/**
 * Voucher types for price calculation
 * Maps to Neon DB: vouchers, voucher_products, voucher_categories
 */

export type VoucherDiscountType = 'PERCENT' | 'FIXED';
export type VoucherStatus = 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'DEPLETED';
export type VoucherScopeType = 'UNIVERSAL' | 'PRODUCT_SPECIFIC' | 'CATEGORY_SPECIFIC';

export interface Voucher {
    id: string;
    code: string;
    description: string | null;
    discountType: VoucherDiscountType;
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number | null;
    startDate: Date;
    endDate: Date;
    usageLimit: number | null;
    usageCount: number;
    status: VoucherStatus;
    scopeType: VoucherScopeType;
    productIds?: string[];
    categoryIds?: string[];
}

export interface PriceBreakdown {
    subtotal: number;
    eligibleSubtotal: number; // Subtotal of items eligible for this voucher
    discount: number;
    shippingFee: number;
    finalPrice: number;
    earnedPoints?: number; // Potential points to be earned from this order
    voucher: Voucher | null;
    error: string | null;
}

export interface VoucherValidationResult {
    isValid: boolean;
    voucher: Voucher | null;
    error: string | null;
}

/**
 * Voucher with pre-calculated eligibility for smooth UX
 */
export interface VoucherWithEligibility extends Voucher {
    isEligible: boolean;
    reason: string | null;  // Human-readable reason if not eligible
    potentialDiscount: number;  // How much user would save
}
