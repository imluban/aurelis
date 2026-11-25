
-- AURELIS Product Management Upgrade
-- Additive migration: preserves existing products and storefront compatibility.

-- =========================================================
-- 1. EXTEND PRODUCTS
-- =========================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS sale_price_paisa BIGINT,
  ADD COLUMN IF NOT EXISTS sale_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS allow_backorder BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS dimension_length_cm NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS dimension_width_cm NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS dimension_height_cm NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS shipping_class TEXT,
  ADD COLUMN IF NOT EXISTS is_fragile BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_sale_price_check,
  ADD CONSTRAINT products_sale_price_check
    CHECK (sale_price_paisa IS NULL OR sale_price_paisa > 0),
  DROP CONSTRAINT IF EXISTS products_low_stock_threshold_check,
  ADD CONSTRAINT products_low_stock_threshold_check
    CHECK (low_stock_threshold >= 0),
  DROP CONSTRAINT IF EXISTS products_dimensions_check,
  ADD CONSTRAINT products_dimensions_check
    CHECK (
      (dimension_length_cm IS NULL OR dimension_length_cm >= 0)
      AND (dimension_width_cm IS NULL OR dimension_width_cm >= 0)
      AND (dimension_height_cm IS NULL OR dimension_height_cm >= 0)
    ),
  DROP CONSTRAINT IF EXISTS products_sale_dates_check,
  ADD CONSTRAINT products_sale_dates_check
    CHECK (
      sale_starts_at IS NULL
      OR sale_ends_at IS NULL
      OR sale_ends_at > sale_starts_at
    );

CREATE INDEX IF NOT EXISTS products_brand_idx
  ON public.products (brand);

CREATE INDEX IF NOT EXISTS products_new_arrival_idx
  ON public.products (is_new_arrival)
  WHERE is_published = TRUE;

CREATE INDEX IF NOT EXISTS products_bestseller_idx
  ON public.products (is_bestseller)
  WHERE is_published = TRUE;


-- =========================================================
-- 2. PRODUCT IMAGE GALLERY
-- =========================================================

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL
    REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_images_product_order_idx
  ON public.product_images (product_id, sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS product_images_one_primary_idx
  ON public.product_images (product_id)
  WHERE is_primary = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS product_images_unique_url_idx
  ON public.product_images (product_id, image_url);

-- Backfill existing product cover images into the new gallery.
-- Existing image URLs are preserved; storage_path stays NULL for legacy images.

INSERT INTO public.product_images (
  product_id,
  image_url,
  alt_text,
  sort_order,
  is_primary
)
SELECT
  id,
  image_url,
  name,
  0,
  TRUE
FROM public.products
WHERE image_url IS NOT NULL
  AND BTRIM(image_url) <> ''
ON CONFLICT (product_id, image_url) DO NOTHING;


-- Keep the legacy products.image_url field synchronized
-- with the primary image, for existing storefront components.

CREATE OR REPLACE FUNCTION public.sync_product_cover_image()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_product_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  UPDATE public.products
  SET image_url = (
    SELECT image_url
    FROM public.product_images
    WHERE product_id = target_product_id
    ORDER BY is_primary DESC, sort_order ASC, created_at ASC
    LIMIT 1
  )
  WHERE id = target_product_id;

  IF TG_OP = 'UPDATE'
     AND OLD.product_id IS DISTINCT FROM NEW.product_id THEN
    UPDATE public.products
    SET image_url = (
      SELECT image_url
      FROM public.product_images
      WHERE product_id = OLD.product_id
      ORDER BY is_primary DESC, sort_order ASC, created_at ASC
      LIMIT 1
    )
    WHERE id = OLD.product_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_product_cover_image_trigger
  ON public.product_images;

CREATE TRIGGER sync_product_cover_image_trigger
AFTER INSERT OR UPDATE OR DELETE
ON public.product_images
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_cover_image();


-- =========================================================
-- 3. PRODUCT VARIANTS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL
    REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  option_values JSONB NOT NULL DEFAULT '{}'::JSONB,
  sku TEXT,
  price_paisa BIGINT,
  compare_at_price_paisa BIGINT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT product_variants_stock_check
    CHECK (stock_quantity >= 0),

  CONSTRAINT product_variants_price_check
    CHECK (price_paisa IS NULL OR price_paisa > 0),

  CONSTRAINT product_variants_compare_price_check
    CHECK (
      compare_at_price_paisa IS NULL
      OR compare_at_price_paisa > 0
    ),

  CONSTRAINT product_variants_options_object_check
    CHECK (jsonb_typeof(option_values) = 'object')
);

