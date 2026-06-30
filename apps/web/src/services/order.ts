import {
  buildOrderPayload,
  type Cart,
  type GuestCheckoutAddress,
  type PaymentRequest,
} from "@muoi/core";
import { apiPost } from "./api";

export interface CreateOrderResponse {
  orderId: string;
  lookupCode: string;
  status: string;
  total: number;
  customerId?: string;
}

export interface CreateOrderInput extends PaymentRequest {
  paymentMethod: string;
}

export function buildCreateOrderBody(input: CreateOrderInput) {
  return buildOrderPayload({
    customerId: input.customerInfo.id,
    customerName: input.customerInfo.name,
    customerPhone: input.customerInfo.phone,
    customerAddress: input.customerInfo.address,
    deliveryLat: input.deliveryLat,
    deliveryLng: input.deliveryLng,
    cart: input.cart,
    note: input.note,
    branchId: input.branchId,
    paymentMethod: input.paymentMethod,
    fees: {
      subtotal: input.fees.subtotal,
      shipping: input.fees.shipping,
      discount: input.fees.discount,
      total: input.fees.total,
    },
    voucher: input.voucher,
    shippingServiceId: input.shippingServiceId,
  });
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResponse> {
  const body = buildCreateOrderBody(input);
  return apiPost<CreateOrderResponse>("/api/orders", body);
}

export async function fetchOrder(orderId: string) {
  return apiGetOrder(orderId);
}

async function apiGetOrder(orderId: string) {
  const response = await fetch(
    `/api/orders?id=${encodeURIComponent(orderId)}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch order ${orderId}`);
  }
  return response.json();
}

export function checkoutToCustomerInfo(
  guestName: string,
  guestPhone: string,
  address: GuestCheckoutAddress,
) {
  return {
    name: guestName.trim(),
    phone: guestPhone.trim(),
    address: address.address,
  };
}

export function cartToPaymentRequest(
  cart: Cart,
  customerInfo: { name: string; phone: string; address: string; id?: string },
  fees: {
    subtotal: number;
    shipping: number;
    discount?: number;
    total: number;
  },
  extras: {
    branchId?: string;
    deliveryLat?: number;
    deliveryLng?: number;
    note?: string;
    shippingServiceId?: "SGN-BIKE" | "SGN-ECO";
  },
): CreateOrderInput {
  return {
    amount: fees.total,
    cart,
    customerInfo,
    fees,
    paymentMethod: "COD",
    ...extras,
  };
}
