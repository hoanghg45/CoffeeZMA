import { Store } from "../types/delivery";
import { pool } from "./db";

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager_name?: string;
  lat?: number;
  long?: number;
  is_active?: boolean;
}

export const getBranches = async (): Promise<Store[]> => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        id, 
        name, 
        address, 
        phone,
        lat, 
        COALESCE(lng, long) as long
      FROM branches 
      WHERE is_active = true OR is_active IS NULL
      ORDER BY name`
    );

    return rows.map((row) => {
      return {
        id: row.id, // ID is already a string (e.g. "branch-1")
        name: row.name,
        address: row.address,
        phone: row.phone,
        lat: row.lat ? Number(row.lat) : 0,
        long: row.long ? Number(row.long) : 0,
      };
    }).filter(store => store.lat !== 0 && store.long !== 0); // Only return stores with coordinates
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
};

export const getBranchById = async (branchId: string): Promise<Branch | null> => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        id, 
        name, 
        address, 
        phone,
        manager_name,
        lat, 
        COALESCE(lng, long) as long,
        is_active
      FROM branches 
      WHERE id = $1`,
      [branchId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      phone: row.phone,
      manager_name: row.manager_name,
      lat: row.lat ? Number(row.lat) : undefined,
      long: row.long ? Number(row.long) : undefined,
      is_active: row.is_active,
    };
  } catch (error) {
    console.error("Error fetching branch:", error);
    return null;
  }
};

