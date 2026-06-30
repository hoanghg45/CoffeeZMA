import { describe, expect, it } from "vitest";
import {
  validateCheckoutFields,
  validateGuestCheckoutFields,
  getFirstValidationError,
} from "../utils/checkout-validation";
import type { GuestCheckoutAddress, Store } from "../types/delivery";

const store: Store = {
  id: "branch-1",
  name: "Muối Q1",
  address: "123 Nguyễn Huệ",
  lat: 10.77,
  long: 106.7,
};

const address: GuestCheckoutAddress = {
  address: "456 Lê Lợi, Q1",
  lat: 10.78,
  long: 106.69,
};

describe("validateCheckoutFields", () => {
  it("passes when all required fields are present", () => {
    const result = validateCheckoutFields(
      address,
      "0901234567",
      store,
      Date.now() + 3600000,
    );
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("flags missing address", () => {
    const result = validateCheckoutFields(null, "0901234567", store, 1000);
    expect(result.isValid).toBe(false);
    expect(result.missingFields.address).toBe(true);
  });
});

describe("validateGuestCheckoutFields", () => {
  it("passes for valid guest input", () => {
    const result = validateGuestCheckoutFields(
      "Nguyễn Văn A",
      "0901234567",
      address,
      store,
      Date.now() + 3600000,
    );
    expect(result.isValid).toBe(true);
  });

  it("rejects invalid phone", () => {
    const result = validateGuestCheckoutFields(
      "Nguyễn Văn A",
      "12345",
      address,
      store,
      Date.now() + 3600000,
    );
    expect(result.isValid).toBe(false);
    expect(result.missingFields.phone).toBe(true);
  });

  it("rejects missing name", () => {
    const result = validateGuestCheckoutFields(
      "",
      "0901234567",
      address,
      store,
      Date.now() + 3600000,
    );
    expect(result.isValid).toBe(false);
    expect(result.missingFields.name).toBe(true);
  });

  it("returns first error message", () => {
    const result = validateGuestCheckoutFields("", "", null, null, null);
    expect(getFirstValidationError(result)).toBeTruthy();
  });
});

describe("buildOrderPayload", () => {
  it("builds ZMA-compatible payload", async () => {
    const { buildOrderPayload } = await import("../utils/order-payload");
    const payload = buildOrderPayload({
      customerName: "Guest",
      customerPhone: "0901234567",
      customerAddress: "456 Lê Lợi",
      cart: [
        {
          product: {
            id: "1",
            name: "Cà phê",
            image: "",
            price: 45000,
            categoryId: ["coffee"],
          },
          options: {},
          quantity: 2,
        },
      ],
      paymentMethod: "COD",
      fees: { subtotal: 90000, shipping: 25000, discount: 0, total: 115000 },
      branchId: "branch-1",
      shippingServiceId: "SGN-ECO",
    });

    expect(payload.customerName).toBe("Guest");
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0].unitPrice).toBe(45000);
    expect(payload.total).toBe(115000);
    expect(payload.shipping_service_id).toBe("SGN-ECO");
  });
});
