-- =============================================================================
-- Migration: Phase 2 — Guest Web Checkout
-- =============================================================================
--
-- Target : PostgreSQL used by muoiZMA-management (:3000) — same DB as ZMA Mini App
-- Plan   : docs/planning/web-clone-plan.md (Phase 2-API, additive, ZMA zero-touch)
-- Contract: docs/api/orders-contract.md
--
-- Principles
--   • ADDITIVE ONLY — no DROP TABLE, no breaking changes to ZMA order flow
--   • Idempotent   — safe to re-run (IF NOT EXISTS)
--   • Apply on STAGING first, then smoke-test ZMA checkout + Zalo Pay before prod
--
-- API field mapping (request JSON → DB column)
--   shipFee              → orders.shipping_fee   (already in base schema)
--   subtotal / discount  → orders.subtotal, orders.discount
--   deliveryLat/Lng      → orders.delivery_lat, orders.delivery_lng
--   branchId             → orders.branch_id
--   shipping_service_id  → orders.shipping_service_id
--   (new) lookupCode     → orders.lookup_code
--
-- Columns intentionally NOT added here (already in production schema / prior migrations)
--   orders: subtotal, shipping_fee, discount, note, branch_id,
--           delivery_lat, delivery_lng, shipping_service_id
--   See: muoiZMA-management/scripts/01_create_schema.sql
--        scripts/03_add_branch_id.sql, 04_add_delivery_coordinates.sql,
--        scripts/06_add_shipping_service_id.sql
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. customers — guest / web identity (no Zalo ID required)
-- -----------------------------------------------------------------------------

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'zalo';

COMMENT ON COLUMN customers.source IS
  'Customer origin: zalo | web | guest. Existing rows default to zalo.';

-- Web guests: id like web_{uuid}, phone-based upsert; ZMA rows keep zalo_id.
ALTER TABLE customers
  ALTER COLUMN zalo_id DROP NOT NULL;

-- Real phone numbers should be unique; ZMA may use pending_{zaloId} placeholders.
-- Partial index: enforce uniqueness only for non-pending phones (guest web upsert).
-- Note: if customers.phone_number already has a table-level UNIQUE constraint,
-- pending_* values remain unique per zalo_id (ZMA pattern). This index adds
-- an explicit guard for real phone collisions on web merge.
CREATE UNIQUE INDEX IF NOT EXISTS customers_phone_real_unique
  ON customers (phone_number)
  WHERE phone_number IS NOT NULL
    AND phone_number NOT LIKE 'pending_%';

-- -----------------------------------------------------------------------------
-- 2. orders — guest lookup & online-payment metadata (new columns only)
-- -----------------------------------------------------------------------------

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS lookup_code VARCHAR(8),
  ADD COLUMN IF NOT EXISTS payment_ref VARCHAR(255),
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.lookup_code IS
  'Short guest-facing order code (e.g. 8 chars). Returned by POST /api/orders for web COD.';

COMMENT ON COLUMN orders.payment_ref IS
  'External payment reference (Zalo Pay / gateway). Nullable for COD.';

COMMENT ON COLUMN orders.paid_at IS
  'Timestamp when payment succeeded. NULL for unpaid / COD until collected.';

-- Guest tra cứu đơn; NULL allowed for legacy ZMA orders without lookup_code.
CREATE UNIQUE INDEX IF NOT EXISTS orders_lookup_code_unique
  ON orders (lookup_code)
  WHERE lookup_code IS NOT NULL;

COMMIT;

-- -----------------------------------------------------------------------------
-- Post-migration verification (run manually)
-- -----------------------------------------------------------------------------
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'customers'
--   AND column_name IN ('source', 'zalo_id');
--
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'orders'
--   AND column_name IN (
--     'lookup_code', 'payment_ref', 'paid_at',
--     'subtotal', 'shipping_fee', 'discount', 'branch_id',
--     'delivery_lat', 'delivery_lng', 'shipping_service_id'
--   );
--
-- Smoke test after apply:
--   1. ZMA: place order with Zalo login + payment flow unchanged
--   2. Web: POST /api/orders (guest, COD) → 201 with lookupCode
--   3. Web: GET /api/orders?id=... returns lookup_code
