export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "DELIVERING"
    | "COMPLETED"
    | "CANCELLED"
    | "RETURNED";

export interface OrderItem {
    id: string; // Product ID
    name: string;
    image: string;
    price: number;
    quantity: number;
    options?: string[]; // List of selected options (e.g., "Size M", "No Sugar")
    note?: string;
}

export interface Order {
    id: string | number;
    displayId?: string; // Short ID for display if needed
    createdAt: string; // ISO Date string
    status: OrderStatus;
    total: number;
    items: OrderItem[];
    paymentMethod: "COD" | "ZALO_PAY";
    deliveryAddress: string;
    // Tracking info (optional)
    trackingCode?: string;
    driverName?: string;
    driverPhone?: string;
}
