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
        const locationData = {
          latitude: lat,
          longitude: lng,
        };
        console.log("📍 Get Location Direct success:", locationData);
        return locationData;
      }
    }

    // Case 2: Token-based flow (older API behavior)
    if (locationResult.token) {
      console.log("📍 Location token received. Attempting conversion...", { token: locationResult.token });
      return await convertLocationToken(locationResult.token);
    }

    console.warn("Location data not available in expected format:", locationResult);
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

    // Get N8N webhook URL from environment
    const n8nWebhook = import.meta.env.VITE_N8N_WEBHOOK_LOCATION;

    if (!n8nWebhook) {
      console.error(
        "❌ No N8N webhook configured. " +
        "Please set VITE_N8N_WEBHOOK_LOCATION in your .env file."
      );
      return null;
    }

    // Use N8N Webhook for location conversion
    const fetchUrl = n8nWebhook;
    const method = "POST";
    const body = {
      token,
      accessToken,
    };

    console.log("📍 Using N8N Webhook for location conversion");

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
      console.error("❌ Location conversion failed:", errorData);
      return null;
    }

    const responseData = await response.json();
    console.log("📍 Raw location response:", responseData);

    let lat = 0;
    let lng = 0;

    // Handle N8N array format: [{"data": { "latitude": "...", "longitude": "..." }}]
    if (Array.isArray(responseData) && responseData.length > 0) {
      const item = responseData[0];
      if (item.data && item.data.latitude && item.data.longitude) {
        lat = parseFloat(item.data.latitude);
        lng = parseFloat(item.data.longitude);
      } else if (item.latitude && item.longitude) {
        // Case: [{"latitude": "...", "longitude": "..."}]
        lat = parseFloat(item.latitude);
        lng = parseFloat(item.longitude);
      }
    }
    // Handle N8N object format with data wrapper: {"data": { "latitude": "...", "longitude": "..." }}
    else if (responseData.data && responseData.data.latitude && responseData.data.longitude) {
      lat = parseFloat(responseData.data.latitude);
      lng = parseFloat(responseData.data.longitude);
    }
    // Handle flat format: {"latitude": "...", "longitude": "..."}
    else if (responseData.latitude && responseData.longitude) {
      lat = parseFloat(responseData.latitude);
      lng = parseFloat(responseData.longitude);
    }

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      console.log(`✅ Parsed location: ${lat}, ${lng}`);
      return {
        latitude: lat,
        longitude: lng,
      };
    }

    console.warn("Invalid location data received from server:", responseData);
    return null;
  } catch (error) {
    console.error("❌ Location Conversion Failed:", error);
    console.info("💡 Make sure VITE_N8N_WEBHOOK_LOCATION is set correctly");
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

