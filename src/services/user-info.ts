import { getPhoneNumber, getUserID, getUserInfo } from "zmp-sdk/apis";
import { getAccessToken } from "zmp-sdk/apis";

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

    // Get backend URL from environment (Vercel serverless function)
    const backendUrl = import.meta.env.VITE_API_URL;

    if (!backendUrl) {
      console.error(
        "❌ VITE_API_URL not configured. " +
        "Please set VITE_API_URL in your .env file to your Vercel deployment URL. " +
        "Example: VITE_API_URL=https://your-app.vercel.app"
      );
      return null;
    }

    // Call Vercel serverless function to convert token
    // This avoids CORS issues and keeps secret key secure on the server
    const response = await fetch(`${backendUrl}/api/user/getphone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        accessToken,
      }),
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

    const data = await response.json();

    if (data.number) {
      return data.number;
    }

    console.warn("Invalid phone number data received from server:", data);
    return null;
  } catch (error) {
    console.error("Error converting phone token:", error);
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

