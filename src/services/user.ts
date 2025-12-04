import { pool } from "./db";

export interface UserAddress {
  id: string;
  userId: string;
  name: string;
  address: string;
  lat: number;
  long: number;
  phone: string;
  isDefault: boolean;
}

export const getUserAddresses = async (userId: string): Promise<UserAddress[]> => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        id, 
        user_id as "userId", 
        name, 
        address, 
        lat, 
        long, 
        phone, 
        is_default as "isDefault"
      FROM user_addresses 
      WHERE user_id = $1 
      ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    
    // Ensure numeric fields are numbers (pg numeric is string)
    return rows.map(row => ({
      ...row,
      lat: Number(row.lat),
      long: Number(row.long)
    }));
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return [];
  }
};

export const saveUserAddress = async (address: Omit<UserAddress, 'id'> & { id?: string }): Promise<UserAddress | null> => {
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // If setting as default, unset others
      if (address.isDefault) {
        await client.query(
          'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
          [address.userId]
        );
      }

      let result;
      if (address.id) {
        // Update
        result = await client.query(
          `UPDATE user_addresses 
           SET name = $1, address = $2, lat = $3, long = $4, phone = $5, is_default = $6, updated_at = NOW()
           WHERE id = $7 AND user_id = $8
           RETURNING id, user_id as "userId", name, address, lat, long, phone, is_default as "isDefault"`,
          [address.name, address.address, address.lat, address.long, address.phone, address.isDefault, address.id, address.userId]
        );
      } else {
        // Create
        const newId = `addr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        result = await client.query(
          `INSERT INTO user_addresses (id, user_id, name, address, lat, long, phone, is_default)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, user_id as "userId", name, address, lat, long, phone, is_default as "isDefault"`,
          [newId, address.userId, address.name, address.address, address.lat, address.long, address.phone, address.isDefault]
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
    console.error("Error saving user address:", error);
    return null;
  }
};

export const ensureUserExists = async (userInfo: { id: string; name: string; avatar: string }) => {
  try {
    // Simplified upsert
    await pool.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES ($1, $2, $3, 'STAFF', 'ACTIVE')
       ON CONFLICT (id) DO UPDATE 
       SET name = EXCLUDED.name, last_login = NOW()`,
      [userInfo.id, userInfo.name, `${userInfo.id}@zalo.me`] // Mock email
    );
  } catch (error) {
    console.error("Error ensuring user:", error);
  }
};

