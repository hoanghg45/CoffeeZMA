export interface GeocodingResult {
    address: string;
    lat: number;
    long: number;
}

import { getStoreConfig } from "./store-config";

let cachedToken: string | null = null;

export const getTrackAsiaToken = async (): Promise<string | null> => {
    if (cachedToken) return cachedToken;
    const dbToken = await getStoreConfig("VITE_TRACKASIA_TOKEN");
    cachedToken = dbToken || import.meta.env.VITE_TRACKASIA_TOKEN || import.meta.env.TRACKASIA_TOKEN;
    return cachedToken;
};

/**
 * Reverse geocoding: Convert coordinates to address text using TrackAsia API
 * @param lat Latitude
 * @param long Longitude
 * @returns Promise<string> The formatted address
 */
export const reverseGeocode = async (lat: number, long: number): Promise<string | null> => {
    try {
        const token = await getTrackAsiaToken();
        if (!token) {
            console.warn("TrackAsia token is missing!");
            return null;
        }

        const url = `https://maps.track-asia.com/api/v2/geocode/json?latlng=${lat},${long}&key=${token}&new_admin=true`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TrackAsia API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
        }

        return null;
    } catch (error) {
        console.error("Error in reverse geocoding:", error);
        return null;
    }
};

/**
 * Forward geocoding: Convert address text to coordinates using TrackAsia API
 * @param address Address text
 * @returns Promise<{lat: number, long: number} | null>
 */
export const forwardGeocode = async (
    address: string
): Promise<{ lat: number, long: number } | null> => {
    try {
        const token = await getTrackAsiaToken();
        if (!token) {
            console.warn("TrackAsia token is missing!");
            return null;
        }

        // Bounding box for Ho Chi Minh City logic is replaced by the location logic if needed, 
        // but TrackAsia textsearch handles it gracefully if we just search.
        const url = `https://maps.track-asia.com/api/v2/place/textsearch/json?language=vi&key=${token}&query=${encodeURIComponent(address)}&new_admin=true`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TrackAsia API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            return { lat, long: lng };
        }

        return null;
    } catch (error) {
        console.error("Error in forward geocoding:", error);
        return null;
    }
};

/**
 * Autocomplete: Get address suggestions based on input text using TrackAsia API
 * @param input Text input to autocomplete
 * @returns Promise<string[]>
 */
export const autocomplete = async (input: string): Promise<string[]> => {
    try {
        const token = await getTrackAsiaToken();
        if (!token) {
            console.warn("TrackAsia token is missing!");
            return [];
        }

        if (!input || input.trim() === '') {
            return [];
        }

        const url = `https://maps.track-asia.com/api/v2/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${token}&new_admin=true&size=5`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`TrackAsia API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.predictions && data.predictions.length > 0) {
            return data.predictions.map((p: any) => p.description);
        }

        return [];
    } catch (error) {
        console.error("Error in autocomplete:", error);
        return [];
    }
};
