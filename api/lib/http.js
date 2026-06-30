const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const ALLOWED_METHODS = "GET,POST,PUT,PATCH,OPTIONS";

function applyCors(req, res) {
  const origin = req.headers.origin;
  const allowOrigin =
    ALLOWED_ORIGINS.includes("*") ||
    (origin && ALLOWED_ORIGINS.includes(origin))
      ? origin || "*"
      : ALLOWED_ORIGINS[0] || "*";

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Guest-Session, Idempotency-Key",
  );
}

function sendJson(res, status, body) {
  res.status(status).json(body);
}

function sendError(res, status, code, message, details) {
  sendJson(res, status, {
    error: code,
    message,
    ...(details !== undefined ? { details } : {}),
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }

    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

module.exports = {
  applyCors,
  sendJson,
  sendError,
  readJsonBody,
  ALLOWED_METHODS,
};
