-- Helper function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Customers Policies
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
CREATE POLICY "Users can view customers" ON customers FOR SELECT 
USING (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
CREATE POLICY "Users can update customers" ON customers FOR UPDATE 
USING (auth.uid() = owner_id OR public.is_admin());

-- Update Invoices Policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view invoices" ON invoices FOR SELECT 
USING (auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
CREATE POLICY "Users can update invoices" ON invoices FOR UPDATE 
USING (auth.uid() = owner_id OR public.is_admin());

-- Update Expenses Policies
DROP POLICY IF EXISTS "Users can manage their own expenses" ON expenses;
CREATE POLICY "Users can view expenses" ON expenses FOR SELECT 
USING (auth.uid() = owner_id OR public.is_admin());
CREATE POLICY "Users can manage expenses" ON expenses FOR ALL 
USING (auth.uid() = owner_id OR public.is_admin());

-- Update Quotations Policies
DROP POLICY IF EXISTS "Users can manage their own quotations" ON quotations;
CREATE POLICY "Users can view quotations" ON quotations FOR SELECT 
USING (auth.uid() = owner_id OR public.is_admin());
CREATE POLICY "Users can manage quotations" ON quotations FOR ALL 
USING (auth.uid() = owner_id OR public.is_admin());

-- Update Products Policies (Everyone can view, admins can manage)
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products FOR ALL 
USING (public.is_admin());
