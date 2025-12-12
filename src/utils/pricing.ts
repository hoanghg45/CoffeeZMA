/**
 * Pricing utilities - Pure functions for price calculation
 * Single source of truth for all pricing logic
 */

import { Voucher, PriceBreakdown } from "../types/voucher";
import { Cart, CartItem } from "../types/cart";
import { calcFinalPrice } from "./product";

/**
 * Calculate discount amount from voucher
 */
export function calculateDiscount(
    voucher: Voucher,
    eligibleSubtotal: number
): number {
    if (eligibleSubtotal <= 0) return 0;

    let discount = 0;

    if (voucher.discountType === 'PERCENT') {
        discount = eligibleSubtotal * (voucher.discountValue / 100);
        // Apply max discount cap for percentage vouchers
        if (voucher.maxDiscount !== null && discount > voucher.maxDiscount) {
            discount = voucher.maxDiscount;
        }
    } else {
        // FIXED discount
        discount = voucher.discountValue;
    }

    // Cannot discount more than eligible subtotal
    return Math.min(discount, eligibleSubtotal);
}

/**
 * Calculate price for a single cart item
 */
export function calcCartItemPrice(item: CartItem): number {
    return calcFinalPrice(item.product, item.options);
}

/**
 * Calculate eligible subtotal based on voucher scope
 */
function calculateEligibleSubtotal(
    voucher: Voucher | null,
    cart: Cart
): number {
    const totalSubtotal = cart.reduce(
        (sum, item) => sum + calcCartItemPrice(item) * item.quantity,
        0
    );

    if (!voucher) return totalSubtotal;

    if (voucher.scopeType === 'UNIVERSAL') {
        return totalSubtotal;
    }

    if (voucher.scopeType === 'PRODUCT_SPECIFIC' && voucher.productIds?.length) {
        return cart
            .filter(item => voucher.productIds!.includes(item.product.id))
            .reduce((sum, item) => sum + calcCartItemPrice(item) * item.quantity, 0);
    }

    if (voucher.scopeType === 'CATEGORY_SPECIFIC' && voucher.categoryIds?.length) {
        return cart
            .filter(item =>
                item.product.categoryId.some(catId => voucher.categoryIds!.includes(catId))
            )
            .reduce((sum, item) => sum + calcCartItemPrice(item) * item.quantity, 0);
    }

    return totalSubtotal;
}

/**
 * Main price calculation function
 * Returns complete price breakdown for checkout
 */
export function calculatePriceBreakdown(
    cart: Cart,
    voucher: Voucher | null,
    shippingFee: number,
    voucherError: string | null = null
): PriceBreakdown {
    // Calculate subtotal
    const subtotal = cart.reduce(
        (sum, item) => sum + calcCartItemPrice(item) * item.quantity,
        0
    );

    // Empty cart
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

    // No valid voucher
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

    // Calculate with voucher
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
