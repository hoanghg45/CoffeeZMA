"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const checkout_validation_1 = require("../utils/checkout-validation");
const store = {
    id: "branch-1",
    name: "Muối Q1",
    address: "123 Nguyễn Huệ",
    lat: 10.77,
    long: 106.7,
};
const address = {
    address: "456 Lê Lợi, Q1",
    lat: 10.78,
    long: 106.69,
};
(0, vitest_1.describe)("validateCheckoutFields", () => {
    (0, vitest_1.it)("passes when all required fields are present", () => {
        const result = (0, checkout_validation_1.validateCheckoutFields)(address, "0901234567", store, Date.now() + 3600000);
        (0, vitest_1.expect)(result.isValid).toBe(true);
        (0, vitest_1.expect)(result.errors).toHaveLength(0);
    });
    (0, vitest_1.it)("flags missing address", () => {
        const result = (0, checkout_validation_1.validateCheckoutFields)(null, "0901234567", store, 1000);
        (0, vitest_1.expect)(result.isValid).toBe(false);
        (0, vitest_1.expect)(result.missingFields.address).toBe(true);
    });
});
(0, vitest_1.describe)("validateGuestCheckoutFields", () => {
    (0, vitest_1.it)("passes for valid guest input", () => {
        const result = (0, checkout_validation_1.validateGuestCheckoutFields)("Nguyễn Văn A", "0901234567", address, store, Date.now() + 3600000);
        (0, vitest_1.expect)(result.isValid).toBe(true);
    });
    (0, vitest_1.it)("rejects invalid phone", () => {
        const result = (0, checkout_validation_1.validateGuestCheckoutFields)("Nguyễn Văn A", "12345", address, store, Date.now() + 3600000);
        (0, vitest_1.expect)(result.isValid).toBe(false);
        (0, vitest_1.expect)(result.missingFields.phone).toBe(true);
    });
    (0, vitest_1.it)("rejects missing name", () => {
        const result = (0, checkout_validation_1.validateGuestCheckoutFields)("", "0901234567", address, store, Date.now() + 3600000);
        (0, vitest_1.expect)(result.isValid).toBe(false);
        (0, vitest_1.expect)(result.missingFields.name).toBe(true);
    });
    (0, vitest_1.it)("returns first error message", () => {
        const result = (0, checkout_validation_1.validateGuestCheckoutFields)("", "", null, null, null);
        (0, vitest_1.expect)((0, checkout_validation_1.getFirstValidationError)(result)).toBeTruthy();
    });
});
(0, vitest_1.describe)("buildOrderPayload", () => {
    (0, vitest_1.it)("builds ZMA-compatible payload", async () => {
        const { buildOrderPayload } = await Promise.resolve().then(() => __importStar(require("../utils/order-payload")));
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
        (0, vitest_1.expect)(payload.customerName).toBe("Guest");
        (0, vitest_1.expect)(payload.items).toHaveLength(1);
        (0, vitest_1.expect)(payload.items[0].unitPrice).toBe(45000);
        (0, vitest_1.expect)(payload.total).toBe(115000);
        (0, vitest_1.expect)(payload.shipping_service_id).toBe("SGN-ECO");
    });
});
