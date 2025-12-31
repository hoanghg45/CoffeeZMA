import { runQuery } from "./db";
import { Order, OrderItem, OrderStatus } from "../types/order";
import { Cart } from "types/cart";
import { getConfig } from "utils/config";
import { getAccessToken } from "zmp-sdk";
import { getStoreConfig } from "./store-config";

// --- Types for createOrderAPI ---

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

// --- Order Fetching Functions (History) ---

export async function getOrders(userId?: string): Promise<Order[]> {
    if (!userId) return [];

    try {
        const sql = `
      SELECT 
        id, created_at, status, total, payment_method, 
        customer_address as "deliveryAddress", 
        customer_name, customer_phone
      FROM orders 
      WHERE customer_id = $1 
      ORDER BY created_at DESC
    `;
        const rows = await runQuery(sql, [userId]);

        if (rows.length === 0) return [];

        // Fetch items for these orders
        const orderIds = rows.map((r: any) => r.id);
        // Use ANY($1) for array inclusion in Postgres
        const itemsSql = `
      SELECT i.*, p.image 
      FROM order_items i 
      LEFT JOIN products p ON i.product_id = p.id
      WHERE i.order_id = ANY($1)
    `;
        const items = await runQuery(itemsSql, [orderIds]);

        return rows.map((row: any) => {
            const orderItems = items
                .filter((i: any) => i.order_id === row.id)
                .map(item => mapRowToOrderItem(item));

            return mapRowToOrder(row, orderItems);
        });
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
}

export async function getOrderDetail(orderId: string): Promise<Order | null> {
    try {
        // 1. Fetch Order
        const orderSql = `
      SELECT 
        id, created_at, status, total, payment_method, 
        customer_address as "deliveryAddress",
        customer_name, customer_phone
        -- Add tracking info if available in DB schema (drivers table?)
      FROM orders 
      WHERE id = $1
    `;

        // 2. Fetch Items
        const itemsSql = `
      SELECT i.*, p.image 
      FROM order_items i 
      LEFT JOIN products p ON i.product_id = p.id
      WHERE i.order_id = $1
    `;

        // 3. Fetch Options
        const optionsSql = `
      SELECT oio.* 
      FROM order_item_options oio
      JOIN order_items i ON oio.order_item_id = i.id
      WHERE i.order_id = $1
    `;

        const [orderRes, itemsRes, optionsRes] = await Promise.all([
            runQuery(orderSql, [orderId]),
            runQuery(itemsSql, [orderId]),
            runQuery(optionsSql, [orderId])
        ]);

        if (orderRes.length === 0) return null;

        const orderRow = orderRes[0];
        const options = optionsRes;

        const items = itemsRes.map((itemRow: any) => {
            const itemOptions = options
                .filter((o: any) => o.order_item_id === itemRow.id)
                .map((o: any) => o.option_name);

            return mapRowToOrderItem(itemRow, itemOptions);
        });

        return mapRowToOrder(orderRow, items);

    } catch (error) {
        console.error("Failed to fetch order detail:", error);
        return null;
    }
}

// --- Order Creation Function (Checkout) ---

export const createOrderAPI = async (data: OrderData) => {
    // Determine API URL: Try DB Config first, fallback to Env
    let url = await getStoreConfig("VITE_WEBSERVICE_URL");

    if (!url) {
        // Fallback or just try env
        url = import.meta.env.VITE_WEBSERVICE_URL;
    }

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
    }

    // Construct items from cart
    const items = data.cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        basePrice: item.product.price,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity,
        options: item.options,
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
                "Authorization": `Bearer ${token}`,
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

// --- Helpers ---

function mapRowToOrder(row: any, items: OrderItem[]): Order {
    return {
        id: row.id,
        createdAt: row.created_at,
        status: row.status as OrderStatus,
        total: Number(row.total),
        paymentMethod: row.payment_method,
        deliveryAddress: row.deliveryAddress || "",
        items: items,
        trackingCode: undefined,
        driverName: undefined,
        driverPhone: undefined
    };
}

function mapRowToOrderItem(row: any, options: string[] = []): OrderItem {
    return {
        id: row.product_id,
        name: row.product_name,
        image: row.image || "",
        price: Number(row.unit_price),
        quantity: Number(row.quantity),
        options: options
    };
}
