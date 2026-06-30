const { pool } = require("../lib/db");

async function fetchVariantsFromDb() {
  const groupsQuery = await pool.query(
    "SELECT id, name as label, selection_type as type FROM option_groups",
  );
  const optionsQuery = await pool.query(
    `SELECT id, option_group_id, name as label, price_adjustment, adjustment_type
     FROM options ORDER BY id`,
  );

  const groups = groupsQuery.rows;
  const options = optionsQuery.rows;

  return groups.map((group) => {
    const groupOptions = options
      .filter((opt) => opt.option_group_id === group.id)
      .map((opt) => {
        const option = {
          id: opt.id,
          label: opt.label,
        };

        if (opt.price_adjustment && parseFloat(opt.price_adjustment) !== 0) {
          if (opt.adjustment_type === "PERCENT") {
            option.priceChange = {
              type: "percent",
              percent: parseFloat(opt.price_adjustment),
            };
          } else {
            option.priceChange = {
              type: "fixed",
              amount: parseFloat(opt.price_adjustment),
            };
          }
        }
        return option;
      });

    return {
      id: group.id,
      label: group.label,
      type: group.type.toLowerCase(),
      options: groupOptions,
      default: group.type === "SINGLE" ? groupOptions[0]?.id : [],
    };
  });
}

async function fetchProductsWithVariants() {
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
      ) as "categoryId",
      COALESCE(
        json_agg(DISTINCT pog.option_group_id) FILTER (WHERE pog.option_group_id IS NOT NULL),
        '[]'
      ) as "variantId"
    FROM products p
    LEFT JOIN product_categories pc ON p.id = pc.product_id
    LEFT JOIN product_option_groups pog ON p.id = pog.product_id
    WHERE p.is_available = true
    GROUP BY p.id
  `;

  const { rows } = await pool.query(query);
  const variants = await fetchVariantsFromDb();

  return rows.map((row) => {
    const variantIds = row.variantId || [];
    return {
      id: String(row.id),
      name: row.name,
      image: row.image || "",
      price: Number(row.price),
      categoryId: row.categoryId || [],
      description: row.description,
      variants: variants.filter((variant) => variantIds.includes(variant.id)),
    };
  });
}

async function fetchBranchById(branchId) {
  const { rows } = await pool.query(
    `SELECT id, name, address, phone, lat, long
     FROM branches WHERE id = $1`,
    [branchId],
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    lat: row.lat ? Number(row.lat) : 0,
    long: row.long ? Number(row.long) : 0,
  };
}

module.exports = {
  fetchVariantsFromDb,
  fetchProductsWithVariants,
  fetchBranchById,
};
