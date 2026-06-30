"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDiscount = calculateDiscount;
exports.calcCartItemPrice = calcCartItemPrice;
exports.calculatePriceBreakdown = calculatePriceBreakdown;
const product_pricing_1 = require("./product-pricing");
function calculateDiscount(voucher, eligibleSubtotal) {
    if (eligibleSubtotal <= 0)
        return 0;
    let discount = 0;
    if (voucher.discountType === "PERCENT") {
        discount = eligibleSubtotal * (voucher.discountValue / 100);
        if (voucher.maxDiscount !== null && discount > voucher.maxDiscount) {
            discount = voucher.maxDiscount;
        }
    }
    else {
        discount = voucher.discountValue;
    }
    return Math.min(discount, eligibleSubtotal);
}
function calcCartItemPrice(item) {
    return (0, product_pricing_1.calcFinalPrice)(item.product, item.options);
}
function calculateEligibleSubtotal(voucher, cart) {
    const totalSubtotal = cart.reduce((sum, item) => sum + calcCartItemPrice(item) * item.quantity, 0);
    if (!voucher)
        return totalSubtotal;
    if (voucher.scopeType === "UNIVERSAL") {
        return totalSubtotal;
    }
    if (voucher.scopeType === "PRODUCT_SPECIFIC" && voucher.productIds?.length) {
        return cart
            .filter((item) => voucher.productIds.includes(item.product.id))
            .reduce((sum, item) => sum + calcCartItemPrice(item) * item.quantity, 0);
    }
    if (voucher.scopeType === "CATEGORY_SPECIFIC" && voucher.categoryIds?.length) {
        return cart
            .filter((item) => item.product.categoryId.some((catId) => voucher.categoryIds.includes(catId)))
            .reduce((sum, item) => sum + calcCartItemPrice(item) * item.quantity, 0);
    }
    return totalSubtotal;
}
function calculatePriceBreakdown(cart, voucher, shippingFee, voucherError = null) {
    const subtotal = cart.reduce((sum, item) => sum + calcCartItemPrice(item) * item.quantity, 0);
    if (cart.length === 0 || subtotal === 0) {
        return {
            subtotal: 0,
            eligibleSubtotal: 0,
            discount: 0,
            shippingFee: 0,
            finalPrice: 0,
            voucher: null,
            error: null,
        };
    }
    if (!voucher || voucherError) {
        return {
            subtotal,
            eligibleSubtotal: subtotal,
            discount: 0,
            shippingFee,
            finalPrice: subtotal + shippingFee,
            voucher: null,
            error: voucherError,
        };
    }
    const eligibleSubtotal = calculateEligibleSubtotal(voucher, cart);
    const discount = calculateDiscount(voucher, eligibleSubtotal);
    const finalPrice = subtotal - discount + shippingFee;
    return {
        subtotal,
        eligibleSubtotal,
        discount,
        shippingFee,
        finalPrice: Math.max(0, finalPrice),
        voucher,
        error: null,
    };
}
