import { describe, expect, it } from "vitest";
import { buildCreateOrderBody } from "../order";

describe("buildCreateOrderBody", () => {
  it("matches ZMA POST /api/orders shape", () => {
    const body = buildCreateOrderBody({
      amount: 115000,
      paymentMethod: "COD",
      customerInfo: {
        name: "Nguyễn Văn A",
        phone: "0901234567",
        address: "456 Lê Lợi",
      },
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
      fees: {
        subtotal: 90000,
        shipping: 25000,
        discount: 0,
        total: 115000,
      },
      branchId: "branch-1",
      deliveryLat: 10.78,
      deliveryLng: 106.69,
      shippingServiceId: "SGN-ECO",
      note: "Ít đá",
    });

    expect(body.customerName).toBe("Nguyễn Văn A");
    expect(body.paymentMethod).toBe("COD");
    expect(body.items[0].unitPrice).toBe(45000);
    expect(body.total).toBe(115000);
    expect(body.shipping_service_id).toBe("SGN-ECO");
    expect(body.deliveryLat).toBe(10.78);
  });
});

describe("mergeProductsWithVariants", () => {
  it("attaches variants by variantId", async () => {
    const { mergeProductsWithVariants } = await import("../catalog");
    const products = mergeProductsWithVariants(
      [
        {
          id: "1",
          name: "Coffee",
          image: "",
          price: 40000,
          categoryId: ["c1"],
          variantId: ["size"],
        } as never,
      ],
      [
        {
          id: "size",
          label: "Size",
          type: "single" as const,
          options: [{ id: "m", label: "M" }],
        },
      ],
    );
    expect(products[0].variants).toHaveLength(1);
    expect(products[0].variants![0].id).toBe("size");
  });
});
