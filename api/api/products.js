const { pool } = require("../lib/db");
const { applyCors, sendJson } = require("../lib/http");

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

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
        ) as "categoryId"
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      WHERE p.is_available = true
      GROUP BY p.id
      ORDER BY p.name
    `;
    const { rows } = await pool.query(query);
    const products = rows.map((row) => ({
      ...row,
      price: Number(row.price),
      categoryId: row.categoryId || [],
    }));
    return sendJson(res, 200, products);
  } catch (error) {
    console.error("[api/products]", error);
    return sendJson(res, 500, { error: "Failed to fetch products" });
  }
};
