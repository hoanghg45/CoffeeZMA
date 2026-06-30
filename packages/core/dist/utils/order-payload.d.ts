import type { Cart } from "../types/cart";
import type { GuestCheckoutAddress } from "../types/delivery";
import type { Store } from "../types/delivery";
export interface OrderFeesInput {
    subtotal: number;
    shipping: number;
    discount?: number;
    total: number;
}
export interface CreateOrderPayloadInput {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    deliveryLat?: number;
    deliveryLng?: number;
    cart: Cart;
    note?: string;
    branchId?: string;
    paymentMethod: string;
    fees: OrderFeesInput;
    voucher?: {
        id: string;
        code: string;
    };
    shippingServiceId?: "SGN-BIKE" | "SGN-ECO";
}
/** Build POST /api/orders body — matches ZMA createOrderAPI contract. */
export declare function buildOrderPayload(input: CreateOrderPayloadInput): {
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    deliveryLat: number | undefined;
    deliveryLng: number | undefined;
    items: {
        productId: string;
        productName: string;
        basePrice: number;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        options: import("../types/cart").SelectedOptions;
    }[];
    note: string;
    branchId: string;
    paymentMethod: string;
    subtotal: number;
    shipFee: number;
    discount: number;
    total: number;
    voucherId: string | undefined;
    voucherCode: string | undefined;
    shipping_service_id: "SGN-BIKE" | "SGN-ECO" | undefined;
};
export declare function guestAddressToPayload(address: GuestCheckoutAddress): Pick<CreateOrderPayloadInput, "customerAddress" | "deliveryLat" | "deliveryLng">;
export type BranchStore = Store;
//# sourceMappingURL=order-payload.d.ts.map