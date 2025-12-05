import { getLocation } from "zmp-sdk/apis";
import { getAccessToken } from "zmp-sdk/apis";

/**
 * Location coordinates interface
 */
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Get current location coordinates from Zalo Mini App
 * 
 * This function handles location retrieval directly without requiring a separate backend.
 * It tries multiple approaches:
 * 1. Direct lat/long from getLocation() (if API returns coordinates directly)
 * 2. Token-based conversion using Zalo Platform's built-in capabilities
 * 
 * According to Zalo documentation, getLocation() may return either:
 * - Direct coordinates: { latitude, longitude }
 * - Token: { token } (requires conversion via Zalo Open API)
 */
export const getCurrentLocation = async (): Promise<LocationCoordinates | null> => {
  try {
    // Step 1: Call getLocation() and check what it returns
    const locationResult = await getLocation();

    // Case 1: Direct coordinates (newer API behavior)
    if (locationResult.latitude && locationResult.longitude) {
      const lat = parseFloat(locationResult.latitude);
      const lng = parseFloat(locationResult.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          latitude: lat,
          longitude: lng,
        };
      }
    }

    // Case 2: Token-based flow (older API behavior)
    if (locationResult.token) {
      return await convertLocationToken(locationResult.token);
    }

    console.warn("Location data not available in expected format");
    return null;
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
};

/**
 * Convert location token to coordinates using Zalo Open API
 * This is called when getLocation() returns a token instead of direct coordinates
 */
const convertLocationToken = async (token: string): Promise<LocationCoordinates | null> => {
  try {
    // Get access token for Zalo Open API
    const accessTokenResult = await getAccessToken();
    const accessToken = (accessTokenResult as any)?.accessToken || accessTokenResult;

    if (!accessToken || typeof accessToken !== 'string') {
      console.warn("Access token not available for location conversion");
      return null;
    }

    // Call Zalo Open API directly from the mini app
    // Note: This requires the secret_key, which should be stored securely
    // If Zalo Platform provides environment variables or secure storage, use that
    const secretKey = import.meta.env.VITE_ZALO_SECRET_KEY;

    if (!secretKey) {
      console.warn(
        "Zalo secret key not found. " +
        "Add VITE_ZALO_SECRET_KEY to your environment variables. " +
        "You can find it at: https://developers.zalo.me/ → Quản lý ứng dụng → Your App"
      );
      return null;
    }

    // Call Zalo Open API to convert token to coordinates
    const params = new URLSearchParams({
      access_token: accessToken,
      code: token,
      secret_key: secretKey,
    });

    const response = await fetch(
      `https://openapi.zalo.me/v2.0/location/getlocation?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to convert location token via Zalo Open API:", errorText);
      return null;
    }

    const data = await response.json();

    // Zalo API response structure:
    // {
    //   "data": {
    //     "provider": "gps",
    //     "latitude": "10.758341",
    //     "longitude": "106.745863",
    //     "timestamp": "1666249171003"
    //   },
    //   "error": 0,
    //   "message": "Success"
    // }

    if (data.error === 0 && data.data?.latitude && data.data?.longitude) {
      return {
        latitude: parseFloat(data.data.latitude),
        longitude: parseFloat(data.data.longitude),
      };
    }

    console.warn("Invalid location data from Zalo Open API:", data);
    return null;
  } catch (error) {
    console.error("Error converting location token:", error);
    return null;
  }
};

/**
 * Get location token only (for debugging or custom handling)
 */
export const getLocationToken = async (): Promise<string | null> => {
  try {
    const result = await getLocation();
    return result.token || null;
  } catch (error) {
    console.error("Error getting location token:", error);
    return null;
  }
};

