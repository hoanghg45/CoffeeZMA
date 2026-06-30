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
    const { rows } = await pool.query(
      `SELECT 
        id, 
        image_url as "imageUrl", 
        title, 
        link, 
        display_order as "displayOrder", 
        is_active as "isActive" 
       FROM banners 
       WHERE is_active = true 
       ORDER BY display_order ASC`,
    );
    return sendJson(res, 200, rows);
  } catch (error) {
    console.error("[api/banners]", error);
    return sendJson(res, 500, { error: "Failed to fetch banners" });
  }
};
