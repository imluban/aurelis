"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, LoaderCircle, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [weightGrams, setWeightGrams] = useState("");
  const [productType, setProductType] = useState<"physical" | "digital">(
    "physical",
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

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

  function handleNameChange(value: string) {
    setName(value);

    if (!slugEdited) {
      setSlug(createSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(createSlug(value));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WebP image.");
      event.target.value = "";
      setImageFile(null);
      return;
    }

    if (file.size > maxSize) {
      setError("The image must be 5 MB or smaller.");
      event.target.value = "";
      setImageFile(null);
      return;
    }

    setError("");
    setImageFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const numericPrice = Number(price);
    const numericComparePrice =
      compareAtPrice.trim() === "" ? null : Number(compareAtPrice);
    const numericStock = Number(stockQuantity);
    const numericWeight =
      weightGrams.trim() === "" ? null : Number(weightGrams);

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

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setError("Stock quantity must be a whole number of zero or more.");
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

    setSaving(true);

    const supabase = createClient();
    let uploadedPath: string | null = null;

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const extension = imageFile.name.split(".").pop()?.toLowerCase();

        if (!extension) {
          throw new Error("The selected image has an invalid filename.");
        }

        uploadedPath = `products/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(uploadedPath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(uploadedPath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("products").insert({
        name: name.trim(),
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
        stock_quantity: numericStock,
        weight_grams: productType === "physical" ? numericWeight : null,
        product_type: productType,
        image_url: imageUrl,
        is_featured: isFeatured,
        is_published: isPublished,
      });

      if (insertError) throw insertError;

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("AURELIS product creation error:", err);

      if (uploadedPath) {
        await supabase.storage.from("product-images").remove([uploadedPath]);
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
          <section className="border border-[#470d20]/10 bg-white/60 p-6 sm:p-9">
            <div className="mb-7">
              <p className="font-mono text-[9px] tracking-[0.2em] text-[#9b806b]">
                01 / PRODUCT INFORMATION
              </p>
              <h2 className="mt-2 font-serif text-3xl">The essentials</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block font-mono text-[10px] tracking-wider">
                  PRODUCT NAME *
                </label>
                <input
                  required
                  maxLength={180}
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="e.g. Signature Leather Tote"
                  className="w-full border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm outline-none focus:border-[#470d20]"
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] tracking-wider">
                  URL SLUG *
                </label>
                <input
                  required
                  maxLength={180}
                  value={slug}
                  onChange={(event) => handleSlugChange(event.target.value)}
                  placeholder="signature-leather-tote"
                  className="w-full border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm outline-none focus:border-[#470d20]"
                />
                <p className="mt-2 text-[11px] text-[#350817]/45">
                  Used in the product URL. Use English letters, numbers and
                  hyphens.
                </p>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] tracking-wider">
                  SKU / PRODUCT CODE
                </label>
                <input
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  maxLength={80}
                  placeholder="AUR-FAS-001"
                  className="w-full border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm outline-none focus:border-[#470d20]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block font-mono text-[10px] tracking-wider">
                  CATEGORY *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  disabled={categoriesLoading || categories.length === 0}
                  className="w-full border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm outline-none focus:border-[#470d20] disabled:opacity-50"
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
                <label className="mb-2 block font-mono text-[10px] tracking-wider">
                  SHORT DESCRIPTION
                </label>
                <input
                  maxLength={250}
                  value={shortDescription}
                  onChange={(event) => setShortDescription(event.target.value)}
                  placeholder="A concise introduction to this product..."
                  className="w-full border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm outline-none focus:border-[#470d20]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block font-mono text-[10px] tracking-wider">
                  FULL DESCRIPTION
                </label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the product, its materials, features and what makes it special..."
                  className="w-full resize-y border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm leading-6 outline-none focus:border-[#470d20]"
                />
              </div>
            </div>
          </section>

          <section className="border border-[#470d20]/10 bg-white/60 p-6 sm:p-9">
            <div className="mb-7">
              <p className="font-mono text-[9px] tracking-[0.2em] text-[#9b806b]">
                02 / PRICING & INVENTORY
              </p>
              <h2 className="mt-2 font-serif text-3xl">The numbers</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-mono text-[10px] tracking-wider">
                  SELLING PRICE (BDT) *
                </label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="2500"
                  className="w-full border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm outline-none focus:border-[#470d20]"
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] tracking-wider">
                  ORIGINAL PRICE (BDT)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(event) => setCompareAtPrice(event.target.value)}
                  placeholder="Optional"
                  className="w-full border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm outline-none focus:border-[#470d20]"
                />
                <p className="mt-2 text-[11px] text-[#350817]/45">
                  Must be higher than the selling price.
                </p>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] tracking-wider">
                  STOCK QUANTITY *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={stockQuantity}
                  onChange={(event) => setStockQuantity(event.target.value)}
                  className="w-full border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm outline-none focus:border-[#470d20]"
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] tracking-wider">
                  PRODUCT TYPE *
                </label>
                <select
                  value={productType}
                  onChange={(event) =>
                    setProductType(event.target.value as "physical" | "digital")
                  }
                  className="w-full border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm outline-none focus:border-[#470d20]"
                >
                  <option value="physical">Physical product</option>
                  <option value="digital">Digital product</option>
                </select>
              </div>

              {productType === "physical" && (
                <div>
                  <label className="mb-2 block font-mono text-[10px] tracking-wider">
                    PRODUCT WEIGHT (GRAMS) *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={weightGrams}
                    onChange={(event) => setWeightGrams(event.target.value)}
                    placeholder="e.g. 500"
                    className="w-full border border-[#470d20]/15 bg-[#f8f4ed] px-4 py-3.5 text-sm outline-none focus:border-[#470d20]"
                  />
                  <p className="mt-2 text-[11px] text-[#350817]/45">
                    Used later for courier pricing.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="border border-[#470d20]/10 bg-white/60 p-6 sm:p-9">
            <div className="mb-7">
              <p className="font-mono text-[9px] tracking-[0.2em] text-[#9b806b]">
                03 / PRODUCT PHOTOGRAPHY
              </p>
              <h2 className="mt-2 font-serif text-3xl">The visual</h2>
            </div>

            <label className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center border border-dashed border-[#470d20]/25 bg-[#f8f4ed] p-8 text-center transition-colors hover:border-[#470d20]">
              <ImagePlus
                size={30}
                strokeWidth={1.2}
                className="text-[#9b806b]"
              />

              <span className="mt-4 font-serif text-2xl">
                {imageFile ? "Image selected" : "Choose product image"}
              </span>

              <span className="mt-2 text-xs text-[#350817]/50">
                JPG, PNG or WebP · Maximum 5 MB
              </span>

              {imageFile && (
                <span className="mt-3 max-w-full truncate text-xs font-medium text-[#470d20]">
                  {imageFile.name}
                </span>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>

            {imageFile && (
              <button
                type="button"
                onClick={() => setImageFile(null)}
                className="mt-4 inline-flex items-center gap-2 text-xs text-red-700 hover:text-red-900"
              >
                <X size={14} />
                Remove selected image
              </button>
            )}
          </section>

          <section className="border border-[#470d20]/10 bg-white/60 p-6 sm:p-9">
            <div className="mb-7">
              <p className="font-mono text-[9px] tracking-[0.2em] text-[#9b806b]">
                04 / STORE VISIBILITY
              </p>
              <h2 className="mt-2 font-serif text-3xl">The finishing touch</h2>
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
                    Feature this product
                  </span>
                  <span className="mt-1 block text-xs text-[#350817]/50">
                    Mark this product as a featured selection.
                  </span>
                </span>
              </label>

              <div className="h-px bg-[#470d20]/10" />

              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(event) => setIsPublished(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#470d20]"
                />
                <span>
                  <span className="block text-sm font-medium">
                    Publish immediately
                  </span>
                  <span className="mt-1 block text-xs text-[#350817]/50">
                    Make this product visible in the public storefront after
                    saving.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse justify-between gap-4 border-t border-[#470d20]/10 pt-7 sm:flex-row sm:items-center">
            <Link
              href="/admin/products"
              className="text-center font-mono text-[10px] tracking-wider text-[#806c59] transition-colors hover:text-[#470d20]"
            >
              CANCEL
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={
                  saving || categoriesLoading || categories.length === 0
                }
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
