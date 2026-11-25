
-- AURELIS: Admin access and product management permissions
-- Migration: 20261125000000_admin_access

-- 1. Create administrator access table
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Allow authenticated users to read their own admin record
REVOKE ALL ON public.admin_users FROM anon;
GRANT SELECT ON public.admin_users TO authenticated;

DROP POLICY IF EXISTS "Admins can read their own record"
ON public.admin_users;

CREATE POLICY "Admins can read their own record"
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 4. Grant product modification privileges to authenticated users.
-- RLS policies below restrict these operations to administrators.
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

DROP POLICY IF EXISTS "Admins can insert products"
ON public.products;

CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Admins can update products"
ON public.products;

CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Admins can delete products"
ON public.products;

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    )
);

-- 5. Register the AURELIS administrator.
-- Replace the placeholder with your actual business email.
INSERT INTO public.admin_users (user_id)
SELECT id
FROM auth.users
WHERE email = 'aurelis.main@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
