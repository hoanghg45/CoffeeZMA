-- Migration: Loyalty Enrollment Foundation
-- 1. Alter customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS is_loyalty_member BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS loyalty_joined_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS loyalty_opt_in_channel TEXT;

-- Index for Zalo ID to ensure uniqueness and fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS customers_zalo_id_unique ON customers (zalo_id);

-- 2. Create loyalty_transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  order_id TEXT, -- Can be null for manual adjustments or non-order events
  type TEXT NOT NULL, -- e.g., 'ENROLL', 'EARN', 'SPEND', 'ADJUSTMENT'
  points INTEGER NOT NULL,
  amount_snapshot DECIMAL(12, 2), -- Value of the transaction if applicable
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying transactions by customer
CREATE INDEX IF NOT EXISTS loyalty_transactions_customer_id_idx ON loyalty_transactions (customer_id);
