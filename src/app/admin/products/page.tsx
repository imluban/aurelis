"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Plus,
  Search,
  Package,
  RefreshCw,
  Eye,
  EyeOff,
  Pencil,
  Image as ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/products";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price_paisa: number;
  compare_at_price_paisa: number | null;
  stock_quantity: number;
  image_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  product_type: "physical" | "digital";
  created_at: string;
  category_id: string | null;
};

type CategoryRow = {
  id: string;
  name: string;
};

type ProductWithCategory = ProductRow & {
  category_name: string;
};

type FilterType = "all" | "published" | "drafts" | "out-of-stock";

const actionButtonStyle: React.CSSProperties = {
  color: "#470d20",
  backgroundColor: "transparent",
  borderColor: "rgba(71, 13, 32, 0.2)",
};

const creamButtonStyle: React.CSSProperties = {
  backgroundColor: "#470d20",
  color: "#f1e8d8",
};

function handleActionMouseEnter(
  event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
) {
  event.currentTarget.style.backgroundColor = "#470d20";
  event.currentTarget.style.color = "#f1e8d8";
  event.currentTarget.style.borderColor = "#470d20";
}

function handleActionMouseLeave(
  event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
) {
  event.currentTarget.style.backgroundColor = "transparent";
  event.currentTarget.style.color = "#470d20";
  event.currentTarget.style.borderColor = "rgba(71, 13, 32, 0.2)";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const supabase = createClient();

      const [productResult, categoryResult] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id, name, slug, sku, price_paisa, compare_at_price_paisa, stock_quantity, image_url, is_published, is_featured, product_type, created_at, category_id",
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("categories")
          .select("id, name")
          .order("name", { ascending: true }),
      ]);

      if (productResult.error) throw productResult.error;
      if (categoryResult.error) throw categoryResult.error;

      const categoryRows = (categoryResult.data ?? []) as CategoryRow[];
      const productRows = (productResult.data ?? []) as ProductRow[];

      const categoryMap = new Map(
        categoryRows.map((category) => [category.id, category.name]),
      );

      setCategories(categoryRows);

      setProducts(
        productRows.map((product) => ({
          ...product,
          category_name: product.category_id
            ? (categoryMap.get(product.category_id) ?? "Uncategorised")
            : "Uncategorised",
        })),
      );

      setError("");
    } catch (err) {
      console.error("AURELIS product loading error:", err);

      setError(
        err instanceof Error ? err.message : "We couldn't load your products.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        void loadProducts();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.slug.toLowerCase().includes(normalizedSearch) ||
        (product.sku ?? "").toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "all" || product.category_id === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && product.is_published) ||
        (statusFilter === "drafts" && !product.is_published) ||
        (statusFilter === "out-of-stock" && product.stock_quantity <= 0);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  function handleRefresh() {
    setLoading(true);
    setError("");
    void loadProducts();
  }

  async function togglePublished(product: ProductWithCategory) {
    const action = product.is_published ? "unpublish" : "publish";

    if (
      !window.confirm(`Are you sure you want to ${action} "${product.name}"?`)
    ) {
      return;
    }

    setUpdatingId(product.id);
    setError("");

    try {
      const supabase = createClient();

      const { data: updatedProduct, error: updateError } = await supabase
        .from("products")
        .update({ is_published: !product.is_published })
        .eq("id", product.id)
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProduct) {
        throw new Error("The product status could not be updated.");
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, is_published: !item.is_published }
            : item,
        ),
      );
    } catch (err) {
      console.error("AURELIS product status error:", err);

      setError(
        err instanceof Error ? err.message : "We couldn't update this product.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const publishedCount = products.filter((item) => item.is_published).length;
  const draftCount = products.length - publishedCount;

  const outOfStockCount = products.filter(
    (item) => item.stock_quantity <= 0,
  ).length;

  return (
    <main className="min-h-screen bg-[#f8f4ed] text-[#350817]">
      <header className="border-b border-[#470d20]/10 bg-[#350817] text-[#f1e8d8]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/admin"
            className="font-serif text-3xl tracking-[0.15em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d2bea5]"
          >
            AURELIS
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-[#f1e8d8]/80 transition-colors hover:text-[#d2bea5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d2bea5]"
          >
            View storefront <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-10 lg:py-16">
        <Link
          href="/admin"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-[#806c59] transition-colors hover:text-[#470d20] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#470d20]"
        >
          <ArrowLeft size={14} />
          BACK TO OVERVIEW
        </Link>

        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-[#806c59]">
              STORE MANAGEMENT / CATALOGUE
            </p>

            <h1 className="mt-4 font-serif text-5xl sm:text-6xl">
              Products<span className="italic">.</span>
            </h1>

            <p className="mt-3 text-sm text-[#350817]/70">
              Manage your collection, inventory and product visibility.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            style={creamButtonStyle}
            className="inline-flex items-center justify-center gap-3 px-6 py-4 font-mono text-[10px] tracking-[0.15em] transition-colors hover:!bg-[#64152f] hover:!text-[#f1e8d8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#470d20]"
          >
            <Plus size={16} />
            ADD NEW PRODUCT
          </Link>
        </div>

        <section className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total products", value: products.length },
            { label: "Published", value: publishedCount },
            { label: "Drafts", value: draftCount },
            { label: "Out of stock", value: outOfStockCount },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-[#470d20]/10 bg-white/60 p-5 sm:p-7"
            >
              <p className="font-mono text-[9px] tracking-[0.12em] text-[#806c59] sm:text-[10px]">
                {stat.label.toUpperCase()}
              </p>

              <p className="mt-5 font-serif text-4xl">
                {loading ? "—" : stat.value}
              </p>
            </div>
          ))}
        </section>

        {error && (
          <div
            role="alert"
            className="mt-8 border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <section className="mt-12">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#806c59]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products by name, SKU or slug..."
                className="w-full border border-[#470d20]/15 bg-white/70 py-4 pl-12 pr-4 text-sm text-[#350817] outline-none placeholder:text-[#350817]/45 focus:border-[#470d20] focus-visible:ring-2 focus-visible:ring-[#470d20]/20"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="border border-[#470d20]/15 bg-white/70 px-4 py-4 text-sm text-[#350817] outline-none focus:border-[#470d20] focus-visible:ring-2 focus-visible:ring-[#470d20]/20"
            >
              <option value="all">All categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 border border-[#470d20]/20 px-5 py-4 font-mono text-[10px] tracking-wider text-[#470d20] transition-colors hover:border-[#470d20] hover:bg-[#470d20] hover:text-[#f1e8d8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#470d20] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              REFRESH
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {(
              [
                ["all", "All products"],
                ["published", "Published"],
                ["drafts", "Drafts"],
                ["out-of-stock", "Out of stock"],
              ] as [FilterType, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                aria-pressed={statusFilter === value}
                className={`border px-4 py-2.5 font-mono text-[9px] tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#470d20] ${
                  statusFilter === value
                    ? "border-[#470d20] bg-[#470d20] text-[#f1e8d8]"
                    : "border-[#470d20]/20 text-[#470d20] hover:border-[#470d20] hover:bg-[#470d20]/5"
                }`}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="mt-8 border border-[#470d20]/10 bg-white/60">
            <div className="flex items-center justify-between border-b border-[#470d20]/10 px-5 py-5 sm:px-7">
              <div>
                <h2 className="font-serif text-2xl">Your collection</h2>

                <p className="mt-1 text-xs text-[#350817]/65">
                  {loading
                    ? "Loading catalogue..."
                    : `${filteredProducts.length} ${
                        filteredProducts.length === 1 ? "product" : "products"
                      } found`}
                </p>
              </div>

              <Package size={20} className="text-[#806c59]" />
            </div>

            {loading ? (
              <div className="space-y-4 p-7">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse bg-[#e8dece]"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <Package
                  size={34}
                  strokeWidth={1.2}
                  className="mx-auto text-[#806c59]"
                />

                <h3 className="mt-5 font-serif text-3xl">
                  {products.length === 0
                    ? "Your collection begins here."
                    : "No products found."}
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#350817]/65">
                  {products.length === 0
                    ? "Add your first product to start building the AURELIS catalogue."
                    : "Try changing your search or filters."}
                </p>

                {products.length === 0 && (
                  <Link
                    href="/admin/products/new"
                    style={creamButtonStyle}
                    className="mt-7 inline-flex items-center gap-2 px-6 py-3.5 font-mono text-[10px] tracking-wider transition-colors hover:!bg-[#64152f] hover:!text-[#f1e8d8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#470d20]"
                  >
                    <Plus size={15} />
                    CREATE FIRST PRODUCT
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#470d20]/10">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="flex flex-col gap-5 px-5 py-5 transition-colors hover:bg-white/70 sm:flex-row sm:items-center sm:px-7"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden bg-[#e8dece]">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon
                            size={23}
                            strokeWidth={1.2}
                            className="text-[#806c59]"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-serif text-xl sm:text-2xl">
                          {product.name}
                        </h3>

                        <p className="mt-1 truncate font-mono text-[9px] tracking-wider text-[#806c59]">
                          {product.sku || product.slug}
                        </p>

                        <p className="mt-2 text-xs text-[#350817]/70">
                          {product.category_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-7 gap-y-3 sm:justify-end">
                      <div>
                        <p className="font-mono text-[9px] tracking-wider text-[#806c59]">
                          PRICE
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatPrice(Number(product.price_paisa) / 100)}
                        </p>
                      </div>

                      <div>
                        <p className="font-mono text-[9px] tracking-wider text-[#806c59]">
                          STOCK
                        </p>

                        <p
                          className={`mt-1 text-sm ${
                            product.stock_quantity <= 0
                              ? "text-red-700"
                              : product.stock_quantity <= 5
                                ? "text-amber-700"
                                : "text-[#350817]"
                          }`}
                        >
                          {product.stock_quantity}
                        </p>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[9px] tracking-wider ${
                            product.is_published
                              ? "border-emerald-800/20 bg-emerald-50 text-emerald-800"
                              : "border-[#806c59]/30 bg-[#e8dece] text-[#59432f]"
                          }`}
                        >
                          {product.is_published ? (
                            <Eye size={11} />
                          ) : (
                            <EyeOff size={11} />
                          )}

                          {product.is_published ? "PUBLISHED" : "DRAFT"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          aria-label={`Edit ${product.name}`}
                          title="Edit product"
                          style={actionButtonStyle}
                          onMouseEnter={handleActionMouseEnter}
                          onMouseLeave={handleActionMouseLeave}
                          className="inline-flex h-10 w-10 items-center justify-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#470d20]"
                        >
                          <Pencil size={15} />
                        </Link>

                        <button
                          onClick={() => togglePublished(product)}
                          disabled={updatingId === product.id}
                          aria-label={
                            product.is_published
                              ? `Unpublish ${product.name}`
                              : `Publish ${product.name}`
                          }
                          title={product.is_published ? "Unpublish" : "Publish"}
                          style={actionButtonStyle}
                          onMouseEnter={handleActionMouseEnter}
                          onMouseLeave={handleActionMouseLeave}
                          className="inline-flex h-10 w-10 items-center justify-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#470d20] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {product.is_published ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-16 border-t border-[#470d20]/10 pt-6">
          <p className="font-mono text-[9px] tracking-[0.15em] text-[#350817]/60">
            AURELIS ADMINISTRATION · PRODUCT CATALOGUE
          </p>
        </footer>
      </div>
    </main>
  );
}
