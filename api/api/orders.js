const {
  applyCors,
  sendJson,
  sendError,
  readJsonBody,
} = require("../lib/http");
const { createOrder, getOrderById } = require("../lib/create-order");

module.exports = async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const orderId =
      req.query?.id ||
      (req.url && new URL(req.url, "http://localhost").searchParams.get("id"));

    if (!orderId) {
      return sendError(res, 400, "MISSING_ORDER_ID", "Query param id is required");
    }

    try {
      const order = await getOrderById(orderId);
      if (!order) {
        return sendError(res, 404, "ORDER_NOT_FOUND", "Order not found");
      }
      return sendJson(res, 200, order);
    } catch (error) {
      console.error("[api/orders GET]", error);
      return sendError(res, 500, "FETCH_FAILED", "Failed to fetch order");
    }
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(req);
    const result = await createOrder(body);
    return sendJson(res, 201, result);
  } catch (error) {
    console.error("[api/orders POST]", error);
    const code = error.code || "ORDER_FAILED";
    const status =
      code === "PRICE_MISMATCH" ||
      code === "INVALID_PHONE" ||
      code === "EMPTY_CART" ||
      code === "PRODUCT_NOT_FOUND"
        ? 400
        : 500;
    return sendError(
      res,
      status,
      code,
      error.message || "Failed to create order",
      error.details,
    );
  }
};
