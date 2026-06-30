"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOrderPayload = buildOrderPayload;
exports.guestAddressToPayload = guestAddressToPayload;
const product_pricing_1 = require("./product-pricing");
/** Build POST /api/orders body — matches ZMA createOrderAPI contract. */
function buildOrderPayload(input) {
    const items = input.cart.map((item) => {
        const unitPrice = (0, product_pricing_1.calcFinalPrice)(item.product, item.options);
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
function guestAddressToPayload(address) {
    return {
        customerAddress: address.address,
        deliveryLat: address.lat,
        deliveryLng: address.long,
    };
}
