export interface GeocodingResult {
    address: string;
    lat: number;
    long: number;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOXMAP_TOKEN || import.meta.env.MAPBOXMAP_TOKEN;

/**
 * Reverse geocoding: Convert coordinates to address text
 * @param lat Latitude
 * @param long Longitude
 * @returns Promise<string> The formatted address
 */
export const reverseGeocode = async (lat: number, long: number): Promise<string | null> => {
    try {
        if (!MAPBOX_TOKEN) {
            console.warn("Mapbox token is missing!");
            return null;
        }

        // Mapbox API expects longitude,latitude
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${long},${lat}.json?types=address,poi&access_token=${MAPBOX_TOKEN}&language=vi`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Mapbox API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
            return data.features[0].place_name;
        }

        return null;
    } catch (error) {
        console.error("Error in reverse geocoding:", error);
        return null;
    }
};

/**
 * Forward geocoding: Convert address text to coordinates
 * @param address Address text
 * @returns Promise<{lat: number, long: number} | null>
 */
export const forwardGeocode = async (address: string): Promise<{ lat: number, long: number } | null> => {
    try {
        if (!MAPBOX_TOKEN) {
            console.warn("Mapbox token is missing!");
            return null;
        }

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=vn&access_token=${MAPBOX_TOKEN}&limit=1&language=vi`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Mapbox API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const [long, lat] = data.features[0].center;
            return { lat, long };
        }

        return null;
    } catch (error) {
        console.error("Error in forward geocoding:", error);
        return null;
    }
};
