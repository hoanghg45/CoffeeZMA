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

// Address Interfaces & Logic - Migrated from user.ts
export interface CustomerAddress {
    id: string;
    customerId: string;
    name: string;
    address: string;
    lat: number;
    long: number;
    phone: string;
    isDefault: boolean;
}

export const getCustomerAddresses = async (customerId: string): Promise<CustomerAddress[]> => {
    try {
        // Querying user_addresses table - treated as customer addresses
        const { rows } = await pool.query(
            `SELECT 
        id, 
        user_id as "customerId", 
        name, 
        address, 
        lat, 
        long, 
        phone, 
        is_default as "isDefault"
      FROM user_addresses 
      WHERE user_id = $1 
      ORDER BY is_default DESC, created_at DESC`,
            [customerId]
        );

        return rows.map(row => ({
            ...row,
            lat: Number(row.lat),
            long: Number(row.long)
        }));
    } catch (error) {
        console.error("[customer.ts] Error fetching customer addresses:", error);
        return [];
    }
};

export const saveCustomerAddress = async (address: Omit<CustomerAddress, 'id'> & { id?: string }): Promise<CustomerAddress | null> => {
    try {
        const client = await pool.connect();

        // Auto-fill coordinates if missing using Mapbox Forward Geocoding
        if ((!address.lat || !address.long) && address.address) {
            try {
                const { forwardGeocode } = await import("./mapbox");
                const coords = await forwardGeocode(address.address);
                if (coords) {
                    console.log(`📍 [customer.ts] Resolved coordinates for "${address.address}":`, coords);
                    address.lat = coords.lat;
                    address.long = coords.long;
                }
            } catch (geoError) {
                console.error("Geocoding failed:", geoError);
            }
        }

        try {
            await client.query('BEGIN');

            if (address.isDefault) {
                await client.query(
                    'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
                    [address.customerId]
                );
            }

            let result;
            if (address.id) {
                // Update
                result = await client.query(
                    `UPDATE user_addresses 
           SET name = $1, address = $2, lat = $3, long = $4, phone = $5, is_default = $6, updated_at = NOW()
           WHERE id = $7 AND user_id = $8
           RETURNING id, user_id as "customerId", name, address, lat, long, phone, is_default as "isDefault"`,
                    [address.name, address.address, address.lat, address.long, address.phone, address.isDefault, address.id, address.customerId]
                );
            } else {
                // Create
                const newId = `addr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                result = await client.query(
                    `INSERT INTO user_addresses (id, user_id, name, address, lat, long, phone, is_default)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, user_id as "customerId", name, address, lat, long, phone, is_default as "isDefault"`,
                    [newId, address.customerId, address.name, address.address, address.lat, address.long, address.phone, address.isDefault]
                );
            }

            await client.query('COMMIT');

            const row = result.rows[0];
            return {
                ...row,
                lat: Number(row.lat),
                long: Number(row.long)
            };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("[customer.ts] Error saving customer address:", error);
        return null;
    }
};

export const deleteCustomerAddress = async (addressId: string, customerId: string): Promise<boolean> => {
    try {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const checkResult = await client.query(
                'SELECT is_default FROM user_addresses WHERE id = $1 AND user_id = $2',
                [addressId, customerId]
            );

            if (checkResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false;
            }

            const isDefault = checkResult.rows[0].is_default;

            const deleteResult = await client.query(
                'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING id',
                [addressId, customerId]
            );

            if (isDefault && deleteResult.rows.length > 0) {
                const remainingResult = await client.query(
                    'SELECT id FROM user_addresses WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1',
                    [customerId]
                );

                if (remainingResult.rows.length > 0) {
                    await client.query(
                        'UPDATE user_addresses SET is_default = true WHERE id = $1',
                        [remainingResult.rows[0].id]
                    );
                }
            }

            await client.query('COMMIT');
            return true;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("[customer.ts] Error deleting customer address:", error);
        return false;
    }
};
