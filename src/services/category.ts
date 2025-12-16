import { Category } from "../types/category";
import { pool } from "./db";

export const getCategories = async (): Promise<Category[]> => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, icon FROM categories ORDER BY display_order ASC"
    );
    return rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};




