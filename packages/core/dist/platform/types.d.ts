import type { Cart } from "../types/cart";
export interface PlatformUserInfo {
    id: string;
    name: string;
    avatar: string;
}
export interface PlatformLocation {
    latitude: number;
    longitude: number;
}
export interface OrderCustomerInfo {
    id?: string;
    name: string;
    phone: string;
    address: string;
}
export interface OrderFees {
    subtotal: number;
    shipping: number;
    discount?: number;
    total: number;
}
export interface PaymentRequest {
    amount: number;
    cart: Cart;
    customerInfo: OrderCustomerInfo;
    fees: OrderFees;
    voucher?: {
        id: string;
        code: string;
    };
    note?: string;
    branchId?: string;
    deliveryLat?: number;
    deliveryLng?: number;
    shippingServiceId?: "SGN-BIKE" | "SGN-ECO";
    existingOrderId?: string;
}
export interface PaymentResult {
    backendOrderId?: string;
    [key: string]: unknown;
}
/** resultCode: 1 = success, 0 = pending, -1 = failed */
export interface PaymentStatus {
    resultCode: number;
    orderId?: string;
    message?: string;
}
export interface SafeAreaInsets {
    top: number;
    bottom: number;
}
export interface PlatformAdapter {
    getUserInfo(options?: {
        autoRequestPermission?: boolean;
    }): Promise<PlatformUserInfo | null>;
    getPhoneNumber(): Promise<string | null>;
    getCurrentLocation(): Promise<PlatformLocation | null>;
    openExternal(url: string): void;
    callPhone(phone: string): void;
    pay(request: PaymentRequest): Promise<PaymentResult>;
    checkTransaction(data: unknown): Promise<PaymentStatus>;
    matchStatusBarColor(visible: boolean): void;
    getSafeAreaInsets(): SafeAreaInsets;
}
//# sourceMappingURL=types.d.ts.map