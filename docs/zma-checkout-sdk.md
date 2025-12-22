# Zalo Checkout SDK Integration Guide (COD/Bank) & N8n

This document summarizes the process of integrating COD/Bank Transfer payment handling on Zalo Mini App, resolving the **"Stuck UI"** and **"Status Pending"** issues.

---

## 1. Workflow Model

1.  **Client**: Calls `createOrder` -> Zalo displays the Payment Sheet.
2.  **User**: Confirms payment on Zalo.
3.  **Zalo Server**: Calls Webhook (Notify) to **N8n**.
4.  **N8n (Backend)**:
    *   Receives Notify -> Verifies MAC.
    *   **IMPORTANT**: Calculates a *new* MAC -> Calls `updateOrderStatus` API to "Approve Order".
    *   Returns Success response to Zalo.
5.  **Zalo Client**:
    *   Closes the Payment Sheet.
    *   Re-opens the Mini App (Event `OpenApp`).
    *   Client catches the event -> Navigates to Result Page -> Displays Success.

---

## 2. Zalo Dashboard Configuration

*   Access: `Mini App Dashboard` -> `Payment` -> `Checkout SDK`.
*   **Notify Url**: Enter your N8n Webhook URL (e.g., `https://n8n.../webhook/notify`).
*   **Redirect Path**: Enter `/result` (Or your App's Result Page Route). **Do not enter a web URL**.

---

## 3. Client Setup (Mini App)

### 3.1. Navigation Hook ([src/hooks.ts](file:///d:/Sff/ZMA/CoffeeZMA/src/hooks.ts))
Must handle the `OpenApp` event to catch the signal when Zalo returns the user to the App.

```typescript
// src/hooks.ts
import { EventName, events } from "zmp-sdk";
import { useNavigate } from "zmp-ui";

export const useHandlePayment = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Listen when Zalo re-opens the App after payment
    events.on(EventName.OpenApp, (data) => {
      console.log("OpenApp Data:", data);
      
      // Prioritize checking Order ID (COD usually returns this)
      if (data?.appTransID || data?.orderId || data?.path) {
        navigate("/result", { state: data });
      }
    });
  }, []);
};
```

### 3.2. Result Page ([src/pages/result.tsx](file:///d:/Sff/ZMA/CoffeeZMA/src/pages/result.tsx))
Status check logic must extract the correct Order ID from the `OpenApp` data.

```typescript
// src/pages/result.tsx
// ...
const check = () => {
  let data = state;
  if (data) {
     // FIX: Prioritize getting ID instead of path string
     if ("appTransID" in data || "orderId" in data) {
         data = { appTransID: data.appTransID, orderId: data.orderId };
     } else if ("path" in data) {
         data = data.path; // Fallback
     }
  }
  
  // Call SDK check
  Payment.checkTransaction({
      data, 
      success: (rs) => {
          // rs.resultCode === 1 => Success
      }
  });
}
```

---

## 4. Backend Setup (N8n Workflow)

The N8n flow must consist of 2 phases: **Verify (Receive)** and **Confirm (Approve)**.

### Phase 1: Verify Notify
*   **Webhook Node**: Receives POST from Zalo.
*   **Crypto Node (HMAC SHA256)**: Verify received data `mac == hmac(key2, data)`. (See Zalo docs for data string).

### Phase 2: Auto-Confirm (MANDATORY FOR COD)
*If missing, the order status remains PENDING forever.*

#### Step A: Code Node (Prepare Confirm Data)
```javascript
const appId = items[0].json.data.appId;
const orderId = items[0].json.data.orderId;
const privateKey = 'YOUR_PRIVATE_KEY'; 
const resultCode = 1; // 1 = Success

// Standard Format: appId -> orderId -> resultCode -> privateKey
const dataStr = `appId=${appId}&orderId=${orderId}&resultCode=${resultCode}&privateKey=${privateKey}`;

return {
    json: {
        ...items[0].json, 
        confirm_data_str: dataStr,
        confirm_private_key: privateKey
    }
};
```

#### Step B: Crypto Node (Hash Confirm Data)
*   **Action**: Hash (SHA256)
*   **Value**: `{{ $json.confirm_data_str }}`
*   **Output**: `confirm_mac`

#### Step C: HTTP Request (Update Order Status)
*   **URL (Specific for COD)**: 
    `https://payment-mini.zalo.me/api/transaction/{{ $json.data.appId }}/cod-callback-payment`
*   **Method**: POST
*   **Body**:
    ```json
    {
      "appId": "{{ $json.data.appId }}",
      "orderId": "{{ $json.data.orderId }}",
      "mac": "{{ $json.confirm_mac }}",
      "resultCode": 1
    }
    ```

---

## 5. Common Issues

1.  **Issue**: App stuck on "Processing" forever.
    *   **Cause**: N8n has not called `updateOrderStatus` or used incorrect URL/MAC.
    *   **Fix**: Re-check Phase 2 above.

2.  **Issue**: `checkTransaction` returns Pending even though N8n finished.
    *   **Cause**: Race condition (Client runs faster than Server).
    *   **Fix**: Trust the `OpenApp` navigation event. Show success if ID matches.

3.  **Issue**: "Invalid MAC" when calling `updateOrderStatus`.
    *   **Cause**: Reusing the old MAC from the Webhook.
    *   **Fix**: Must calculate a new MAC with `resultCode=1`.