CREATE INDEX IF NOT EXISTS product_variants_product_idx
  ON public.product_variants (product_id, sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS product_variants_sku_unique_idx
  ON public.product_variants (sku)
  WHERE sku IS NOT NULL AND BTRIM(sku) <> '';

DROP TRIGGER IF EXISTS set_product_variants_updated_at
  ON public.product_variants;

CREATE TRIGGER set_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


-- Keep products.stock_quantity synchronized with variant stock.
-- Products without variants continue using their own stock_quantity.


CREATE OR REPLACE FUNCTION public.sync_product_variant_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    UPDATE public.products
    SET stock_quantity = (
      SELECT COALESCE(SUM(stock_quantity), 0)::INTEGER
      FROM public.product_variants
      WHERE product_id = OLD.product_id
        AND is_active = TRUE
    )
    WHERE id = OLD.product_id;
  END IF;

  IF TG_OP <> 'DELETE' THEN
    UPDATE public.products
    SET stock_quantity = (
      SELECT COALESCE(SUM(stock_quantity), 0)::INTEGER
      FROM public.product_variants
      WHERE product_id = NEW.product_id
        AND is_active = TRUE
    )
    WHERE id = NEW.product_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_product_variant_stock_trigger
  ON public.product_variants;

CREATE TRIGGER sync_product_variant_stock_trigger
AFTER INSERT OR UPDATE OR DELETE
ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_variant_stock();


-- =========================================================
-- 4. PRODUCT ATTRIBUTES / SPECIFICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS public.product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL
    REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_name TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_attributes_product_order_idx
  ON public.product_attributes (product_id, sort_order);


-- =========================================================
-- 5. ROW LEVEL SECURITY
-- =========================================================

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;


-- Public visitors can read gallery images for published products.

DROP POLICY IF EXISTS "Public can view published product images"
  ON public.product_images;

CREATE POLICY "Public can view published product images"
ON public.product_images
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.products
    WHERE products.id = product_images.product_id
      AND products.is_published = TRUE
  )
);


-- Public visitors can read active variants for published products.

DROP POLICY IF EXISTS "Public can view active product variants"
  ON public.product_variants;

CREATE POLICY "Public can view active product variants"
ON public.product_variants
FOR SELECT
TO anon, authenticated
USING (
  is_active = TRUE
  AND EXISTS (
    SELECT 1
    FROM public.products
    WHERE products.id = product_variants.product_id
      AND products.is_published = TRUE
  )
);


-- Public visitors can read attributes for published products.

DROP POLICY IF EXISTS "Public can view published product attributes"
  ON public.product_attributes;

CREATE POLICY "Public can view published product attributes"
ON public.product_attributes
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.products
    WHERE products.id = product_attributes.product_id
      AND products.is_published = TRUE
  )
);


-- Admins can manage all product gallery images.

DROP POLICY IF EXISTS "Admins can manage product images"
  ON public.product_images;

CREATE POLICY "Admins can manage product images"
ON public.product_images
FOR ALL
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


-- Admins can manage all product variants.

DROP POLICY IF EXISTS "Admins can manage product variants"
  ON public.product_variants;

CREATE POLICY "Admins can manage product variants"
ON public.product_variants
FOR ALL
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


-- Admins can manage all product attributes.

DROP POLICY IF EXISTS "Admins can manage product attributes"
  ON public.product_attributes;

CREATE POLICY "Admins can manage product attributes"
ON public.product_attributes
FOR ALL
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


-- =========================================================
-- 6. API TABLE PERMISSIONS
-- =========================================================

GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.product_attributes TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE
ON public.product_images TO authenticated;

GRANT INSERT, UPDATE, DELETE
ON public.product_variants TO authenticated;

GRANT INSERT, UPDATE, DELETE
ON public.product_attributes TO authenticated;
