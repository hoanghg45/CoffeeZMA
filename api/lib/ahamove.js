const crypto = require("crypto");

async function getAhaMoveConfig(pool) {
  try {
    const { rows } = await pool.query(
      `SELECT key, value FROM store_config
       WHERE key IN ('AHAMOVE_V3_TOKEN', 'AHAMOVE_API_URL')`,
    );
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      token: map.AHAMOVE_V3_TOKEN || process.env.AHAMOVE_V3_TOKEN || "",
      apiUrl:
        map.AHAMOVE_API_URL ||
        process.env.AHAMOVE_API_URL ||
        "https://partner-apistg.ahamove.com/v3",
    };
  } catch {
    return {
      token: process.env.AHAMOVE_V3_TOKEN || "",
      apiUrl:
        process.env.AHAMOVE_API_URL ||
        "https://partner-apistg.ahamove.com/v3",
    };
  }
}

async function estimateAhaMoveFee(pool, params) {
  const { token, apiUrl } = await getAhaMoveConfig(pool);

  if (!token) {
    throw new Error("AhaMove token is not configured");
  }

  const requestBody = {
    path: params.path,
    services: [{ _id: params.serviceId || "SGN-ECO" }],
    items: params.items,
    payment_method: params.payment_method || "CASH",
  };

  if (params.order_time) requestBody.order_time = params.order_time;
  if (params.remarks) requestBody.remarks = params.remarks;
  if (params.promo_code) requestBody.promo_code = params.promo_code;

  const response = await fetch(`${apiUrl}/orders/estimates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `AhaMove estimate failed (${response.status}): ${errorText}`,
    );
  }

  const data = await response.json();

  if (Array.isArray(data) && data.length > 0) {
    const item = data[0];

    if (item.error) {
      if (item.error.code === "INVALID_MAX_DISTANCE") {
        throw new Error("Vượt quá giới hạn 100km");
      }
      throw new Error(
        item.error.description || item.error.title || "Lỗi giao hàng",
      );
    }

    if (item.data) {
      return {
        total_pay: item.data.total_price || item.data.total_pay || 0,
        distance: item.data.distance || 0,
        duration: item.data.duration || 0,
        currency: item.data.currency || "VND",
      };
    }
  }

  return {
    total_pay: data.total_pay || data.fee || 0,
    distance: data.distance || 0,
    duration: data.duration || 0,
    currency: data.currency || "VND",
  };
}

function generateLookupCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

function generateOrderId() {
  return crypto.randomUUID();
}

module.exports = {
  estimateAhaMoveFee,
  generateLookupCode,
  generateOrderId,
};
