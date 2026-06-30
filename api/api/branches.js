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
      `SELECT id, name, address, phone, lat, long
       FROM branches 
       WHERE is_active = true OR is_active IS NULL
       ORDER BY name`,
    );

    const branches = rows
      .map((row) => ({
        id: row.id,
        name: row.name,
        address: row.address,
        phone: row.phone,
        lat: row.lat ? Number(row.lat) : 0,
        long: row.long ? Number(row.long) : 0,
      }))
      .filter((store) => store.lat !== 0 && store.long !== 0);

    return sendJson(res, 200, branches);
  } catch (error) {
    console.error("[api/branches]", error);
    return sendJson(res, 500, { error: "Failed to fetch branches" });
  }
};
