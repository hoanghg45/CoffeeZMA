import { createOrder } from "../services/order";
import type {
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  PlatformAdapter,
  SafeAreaInsets,
} from "@muoi/core";

export const webPlatformAdapter: PlatformAdapter = {
  async getUserInfo() {
    return null;
  },

  async getPhoneNumber() {
    return null;
  },

  async getCurrentLocation() {
    if (!navigator.geolocation) return null;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  },

  openExternal(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  },

  callPhone(phone: string) {
    window.location.href = `tel:${phone}`;
  },

  async pay(request: PaymentRequest): Promise<PaymentResult> {
    const result = await createOrder({
      ...request,
      paymentMethod: "COD",
    });
    return {
      backendOrderId: result.orderId,
      lookupCode: result.lookupCode,
    };
  },

  async checkTransaction(_data: unknown): Promise<PaymentStatus> {
    return { resultCode: 1, message: "COD confirmed" };
  },

  matchStatusBarColor(_visible: boolean) {
    // no-op on web
  },

  getSafeAreaInsets(): SafeAreaInsets {
    return { top: 0, bottom: 0 };
  },
};
