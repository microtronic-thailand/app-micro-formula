-- Create Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  number TEXT NOT NULL,
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, accepted, rejected, invoiced, expired
  notes TEXT,
  
  -- Customer Snapshot
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_tax_id TEXT,
  
  -- Totals
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  vat_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  
  owner_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Create Quotation Items Table
CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  quantity NUMERIC(15, 2) NOT NULL DEFAULT 1,
  price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(15, 2) DEFAULT 0,
  vat_rate NUMERIC(5, 2) DEFAULT 7
);

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own quotations" ON quotations FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage items of their quotations" ON quotation_items FOR ALL USING (
  EXISTS (SELECT 1 FROM quotations WHERE id = quotation_items.quotation_id AND owner_id = auth.uid())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_owner_id ON quotations(owner_id);
