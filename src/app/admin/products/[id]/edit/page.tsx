"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, Save, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
};

type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  price_paisa: number;
  compare_at_price_paisa: number | null;
  stock_quantity: number;
  weight_grams: number | null;
  product_type: "physical" | "digital";
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
};

const inputClass =
  "w-full border border-[#470d20]/15 bg-white/70 px-4 py-3.5 text-sm text-[#350817] outline-none transition-colors placeholder:text-[#350817]/35 focus:border-[#470d20]";

const labelClass =
  "mb-2 block font-mono text-[9px] tracking-[0.15em] text-[#806c59]";

function getStoragePath(publicUrl: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const index = publicUrl.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(publicUrl.slice(index + marker.length));
}

function EditProductPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [productType, setProductType] = useState<"physical" | "digital">(
    "physical",
  );
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setError("");

      const supabase = createClient();

      const [productResult, categoryResult] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id, name, slug, sku, category_id, short_description, description, price_paisa, compare_at_price_paisa, stock_quantity, weight_grams, product_type, image_url, is_featured, is_published",
          )
          .eq("id", productId)
          .maybeSingle(),

        supabase
          .from("categories")
          .select("id, name")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (productResult.error) throw productResult.error;
      if (categoryResult.error) throw categoryResult.error;

      if (!productResult.data) {
        throw new Error("This product could not be found.");
      }

      const product = productResult.data as ProductRecord;

      setCategories((categoryResult.data ?? []) as Category[]);

      setName(product.name);
      setSlug(product.slug);
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

      setStockQuantity(String(product.stock_quantity));

      setWeightGrams(
        product.weight_grams !== null ? String(product.weight_grams) : "",
      );

      setProductType(product.product_type);
      setImageUrl(product.image_url ?? "");
      setImagePreview(product.image_url ?? "");
      setIsFeatured(product.is_featured);
      setIsPublished(product.is_published);
    } catch (err) {
      console.error("AURELIS product loading error:", err);

      setError(
        err instanceof Error ? err.message : "We couldn't load this product.",
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        void loadProduct();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadProduct]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleImageChange(file: File | null) {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeSelectedImage() {
    setImageFile(null);
    setImagePreview(imageUrl);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const numericPrice = Number(price);

    const numericCompareAtPrice = compareAtPrice
      ? Number(compareAtPrice)
      : null;

    const numericStock = Number(stockQuantity);
    const numericWeight = weightGrams ? Number(weightGrams) : null;

    if (!name.trim() || !slug.trim() || !categoryId) {
      setError("Please complete the product name, slug and category.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid selling price.");
      return;
    }

    if (
      numericCompareAtPrice !== null &&
      (!Number.isFinite(numericCompareAtPrice) || numericCompareAtPrice < 0)
    ) {
      setError("Please enter a valid compare-at price.");
      return;
    }

    if (
      numericCompareAtPrice !== null &&
      numericCompareAtPrice <= numericPrice
    ) {
      setError("Compare-at price must be higher than the selling price.");
      return;
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setError("Stock quantity must be a non-negative whole number.");
      return;
    }

    if (
      numericWeight !== null &&
      (!Number.isInteger(numericWeight) || numericWeight < 0)
    ) {
      setError("Weight must be a non-negative whole number.");
      return;
    }

    if (productType === "physical" && numericWeight === null) {
      setError("Please enter the product weight in grams.");
      return;
    }

    setSaving(true);

    const supabase = createClient();
    let uploadedImagePath: string | null = null;

    try {
      let finalImageUrl = imageUrl;

      // Upload a replacement image only when one has been selected.
      if (imageFile) {
        const extension = imageFile.name.split(".").pop()?.toLowerCase();

        if (!extension || !["jpg", "jpeg", "png", "webp"].includes(extension)) {
          throw new Error("Unsupported image extension.");
        }

        const filePath = `products/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) throw uploadError;

        uploadedImagePath = filePath;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const { data: updatedProduct, error: updateError } = await supabase
        .from("products")
        .update({
          name: name.trim(),
          slug: slug.trim(),
          sku: sku.trim() || null,
          category_id: categoryId,
          short_description: shortDescription.trim() || null,
          description: description.trim() || null,
          price_paisa: Math.round(numericPrice * 100),
          compare_at_price_paisa:
            numericCompareAtPrice !== null
              ? Math.round(numericCompareAtPrice * 100)
              : null,
          stock_quantity: numericStock,
          weight_grams: productType === "physical" ? numericWeight : null,
          product_type: productType,
          image_url: finalImageUrl || null,
          is_featured: isFeatured,
          is_published: isPublished,
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

      // Remove the previous image only after the database update succeeds.
      if (imageFile && imageUrl) {
        const oldImagePath = getStoragePath(imageUrl);

        if (oldImagePath) {
          const { error: removeError } = await supabase.storage
            .from("product-images")
            .remove([oldImagePath]);

          if (removeError) {
            console.error("Old product image cleanup failed:", removeError);
          }
        }
      }

      setSuccess("Product updated successfully.");

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("AURELIS product update error:", err);

      // Avoid leaving an unused replacement image if the update fails.
      if (uploadedImagePath) {
        const { error: cleanupError } = await supabase.storage
          .from("product-images")
          .remove([uploadedImagePath]);

        if (cleanupError) {
          console.error("Replacement image cleanup failed:", cleanupError);
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

  return (
    <main className="min-h-screen bg-[#f8f4ed] text-[#350817]">
      <header className="border-b border-[#470d20]/10 bg-[#350817] text-[#f1e8d8]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/admin" className="font-serif text-3xl tracking-[0.15em]">
            AURELIS
          </Link>

          <Link
            href="/"
            target="_blank"
            className="text-xs text-[#f1e8d8]/65 transition-colors hover:text-[#d2bea5]"
          >
            View storefront ↗
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-6 py-12 lg:px-10 lg:py-16">
        <Link
          href="/admin/products"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-[#9b806b] transition-colors hover:text-[#470d20]"
        >
          <ArrowLeft size={14} />
          BACK TO PRODUCTS
        </Link>

        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.25em] text-[#9b806b]">
            STORE MANAGEMENT / CATALOGUE
          </p>

          <h1 className="mt-4 font-serif text-5xl sm:text-6xl">
            Edit product<span className="italic">.</span>
          </h1>

          <p className="mt-3 text-sm text-[#350817]/55">
            Update product information, pricing, inventory and visibility.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-7 border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-7 border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 border border-[#470d20]/10 bg-white/60 py-24">
            <Loader2 size={20} className="animate-spin" />
            <span className="font-mono text-[10px] tracking-wider">
              LOADING PRODUCT...
            </span>
          </div>
        ) : error && !name ? (
          <div className="border border-[#470d20]/10 bg-white/60 px-6 py-12 text-center">
            <p className="font-serif text-2xl">Product unavailable.</p>

            <Link
              href="/admin/products"
              className="mt-5 inline-flex bg-[#470d20] px-6 py-3 font-mono text-[10px] tracking-wider"
              style={{ color: "#f1e8d8" }}
            >
              BACK TO PRODUCTS
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* BASIC INFORMATION */}
            <section className="border border-[#470d20]/10 bg-white/60 p-6 sm:p-9">
              <div className="mb-7 border-b border-[#470d20]/10 pb-5">
                <p className="font-mono text-[9px] tracking-[0.2em] text-[#9b806b]">
                  01 / PRODUCT DETAILS
                </p>

                <h2 className="mt-2 font-serif text-3xl">Basic information</h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>PRODUCT NAME *</label>

                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClass}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className={labelClass}>PRODUCT SLUG *</label>

                  <input
                    required
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    className={inputClass}
                    placeholder="product-url-slug"
                  />

                  <p className="mt-2 text-[10px] text-[#806c59]">
                    Used in the product URL. Keep it unique.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>SKU</label>

                  <input
                    value={sku}
                    onChange={(event) => setSku(event.target.value)}
                    className={inputClass}
                    placeholder="e.g. AUR-001"
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

                  <textarea
                    rows={2}
                    value={shortDescription}
                    onChange={(event) =>
                      setShortDescription(event.target.value)
                    }
                    className={inputClass}
                    placeholder="A short introduction to this product"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>FULL DESCRIPTION</label>

                  <textarea
                    rows={6}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className={inputClass}
                    placeholder="Describe the product in detail..."
                  />
                </div>
              </div>
            </section>

            {/* PRICING AND INVENTORY */}
            <section className="border border-[#470d20]/10 bg-white/60 p-6 sm:p-9">
              <div className="mb-7 border-b border-[#470d20]/10 pb-5">
                <p className="font-mono text-[9px] tracking-[0.2em] text-[#9b806b]">
                  02 / COMMERCE
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  Pricing & inventory
                </h2>
              </div>

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
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className={labelClass}>COMPARE-AT PRICE (BDT)</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={compareAtPrice}
                    onChange={(event) => setCompareAtPrice(event.target.value)}
                    className={inputClass}
                    placeholder="Optional original price"
                  />
                </div>

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
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className={labelClass}>PRODUCT TYPE *</label>

                  <select
                    value={productType}
                    onChange={(event) =>
                      setProductType(
                        event.target.value as "physical" | "digital",
                      )
                    }
                    className={inputClass}
                  >
                    <option value="physical">Physical product</option>
                    <option value="digital">Digital product</option>
                  </select>
                </div>

                {productType === "physical" && (
                  <div>
                    <label className={labelClass}>WEIGHT (GRAMS) *</label>

                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={weightGrams}
                      onChange={(event) => setWeightGrams(event.target.value)}
                      className={inputClass}
                      placeholder="e.g. 500"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* PRODUCT IMAGE */}
            <section className="border border-[#470d20]/10 bg-white/60 p-6 sm:p-9">
              <div className="mb-7 border-b border-[#470d20]/10 pb-5">
                <p className="font-mono text-[9px] tracking-[0.2em] text-[#9b806b]">
                  03 / VISUAL IDENTITY
                </p>

                <h2 className="mt-2 font-serif text-3xl">Product image</h2>
              </div>

              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex h-56 w-full max-w-[220px] items-center justify-center overflow-hidden bg-[#e8dece]">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlus
                      size={36}
                      strokeWidth={1.2}
                      className="text-[#9b806b]"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col items-start justify-center">
                  <p className="text-sm text-[#350817]/65">
                    {imageFile
                      ? "A replacement image is selected."
                      : imageUrl
                        ? "This is the current product image."
                        : "No product image has been uploaded."}
                  </p>

                  <label
                    className="mt-5 inline-flex cursor-pointer items-center gap-2 bg-[#470d20] px-5 py-3.5 font-mono text-[10px] tracking-wider transition-colors hover:bg-[#64152f]"
                    style={{ color: "#f1e8d8" }}
                  >
                    <Upload size={15} />

                    {imageFile ? "CHOOSE ANOTHER IMAGE" : "REPLACE IMAGE"}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) =>
                        handleImageChange(event.target.files?.[0] ?? null)
                      }
                    />
                  </label>

                  {imageFile && (
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="mt-4 inline-flex items-center gap-2 text-xs text-red-700 hover:text-red-900"
                    >
                      <X size={14} />
                      Cancel image replacement
                    </button>
                  )}

                  <p className="mt-4 text-[10px] text-[#806c59]">
                    JPG, PNG or WebP · Maximum 5 MB
                  </p>
                </div>
              </div>
            </section>

            {/* VISIBILITY */}
            <section className="border border-[#470d20]/10 bg-white/60 p-6 sm:p-9">
              <div className="mb-7 border-b border-[#470d20]/10 pb-5">
                <p className="font-mono text-[9px] tracking-[0.2em] text-[#9b806b]">
                  04 / STOREFRONT
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  Visibility & placement
                </h2>
              </div>

              <div className="space-y-5">
                <label className="flex cursor-pointer items-start gap-4">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(event) => setIsFeatured(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#470d20]"
                  />

                  <span>
                    <span className="block text-sm font-medium">
                      Featured product
                    </span>

                    <span className="mt-1 block text-xs text-[#350817]/50">
                      Highlight this product in featured collections.
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-4">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(event) => setIsPublished(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#470d20]"
                  />

                  <span>
                    <span className="block text-sm font-medium">
                      Publish product
                    </span>

                    <span className="mt-1 block text-xs text-[#350817]/50">
                      Published products are visible in the public storefront.
                    </span>
                  </span>
                </label>
              </div>
            </section>

            {/* ACTIONS */}
            <div className="flex flex-col-reverse justify-between gap-4 sm:flex-row">
              <Link
                href="/admin/products"
                className="inline-flex items-center justify-center border border-[#470d20]/20 px-7 py-4 font-mono text-[10px] tracking-wider text-[#470d20] transition-colors hover:bg-white"
              >
                CANCEL
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-3 bg-[#470d20] px-8 py-4 font-mono text-[10px] tracking-[0.15em] transition-colors hover:bg-[#64152f] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: "#f1e8d8" }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    SAVING CHANGES...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    SAVE CHANGES
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default function EditProductPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f1e8d8] px-6 py-20 text-center text-[#470d20]">
          Loading product editor...
        </main>
      }
    >
      <EditProductPageContent />
    </Suspense>
  );
}
