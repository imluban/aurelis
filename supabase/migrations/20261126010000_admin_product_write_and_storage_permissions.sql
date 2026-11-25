-- =========================================
-- AURELIS: ADMIN PRODUCT WRITE PERMISSIONS
-- =========================================

-- Allow authenticated users to perform product writes.
GRANT INSERT, UPDATE, DELETE
ON public.products
TO authenticated;

-- Admin-only product insertion.
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

-- Admin-only product updates.
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

-- Admin-only product deletion.
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


-- =========================================
-- AURELIS: PRODUCT IMAGE STORAGE PERMISSIONS
-- =========================================

-- Admin-only image uploads.
DROP POLICY IF EXISTS "Admins can upload product images"
ON storage.objects;

CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    )
);

-- Admin-only image updates.
DROP POLICY IF EXISTS "Admins can update product images"
ON storage.objects;

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    )
);

-- Admin-only image deletion.
DROP POLICY IF EXISTS "Admins can delete product images"
ON storage.objects;

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    )
);
