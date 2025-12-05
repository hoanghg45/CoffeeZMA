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
    const response = await fetch(`${backendUrl}/api/location/convert`, {
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
      console.error("❌ Location conversion failed:", errorData);
      return null;
    }

    const data = await response.json();

    if (data.latitude && data.longitude) {
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      };
    }

    console.warn("Invalid location data received from server:", data);
    return null;
  } catch (error) {
    console.error("❌ Location Conversion Failed:", error);
    console.info("💡 Make sure VITE_API_URL is set to your Vercel deployment URL");
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

