import { pool } from "./db";

export const getStoreConfig = async (key: string): Promise<string | null> => {
    try {
        const { rows } = await pool.query(
            "SELECT value FROM store_config WHERE key = $1",
            [key]
        );

        if (rows.length > 0) {
            return rows[0].value;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching store config for key ${key}:`, error);
        return null;
    }
};
