/**
 * Voucher service - DB operations and validation
 * Connects to Neon DB vouchers tables
 */

import { pool } from "./db";
import { Voucher, VoucherValidationResult, VoucherWithEligibility } from "../types/voucher";
import { Cart, CartItem } from "../types/cart";

export interface VoucherQueryContext {
    customerId?: string;
    branchId?: string;
}

/**
 * Map DB row to Voucher type (snake_case → camelCase)
 */
function mapRowToVoucher(row: any): Voucher {
    return {
        id: row.id,
        code: row.code,
        description: row.description,
        discountType: row.discount_type,
        discountValue: parseFloat(row.discount_value),
        minOrderValue: parseFloat(row.min_order_value || 0),
        maxDiscount: row.max_discount ? parseFloat(row.max_discount) : null,
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        usageLimit: row.usage_limit ? parseInt(row.usage_limit) : null,
        usageCount: parseInt(row.usage_count || 0),
        status: row.status,
        scopeType: row.scope_type,
        productIds: row.product_ids || [],
        categoryIds: row.category_ids || [],
    };
}

/**
 * Fetch vouchers visible to one customer.
 *
 * Visibility rules:
 * - broadcast vouchers have no customer owner and no visit trigger;
 * - personal copies must belong to the current customer;
 * - visit templates are offered only when the customer's next order reaches
 *   the milestone and that rule has never been issued to them.
 */
async function getVisibleVouchers(
    context: VoucherQueryContext,
    code?: string
): Promise<Voucher[]> {
    try {
        const query = `
      SELECT 
        v.*,
        COALESCE(
          array_agg(DISTINCT vp.product_id) FILTER (WHERE vp.product_id IS NOT NULL),
          '{}'
        ) as product_ids,
        COALESCE(
          array_agg(DISTINCT vc.category_id) FILTER (WHERE vc.category_id IS NOT NULL),
          '{}'
        ) as category_ids
      FROM vouchers v
      LEFT JOIN voucher_products vp ON v.id = vp.voucher_id
      LEFT JOIN voucher_categories vc ON v.id = vc.voucher_id
      LEFT JOIN branch_vouchers bv
        ON v.id = bv.voucher_id
       AND bv.branch_id = $3
      WHERE ($2::text IS NULL OR UPPER(v.code) = UPPER($2))
        AND v.status = 'ACTIVE'
        AND v.start_date <= NOW()
        AND v.end_date >= NOW()
        AND (v.usage_limit IS NULL OR v.usage_count < v.usage_limit)
        AND ($3::text IS NULL OR COALESCE(bv.is_active, true) = true)
        AND (
          (
            v.trigger_type IS NULL
            AND NOT EXISTS (
              SELECT 1
              FROM customer_vouchers owned
              WHERE owned.voucher_id = v.id
            )
          )
          OR EXISTS (
            SELECT 1
            FROM customer_vouchers owned
            WHERE owned.voucher_id = v.id
              AND owned.customer_id = $1
          )
          OR (
            v.trigger_type = 'VISIT_COUNT'
            AND $1::text IS NOT NULL
            AND EXISTS (
              SELECT 1
              FROM customers customer
              WHERE customer.id = $1
                AND customer.total_orders + 1 >= v.trigger_value
            )
            AND NOT EXISTS (
              SELECT 1
              FROM customer_vouchers issued
              WHERE issued.customer_id = $1
                AND issued.voucher_rule_id = v.id
            )
          )
        )
      GROUP BY v.id
      ORDER BY v.discount_value DESC
    `;

        const { rows } = await pool.query(query, [
            context.customerId || null,
            code || null,
            context.branchId || null,
        ]);
        return rows.map(mapRowToVoucher);
    } catch (error) {
        console.error("Error fetching visible vouchers:", error);
        throw error;
    }
}

/**
 * Fetch one customer-visible voucher by code.
 */
export async function getVoucherByCode(
    code: string,
    context: VoucherQueryContext = {}
): Promise<Voucher | null> {
    const vouchers = await getVisibleVouchers(context, code);
    return vouchers[0] || null;
}

/**
 * Fetch all active vouchers visible to the current customer.
 */
export async function getActiveVouchers(
    context: VoucherQueryContext = {}
): Promise<Voucher[]> {
    return getVisibleVouchers(context);
}

/**
 * Pure validation function - no side effects
 */
