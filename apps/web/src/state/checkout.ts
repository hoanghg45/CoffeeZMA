import {
  calculatePriceBreakdown,
  type GuestCheckoutAddress,
  type Store,
} from "@muoi/core";
import { atom, selector } from "recoil";
import { cartState, subtotalState } from "./cart";
import { branchesState } from "./catalog";
import { estimateShippingFee } from "../services/shipping";

export const guestNameState = atom<string>({
  key: "web/guestName",
  default: "",
});

export const guestPhoneState = atom<string>({
  key: "web/guestPhone",
  default: "",
});

export const selectedAddressState = atom<GuestCheckoutAddress | null>({
  key: "web/selectedAddress",
  default: null,
});

export const selectedStoreIdState = atom<string | null>({
  key: "web/selectedStoreId",
  default: null,
});

export const selectedStoreState = selector<Store | null>({
  key: "web/selectedStore",
  get: async ({ get }) => {
    const storeId = get(selectedStoreIdState);
    if (!storeId) return null;
    const branches = await get(branchesState);
    return branches.find((b) => b.id === storeId) ?? null;
  },
});

export const selectedDeliveryTimeState = atom<number>({
  key: "web/deliveryTime",
  default: 0,
});

export const shippingServiceState = atom<"SGN-BIKE" | "SGN-ECO">({
  key: "web/shippingService",
  default: "SGN-ECO",
});

export const orderNoteState = atom<string>({
  key: "web/orderNote",
  default: "",
});

export const calculatedDeliveryFeeState = selector({
  key: "web/calculatedDeliveryFee",
  get: async ({ get }) => {
    const address = get(selectedAddressState);
    const store = get(selectedStoreState);
    const cart = get(cartState);
    const serviceId = get(shippingServiceState);
    const guestName = get(guestNameState);
    const guestPhone = get(guestPhoneState);

    if (!address?.lat || !address?.long || !store || cart.length === 0) {
      return 0;
    }

    return estimateShippingFee({
      store,
      address,
      cart,
      guestName,
      guestPhone,
      serviceId,
    });
  },
});

export const priceBreakdownState = selector({
  key: "web/priceBreakdown",
  get: async ({ get }) => {
    const cart = get(cartState);
    const shippingFee = get(calculatedDeliveryFeeState);
    return calculatePriceBreakdown(cart, null, shippingFee, null);
  },
});

export const totalPriceState = selector({
  key: "web/totalPrice",
  get: async ({ get }) => {
    const breakdown = await get(priceBreakdownState);
    return breakdown.finalPrice;
  },
});

export { subtotalState };
