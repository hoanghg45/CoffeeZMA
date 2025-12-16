import { pool } from "./db";

export interface CustomerProfile {
    id: number;
    zaloId: string;
    name: string;
    avatar: string; // url
    phone?: string;
    isLoyaltyMember: boolean;
    loyaltyJoinedAt?: string;
    loyaltyPoints: number; // calculated from transactions
}

// Maps DB row to domain object
const mapRowToCustomer = (row: any, points: number = 0): CustomerProfile => ({
    id: row.id,
    zaloId: row.zalo_id,
    name: row.name,
    avatar: row.avatar,
    phone: row.phone,
    isLoyaltyMember: row.is_loyalty_member,
    loyaltyJoinedAt: row.loyalty_joined_at,
    loyaltyPoints: points,
});

export const getCustomerByZaloId = async (
    zaloId: string
): Promise<CustomerProfile | null> => {
    if (!zaloId) return null;

    try {
        // Fetch customer and their total points in one go (or two queries)
        // For simplicity, let's fetch customer first
        const res = await pool.query("SELECT * FROM customers WHERE zalo_id = $1", [
            zaloId,
        ]);
        const customer = res.rows[0];

        if (!customer) return null;

        // Calculate points
        // Sum of points from loyalty_transactions
        const pointsRes = await pool.query(
            "SELECT SUM(points) as total FROM loyalty_transactions WHERE customer_id = $1",
            [customer.id]
        );
        const totalPoints = parseInt(pointsRes.rows[0].total || "0", 10);

        return mapRowToCustomer(customer, totalPoints);
    } catch (error) {
        console.error("Error fetching customer by Zalo ID:", error);
        return null;
    }
};

export const createCustomer = async (
    zaloId: string,
    name: string,
    avatar: string,
    phone?: string
): Promise<CustomerProfile | null> => {
    try {
        const res = await pool.query(
            `INSERT INTO customers (zalo_id, name, avatar, phone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (zalo_id) DO UPDATE 
       SET name = EXCLUDED.name, avatar = EXCLUDED.avatar, phone = COALESCE(customers.phone, EXCLUDED.phone)
       RETURNING *`,
            [zaloId, name, avatar, phone]
        );
        const customer = res.rows[0];
        return mapRowToCustomer(customer, 0);
    } catch (error) {
        console.error("Error creating/updating customer:", error);
        return null;
    }
};

export const markCustomerAsLoyaltyMember = async (
    customerId: number,
    channel: string = "manual"
): Promise<boolean> => {
    try {
        await pool.query(
            `UPDATE customers 
       SET is_loyalty_member = TRUE, 
           loyalty_joined_at = NOW(), 
           loyalty_opt_in_channel = $2
       WHERE id = $1`,
            [customerId, channel]
        );

        // Create an enrollment transaction record
        await pool.query(
            `INSERT INTO loyalty_transactions (customer_id, type, points, note)
       VALUES ($1, 'ENROLL', 0, 'Welcome to the loyalty program')`,
            [customerId]
        );

        return true;
    } catch (error) {
        console.error("Error enrolling customer:", error);
        return false;
    }
};
