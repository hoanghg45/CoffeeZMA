const { pool } = require("../lib/db");
const {
  applyCors,
  sendJson,
  sendError,
  readJsonBody,
} = require("../lib/http");
const { estimateAhaMoveFee } = require("../lib/ahamove");

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(req);

    if (!body.path || !Array.isArray(body.path) || body.path.length < 2) {
      return sendError(res, 400, "INVALID_PATH", "path must include pickup and delivery points");
    }

    const result = await estimateAhaMoveFee(pool, {
      path: body.path,
      items: body.items || [],
      payment_method: body.payment_method || "CASH",
      order_time: body.order_time,
      remarks: body.remarks,
      promo_code: body.promo_code,
      serviceId: body.serviceId || body.service_id || "SGN-ECO",
    });

    return sendJson(res, 200, result);
  } catch (error) {
    console.error("[api/shipping/estimate]", error);
    const message = error instanceof Error ? error.message : "Estimate failed";
    if (message.includes("100km")) {
      return sendError(res, 400, "INVALID_MAX_DISTANCE", message);
    }
    if (message.includes("token")) {
      return sendError(res, 503, "SHIPPING_UNAVAILABLE", message);
    }
    return sendError(res, 500, "ESTIMATE_FAILED", message);
  }
};
