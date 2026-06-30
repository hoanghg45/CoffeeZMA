export type VoucherDiscountType = "PERCENT" | "FIXED";
export type VoucherStatus = "ACTIVE" | "UPCOMING" | "EXPIRED" | "DEPLETED";
export type VoucherScopeType =
  | "UNIVERSAL"
  | "PRODUCT_SPECIFIC"
  | "CATEGORY_SPECIFIC";

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
  eligibleSubtotal: number;
  discount: number;
  shippingFee: number;
  finalPrice: number;
  earnedPoints?: number;
  voucher: Voucher | null;
  error: string | null;
}

export interface VoucherValidationResult {
  isValid: boolean;
  voucher: Voucher | null;
  error: string | null;
}

export interface VoucherWithEligibility extends Voucher {
  isEligible: boolean;
  reason: string | null;
  potentialDiscount: number;
}
