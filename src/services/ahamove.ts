import { getConfig } from "../utils/config";

// Types for AhaMove API
interface AhaMovePoint {
  lat: number;
  lng: number;
  address: string;
  name?: string;
  mobile?: string;
}

interface AhaMoveItem {
  _id: string;
  name: string;
  price: number;
  num: number;
}

export interface EstimateFeeParams {
  path: AhaMovePoint[];
  items: AhaMoveItem[];
}

export interface EstimateFeeResponse {
  total_pay: number;
  distance: number;
  duration: number;
  currency: string;
}

// This should be moved to a secure backend in production
const AHAMOVE_API_URL = "https://apistg.ahamove.com/v1";
const AHAMOVE_TOKEN = "0d885280ed9d3ab162ba52f01ff8ada44ebec7a4"; // Placeholder - needs real token

export const estimateFee = async (params: EstimateFeeParams): Promise<EstimateFeeResponse> => {
  try {
    // Mock response for development/demo if no real token
    // Remove this block when integrating real API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple mock calculation: 5000 base + 5000 per km
        const distanceKm = Math.random() * 5 + 1; // Random 1-6km
        const total = 15000 + Math.round(distanceKm * 5000);
        
        resolve({
          total_pay: total,
          distance: distanceKm,
          duration: distanceKm * 5, // 5 mins per km
          currency: "VND"
        });
      }, 1000);
    });

    /* Real implementation
    const response = await fetch(`${AHAMOVE_API_URL}/order/estimated_fee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AHAMOVE_TOKEN}`
      },
      body: JSON.stringify({
        order: {
          path: params.path,
          items: params.items,
          service_id: "SGN-BIKE" // Or specific service ID
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch estimate");
    }

    return await response.json();
    */
  } catch (error) {
    console.error("Error estimating fee:", error);
    return {
      total_pay: 30000, // Fallback default
      distance: 0,
      duration: 0,
      currency: "VND"
    };
  }
};

