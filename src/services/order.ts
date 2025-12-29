import { Cart } from "types/cart";
import { getConfig } from "utils/config";
import { getAccessToken } from "zmp-sdk";
import { getStoreConfig } from "./store-config";

interface OrderData {
    customerInfo: {
        id?: string;
        name: string;
        phone: string;
        address: string;
    };
    cart: Cart;
    paymentMethod: string;
    // Added delivery coordinates
    deliveryLat?: number;
    deliveryLng?: number;

    fees: {
        subtotal: number;
        shipping: number;
        discount?: number;
        total: number;
    };
    note?: string;
    branchId?: string;
}

export const createOrderAPI = async (data: OrderData) => {
    // Determine API URL: Try DB Config first, fallback to Env
    let url = await getStoreConfig("VITE_WEBSERVICE_URL");

    if (!url) {
        // Fallback or just try env (optional, loop said "instead of env" but safe to check both or just warn)
        url = import.meta.env.VITE_WEBSERVICE_URL;
    }
    // const apiKey = import.meta.env.VITE_API_SECRET; 

    if (!url) {
        console.warn("VITE_WEBSERVICE_URL is not set in DB (store_config) or .env. Skipping API call.");
        return;
    }

    // Get User Access Token
    let token = "";
    try {
        const accessToken = await getAccessToken({});
        token = accessToken;
    } catch (err) {
        console.error("Failed to get Access Token:", err);
        // Proceed without token? Or block? 
        // Usually we still send request, backend will reject if strict.
    }

    // Construct items from cart
    const items = data.cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        basePrice: item.product.price,
        quantity: item.quantity,
        unitPrice: item.product.price, // Or calcFinalPrice if needed
        totalPrice: item.product.price * item.quantity,
        options: item.options, // Pass options if exist
    }));

    const payload = {
        customerId: data.customerInfo.id || "guest",
        customerName: data.customerInfo.name,
        customerPhone: data.customerInfo.phone,
        customerAddress: data.customerInfo.address,
        deliveryLat: data.deliveryLat,
        deliveryLng: data.deliveryLng,
        items: items,
        note: data.note || "",
        branchId: data.branchId || "branch-1",
        paymentMethod: data.paymentMethod,
        subtotal: data.fees.subtotal,
        shipFee: data.fees.shipping,
        discount: data.fees.discount || 0,
        total: data.fees.total,
    };

    console.log("Calling Backend API:", `${url}/api/orders`, payload);

    try {
        const response = await fetch(`${url}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Use Standard Bearer Token
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const resData = await response.json();
        console.log("Backend API Response:", resData);
        return resData;
    } catch (error) {
        console.error("Backend API Error:", error);
        throw error;
    }
};


