import type { Voucher, PriceBreakdown } from "../types/voucher";
import type { Cart, CartItem } from "../types/cart";
export declare function calculateDiscount(voucher: Voucher, eligibleSubtotal: number): number;
export declare function calcCartItemPrice(item: CartItem): number;
export declare function calculatePriceBreakdown(cart: Cart, voucher: Voucher | null, shippingFee: number, voucherError?: string | null): PriceBreakdown;
//# sourceMappingURL=pricing.d.ts.map