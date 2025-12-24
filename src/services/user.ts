import { pool } from "./db";

// Internal User Logic Only
// Zalo Users (Customers) are now handled in customer.ts

export const getAllInternalUsers = async () => {
  try {
    const { rows } = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    return rows;
  } catch (error) {
    console.error("Error fetching internal users:", error);
    return [];
  }
};
