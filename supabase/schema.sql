-- 1. Create Profiles/Users Table (Replacing Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- สำหรับ Local Test
    role TEXT DEFAULT 'user' NOT NULL, -- user, admin, super_admin
    points INTEGER DEFAULT 0,
    must_change_password BOOLEAN DEFAULT false,
    last_activity_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    tax_id TEXT,
    branch TEXT,
    address TEXT,
    email TEXT,
    phone TEXT,
    owner_id UUID REFERENCES profiles(id)
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'ชิ้น',
    category TEXT DEFAULT 'general',
    stock_quantity NUMERIC DEFAULT 0,
    min_stock_level NUMERIC DEFAULT 0,
    owner_id UUID REFERENCES profiles(id)
);

-- 4. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    number TEXT NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    notes TEXT,
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_address TEXT,
    customer_tax_id TEXT,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    vat_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    owner_id UUID REFERENCES profiles(id)
);

-- 5. Quotation Items Table
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity NUMERIC(15, 2) NOT NULL DEFAULT 1,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(15, 2) DEFAULT 0,
    vat_rate NUMERIC(5, 2) DEFAULT 7
);

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    number TEXT NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    notes TEXT,
    customer_id UUID REFERENCES customers(id),
    quotation_id UUID REFERENCES quotations(id),
    customer_name TEXT NOT NULL,
    customer_address TEXT,
    customer_tax_id TEXT,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    vat_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    wht_total NUMERIC(15, 2) DEFAULT 0,
    is_reconciled BOOLEAN DEFAULT false,
    owner_id UUID REFERENCES profiles(id)
);

-- 7. Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity NUMERIC(15, 2) NOT NULL DEFAULT 1,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(15, 2) DEFAULT 0,
    vat_rate NUMERIC(5, 2) DEFAULT 7
);

-- 8. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_vat BOOLEAN DEFAULT false,
    vat_amount NUMERIC(15, 2) DEFAULT 0,
    category TEXT DEFAULT 'general',
    date DATE NOT NULL,
    recipient TEXT,
    receipt_url TEXT, -- Link to bill image/pdf
    payment_status TEXT DEFAULT 'paid', -- 'pending', 'paid', 'cancelled'
    is_reconciled BOOLEAN DEFAULT false, -- Check against bank statement
    wht_amount NUMERIC(15, 2) DEFAULT 0, -- Withholding Taxหัก ณ ที่จ่าย
    owner_id UUID REFERENCES profiles(id)
);

-- 9. Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 10. Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
    quantity NUMERIC NOT NULL,
    reference_id UUID,
    notes TEXT,
    owner_id UUID REFERENCES profiles(id)
);

-- 11. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    author_id UUID REFERENCES profiles(id)
);

-- 12. Helper Functions
CREATE OR REPLACE FUNCTION increment_stock(row_id UUID, count NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity + count
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    entity_type TEXT NOT NULL, -- 'INVOICE', 'EXPENSE', 'PRODUCT', 'CUSTOMER'
    entity_id TEXT NOT NULL,
    details TEXT,
    old_data JSONB,
    new_data JSONB
);

-- Initial Data
INSERT INTO profiles (email, role) VALUES ('admin@local', 'super_admin') ON CONFLICT DO NOTHING;
INSERT INTO settings (key, value) VALUES ('company_name', 'Microtronic Local') ON CONFLICT DO NOTHING;
