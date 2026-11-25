
-- AURELIS: Allow administrators to view all products

DROP POLICY IF EXISTS "Admins can view all products"
ON public.products;

CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    )
);
