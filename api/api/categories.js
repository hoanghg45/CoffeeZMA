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
      "SELECT id, name, icon, image FROM categories ORDER BY display_order ASC",
    );
    return sendJson(res, 200, rows);
  } catch (error) {
    console.error("[api/categories]", error);
    return sendJson(res, 500, { error: "Failed to fetch categories" });
  }
};
