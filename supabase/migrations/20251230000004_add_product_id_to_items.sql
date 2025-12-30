-- Add product_id to invoice_items and quotation_items
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);

-- Update RLS or Indexes if needed
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_product_id ON quotation_items(product_id);
