const {
  calcFinalPrice,
  isValidVietnamesePhone,
  normalizePhoneE164,
} = require("@muoi/core");
const { pool } = require("./db");
const { fetchProductsWithVariants, fetchBranchById } = require("./catalog");
const { generateLookupCode, generateOrderId } = require("./ahamove");

const PRICE_TOLERANCE = 1;

function flattenOptions(options) {
  if (!options || typeof options !== "object") return [];
  const names = [];
  for (const key of Object.keys(options)) {
    const value = options[key];
    if (Array.isArray(value)) {
      names.push(...value);
    } else if (value) {
      names.push(String(value));
    }
  }
  return names;
}

function validateOrderInput(body) {
  const errors = [];

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    errors.push("EMPTY_CART");
  }
  if (!body.customerName || !String(body.customerName).trim()) {
    errors.push("MISSING_NAME");
  }
  if (!body.customerPhone || !isValidVietnamesePhone(body.customerPhone)) {
    errors.push("INVALID_PHONE");
  }
  if (!body.customerAddress || !String(body.customerAddress).trim()) {
    errors.push("MISSING_ADDRESS");
  }
  if (!body.paymentMethod) {
    errors.push("MISSING_PAYMENT_METHOD");
  }
  if (body.total == null || body.subtotal == null || body.shipFee == null) {
    errors.push("MISSING_FEES");
  }

  return errors;
}

async function upsertGuestCustomer(client, { name, phone }) {
  const e164 = normalizePhoneE164(phone);
  const displayPhone = phone.replace(/\D/g, "").startsWith("84")
    ? "0" + phone.replace(/\D/g, "").substring(2)
    : phone.replace(/\D/g, "");

  const existing = await client.query(
    `SELECT id FROM customers
     WHERE phone_number = $1 OR phone_number = $2
     LIMIT 1`,
    [displayPhone, e164],
  );

  if (existing.rows.length > 0) {
    const customerId = existing.rows[0].id;
    await client.query(
      `UPDATE customers SET name = $1, source = COALESCE(source, 'web')
       WHERE id = $2`,
      [name.trim(), customerId],
    );
    return customerId;
  }

  const customerId = `web_${generateOrderId()}`;
  await client.query(
    `INSERT INTO customers (id, zalo_id, name, avatar, phone_number, segment, source)
     VALUES ($1, NULL, $2, '', $3, 'NEW', 'web')`,
    [customerId, name.trim(), displayPhone],
  );
  return customerId;
}

async function recomputeOrderTotals(body) {
  const catalog = await fetchProductsWithVariants();
  const productMap = new Map(catalog.map((p) => [String(p.id), p]));

  let subtotal = 0;
  const lineItems = [];

  for (const item of body.items) {
    const product = productMap.get(String(item.productId));
    if (!product) {
      throw Object.assign(new Error(`Product not found: ${item.productId}`), {
        code: "PRODUCT_NOT_FOUND",
      });
    }

    const unitPrice = calcFinalPrice(product, item.options || {});
    const quantity = Number(item.quantity) || 0;
    if (quantity <= 0) {
      throw Object.assign(new Error("Invalid quantity"), {
        code: "INVALID_QUANTITY",
      });
    }

    subtotal += unitPrice * quantity;
    lineItems.push({
      productId: String(product.id),
      productName: product.name,
      unitPrice,
      quantity,
      totalPrice: unitPrice * quantity,
      options: item.options || {},
    });
  }

  const discount = Number(body.discount) || 0;
  const shipFee = Number(body.shipFee) || 0;
  const total = subtotal + shipFee - discount;

  return { subtotal, shipFee, discount, total, lineItems };
}

function assertPriceMatch(clientValue, serverValue, field) {
  if (Math.abs(Number(clientValue) - Number(serverValue)) > PRICE_TOLERANCE) {
    throw Object.assign(
      new Error(`${field} mismatch: client=${clientValue}, server=${serverValue}`),
      {
        code: "PRICE_MISMATCH",
        details: { field, client: clientValue, server: serverValue },
      },
    );
  }
}