export function validateVoucher(
    voucher: Voucher | null,
    cart: Cart,
    subtotal: number,
    branchId?: number
): VoucherValidationResult {
    // No voucher applied
    if (!voucher) {
        return { isValid: false, voucher: null, error: null };
    }

    // Status check
    if (voucher.status !== 'ACTIVE') {
        return { isValid: false, voucher, error: `Mã "${voucher.code}" không còn hiệu lực` };
    }

    // Date validation
    const now = new Date();
    if (now < voucher.startDate) {
        return { isValid: false, voucher, error: `Mã "${voucher.code}" chưa bắt đầu` };
    }
    if (now > voucher.endDate) {
        return { isValid: false, voucher, error: `Mã "${voucher.code}" đã hết hạn` };
    }

    // Usage limit
    if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
        return { isValid: false, voucher, error: `Mã "${voucher.code}" đã hết lượt sử dụng` };
    }

    // Minimum order value
    if (subtotal < voucher.minOrderValue) {
        const minFormatted = voucher.minOrderValue.toLocaleString('vi-VN');
        return {
            isValid: false,
            voucher,
            error: `Đơn tối thiểu ${minFormatted}đ để sử dụng mã này`
        };
    }

    // Scope validation for PRODUCT_SPECIFIC
    if (voucher.scopeType === 'PRODUCT_SPECIFIC' && voucher.productIds?.length) {
        const hasEligibleProduct = cart.some(item =>
            voucher.productIds!.includes(item.product.id)
        );
        if (!hasEligibleProduct) {
            return {
                isValid: false,
                voucher,
                error: `Mã này chỉ áp dụng cho một số sản phẩm nhất định`
            };
        }
    }

    // Scope validation for CATEGORY_SPECIFIC
    if (voucher.scopeType === 'CATEGORY_SPECIFIC' && voucher.categoryIds?.length) {
        const hasEligibleCategory = cart.some(item =>
            item.product.categoryId.some(catId => voucher.categoryIds!.includes(catId))
        );
        if (!hasEligibleCategory) {
            return {
                isValid: false,
                voucher,
                error: `Mã này chỉ áp dụng cho một số danh mục nhất định`
            };
        }
    }

    return { isValid: true, voucher, error: null };
}

/**
 * Calculate eligible subtotal based on voucher scope
 */
export function calculateEligibleSubtotal(
    voucher: Voucher,
    cart: Cart,
    calcItemPrice: (item: CartItem) => number
): number {
    if (voucher.scopeType === 'UNIVERSAL') {
        return cart.reduce((sum, item) => sum + calcItemPrice(item) * item.quantity, 0);
    }

    if (voucher.scopeType === 'PRODUCT_SPECIFIC' && voucher.productIds?.length) {
        return cart
            .filter(item => voucher.productIds!.includes(item.product.id))
            .reduce((sum, item) => sum + calcItemPrice(item) * item.quantity, 0);
    }

    if (voucher.scopeType === 'CATEGORY_SPECIFIC' && voucher.categoryIds?.length) {
        return cart
            .filter(item =>
                item.product.categoryId.some(catId => voucher.categoryIds!.includes(catId))
            )
            .reduce((sum, item) => sum + calcItemPrice(item) * item.quantity, 0);
    }

    return 0;
}

/**
 * Pre-calculate eligibility for all active vouchers
 * Returns vouchers sorted: eligible first, then by discount value
 */
export async function getVouchersWithEligibility(
    cart: Cart,
    subtotal: number,
    calcItemPrice: (item: CartItem) => number,
    context: VoucherQueryContext = {}
): Promise<VoucherWithEligibility[]> {
    const vouchers = await getActiveVouchers(context);

    return vouchers
        .map(voucher => {
            const validation = validateVoucher(voucher, cart, subtotal);
            const eligibleSubtotal = calculateEligibleSubtotal(voucher, cart, calcItemPrice);

            // Calculate potential discount
            let potentialDiscount = 0;
            if (validation.isValid && eligibleSubtotal > 0) {
                if (voucher.discountType === 'PERCENT') {
                    potentialDiscount = eligibleSubtotal * (voucher.discountValue / 100);
                    if (voucher.maxDiscount && potentialDiscount > voucher.maxDiscount) {
                        potentialDiscount = voucher.maxDiscount;
                    }
                } else {
                    potentialDiscount = Math.min(voucher.discountValue, eligibleSubtotal);
                }
            }

            // Determine reason for ineligibility
            let reason: string | null = null;
            if (!validation.isValid) {
                reason = validation.error;
            } else if (eligibleSubtotal === 0 && voucher.scopeType !== 'UNIVERSAL') {
                reason = "Không có sản phẩm phù hợp trong giỏ";
            }

            return {
                ...voucher,
                isEligible: validation.isValid && (voucher.scopeType === 'UNIVERSAL' || eligibleSubtotal > 0),
                reason,
                potentialDiscount,
            } as VoucherWithEligibility;
        })
        // Sort: eligible first, then by potential discount
        .sort((a, b) => {
            if (a.isEligible && !b.isEligible) return -1;
            if (!a.isEligible && b.isEligible) return 1;
            return b.potentialDiscount - a.potentialDiscount;
        });
}
