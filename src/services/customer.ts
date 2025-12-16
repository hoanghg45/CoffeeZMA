import { pool } from "./db";

export interface CustomerProfile {
    id: string; // TEXT in DB, not INTEGER
    zaloId: string;
    name: string;
    avatar: string;
    phoneNumber?: string;
    isLoyaltyMember: boolean;
    loyaltyJoinedAt?: string;
    loyaltyPoints: number;
    segment: string;
}

/**
 * Maps DB row to CustomerProfile domain object.
 * Aligns with actual customers table schema.
 */
const mapRowToCustomer = (row: any, points: number = 0): CustomerProfile => ({
    id: row.id,
    zaloId: row.zalo_id,
    name: row.name,
    avatar: row.avatar || "",
    phoneNumber: row.phone_number,
    isLoyaltyMember: row.is_loyalty_member ?? false,
    loyaltyJoinedAt: row.loyalty_joined_at,
    loyaltyPoints: points || row.loyalty_points || 0,
    segment: row.segment,
});

/**
 * Get customer by Zalo ID.
 */
export const getCustomerByZaloId = async (
    zaloId: string
): Promise<CustomerProfile | null> => {
    if (!zaloId) {
        console.warn("[customer.ts] getCustomerByZaloId called with empty zaloId");
        return null;
    }

    try {
        const res = await pool.query(
            "SELECT * FROM customers WHERE zalo_id = $1",
            [zaloId]
        );
        const customer = res.rows[0];

        if (!customer) {
            console.log("[customer.ts] No customer found for zalo_id:", zaloId);
            return null;
        }

        // Calculate points from loyalty_transactions
        const pointsRes = await pool.query(
            "SELECT COALESCE(SUM(points), 0) as total FROM loyalty_transactions WHERE customer_id = $1",
            [customer.id]
        );
        const totalPoints = parseInt(pointsRes.rows[0].total || "0", 10);

        return mapRowToCustomer(customer, totalPoints);
    } catch (error) {
        console.error("[customer.ts] Error fetching customer by Zalo ID:", error);
        return null;
    }
};

/**
 * Create a new customer or update existing one.
 * 
 * IMPORTANT: The customers table requires:
 * - id (TEXT, PRIMARY KEY) - we use zaloId as the id
 * - name (TEXT, NOT NULL)
 * - phone_number (TEXT, NOT NULL) - we use a placeholder if not available
 * - segment (TEXT, NOT NULL) - defaults to 'NEW'
 */
export const createCustomer = async (
    zaloId: string,
    name: string,
    avatar: string,
    phoneNumber?: string
): Promise<CustomerProfile | null> => {
    if (!zaloId) {
        console.warn("[customer.ts] createCustomer called with empty zaloId");
        return null;
    }

    try {
        // Use zaloId as the primary key (id)
        // Use placeholder for phone_number if not provided (will be updated later when user grants permission)
        const phone = phoneNumber || `pending_${zaloId}`;

        const res = await pool.query(
            `INSERT INTO customers (id, zalo_id, name, avatar, phone_number, segment)
       VALUES ($1, $2, $3, $4, $5, 'NEW')
       ON CONFLICT (id) DO UPDATE 
       SET name = EXCLUDED.name, 
           avatar = EXCLUDED.avatar,
           updated_at = NOW()
       RETURNING *`,
            [zaloId, zaloId, name, avatar, phone]
        );

        const customer = res.rows[0];
        console.log("[customer.ts] Customer created/updated:", customer.id);
        return mapRowToCustomer(customer, 0);
    } catch (error) {
        console.error("[customer.ts] Error creating/updating customer:", error);
        return null;
    }
};

/**
 * Mark a customer as a loyalty program member.
 */
export const markCustomerAsLoyaltyMember = async (
    customerId: string, // TEXT, not number
    channel: string = "manual"
): Promise<boolean> => {
    if (!customerId) {
        console.warn("[customer.ts] markCustomerAsLoyaltyMember called with empty customerId");
        return false;
    }

    try {
        await pool.query(
            `UPDATE customers 
       SET is_loyalty_member = TRUE, 
           loyalty_joined_at = NOW(), 
           loyalty_opt_in_channel = $2,
           updated_at = NOW()
       WHERE id = $1`,
            [customerId, channel]
        );

        // Create an enrollment transaction record
        await pool.query(
            `INSERT INTO loyalty_transactions (customer_id, type, points, note)
       VALUES ($1, 'ENROLL', 0, 'Welcome to the loyalty program')`,
            [customerId]
        );

        console.log("[customer.ts] Customer enrolled in loyalty:", customerId);
        return true;
    } catch (error) {
        console.error("[customer.ts] Error enrolling customer:", error);
        return false;
    }
};
