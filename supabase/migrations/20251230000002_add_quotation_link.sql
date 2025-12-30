-- Add quotation_id to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS quotation_id UUID REFERENCES quotations(id);
