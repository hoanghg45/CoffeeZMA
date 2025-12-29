import { getPhoneNumber, getUserID, getUserInfo } from "zmp-sdk/apis";
import { getAccessToken } from "zmp-sdk/apis";
import { getStoreConfig } from "./store-config";

/**
 * Get user's phone number from Zalo Mini App
 * 
 * According to Zalo documentation, getPhoneNumber() returns a token
 * that must be converted to actual phone number via Zalo Open API.
 * 
 * Reference: https://miniapp.zaloplatforms.com/documents/api/getPhoneNumber/
 */
export const getCurrentPhoneNumber = async (): Promise<string | null> => {
  try {
    // Step 1: Get phone number token from Zalo SDK
    const { token } = await getPhoneNumber();

    if (!token) {
      console.warn("Phone number token not available");
      return null;
    }

    // Step 2: Convert token to phone number using Zalo Open API
    return await convertPhoneToken(token);
  } catch (error) {
    console.error("Error getting phone number:", error);
    return null;
  }
};

/**
 * Convert phone number token to actual phone number using Zalo Open API
 */
const convertPhoneToken = async (token: string): Promise<string | null> => {
  try {
    // Get access token for Zalo Open API
    const accessTokenResult = await getAccessToken();
    const accessToken = (accessTokenResult as any)?.accessToken || accessTokenResult;

    if (!accessToken || typeof accessToken !== 'string') {
      console.warn("Access token not available for phone number conversion");
      return null;
    }

    // Get N8N webhook URL from Config Store (DB) or Environment
    const n8nWebhook = await getStoreConfig("VITE_WEBHOOK_PHONE") || import.meta.env.VITE_N8N_WEBHOOK_PHONE;

    if (!n8nWebhook) {
      console.error(
        "❌ No N8N webhook configured. " +
        "Please set VITE_WEBHOOK_PHONE in 'store_config' DB or VITE_N8N_WEBHOOK_PHONE in .env."
      );
      return null;
    }

    // Use N8N Webhook for phone number conversion
    const fetchUrl = n8nWebhook;
    const method = "POST";
    const body = {
      token,
      accessToken,
    };

    console.log("📞 Using N8N Webhook for phone number conversion");

    // Call server to convert token
    const response = await fetch(fetchUrl, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: await response.text() };
      }
      console.error("❌ Phone number conversion failed:", errorData);
      return null;
    }

    const responseData = await response.json();
    console.log("📞 Raw phone number response:", responseData);

    let phoneNumber: string | null = null;

    // Handle N8N array format: [{"data": { "number": "..." }}]
    if (Array.isArray(responseData) && responseData.length > 0) {
      const item = responseData[0];
      if (item.data && item.data.number) {
        phoneNumber = item.data.number;
      } else if (item.number) {
        // Case: [{"number": "..."}]
        phoneNumber = item.number;
      }
    }
    // Handle N8N object format with data wrapper: {"data": { "number": "..." }}
    else if (responseData.data && responseData.data.number) {
      phoneNumber = responseData.data.number;
    }
    // Handle flat format: {"number": "..."}
    else if (responseData.number) {
      phoneNumber = responseData.number;
    }

    if (phoneNumber) {
      console.log(`✅ Parsed phone number: ${phoneNumber}`);
      return phoneNumber;
    }

    console.warn("Invalid phone number data received from server:", responseData);
    return null;
  } catch (error) {
    console.error("❌ Phone Number Conversion Failed:", error);
    console.info("💡 Make sure VITE_N8N_WEBHOOK_PHONE is set correctly");
    return null;
  }
};

/**
 * Get user ID from Zalo Mini App
 * 
 * According to Zalo documentation, getUserID() returns the ID directly
 * as a string. No conversion needed.
 * 
 * Reference: https://miniapp.zaloplatforms.com/documents/api/getUserID/
 */
export const getCurrentUserID = async (): Promise<string | null> => {
  try {
    const userID = await getUserID({});
    return userID || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

/**
 * Get user info from Zalo Mini App
 * 
 * According to Zalo documentation, getUserInfo() returns user information directly.
 * No token conversion needed.
 * 
 * Reference: https://miniapp.zaloplatforms.com/documents/api/getUserInfo/
 */
export const getCurrentUserInfo = async (options?: { autoRequestPermission?: boolean }) => {
  try {
    const { userInfo } = await getUserInfo({
      autoRequestPermission: options?.autoRequestPermission ?? true
    });
    return userInfo;
  } catch (error) {
    console.error("Error getting user info:", error);
    return null;
  }
};

/**
 * Get phone number token only (for debugging or custom handling)
 */
export const getPhoneNumberToken = async (): Promise<string | null> => {
  try {
    const { token } = await getPhoneNumber();
    return token || null;
  } catch (error) {
    console.error("Error getting phone number token:", error);
    return null;
  }
};

