import type { Cart } from "../types/cart";
import type { GuestCheckoutAddress } from "../types/delivery";
import type { Store } from "../types/delivery";
import { calcFinalPrice } from "./product-pricing";

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
  voucher?: { id: string; code: string };
  shippingServiceId?: "SGN-BIKE" | "SGN-ECO";
}

/** Build POST /api/orders body — matches ZMA createOrderAPI contract. */
export function buildOrderPayload(input: CreateOrderPayloadInput) {
  const items = input.cart.map((item) => {
    const unitPrice = calcFinalPrice(item.product, item.options);
    return {
      productId: item.product.id,
      productName: item.product.name,
      basePrice: item.product.price,
      quantity: item.quantity,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
      options: item.options,
    };
  });

  return {
    customerId: input.customerId || "guest",
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerAddress: input.customerAddress,
    deliveryLat: input.deliveryLat,
    deliveryLng: input.deliveryLng,
    items,
    note: input.note || "",
    branchId: input.branchId || "branch-1",
    paymentMethod: input.paymentMethod,
    subtotal: input.fees.subtotal,
    shipFee: input.fees.shipping,
    discount: input.fees.discount || 0,
    total: input.fees.total,
    voucherId: input.voucher?.id,
    voucherCode: input.voucher?.code,
    shipping_service_id: input.shippingServiceId,
  };
}

export function guestAddressToPayload(
  address: GuestCheckoutAddress,
): Pick<
  CreateOrderPayloadInput,
  "customerAddress" | "deliveryLat" | "deliveryLng"
> {
  return {
    customerAddress: address.address,
    deliveryLat: address.lat,
    deliveryLng: address.long,
  };
}

export type BranchStore = Store;
