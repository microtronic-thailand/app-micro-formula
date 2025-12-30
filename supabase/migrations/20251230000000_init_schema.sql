-- Create Customers Table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  name TEXT NOT NULL,
  tax_id TEXT,
  branch TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  
  -- Metadata
  owner_id UUID REFERENCES auth.users(id)
);

-- Create Invoices Table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  number TEXT NOT NULL,
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, issued, paid, overdue, cancelled
  notes TEXT,
  
  -- Customer Snapshot (เก็บข้อมูลลูกค้า ณ วันที่ออกบิล เผื่อลูกค้าเปลี่ยนชื่อ/ที่อยู่)
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_tax_id TEXT,
  
  -- Totals
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  vat_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  wht_total NUMERIC(15, 2) DEFAULT 0,
  
  owner_id UUID REFERENCES auth.users(id)
);

-- Create Invoice Items Table
CREATE TABLE invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  quantity NUMERIC(15, 2) NOT NULL DEFAULT 1,
  price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(15, 2) DEFAULT 0,
  vat_rate NUMERIC(5, 2) DEFAULT 7,
  
  total NUMERIC(15, 2) GENERATED ALWAYS AS ((quantity * price) - discount) STORED
);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create Policies (ให้ User เห็นเฉพาะข้อมูลที่ตัวเองสร้าง)
CREATE POLICY "Users can view their own customers" ON customers FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own customers" ON customers FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own customers" ON customers FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can view their own invoices" ON invoices FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own invoices" ON invoices FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage items of their invoices" ON invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND owner_id = auth.uid())
);

-- Create Indexes for performance
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_owner_id ON invoices(owner_id);
CREATE INDEX idx_customers_owner_id ON customers(owner_id);
