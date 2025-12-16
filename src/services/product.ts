import { Product } from "../types/product";
import { pool } from "./db";

export const getProducts = async (): Promise<Product[]> => {
  try {
    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.base_price as price, 
        p.image, 
        p.description,
        COALESCE(
          json_agg(DISTINCT pc.category_id) FILTER (WHERE pc.category_id IS NOT NULL), 
          '[]'
        ) as "categoryId",
        COALESCE(
          json_agg(DISTINCT pog.option_group_id) FILTER (WHERE pog.option_group_id IS NOT NULL),
          '[]'
        ) as "variantId"
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN product_option_groups pog ON p.id = pog.product_id
      WHERE p.is_available = true
      GROUP BY p.id
    `;

    const { rows } = await pool.query(query);
    
    // Convert price to number (postgres numeric is string in JS usually)
    return rows.map(row => ({
      ...row,
      price: Number(row.price),
      categoryId: row.categoryId,
      variantId: row.variantId // Intermediate property, will be mapped to variants objects in state
    })) as any as Product[]; // Type cast as we are returning objects that match Product shape but have variantId instead of variants
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};




