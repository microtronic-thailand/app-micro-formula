-- Ensure products table has stock columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock_level NUMERIC DEFAULT 0;

-- Stock Movements Table (History)
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'in' (purchase/return), 'out' (sale), 'adjustment'
    quantity NUMERIC NOT NULL,
    reference_id UUID, -- invoice_id or other transaction id
    notes TEXT,
    owner_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- RLS
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own stock movements" ON stock_movements FOR ALL USING (auth.uid() = owner_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_owner_id ON stock_movements(owner_id);

-- RPC for atomic stock updates
CREATE OR REPLACE FUNCTION increment_stock(row_id UUID, count NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity + count
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
