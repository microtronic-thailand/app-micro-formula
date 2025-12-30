-- Add must_change_password column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- Create increment_points function if not exists
CREATE OR REPLACE FUNCTION public.increment_points(row_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET points = points + amount
    WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
