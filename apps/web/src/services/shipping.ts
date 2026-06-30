import type { Cart, GuestCheckoutAddress, Store } from "@muoi/core";
import { apiPost } from "./api";

export interface EstimateShippingParams {
  store: Store;
  address: GuestCheckoutAddress;
  cart: Cart;
  guestName: string;
  guestPhone: string;
  serviceId: "SGN-BIKE" | "SGN-ECO";
}

export interface EstimateShippingResult {
  total_pay: number;
  distance: number;
  duration: number;
  currency: string;
}

export async function estimateShippingFee(
  params: EstimateShippingParams,
): Promise<number> {
  const { store, address, cart, guestName, guestPhone, serviceId } = params;

  const result = await apiPost<EstimateShippingResult>(
    "/api/shipping/estimate",
    {
      path: [
        {
          lat: store.lat,
          lng: store.long,
          address: store.address,
          name: store.name,
          mobile: store.phone || "02873001234",
        },
        {
          lat: address.lat,
          lng: address.long,
          address: address.address,
          name: guestName || address.name || "Khách",
          mobile: guestPhone || address.phone || "",
        },
      ],
      items: cart.map((item) => ({
        _id: String(item.product.id),
        name: item.product.name,
        price: item.product.price,
        num: item.quantity,
      })),
      payment_method: "CASH",
      serviceId,
    },
  );

  return result.total_pay;
}
