const { applyCors, sendJson } = require("../lib/http");
const { fetchVariantsFromDb } = require("../lib/catalog");

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const variants = await fetchVariantsFromDb();
    return sendJson(res, 200, variants);
  } catch (error) {
    console.error("[api/variants]", error);
    return sendJson(res, 500, { error: "Failed to fetch variants" });
  }
};
