# POST /api/orders — API Contract

Contract for guest/web order creation. Implement in monorepo [`api/`](../api/) and port to production backend (`:3000`).

## POST /api/orders

Creates an order with **server-side price re-validation**.

### Request

```http
POST /api/orders
Content-Type: application/json
X-Guest-Session: <optional-uuid>
Idempotency-Key: <optional-uuid>
```

### Body (ZMA-compatible)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `customerId` | string | no | `"guest"` or `web_{uuid}`; server upserts by phone |
| `customerName` | string | yes | Receiver name |
| `customerPhone` | string | yes | Vietnamese mobile; validated server-side |
| `customerAddress` | string | yes | Delivery address text |
| `deliveryLat` | number | no | Destination latitude |
| `deliveryLng` | number | no | Destination longitude |
| `items` | array | yes | Line items (see below) |
| `note` | string | no | Order note |
| `branchId` | string | yes | Branch/store ID |
| `paymentMethod` | string | yes | `"COD"` for Phase 2 web |
| `subtotal` | number | yes | Client-computed; server verifies |
| `shipFee` | number | yes | Shipping fee from estimate |
| `discount` | number | no | Default `0`; voucher Phase 2.1 |
| `total` | number | yes | `subtotal + shipFee - discount` |
| `voucherId` | string | no | Reserved |
| `voucherCode` | string | no | Reserved |
| `shipping_service_id` | string | no | `SGN-BIKE` \| `SGN-ECO` |

**Item shape:**

```json
{
  "productId": "123",
  "productName": "Cà phê sữa",
  "basePrice": 45000,
  "quantity": 2,
  "unitPrice": 45000,
  "totalPrice": 90000,
  "options": { "size": "M", "topping": ["pearl"] }
}
```

Server recomputes `unitPrice` from DB catalog + `@muoi/core` `calcFinalPrice`. Rejects if client totals differ by > 1 VND.

### Success response `201`

```json
{
  "orderId": "uuid",
  "lookupCode": "A1B2C3D4",
  "status": "CONFIRMED",
  "total": 115000,
  "customerId": "web_uuid"
}
```

COD orders may auto-confirm (`CONFIRMED`); online payment stays `PENDING`.

### Error responses

| HTTP | code | When |
|------|------|------|
| 400 | `EMPTY_CART` | No items |
| 400 | `INVALID_PHONE` | Phone fails validation |
| 400 | `MISSING_ADDRESS` | Empty address |
| 400 | `PRICE_MISMATCH` | Client/server totals differ |
| 400 | `PRODUCT_NOT_FOUND` | Unknown productId |
| 400 | `BRANCH_NOT_FOUND` | Invalid branchId |
| 404 | `ORDER_NOT_FOUND` | GET with unknown id |
| 503 | `SHIPPING_UNAVAILABLE` | AhaMove token missing |

Error body:

```json
{
  "error": "PRICE_MISMATCH",
  "message": "subtotal mismatch: client=90000, server=95000",
  "details": { "field": "subtotal", "client": 90000, "server": 95000 }
}
```

---

## POST /api/shipping/estimate

Proxy to AhaMove v3 `/orders/estimates`. Token stays server-side.

### Request body

```json
{
  "path": [
    { "lat": 10.77, "lng": 106.7, "address": "Store", "name": "Muối", "mobile": "02873001234" },
    { "lat": 10.78, "lng": 106.69, "address": "Customer", "name": "Guest", "mobile": "0901234567" }
  ],
  "items": [{ "_id": "1", "name": "Coffee", "price": 45000, "num": 1 }],
  "serviceId": "SGN-ECO",
  "payment_method": "CASH"
}
```

### Response `200`

```json
{
  "total_pay": 25000,
  "distance": 1200,
  "duration": 600,
  "currency": "VND"
}
```

---

## GET /api/variants

Returns option groups for product picker (same shape as ZMA `getVariants()`).

---

## GET /api/orders?id={orderId}

Returns order status after checkout.

---

## SQL transaction (pseudocode)

```
BEGIN
  upsert customers by phone → customer_id
  INSERT orders (id, customer_id, totals, lookup_code, status, ...)
  FOR EACH item:
    INSERT order_items
    INSERT order_item_options (option_name snapshots)
COMMIT
```

Apply [`DB_MIGRATION_PHASE2.sql`](../DB_MIGRATION_PHASE2.sql) before deploying.

---

## Port checklist for `:3000` production

- [ ] Run `DB_MIGRATION_PHASE2.sql`
- [ ] Add POST CORS for `/api/orders`, `/api/shipping/estimate`
- [ ] Wire `@muoi/core` or equivalent pricing (must match web)
- [ ] Set `AHAMOVE_V3_TOKEN` / `store_config` keys
- [ ] Guest customer upsert by phone (not Zalo ID)
- [ ] Keep ZMA Bearer auth path unchanged for existing clients
- [ ] Verify `order_items` / `order_item_options` column names match production

---

## Field aliases (catalog GET endpoints)

Production `:3000` may return different shapes; web mappers handle:

| Production | Web type |
|------------|----------|
| `base_price` | `price` |
| `category_ids` | `categoryId[]` |
| `image_url` | `imageUrl` |

Order POST body uses **ZMA names** (`shipFee`, `shipping_service_id`) for compatibility with [`src/services/order.ts`](../../src/services/order.ts).
