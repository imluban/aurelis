"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ImagePlus,
  LoaderCircle,
  Save,
  Star,
  Trash2,
  X,
  GripVertical,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProductVariantsEditor, {
  type ProductVariantDraft,
  type VariantOptionGroup,
} from "@/components/admin/product-variants-editor";

type Category = {
  id: string;
  name: string;
};

type GalleryImage = {
  id: string;
  imageUrl: string;
  storagePath: string | null;
  file: File | null;
  preview: string;
  altText: string;
  isNew: boolean;
};

type ProductAttribute = {
  id: string;
  name: string;
  value: string;
};

type ProductRecord = {
  id: string;
  name: string;
  brand: string | null;
  slug: string;
  sku: string | null;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  price_paisa: number;
  compare_at_price_paisa: number | null;
  sale_price_paisa: number | null;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  allow_backorder: boolean;
  product_type: "physical" | "digital";
  weight_grams: number | null;
  dimension_length_cm: number | null;
  dimension_width_cm: number | null;
  dimension_height_cm: number | null;
  shipping_class: string | null;
  is_fragile: boolean;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[] | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_published: boolean;
  publish_at: string | null;
};

type ProductImageRecord = {
  id: string;
  image_url: string;
  storage_path: string | null;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

type ProductAttributeRecord = {
  attribute_name: string;
  attribute_value: string;
  sort_order: number;
};

type ProductVariantRecord = {
  id: string;
  variant_name: string;
  option_values: Record<string, string>;
  sku: string | null;
  price_paisa: number | null;
  compare_at_price_paisa: number | null;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

const MAX_IMAGES = 15;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const inputClass =
  "w-full border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm text-[#350817] outline-none transition-colors focus:border-[#470d20]";

const labelClass =
  "mb-2 block font-mono text-[10px] tracking-wider text-[#470d20]";

const sectionClass = "border border-[#470d20]/10 bg-white/60 p-6 sm:p-9";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeId() {
  return crypto.randomUUID();
}

function dateToIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function isoToLocalDate(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getStoragePath(url: string | null) {
  if (!url) return null;

  const marker = "/storage/v1/object/public/product-images/";

  const index = url.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(url.slice(index + marker.length));
}

function SectionHeading({
  number,
  eyebrow,
  title,
  description,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-7">
      <p className="font-mono text-[9px] tracking-[0.2em] text-[#9b806b]">
        {number} / {eyebrow}
      </p>

      <h2 className="mt-2 font-serif text-3xl text-[#350817]">{title}</h2>

      {description && (
        <p className="mt-2 text-xs leading-5 text-[#350817]/50">
          {description}
        </p>
      )}
    </div>
  );
}

function EditProductPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;

  const previewUrls = useRef<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Product information
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  // Pricing
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleStartsAt, setSaleStartsAt] = useState("");
  const [saleEndsAt, setSaleEndsAt] = useState("");

  // Inventory
  const [stockQuantity, setStockQuantity] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [allowBackorder, setAllowBackorder] = useState(false);

  // Shipping
  const [productType, setProductType] = useState<"physical" | "digital">(
    "physical",
  );
  const [weightGrams, setWeightGrams] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [shippingClass, setShippingClass] = useState("");
  const [isFragile, setIsFragile] = useState(false);

  // Gallery
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);

  // Attributes
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);

  // Product variants
  const [variantGroups, setVariantGroups] = useState<VariantOptionGroup[]>([]);
  const [variants, setVariants] = useState<ProductVariantDraft[]>([]);

  // SEO
  const [tagsInput, setTagsInput] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Visibility
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [publishAt, setPublishAt] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      const supabase = createClient();

      try {
        const [
          productResult,
          categoryResult,
          galleryResult,
          attributeResult,
          variantResult,
        ] = await Promise.all([
          supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .maybeSingle(),

          supabase
            .from("categories")
            .select("id, name")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),

          supabase
            .from("product_images")
            .select(
              "id, image_url, storage_path, alt_text, sort_order, is_primary",
            )
            .eq("product_id", productId)
            .order("sort_order", { ascending: true }),

          supabase
            .from("product_attributes")
            .select("attribute_name, attribute_value, sort_order")
            .eq("product_id", productId)
            .order("sort_order", { ascending: true }),

          supabase
            .from("product_variants")
            .select(
              "id, variant_name, option_values, sku, price_paisa, compare_at_price_paisa, stock_quantity, image_url, is_active, sort_order",
            )
            .eq("product_id", productId)
            .order("sort_order", { ascending: true }),
        ]);

        if (productResult.error) throw productResult.error;
        if (categoryResult.error) throw categoryResult.error;
        if (galleryResult.error) throw galleryResult.error;
        if (attributeResult.error) throw attributeResult.error;
        if (variantResult.error) throw variantResult.error;

        if (!productResult.data) {
          throw new Error("This product could not be found.");
        }

        if (!active) return;

        const product = productResult.data as ProductRecord;
        const gallery = (galleryResult.data ?? []) as ProductImageRecord[];
        const attributeRows = (attributeResult.data ??
          []) as ProductAttributeRecord[];
        const variantRows = (variantResult.data ??
          []) as ProductVariantRecord[];

        setCategories((categoryResult.data ?? []) as Category[]);

        setName(product.name ?? "");
        setBrand(product.brand ?? "");
        setSlug(product.slug ?? "");
        setSku(product.sku ?? "");
        setCategoryId(product.category_id ?? "");
        setShortDescription(product.short_description ?? "");
        setDescription(product.description ?? "");

        setPrice(String(Number(product.price_paisa) / 100));

        setCompareAtPrice(
          product.compare_at_price_paisa !== null
            ? String(Number(product.compare_at_price_paisa) / 100)
            : "",
        );

        setSalePrice(
          product.sale_price_paisa !== null
            ? String(Number(product.sale_price_paisa) / 100)
            : "",
        );

        setSaleStartsAt(isoToLocalDate(product.sale_starts_at));
        setSaleEndsAt(isoToLocalDate(product.sale_ends_at));

        setStockQuantity(String(product.stock_quantity ?? 0));
        setLowStockThreshold(String(product.low_stock_threshold ?? 5));
        setAllowBackorder(Boolean(product.allow_backorder));

        setProductType(product.product_type ?? "physical");
        setWeightGrams(
          product.weight_grams !== null ? String(product.weight_grams) : "",
        );

        setLengthCm(
          product.dimension_length_cm !== null
            ? String(product.dimension_length_cm)
            : "",
        );

        setWidthCm(
          product.dimension_width_cm !== null
            ? String(product.dimension_width_cm)
            : "",
        );

        setHeightCm(
          product.dimension_height_cm !== null
            ? String(product.dimension_height_cm)
            : "",
        );

        setShippingClass(product.shipping_class ?? "");
        setIsFragile(Boolean(product.is_fragile));

        setSeoTitle(product.seo_title ?? "");
        setSeoDescription(product.seo_description ?? "");
        setTagsInput((product.tags ?? []).join(", "));

        setIsFeatured(Boolean(product.is_featured));
        setIsNewArrival(Boolean(product.is_new_arrival));
        setIsBestseller(Boolean(product.is_bestseller));
        setIsPublished(Boolean(product.is_published));
        setPublishAt(isoToLocalDate(product.publish_at));

        // Load saved gallery records.
        const loadedImages: GalleryImage[] =
          gallery.length > 0
            ? gallery.map((image) => ({
                id: image.id,
                imageUrl: image.image_url,
                storagePath: image.storage_path,
                file: null,
                preview: image.image_url,
                altText: image.alt_text ?? product.name,
                isNew: false,
              }))
            : product.image_url
              ? [
                  {
                    id: "legacy-primary-image",
                    imageUrl: product.image_url,
                    storagePath: getStoragePath(product.image_url),
                    file: null,
                    preview: product.image_url,
                    altText: product.name,
                    isNew: false,
                  },
                ]
              : [];

        setImages(loadedImages);

        const primary = gallery.find((image) => image.is_primary);

        setPrimaryImageId(primary?.id ?? loadedImages[0]?.id ?? null);

        // Load product attributes.
        setAttributes(
          attributeRows.map((attribute) => ({
            id: makeId(),
            name: attribute.attribute_name,
            value: attribute.attribute_value,
          })),
        );

        // Reconstruct option groups from saved variant combinations.
        const optionValues = new Map<string, Set<string>>();

        for (const variant of variantRows) {
          for (const [optionName, optionValue] of Object.entries(
            variant.option_values ?? {},
          )) {
            if (!optionValues.has(optionName)) {
              optionValues.set(optionName, new Set());
            }

            optionValues.get(optionName)?.add(optionValue);
          }
        }

        setVariantGroups(
          Array.from(optionValues.entries()).map(([optionName, values]) => ({
            id: makeId(),
            name: optionName,
            values: Array.from(values),
          })),
        );

        setVariants(
          variantRows.map((variant) => ({
            id: variant.id,
            variant_name: variant.variant_name,
            option_values: variant.option_values ?? {},
            sku: variant.sku ?? "",
            price:
              variant.price_paisa !== null
                ? String(Number(variant.price_paisa) / 100)
                : "",
            compareAtPrice:
              variant.compare_at_price_paisa !== null
                ? String(Number(variant.compare_at_price_paisa) / 100)
                : "",
            stock_quantity: String(variant.stock_quantity ?? 0),
            image_url: variant.image_url ?? "",
            is_active: Boolean(variant.is_active),
            sort_order: variant.sort_order ?? 0,
          })),
        );
      } catch (err) {
        console.error("AURELIS product loading error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "We couldn't load this product.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function handleNameChange(value: string) {
    setName(value);

    if (!seoTitle) {
      setSeoTitle(value);
    }
  }

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const accepted: GalleryImage[] = [];
    const errors: string[] = [];

    for (const file of selectedFiles) {
      if (images.length + accepted.length >= MAX_IMAGES) {
        errors.push(`Only ${MAX_IMAGES} images are allowed per product.`);
        break;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: unsupported image format.`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: image must be 5 MB or smaller.`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      previewUrls.current.push(preview);

      accepted.push({
        id: makeId(),
        imageUrl: "",
        storagePath: null,
        file,
        preview,
        altText: name.trim() || file.name.replace(/\.[^.]+$/, ""),
        isNew: true,
      });
    }

    if (accepted.length > 0) {
      if (images.length === 0) {
        setPrimaryImageId(accepted[0].id);
      }

      setImages((current) => [...current, ...accepted]);
    }

    setError(errors.join(" "));
  }

  function removeImage(imageId: string) {
    const image = images.find((item) => item.id === imageId);

    if (image?.isNew) {
      URL.revokeObjectURL(image.preview);

      previewUrls.current = previewUrls.current.filter(
        (url) => url !== image.preview,
      );
    }

    setImages((current) => {
      const updated = current.filter((item) => item.id !== imageId);

      if (primaryImageId === imageId) {
        setPrimaryImageId(updated[0]?.id ?? null);
      }

      return updated;
    });
  }

  function moveImage(imageId: string, direction: -1 | 1) {
    setImages((current) => {
      const index = current.findIndex((item) => item.id === imageId);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const updated = [...current];

      [updated[index], updated[nextIndex]] = [
        updated[nextIndex],
        updated[index],
      ];

      return updated;
    });
  }

  function handleImageDrop(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault();

    if (!draggedImageId || draggedImageId === targetId) return;

    setImages((current) => {
      const updated = [...current];
      const fromIndex = updated.findIndex((item) => item.id === draggedImageId);
      const toIndex = updated.findIndex((item) => item.id === targetId);

      if (fromIndex < 0 || toIndex < 0) return current;

      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      return updated;
    });

    setDraggedImageId(null);
  }

  function updateImageAlt(imageId: string, value: string) {
    setImages((current) =>
      current.map((image) =>
        image.id === imageId ? { ...image, altText: value } : image,
      ),
    );
  }

  function updateAttribute(id: string, field: "name" | "value", value: string) {
    setAttributes((current) =>
      current.map((attribute) =>
        attribute.id === id ? { ...attribute, [field]: value } : attribute,
      ),
    );
  }

  function addAttribute() {
    setAttributes((current) => [
      ...current,
      { id: makeId(), name: "", value: "" },
    ]);
  }

  function removeAttribute(id: string) {
    setAttributes((current) =>
      current.filter((attribute) => attribute.id !== id),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const numericPrice = Number(price);
    const numericComparePrice =
      compareAtPrice.trim() === "" ? null : Number(compareAtPrice);
    const numericSalePrice = salePrice.trim() === "" ? null : Number(salePrice);
    const numericStock = Number(stockQuantity);
    const numericLowStock = Number(lowStockThreshold);
    const numericWeight =
      weightGrams.trim() === "" ? null : Number(weightGrams);

    const numericLength = lengthCm.trim() === "" ? null : Number(lengthCm);
    const numericWidth = widthCm.trim() === "" ? null : Number(widthCm);
    const numericHeight = heightCm.trim() === "" ? null : Number(heightCm);

    if (!name.trim() || !slug.trim() || !categoryId) {
      setError("Please complete the product name, slug and category.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Enter a valid selling price greater than zero.");
      return;
    }

    if (
      numericComparePrice !== null &&
      (!Number.isFinite(numericComparePrice) ||
        numericComparePrice <= numericPrice)
    ) {
      setError("The original price must be higher than the selling price.");
      return;
    }

    if (
      numericSalePrice !== null &&
      (!Number.isFinite(numericSalePrice) ||
        numericSalePrice <= 0 ||
        numericSalePrice > numericPrice)
    ) {
      setError(
        "The sale price must be greater than zero and cannot exceed the selling price.",
      );
      return;
    }

    if (
      saleStartsAt &&
      saleEndsAt &&
      new Date(saleEndsAt) <= new Date(saleStartsAt)
    ) {
      setError("The sale end date must be after the sale start date.");
      return;
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setError("Stock quantity must be a whole number of zero or more.");
      return;
    }

    if (!Number.isInteger(numericLowStock) || numericLowStock < 0) {
      setError("The low-stock threshold must be zero or more.");
      return;
    }

    if (
      numericWeight !== null &&
      (!Number.isInteger(numericWeight) || numericWeight <= 0)
    ) {
      setError("Weight must be a positive whole number of grams.");
      return;
    }

    if (productType === "physical" && numericWeight === null) {
      setError("Please enter the product weight in grams.");
      return;
    }

    if (
      [numericLength, numericWidth, numericHeight].some(
        (value) => value !== null && (!Number.isFinite(value) || value < 0),
      )
    ) {
      setError("Product dimensions must be valid non-negative numbers.");
      return;
    }

    if (images.length > MAX_IMAGES) {
      setError(`A product can have no more than ${MAX_IMAGES} images.`);
      return;
    }

    if (images.length > 0 && !primaryImageId) {
      setError("Please choose a primary cover image.");
      return;
    }

    if (publishAt && new Date(publishAt) <= new Date()) {
      setError("Choose a future date and time for scheduled publishing.");
      return;
    }

    // Validate variants.
    for (const [index, variant] of variants.entries()) {
      if (!variant.variant_name.trim()) {
        setError(`Variant ${index + 1} needs a name.`);
        return;
      }

      const variantStock = Number(variant.stock_quantity);

      if (!Number.isInteger(variantStock) || variantStock < 0) {
        setError(
          `Stock for variant "${variant.variant_name}" must be a whole number of zero or more.`,
        );
        return;
      }

      const variantPrice =
        variant.price.trim() === "" ? numericPrice : Number(variant.price);

      const variantCompareAt =
        variant.compareAtPrice.trim() === ""
          ? null
          : Number(variant.compareAtPrice);

      if (
        variant.price.trim() !== "" &&
        (!Number.isFinite(variantPrice) || variantPrice <= 0)
      ) {
        setError(`Enter a valid price for "${variant.variant_name}".`);
        return;
      }

      if (
        variantCompareAt !== null &&
        (!Number.isFinite(variantCompareAt) || variantCompareAt <= variantPrice)
      ) {
        setError(
          `The compare-at price for "${variant.variant_name}" must exceed its selling price.`,
        );
        return;
      }
    }

    setSaving(true);

    const supabase = createClient();
    const uploadedPaths: string[] = [];

    try {
      // Upload new images first.
      const uploadedImages = new Map<
        string,
        { imageUrl: string; storagePath: string }
      >();

      for (const image of images) {
        if (!image.isNew || !image.file) continue;

        const extension = image.file.name.split(".").pop()?.toLowerCase();

        if (!extension) {
          throw new Error(`Invalid filename for ${image.file.name}.`);
        }

        const storagePath = `products/${productId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(storagePath, image.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: image.file.type,
          });

        if (uploadError) throw uploadError;

        uploadedPaths.push(storagePath);

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(storagePath);

        uploadedImages.set(image.id, {
          imageUrl: publicUrlData.publicUrl,
          storagePath,
        });
      }

      const finalImages = images.map((image) => {
        const uploaded = uploadedImages.get(image.id);

        return {
          ...image,
          imageUrl: uploaded?.imageUrl ?? image.imageUrl,
          storagePath: uploaded?.storagePath ?? image.storagePath,
        };
      });

      const primaryImage = finalImages.find(
        (image) => image.id === primaryImageId,
      );

      const finalImageUrl = primaryImage?.imageUrl || null;

      // Update product.
      const { data: updatedProduct, error: updateError } = await supabase
        .from("products")
        .update({
          name: name.trim(),
          brand: brand.trim() || null,
          slug: slug.trim(),
          sku: sku.trim() || null,
          category_id: categoryId,
          short_description: shortDescription.trim() || null,
          description: description.trim() || null,

          price_paisa: Math.round(numericPrice * 100),
          compare_at_price_paisa:
            numericComparePrice === null
              ? null
              : Math.round(numericComparePrice * 100),

          sale_price_paisa:
            numericSalePrice === null
              ? null
              : Math.round(numericSalePrice * 100),
          sale_starts_at: dateToIso(saleStartsAt),
          sale_ends_at: dateToIso(saleEndsAt),

          stock_quantity: numericStock,
          low_stock_threshold: numericLowStock,
          allow_backorder: allowBackorder,

          product_type: productType,
          weight_grams: productType === "physical" ? numericWeight : null,
          dimension_length_cm:
            productType === "physical" ? numericLength : null,
          dimension_width_cm: productType === "physical" ? numericWidth : null,
          dimension_height_cm:
            productType === "physical" ? numericHeight : null,
          shipping_class:
            productType === "physical" ? shippingClass.trim() || null : null,
          is_fragile: productType === "physical" ? isFragile : false,

          image_url: finalImageUrl,

          seo_title: seoTitle.trim() || name.trim(),
          seo_description: seoDescription.trim() || null,
          tags: Array.from(
            new Set(
              tagsInput
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            ),
          ),

          is_featured: isFeatured,
          is_new_arrival: isNewArrival,
          is_bestseller: isBestseller,
          is_published: publishAt ? false : isPublished,
          publish_at: dateToIso(publishAt),
        })
        .eq("id", productId)
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProduct) {
        throw new Error(
          "The product was not updated. Please check your admin permissions.",
        );
      }

      // Update existing gallery records.
      const existingImages = finalImages.filter(
        (image) => !image.isNew && image.id !== "legacy-primary-image",
      );

      for (const image of existingImages) {
        const { error: imageUpdateError } = await supabase
          .from("product_images")
          .update({
            alt_text: image.altText.trim() || name.trim(),
            sort_order: finalImages.findIndex((item) => item.id === image.id),
            is_primary: image.id === primaryImageId,
          })
          .eq("id", image.id)
          .eq("product_id", productId);

        if (imageUpdateError) throw imageUpdateError;
      }

      // Insert newly uploaded gallery images.
      const newGalleryRows = finalImages
        .filter((image) => image.isNew)
        .map((image) => ({
          product_id: productId,
          image_url: image.imageUrl,
          storage_path: image.storagePath,
          alt_text: image.altText.trim() || name.trim(),
          sort_order: finalImages.findIndex((item) => item.id === image.id),
          is_primary: image.id === primaryImageId,
        }));

      if (newGalleryRows.length > 0) {
        const { error: galleryInsertError } = await supabase
          .from("product_images")
          .insert(newGalleryRows);

        if (galleryInsertError) throw galleryInsertError;
      }

      // Find and delete removed gallery records.
      const keptIds = new Set(existingImages.map((image) => image.id));

      const { data: currentGallery, error: currentGalleryError } =
        await supabase
          .from("product_images")
          .select("id, storage_path")
          .eq("product_id", productId);

      if (currentGalleryError) throw currentGalleryError;

      const removedGallery = (currentGallery ?? []).filter(
        (image) =>
          !keptIds.has(image.id) &&
          !finalImages.some((finalImage) => finalImage.id === image.id),
      );

      if (removedGallery.length > 0) {
        const { error: removeRowsError } = await supabase
          .from("product_images")
          .delete()
          .in(
            "id",
            removedGallery.map((image) => image.id),
          );

        if (removeRowsError) throw removeRowsError;
      }

      // Replace product attributes.
      const attributeRows = attributes
        .filter((attribute) => attribute.name.trim() && attribute.value.trim())
        .map((attribute, index) => ({
          product_id: productId,
          attribute_name: attribute.name.trim(),
          attribute_value: attribute.value.trim(),
          sort_order: index,
        }));

      const { error: deleteAttributesError } = await supabase
        .from("product_attributes")
        .delete()
        .eq("product_id", productId);

      if (deleteAttributesError) throw deleteAttributesError;

      if (attributeRows.length > 0) {
        const { error: insertAttributesError } = await supabase
          .from("product_attributes")
          .insert(attributeRows);

        if (insertAttributesError) throw insertAttributesError;
      }

      // Replace product variants with the edited variant set.
      const { error: deleteVariantsError } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId);

      if (deleteVariantsError) throw deleteVariantsError;

      const variantRows = variants.map((variant, index) => {
        const variantPrice =
          variant.price.trim() === "" ? null : Number(variant.price);

        const variantCompareAt =
          variant.compareAtPrice.trim() === ""
            ? null
            : Number(variant.compareAtPrice);

        return {
          product_id: productId,
          variant_name: variant.variant_name.trim(),
          option_values: variant.option_values,
          sku: variant.sku.trim() || null,
          price_paisa:
            variantPrice === null ? null : Math.round(variantPrice * 100),
          compare_at_price_paisa:
            variantCompareAt === null
              ? null
              : Math.round(variantCompareAt * 100),
          stock_quantity: Number(variant.stock_quantity),
          image_url: variant.image_url.trim() || null,
          is_active: variant.is_active,
          sort_order: index,
        };
      });

      if (variantRows.length > 0) {
        const { error: insertVariantsError } = await supabase
          .from("product_variants")
          .insert(variantRows);

        if (insertVariantsError) throw insertVariantsError;
      }

      // Remove storage files for images removed from the gallery.
      const removedStoragePaths = removedGallery
        .map((image) => image.storage_path)
        .filter((path): path is string => Boolean(path));

      if (removedStoragePaths.length > 0) {
        const { error: storageCleanupError } = await supabase.storage
          .from("product-images")
          .remove(removedStoragePaths);

        if (storageCleanupError) {
          console.error(
            "Removed gallery image cleanup failed:",
            storageCleanupError,
          );
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("AURELIS product update error:", err);

      if (uploadedPaths.length > 0) {
        const { error: cleanupError } = await supabase.storage
          .from("product-images")
          .remove(uploadedPaths);

        if (cleanupError) {
          console.error("Upload cleanup failed:", cleanupError);
        }
      }

      setError(
        err instanceof Error
          ? err.message
          : "We couldn't update this product. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const primaryImage = images.find((image) => image.id === primaryImageId);

  return (
    <main className="min-h-screen bg-[#f8f4ed] text-[#350817]">
      <header className="border-b border-[#470d20]/10 bg-[#350817] text-[#f1e8d8]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/admin" className="font-serif text-3xl tracking-[0.15em]">
            AURELIS
          </Link>

          <span className="font-mono text-[9px] tracking-[0.15em] text-[#f1e8d8]/50">
            PRODUCT MANAGEMENT
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-6 py-12 lg:py-16">
        <Link
          href="/admin/products"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-[#9b806b] transition-colors hover:text-[#470d20]"
        >
          <ArrowLeft size={14} />
          BACK TO PRODUCTS
        </Link>

        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.25em] text-[#9b806b]">
            CATALOGUE / PRODUCT EDITOR
          </p>

          <h1 className="mt-4 font-serif text-5xl sm:text-6xl">
            Edit product<span className="italic">.</span>
          </h1>

          <p className="mt-3 text-sm text-[#350817]/55">
            Refine product information, imagery, pricing and visibility.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-8 border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 border border-[#470d20]/10 bg-white/60 py-24">
            <LoaderCircle size={20} className="animate-spin" />
            <span className="font-mono text-[10px] tracking-wider">
              LOADING PRODUCT...
            </span>
          </div>
        ) : error && !name ? (
          <div className="border border-[#470d20]/10 bg-white/60 px-6 py-12 text-center">
            <p className="font-serif text-2xl">Product unavailable.</p>

            <Link
              href="/admin/products"
              className="mt-5 inline-flex bg-[#470d20] px-6 py-3 font-mono text-[10px] tracking-wider text-[#f1e8d8]"
            >
              BACK TO PRODUCTS
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 01 — PRODUCT INFORMATION */}
            <section className={sectionClass}>
              <SectionHeading
                number="01"
                eyebrow="PRODUCT INFORMATION"
                title="The essentials"
                description="Edit the product identity and customer-facing descriptions."
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>PRODUCT NAME *</label>
                  <input
                    required
                    maxLength={180}
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>BRAND</label>
                  <input
                    value={brand}
                    onChange={(event) => setBrand(event.target.value)}
                    maxLength={120}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>SKU / PRODUCT CODE</label>
                  <input
                    value={sku}
                    onChange={(event) => setSku(event.target.value)}
                    maxLength={80}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>URL SLUG *</label>
                  <input
                    required
                    maxLength={180}
                    value={slug}
                    onChange={(event) =>
                      setSlug(createSlug(event.target.value))
                    }
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>CATEGORY *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>SHORT DESCRIPTION</label>
                  <input
                    maxLength={250}
                    value={shortDescription}
                    onChange={(event) =>
                      setShortDescription(event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>FULL DESCRIPTION</label>
                  <textarea
                    rows={7}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className={`${inputClass} resize-y leading-6`}
                  />
                </div>
              </div>
            </section>

            {/* 02 — GALLERY */}
            <section className={sectionClass}>
              <SectionHeading
                number="02"
                eyebrow="PRODUCT MEDIA"
                title="The gallery"
                description="Manage up to 15 images. Existing images remain in storage unless you remove them."
              />

              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl">
                    {images.length} <span className="text-[#9b806b]">/ 15</span>
                  </p>
                  <p className="mt-1 text-[11px] text-[#350817]/45">
                    Saved and newly selected product images
                  </p>
                </div>

                <label
                  className={`inline-flex cursor-pointer items-center gap-2 bg-[#470d20] px-5 py-3 font-mono text-[10px] tracking-wider text-[#f1e8d8] transition-colors hover:bg-[#64152f] ${
                    images.length >= MAX_IMAGES
                      ? "pointer-events-none opacity-40"
                      : ""
                  }`}
                >
                  <ImagePlus size={15} />
                  ADD IMAGES
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={images.length >= MAX_IMAGES}
                    onChange={handleImagesChange}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="mb-5 border border-[#470d20]/10 bg-[#f8f4ed] p-4 text-xs leading-5 text-[#350817]/60">
                JPG, PNG or WebP · Maximum 5 MB per image · Up to 15 images.
                Your primary image becomes the storefront cover.
              </div>

              {images.length === 0 ? (
                <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center border border-dashed border-[#470d20]/25 bg-[#f8f4ed] p-8 text-center transition-colors hover:border-[#470d20]">
                  <ImagePlus
                    size={34}
                    strokeWidth={1.2}
                    className="text-[#9b806b]"
                  />
                  <span className="mt-4 font-serif text-2xl">
                    Add product photographs
                  </span>
                  <span className="mt-2 text-xs text-[#350817]/50">
                    Select one or multiple images
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImagesChange}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {images.map((image, index) => {
                    const isPrimary = image.id === primaryImageId;

                    return (
                      <div
                        key={image.id}
                        draggable
                        onDragStart={() => setDraggedImageId(image.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleImageDrop(event, image.id)}
                        onDragEnd={() => setDraggedImageId(null)}
                        className={`overflow-hidden border bg-[#f8f4ed] transition-colors ${
                          isPrimary ? "border-[#470d20]" : "border-[#470d20]/10"
                        } ${draggedImageId === image.id ? "opacity-40" : ""}`}
                      >
                        <div className="relative aspect-[4/3] bg-[#e8dece]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.preview}
                            alt={image.altText}
                            className="h-full w-full object-contain"
                          />

                          <div className="absolute left-3 top-3 flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center bg-[#350817]/85 text-xs text-[#f1e8d8]">
                              {index + 1}
                            </span>

                            {isPrimary && (
                              <span className="inline-flex items-center gap-1 bg-[#470d20] px-3 py-2 font-mono text-[9px] tracking-wider text-[#f1e8d8]">
                                <Star size={11} fill="currentColor" />
                                COVER
                              </span>
                            )}
                          </div>

                          <div className="absolute right-2 top-2 flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveImage(image.id, -1)}
                              disabled={index === 0}
                              aria-label="Move image up"
                              className="flex h-8 w-8 items-center justify-center bg-[#350817]/85 text-[#f1e8d8] hover:bg-[#470d20] disabled:opacity-30"
                            >
                              <ArrowUp size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => moveImage(image.id, 1)}
                              disabled={index === images.length - 1}
                              aria-label="Move image down"
                              className="flex h-8 w-8 items-center justify-center bg-[#350817]/85 text-[#f1e8d8] hover:bg-[#470d20] disabled:opacity-30"
                            >
                              <ArrowDown size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              aria-label="Remove image"
                              className="flex h-8 w-8 items-center justify-center bg-red-800 text-white hover:bg-red-950"
                            >
                              <X size={15} />
                            </button>
                          </div>

                          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#350817]/80 px-2 py-1 text-[9px] text-[#f1e8d8]/80">
                            <GripVertical size={12} />
                            DRAG TO REORDER
                          </div>
                        </div>

                        <div className="space-y-3 p-4">
                          <div>
                            <label className="mb-1 block font-mono text-[9px] tracking-wider text-[#9b806b]">
                              IMAGE ALT TEXT
                            </label>
                            <input
                              value={image.altText}
                              onChange={(event) =>
                                updateImageAlt(image.id, event.target.value)
                              }
                              maxLength={250}
                              className="w-full border border-[#470d20]/15 bg-white px-3 py-2 text-xs outline-none focus:border-[#470d20]"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => setPrimaryImageId(image.id)}
                            disabled={isPrimary}
                            className={`inline-flex w-full items-center justify-center gap-2 border px-3 py-2.5 font-mono text-[9px] tracking-wider transition-colors ${
                              isPrimary
                                ? "border-[#470d20]/20 bg-[#470d20]/5 text-[#470d20]"
                                : "border-[#470d20]/20 text-[#470d20] hover:bg-[#470d20] hover:text-[#f1e8d8]"
                            }`}
                          >
                            <Star size={12} />
                            {isPrimary ? "PRIMARY COVER IMAGE" : "SET AS COVER"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {images.length > 0 && (
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#470d20]/10 pt-5">
                  <p className="text-[11px] text-[#350817]/50">
                    {primaryImage
                      ? `Cover image selected · ${images.length} total`
                      : "Select a cover image"}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      images.forEach((image) => {
                        if (image.isNew) {
                          URL.revokeObjectURL(image.preview);
                        }
                      });

                      previewUrls.current = [];
                      setImages([]);
                      setPrimaryImageId(null);
                    }}
                    className="inline-flex items-center gap-2 text-xs text-red-700 hover:text-red-900"
                  >
                    <Trash2 size={13} />
                    Remove all
                  </button>
                </div>
              )}
            </section>

            {/* 03 — PRICING */}
            <section className={sectionClass}>
              <SectionHeading
                number="03"
                eyebrow="PRICING"
                title="The numbers"
                description="Manage selling price, compare-at price and promotional pricing."
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>SELLING PRICE (BDT) *</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    ORIGINAL / COMPARE-AT PRICE
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={compareAtPrice}
                    onChange={(event) => setCompareAtPrice(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>SALE PRICE (BDT)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={salePrice}
                    onChange={(event) => setSalePrice(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div />

                <div>
                  <label className={labelClass}>SALE STARTS</label>
                  <input
                    type="datetime-local"
                    value={saleStartsAt}
                    onChange={(event) => setSaleStartsAt(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>SALE ENDS</label>
                  <input
                    type="datetime-local"
                    value={saleEndsAt}
                    onChange={(event) => setSaleEndsAt(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* 04 — INVENTORY */}
            <section className={sectionClass}>
              <SectionHeading
                number="04"
                eyebrow="INVENTORY"
                title="Stock control"
                description="Manage available quantities and backorder preferences."
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>STOCK QUANTITY *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={stockQuantity}
                    onChange={(event) => setStockQuantity(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>LOW-STOCK WARNING LEVEL</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={lowStockThreshold}
                    onChange={(event) =>
                      setLowStockThreshold(event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <label className="mt-7 flex cursor-pointer items-start gap-4 border-t border-[#470d20]/10 pt-6">
                <input
                  type="checkbox"
                  checked={allowBackorder}
                  onChange={(event) => setAllowBackorder(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#470d20]"
                />
                <span>
                  <span className="block text-sm font-medium">
                    Allow backorders
                  </span>
                  <span className="mt-1 block text-xs text-[#350817]/50">
                    Allow customers to order when stock reaches zero.
                  </span>
                </span>
              </label>
            </section>

            {/* 05 — PRODUCT VARIANTS */}
            <section className={sectionClass}>
              <SectionHeading
                number="05"
                eyebrow="PRODUCT OPTIONS"
                title="Variants & combinations"
                description="Manage sizes, colours and other product options. Existing combinations are loaded automatically."
              />

              <ProductVariantsEditor
                groups={variantGroups}
                variants={variants}
                onGroupsChange={setVariantGroups}
                onVariantsChange={setVariants}
                baseSku={sku}
              />
            </section>

            {/* 06 — SHIPPING */}
            <section className={sectionClass}>
              <SectionHeading
                number="06"
                eyebrow="SHIPPING"
                title="Delivery details"
                description="Update physical or digital product information and package measurements."
              />

              <div>
                <label className={labelClass}>PRODUCT TYPE *</label>
                <select
                  value={productType}
                  onChange={(event) =>
                    setProductType(event.target.value as "physical" | "digital")
                  }
                  className={inputClass}
                >
                  <option value="physical">Physical product</option>
                  <option value="digital">Digital product</option>
                </select>
              </div>

              {productType === "physical" && (
                <>
                  <div className="mt-6">
                    <label className={labelClass}>WEIGHT (GRAMS) *</label>
                    <input
                      required
                      type="number"
                      min="1"
                      step="1"
                      value={weightGrams}
                      onChange={(event) => setWeightGrams(event.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="mt-7 border-t border-[#470d20]/10 pt-6">
                    <p className="mb-5 font-mono text-[10px] tracking-wider text-[#470d20]">
                      PACKAGE DIMENSIONS (CM)
                    </p>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className={labelClass}>LENGTH</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={lengthCm}
                          onChange={(event) => setLengthCm(event.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>WIDTH</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={widthCm}
                          onChange={(event) => setWidthCm(event.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>HEIGHT</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={heightCm}
                          onChange={(event) => setHeightCm(event.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-7">
                    <label className={labelClass}>SHIPPING CLASS</label>
                    <input
                      value={shippingClass}
                      onChange={(event) => setShippingClass(event.target.value)}
                      maxLength={80}
                      className={inputClass}
                    />
                  </div>

                  <label className="mt-6 flex cursor-pointer items-start gap-4 border-t border-[#470d20]/10 pt-6">
                    <input
                      type="checkbox"
                      checked={isFragile}
                      onChange={(event) => setIsFragile(event.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#470d20]"
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        Fragile item
                      </span>
                      <span className="mt-1 block text-xs text-[#350817]/50">
                        Requires careful handling during delivery.
                      </span>
                    </span>
                  </label>
                </>
              )}
            </section>

            {/* 07 — ATTRIBUTES */}
            <section className={sectionClass}>
              <SectionHeading
                number="07"
                eyebrow="PRODUCT DETAILS"
                title="Specifications & attributes"
                description="Edit material, colour, dimensions, care instructions and other specifications."
              />

              <div className="space-y-3">
                {attributes.map((attribute, index) => (
                  <div
                    key={attribute.id}
                    className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]"
                  >
                    <input
                      value={attribute.name}
                      onChange={(event) =>
                        updateAttribute(
                          attribute.id,
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder={index === 0 ? "e.g. Material" : "Attribute"}
                      maxLength={100}
                      className={inputClass}
                    />

                    <input
                      value={attribute.value}
                      onChange={(event) =>
                        updateAttribute(
                          attribute.id,
                          "value",
                          event.target.value,
                        )
                      }
                      placeholder={
                        index === 0 ? "e.g. Genuine leather" : "Value"
                      }
                      maxLength={500}
                      className={inputClass}
                    />

                    <button
                      type="button"
                      onClick={() => removeAttribute(attribute.id)}
                      aria-label="Remove attribute"
                      className="flex h-12 w-12 items-center justify-center border border-[#470d20]/15 text-[#806c59] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addAttribute}
                className="mt-5 inline-flex items-center gap-2 border border-[#470d20]/20 px-4 py-3 font-mono text-[9px] tracking-wider text-[#470d20] transition-colors hover:bg-[#470d20] hover:text-[#f1e8d8]"
              >
                <Plus size={13} />
                ADD SPECIFICATION
              </button>
            </section>

            {/* 08 — SEO */}
            <section className={sectionClass}>
              <SectionHeading
                number="08"
                eyebrow="SEARCH & DISCOVERY"
                title="SEO and product tags"
                description="Manage search engine metadata and product discovery tags."
              />

              <div className="space-y-6">
                <div>
                  <label className={labelClass}>PRODUCT TAGS</label>
                  <input
                    value={tagsInput}
                    onChange={(event) => setTagsInput(event.target.value)}
                    placeholder="leather, accessories, premium"
                    className={inputClass}
                  />
                  <p className="mt-2 text-[11px] text-[#350817]/45">
                    Separate tags with commas.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>SEO TITLE</label>
                  <input
                    value={seoTitle}
                    onChange={(event) => setSeoTitle(event.target.value)}
                    maxLength={180}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>SEO META DESCRIPTION</label>
                  <textarea
                    rows={4}
                    value={seoDescription}
                    onChange={(event) => setSeoDescription(event.target.value)}
                    maxLength={320}
                    className={`${inputClass} resize-y leading-6`}
                  />
                  <p className="mt-2 text-right text-[10px] text-[#350817]/40">
                    {seoDescription.length}/320
                  </p>
                </div>
              </div>
            </section>

            {/* 09 — VISIBILITY */}
            <section className={sectionClass}>
              <SectionHeading
                number="09"
                eyebrow="STORE VISIBILITY"
                title="The finishing touch"
                description="Choose how this product appears in your AURELIS store."
              />

              <div className="space-y-5">
                {[
                  {
                    label: "Featured product",
                    description:
                      "Highlight this product in featured selections.",
                    checked: isFeatured,
                    change: setIsFeatured,
                  },
                  {
                    label: "New arrival",
                    description: "Identify this product as a recent addition.",
                    checked: isNewArrival,
                    change: setIsNewArrival,
                  },
                  {
                    label: "Bestseller",
                    description: "Give this product a bestseller designation.",
                    checked: isBestseller,
                    change: setIsBestseller,
                  },
                  {
                    label: "Publish immediately",
                    description:
                      "Make this product visible in the public storefront.",
                    checked: isPublished,
                    change: setIsPublished,
                  },
                ].map((item) => (
                  <label
                    key={item.label}
                    className="flex cursor-pointer items-start gap-4"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(event) => item.change(event.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#470d20]"
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs text-[#350817]/50">
                        {item.description}
                      </span>
                    </span>
                  </label>
                ))}

                <div className="border-t border-[#470d20]/10 pt-6">
                  <label className={labelClass}>
                    SCHEDULED PUBLICATION (OPTIONAL)
                  </label>
                  <input
                    type="datetime-local"
                    value={publishAt}
                    onChange={(event) => setPublishAt(event.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-2 text-[11px] leading-5 text-[#350817]/45">
                    Scheduled publication is saved with the product. Automatic
                    publishing will require a scheduled server process.
                  </p>
                  {publishAt && (
                    <p className="mt-3 text-xs text-[#470d20]">
                      This product will remain unpublished until publishing
                      automation is connected.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* SAVE */}
            <div className="flex flex-col-reverse justify-between gap-4 border-t border-[#470d20]/10 pt-7 sm:flex-row sm:items-center">
              <Link
                href="/admin/products"
                className="text-center font-mono text-[10px] tracking-wider text-[#806c59] transition-colors hover:text-[#470d20]"
              >
                CANCEL
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-3 bg-[#470d20] px-7 py-4 font-mono text-[10px] tracking-[0.15em] text-[#f1e8d8] transition-colors hover:bg-[#64152f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "SAVING CHANGES..." : "SAVE CHANGES"}
              </button>
            </div>
          </form>
        )}

        <footer className="mt-16 border-t border-[#470d20]/10 pt-6">
          <p className="font-mono text-[9px] tracking-[0.15em] text-[#350817]/40">
            AURELIS ADMINISTRATION · PRODUCT EDITOR
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function EditProductPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f8f4ed] text-[#350817]">
          <div className="flex items-center gap-3">
            <LoaderCircle size={20} className="animate-spin" />
            <span className="font-mono text-[10px] tracking-wider">
              LOADING EDITOR...
            </span>
          </div>
        </main>
      }
    >
      <EditProductPageContent />
    </Suspense>
  );
}
