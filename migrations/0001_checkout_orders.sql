-- MiniGains: órdenes de Checkout Pro. Sin datos de tarjetas ni secretos.
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'awaiting_payment', 'pending', 'approved', 'rejected', 'cancelled', 'refunded', 'charged_back')),
  currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency = 'ARS'),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  items_json TEXT NOT NULL,
  preference_id TEXT,
  payment_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_id_idx ON orders(payment_id) WHERE payment_id IS NOT NULL;
