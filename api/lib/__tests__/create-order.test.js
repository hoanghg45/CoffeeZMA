const { validateOrderInput } = require("../create-order");
const test = require("node:test");
const assert = require("node:assert/strict");

test("validateOrderInput rejects empty cart", () => {
  const errors = validateOrderInput({
    customerName: "Test",
    customerPhone: "0901234567",
    customerAddress: "123 Street",
    paymentMethod: "COD",
    subtotal: 0,
    shipFee: 0,
    total: 0,
    items: [],
  });
  assert.ok(errors.includes("EMPTY_CART"));
});

test("validateOrderInput rejects invalid phone", () => {
  const errors = validateOrderInput({
    customerName: "Test",
    customerPhone: "123",
    customerAddress: "123 Street",
    paymentMethod: "COD",
    subtotal: 100,
    shipFee: 0,
    total: 100,
    items: [{ productId: "1", quantity: 1, options: {} }],
  });
  assert.ok(errors.includes("INVALID_PHONE"));
});
