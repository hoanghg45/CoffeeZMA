import { runQuery } from "./db";
import { Order, OrderItem, OrderStatus } from "../types/order";

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

        // For the list view, we might need some items preview
        // Fetching items for ALL orders might be heavy. 
        // Optimization: Fetch first 2 items for each order or just show "X items"
        // For now, let's just return the orders and maybe fetch items if needed, 
        // OR just fetch items for all these orders in one go if list is small.
        // Let's keep it simple: List of orders with total/status is often enough for history list, 
        // but the UI shows "Quantity x Name".

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
        // Join with order_items to filter by order_id
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

function mapRowToOrder(row: any, items: OrderItem[]): Order {
    return {
        id: row.id,
        createdAt: row.created_at, // Postgres returns ISO/Date object usually
        status: row.status as OrderStatus,
        total: Number(row.total), // Ensure number
        paymentMethod: row.payment_method,
        deliveryAddress: row.deliveryAddress || "",
        items: items,
        // Provide defaults for tracking if not in DB yet
        trackingCode: undefined, // row.tracking_code?
        driverName: undefined,   // row.driver_name?
        driverPhone: undefined   // row.driver_phone?
    };
}

function mapRowToOrderItem(row: any, options: string[] = []): OrderItem {
    return {
        id: row.product_id, // Map product_id to OrderItem.id as per interface (Item ID usually means Product ID in UI)
        name: row.product_name,
        image: row.image || "", // Handle missing image
        price: Number(row.unit_price),
        quantity: Number(row.quantity),
        options: options
    };
}
