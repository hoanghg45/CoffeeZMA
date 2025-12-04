import { getConfig } from "../utils/config";

// Types for AhaMove API v3
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
  num: number;a
}

export interface EstimateFeeParams {
  path: AhaMovePoint[];
  items: AhaMoveItem[];
  payment_method?: string;
  order_time?: number;
  remarks?: string;
  promo_code?: string;
}

export interface EstimateFeeResponse {
  total_pay: number;
  distance: number;
  duration: number;
  currency: string;
}

// AhaMove Partner API v3 endpoint
const AHAMOVE_API_URL = "https://partner-apistg.ahamove.com/v3";

export const estimateFee = async (params: EstimateFeeParams): Promise<EstimateFeeResponse> => {
  try {
    const token = import.meta.env.VITE_AHAMOVE_TOKEN;
    
    if (!token) {
      console.warn("AhaMove token is missing!");
      return {
        total_pay: 30000,
        distance: 0,
        duration: 0,
        currency: "VND"
      };
    }

    // AhaMove v3 API structure
    const requestBody: any = {
      path: params.path,
      services: ["SGN-BIKE"], // Service ID array
      items: params.items,
      payment_method: params.payment_method || "CASH" // Default to cash on delivery
    };

    // Add optional fields if provided
    if (params.order_time) {
      requestBody.order_time = params.order_time;
    }
    if (params.remarks) {
      requestBody.remarks = params.remarks;
    }
    if (params.promo_code) {
      requestBody.promo_code = params.promo_code;
    }

    const response = await fetch(`${AHAMOVE_API_URL}/orders/estimates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AhaMove API error:", errorText);
      throw new Error(`Failed to fetch estimate: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle AhaMove v3 response structure
    // The response may have different structure, adjust based on actual API response
    return {
      total_pay: data.total_pay || data.fee || 30000,
      distance: data.distance || 0,
      duration: data.duration || 0,
      currency: data.currency || "VND"
    };

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