async function createOrder(body) {
  const validationErrors = validateOrderInput(body);
  if (validationErrors.length > 0) {
    throw Object.assign(new Error(validationErrors[0]), {
      code: validationErrors[0],
    });
  }

  const branchId = body.branchId || "branch-1";
  const branch = await fetchBranchById(branchId);
  if (!branch) {
    throw Object.assign(new Error(`Branch not found: ${branchId}`), {
      code: "BRANCH_NOT_FOUND",
    });
  }

  const computed = await recomputeOrderTotals(body);

  assertPriceMatch(body.subtotal, computed.subtotal, "subtotal");
  assertPriceMatch(body.shipFee, computed.shipFee, "shipFee");
  assertPriceMatch(body.discount, computed.discount, "discount");
  assertPriceMatch(body.total, computed.total, "total");

  const orderId = generateOrderId();
  const lookupCode = generateLookupCode();
  const status =
    String(body.paymentMethod).toUpperCase().includes("COD")
      ? "CONFIRMED"
      : "PENDING";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const customerId = await upsertGuestCustomer(client, {
      name: body.customerName,
      phone: body.customerPhone,
    });

    await client.query(
      `INSERT INTO orders (
        id, customer_id, customer_name, customer_phone, customer_address,
        status, payment_method, total, subtotal, ship_fee, discount,
        note, branch_id, shipping_service_id, delivery_lat, delivery_lng,
        lookup_code, created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, NOW()
      )`,
      [
        orderId,
        customerId,
        body.customerName.trim(),
        body.customerPhone.replace(/\D/g, "").startsWith("84")
          ? "0" + body.customerPhone.replace(/\D/g, "").substring(2)
          : body.customerPhone,
        body.customerAddress.trim(),
        status,
        body.paymentMethod,
        computed.total,
        computed.subtotal,
        computed.shipFee,
        computed.discount,
        body.note || "",
        branchId,
        body.shipping_service_id || body.shippingServiceId || "SGN-ECO",
        body.deliveryLat ?? null,
        body.deliveryLng ?? null,
        lookupCode,
      ],
    );

    for (const line of computed.lineItems) {
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          orderId,
          line.productId,
          line.productName,
          line.unitPrice,
          line.quantity,
        ],
      );
      const orderItemId = itemResult.rows[0].id;
      const optionNames = flattenOptions(line.options);
      for (const optionName of optionNames) {
        await client.query(
          `INSERT INTO order_item_options (order_item_id, option_name)
           VALUES ($1, $2)`,
          [orderItemId, optionName],
        );
      }
    }

    await client.query("COMMIT");

    return {
      orderId,
      lookupCode,
      status,
      total: computed.total,
      customerId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getOrderById(orderId) {
  const orderResult = await pool.query(
    `SELECT id, status, total, payment_method, customer_name, customer_phone,
            customer_address, lookup_code, created_at, shipping_service_id
     FROM orders WHERE id = $1`,
    [orderId],
  );

  if (orderResult.rows.length === 0) return null;

  const order = orderResult.rows[0];
  const itemsResult = await pool.query(
    `SELECT product_id, product_name, unit_price, quantity
     FROM order_items WHERE order_id = $1`,
    [orderId],
  );

  return {
    orderId: order.id,
    lookupCode: order.lookup_code,
    status: order.status,
    total: Number(order.total),
    paymentMethod: order.payment_method,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerAddress: order.customer_address,
    createdAt: order.created_at,
    shippingServiceId: order.shipping_service_id,
    items: itemsResult.rows.map((row) => ({
      productId: row.product_id,
      productName: row.product_name,
      unitPrice: Number(row.unit_price),
      quantity: Number(row.quantity),
    })),
  };
}

module.exports = {
  createOrder,
  getOrderById,
  recomputeOrderTotals,
  validateOrderInput,
};
