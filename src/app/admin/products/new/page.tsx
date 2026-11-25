"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

type Category = {
  id: string;
  name: string;
};

type GalleryImage = {
  id: string;
  file: File;
  preview: string;
  altText: string;
};

type ProductAttribute = {
  id: string;
  name: string;
  value: string;
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

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const previewUrls = useRef<string[]>([]);

  // Product information
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
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

  // Product gallery
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);

  // Product attributes
  const [attributes, setAttributes] = useState<ProductAttribute[]>([
    { id: "initial-attribute", name: "", value: "" },
  ]);

  // Discovery and SEO
  const [tagsInput, setTagsInput] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Store visibility
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [publishAt, setPublishAt] = useState("");

  // UI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error: categoryError }) => {
        if (!active) return;

        if (categoryError) {
          setError("We couldn't load the product categories.");
        } else {
          const rows = (data ?? []) as Category[];
          setCategories(rows);
          setCategoryId(rows[0]?.id ?? "");
        }

        setCategoriesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  function handleNameChange(value: string) {
    setName(value);

    if (!slugEdited) {
      setSlug(createSlug(value));
    }

    if (!seoTitle) {
      setSeoTitle(value);
    }
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(createSlug(value));
  }

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setError(`You can add a maximum of ${MAX_IMAGES} images.`);
      return;
    }

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
        file,
        preview,
        altText: name.trim() || file.name.replace(/\.[^.]+$/, ""),
      });
    }

    if (accepted.length > 0) {
      if (images.length === 0) {
        setPrimaryImageId(accepted[0].id);
      }

      setImages((current) => [...current, ...accepted]);
    }

    setError(errors.length > 0 ? errors.join(" ") : "");
  }

  function removeImage(imageId: string) {
    const image = images.find((item) => item.id === imageId);

    if (image) {
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

    const dimensions = [numericLength, numericWidth, numericHeight];

    if (
      dimensions.some(
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

    if (publishAt && new Date(publishAt) <= new Date()) {
      setError("Choose a future date and time for scheduled publishing.");
      return;
    }

    setSaving(true);

    const supabase = createClient();
    const uploadedPaths: string[] = [];
    let createdProductId: string | null = null;

    try {
      const { data: product, error: insertError } = await supabase
        .from("products")
        .insert({
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

          image_url: null,

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
        .select("id")
        .single();

      if (insertError) throw insertError;

      createdProductId = product.id;

      // Upload all gallery images, then create their database records.
      const galleryRows = [];

      for (let index = 0; index < images.length; index += 1) {
        const image = images[index];
        const extension = image.file.name.split(".").pop()?.toLowerCase();

        if (!extension) {
          throw new Error(`Invalid filename for ${image.file.name}.`);
        }

        const storagePath = `products/${product.id}/${crypto.randomUUID()}.${extension}`;

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

        galleryRows.push({
          product_id: product.id,
          image_url: publicUrlData.publicUrl,
          storage_path: storagePath,
          alt_text: image.altText.trim() || name.trim(),
          sort_order: index,
          is_primary: image.id === primaryImageId,
        });
      }

      if (galleryRows.length > 0) {
        const { error: galleryError } = await supabase
          .from("product_images")
          .insert(galleryRows);

        if (galleryError) throw galleryError;
      }

      const attributeRows = attributes
        .filter((attribute) => attribute.name.trim() && attribute.value.trim())
        .map((attribute, index) => ({
          product_id: product.id,
          attribute_name: attribute.name.trim(),
          attribute_value: attribute.value.trim(),
          sort_order: index,
        }));

      if (attributeRows.length > 0) {
        const { error: attributesError } = await supabase
          .from("product_attributes")
          .insert(attributeRows);

        if (attributesError) throw attributesError;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("AURELIS product creation error:", err);

      // Clean up any partially created product and uploaded files.
      if (createdProductId) {
        await supabase.from("products").delete().eq("id", createdProductId);
      }

      if (uploadedPaths.length > 0) {
        await supabase.storage.from("product-images").remove(uploadedPaths);
      }

      setError(
        err instanceof Error
          ? err.message
          : "We couldn't save this product. Please try again.",
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
            CATALOGUE / NEW PRODUCT
          </p>

          <h1 className="mt-4 font-serif text-5xl sm:text-6xl">
            Add a product<span className="italic">.</span>
          </h1>

          <p className="mt-3 text-sm text-[#350817]/55">
            Introduce something new to the AURELIS collection.
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 01 — PRODUCT INFORMATION */}
          <section className={sectionClass}>
            <SectionHeading
              number="01"
              eyebrow="PRODUCT INFORMATION"
              title="The essentials"
              description="The identity and description customers will see."
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>PRODUCT NAME *</label>
                <input
                  required
                  maxLength={180}
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="e.g. Signature Leather Tote"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>BRAND</label>
                <input
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  maxLength={120}
                  placeholder="e.g. AURELIS"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>SKU / PRODUCT CODE</label>
                <input
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  maxLength={80}
                  placeholder="AUR-FAS-001"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>URL SLUG *</label>
                <input
                  required
                  maxLength={180}
                  value={slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  placeholder="signature-leather-tote"
                  className={inputClass}
                />
                <p className="mt-2 text-[11px] text-[#350817]/45">
                  Used in the product URL. English letters, numbers and hyphens.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>CATEGORY *</label>
                <select
                  required
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  disabled={categoriesLoading || categories.length === 0}
                  className={inputClass}
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : categories.length === 0
                        ? "No active categories available"
                        : "Select a category"}
                  </option>
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
                  onChange={(event) => setShortDescription(event.target.value)}
                  placeholder="A concise introduction to this product..."
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>FULL DESCRIPTION</label>
                <textarea
                  rows={7}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the product, its materials, features and what makes it special..."
                  className={`${inputClass} resize-y leading-6`}
                />
              </div>
            </div>
          </section>

          {/* 02 — MEDIA GALLERY */}
          <section className={sectionClass}>
            <SectionHeading
              number="02"
              eyebrow="PRODUCT MEDIA"
              title="The gallery"
              description="Upload up to 15 images. Choose a cover image, arrange the order and add descriptive alt text."
            />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-serif text-2xl">
                  {images.length} <span className="text-[#9b806b]">/ 15</span>
                </p>
                <p className="mt-1 text-[11px] text-[#350817]/45">
                  {images.length === 0
                    ? "No images selected yet"
                    : "Images selected for this product"}
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
              JPG, PNG or WebP · Maximum 5 MB per image · Up to 15 images. The
              primary image becomes the product&apos;s main storefront image.
            </div>

            {images.length === 0 ? (
              <label className="flex min-h-[230px] cursor-pointer flex-col items-center justify-center border border-dashed border-[#470d20]/25 bg-[#f8f4ed] p-8 text-center transition-colors hover:border-[#470d20]">
                <ImagePlus
                  size={34}
                  strokeWidth={1.2}
                  className="text-[#9b806b]"
                />
                <span className="mt-4 font-serif text-2xl">
                  Add product photographs
                </span>
                <span className="mt-2 text-xs text-[#350817]/50">
                  Select one or multiple images from your device
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
                            aria-label="Move image left"
                            className="flex h-8 w-8 items-center justify-center bg-[#350817]/85 text-[#f1e8d8] hover:bg-[#470d20] disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => moveImage(image.id, 1)}
                            disabled={index === images.length - 1}
                            aria-label="Move image right"
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
                            placeholder="Describe this image"
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
                    ? `Cover: ${primaryImage.file.name}`
                    : "Select a cover image"}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    images.forEach((image) => {
                      URL.revokeObjectURL(image.preview);
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
              description="Set your regular price, compare-at price and optional promotional sale."
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
                  placeholder="2500"
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
                  placeholder="Optional"
                  className={inputClass}
                />
                <p className="mt-2 text-[11px] text-[#350817]/45">
                  Must be higher than the selling price.
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-[#470d20]/10 pt-7">
              <p className="mb-5 font-mono text-[10px] tracking-wider text-[#470d20]">
                PROMOTIONAL SALE
              </p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>SALE PRICE (BDT)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={salePrice}
                    onChange={(event) => setSalePrice(event.target.value)}
                    placeholder="Optional"
                    className={inputClass}
                  />
                  <p className="mt-2 text-[11px] text-[#350817]/45">
                    Must not exceed the regular selling price.
                  </p>
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
            </div>
          </section>

          {/* 04 — INVENTORY */}
          <section className={sectionClass}>
            <SectionHeading
              number="04"
              eyebrow="INVENTORY"
              title="Stock control"
              description="Keep track of available quantities and low-stock warnings."
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
                  onChange={(event) => setLowStockThreshold(event.target.value)}
                  className={inputClass}
                />
                <p className="mt-2 text-[11px] text-[#350817]/45">
                  Flag this product when stock reaches this quantity.
                </p>
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
                  Allow customers to order this product when its stock reaches
                  zero. This setting is stored for the future checkout inventory
                  workflow.
                </span>
              </span>
            </label>
          </section>

          {/* 05 — SHIPPING */}
          <section className={sectionClass}>
            <SectionHeading
              number="05"
              eyebrow="SHIPPING"
              title="Delivery details"
              description="Physical product measurements will help with future courier calculations."
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
                    placeholder="e.g. 500"
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
                        placeholder="Length"
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
                        placeholder="Width"
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
                        placeholder="Height"
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
                    placeholder="e.g. Standard, Bulky, Express"
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
                      Mark this product as requiring careful handling.
                    </span>
                  </span>
                </label>
              </>
            )}
          </section>

          {/* 06 — ATTRIBUTES */}
          <section className={sectionClass}>
            <SectionHeading
              number="06"
              eyebrow="PRODUCT DETAILS"
              title="Specifications & attributes"
              description="Add useful product information such as material, colour, dimensions, care instructions or technical specifications."
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
                      updateAttribute(attribute.id, "name", event.target.value)
                    }
                    placeholder={index === 0 ? "e.g. Material" : "Attribute"}
                    maxLength={100}
                    className={inputClass}
                  />

                  <input
                    value={attribute.value}
                    onChange={(event) =>
                      updateAttribute(attribute.id, "value", event.target.value)
                    }
                    placeholder={index === 0 ? "e.g. Genuine leather" : "Value"}
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

          {/* 07 — SEO */}
          <section className={sectionClass}>
            <SectionHeading
              number="07"
              eyebrow="SEARCH & DISCOVERY"
              title="SEO and product tags"
              description="Help search engines and customers understand what this product is about."
            />

            <div className="space-y-6">
              <div>
                <label className={labelClass}>PRODUCT TAGS</label>
                <input
                  value={tagsInput}
                  onChange={(event) => setTagsInput(event.target.value)}
                  placeholder="leather, tote bag, accessories, premium"
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
                  placeholder="Search engine title"
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
                  placeholder="Write a concise description for search engine results..."
                  className={`${inputClass} resize-y leading-6`}
                />
                <p className="mt-2 text-right text-[10px] text-[#350817]/40">
                  {seoDescription.length}/320
                </p>
              </div>
            </div>
          </section>

          {/* 08 — PUBLISHING */}
          <section className={sectionClass}>
            <SectionHeading
              number="08"
              eyebrow="STORE VISIBILITY"
              title="The finishing touch"
              description="Choose how this product will appear in your AURELIS store."
            />

            <div className="space-y-5">
              {[
                {
                  label: "Featured product",
                  description: "Mark this product as a featured selection.",
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
                    "Make this product visible in the public storefront after saving.",
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
                  A scheduled publication time is saved with the product.
                  Automatic publishing requires a scheduled server process,
                  which we&apos;ll implement separately.
                </p>
                {publishAt && (
                  <p className="mt-3 text-xs text-[#470d20]">
                    Scheduled products will be saved as drafts until the
                    publishing automation is connected.
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
              disabled={saving || categoriesLoading || categories.length === 0}
              className="inline-flex items-center justify-center gap-3 bg-[#470d20] px-7 py-4 font-mono text-[10px] tracking-[0.15em] text-[#f1e8d8] transition-colors hover:bg-[#64152f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "SAVING PRODUCT..." : "SAVE PRODUCT"}
            </button>
          </div>
        </form>

        <footer className="mt-16 border-t border-[#470d20]/10 pt-6">
          <p className="font-mono text-[9px] tracking-[0.15em] text-[#350817]/40">
            AURELIS ADMINISTRATION · PRODUCT CREATION
          </p>
        </footer>
      </div>
    </main>
  );
}
