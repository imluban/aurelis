"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { categories, products, formatPrice } from "@/lib/products";
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

type SortOption = "featured" | "newest" | "price-low" | "price-high";

export default function ShopExperience({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const [activeCategory, setActiveCategory] = useState("All products");
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortOption>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesCategory =
        activeCategory === "All products" ||
        product.category === activeCategory;

      const matchesSearch =
        !normalizedQuery ||
        `${product.name} ${product.category} ${product.badge ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });

    switch (sort) {
      case "newest":
        result.sort((a, b) => b.date - a.date);
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [activeCategory, query, sort]);

  function clearFilters() {
    setActiveCategory("All products");
    setQuery("");
    setSort("featured");
  }

  return (
    <main className="min-h-screen bg-[#f8f4ed] text-[#470d20]">
      {/* SHOP INTRODUCTION */}
      <section className="relative overflow-hidden bg-[#350817] px-5 py-16 text-[#f1e8d8] sm:px-8 sm:py-20 lg:px-16 lg:py-24">
        <div className="absolute -top-32 right-[-5%] h-[420px] w-[420px] rounded-full border border-[#d2bea5]/10" />
        <div className="absolute -top-20 right-[2%] h-[300px] w-[300px] rounded-full border border-[#d2bea5]/10" />

        <div className="relative mx-auto max-w-[1440px]">
          <div className="mb-8 flex items-center gap-3 font-mono text-[9px] tracking-[0.2em] text-[#d2bea5] uppercase">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="text-[#b9a58a]">/</span>
            <span className="text-[#f1e8d8]">Shop</span>
          </div>

          <p className="font-mono text-[10px] tracking-[0.22em] text-[#d2bea5]">
            THE AURELIS COLLECTION
          </p>

          <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-[850px] font-serif text-6xl leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-[100px]">
                Find your
                <span className="block italic text-[#d2bea5]">something.</span>
              </h1>
            </div>

            <p className="max-w-[360px] text-sm leading-7 text-[#e3d9cc]">
              Explore a considered collection of pieces for your style, your
              space, and everything in between.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/15 pt-6 font-mono text-[9px] tracking-[0.15em] text-[#d2bea5]">
            <span>FASHION</span>
            <span>ELECTRONICS</span>
            <span>HOME</span>
            <span>BEAUTY</span>
            <span>LIFESTYLE</span>
          </div>
        </div>
      </section>

      {/* PRODUCT CATALOGUE */}
      <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          {/* CATALOGUE HEADER */}
          <div className="flex flex-col justify-between gap-6 border-b border-[#470d20]/15 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em] text-[#8b6d66]">
                A WORLD OF POSSIBILITIES
              </p>
              <h2 className="mt-3 font-serif text-4xl tracking-[-0.035em] sm:text-5xl">
                Shop everything.
              </h2>
              <p className="mt-3 text-sm text-[#76645d]">
                Thoughtful finds, chosen with intention.
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.12em] text-[#76645d]">
              <span className="h-px w-8 bg-[#b9a58a]" />
              {filteredProducts.length} PRODUCTS
            </div>
          </div>

          {/* SEARCH AND SORT */}
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={(event) => event.preventDefault()}
              className="flex min-h-[50px] w-full items-center gap-3 border-b border-[#470d20]/35 md:max-w-[420px]"
            >
              <Search size={17} className="shrink-0 text-[#80645b]" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the collection..."
                aria-label="Search products"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#470d20] outline-none placeholder:text-[#9a8980]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="text-[#80645b] transition-colors hover:text-[#470d20]"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                aria-expanded={mobileFiltersOpen}
                className="inline-flex items-center gap-2 border border-[#470d20]/20 px-4 py-3 text-[9px] tracking-[0.12em] uppercase transition-colors hover:bg-[#470d20] hover:text-[#f1e8d8] lg:hidden"
              >
                <SlidersHorizontal size={14} />
                Categories
              </button>

              <label className="flex items-center gap-3">
                <ArrowDownUp
                  size={14}
                  className="hidden text-[#80645b] sm:block"
                />
                <span className="font-mono text-[9px] tracking-[0.12em] text-[#80645b]">
                  SORT BY
                </span>
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  aria-label="Sort products"
                  className="max-w-[180px] border-b border-[#470d20]/35 bg-transparent py-3 text-xs text-[#470d20] outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to high</option>
                  <option value="price-high">Price: High to low</option>
                </select>
              </label>
            </div>
          </div>

          {/* CATEGORY FILTERS AND PRODUCT GRID */}
          <div className="mt-9 grid gap-10 lg:grid-cols-[220px_1fr]">
            <aside
              className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block`}
            >
              <div className="sticky top-8">
                <div className="flex items-center justify-between border-b border-[#470d20]/15 pb-4">
                  <p className="font-mono text-[9px] tracking-[0.17em]">
                    CATEGORIES
                  </p>
                  <span className="font-mono text-[9px] text-[#8b6d66]">
                    05
                  </span>
                </div>

                <nav className="mt-3 flex flex-col">
                  {categories.map((category, index) => {
                    const active = activeCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setActiveCategory(category);
                          setMobileFiltersOpen(false);
                        }}
                        aria-pressed={active}
                        className={`group flex items-center justify-between border-b border-[#470d20]/10 py-4 text-left text-xs transition-colors ${
                          active
                            ? "font-semibold text-[#470d20]"
                            : "text-[#76645d] hover:text-[#470d20]"
                        }`}
                      >
                        <span>{category}</span>
                        <span
                          className={`font-mono text-[9px] ${
                            active ? "text-[#8b6d66]" : "text-[#b9a58a]"
                          }`}
                        >
                          {index === 0
                            ? String(products.length).padStart(2, "0")
                            : String(
                                products.filter(
                                  (product) => product.category === category,
                                ).length,
                              ).padStart(2, "0")}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                {(activeCategory !== "All products" || query) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-[#8b6d66] transition-colors hover:text-[#470d20]"
                  >
                    <X size={13} />
                    CLEAR FILTERS
                  </button>
                )}

                <div className="mt-12 border-t border-[#470d20]/15 pt-6">
                  <p className="font-mono text-[9px] tracking-[0.15em] text-[#8b6d66]">
                    THE AURELIS PROMISE
                  </p>
                  <p className="mt-3 font-serif text-2xl leading-tight">
                    Beyond ordinary.
                    <span className="block italic text-[#8b6d66]">
                      Within reach.
                    </span>
                  </p>
                </div>
              </div>
            </aside>

            <div>
              {/* ACTIVE FILTER SUMMARY */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[#76645d]">
                  Showing{" "}
                  <span className="font-semibold text-[#470d20]">
                    {filteredProducts.length}
                  </span>{" "}
                  {filteredProducts.length === 1 ? "piece" : "pieces"}
                  {activeCategory !== "All products" && (
                    <span> in {activeCategory}</span>
                  )}
                </p>

                {activeCategory !== "All products" && (
                  <button
                    type="button"
                    onClick={() => setActiveCategory("All products")}
                    className="inline-flex items-center gap-2 text-[10px] text-[#8b6d66] hover:text-[#470d20]"
                  >
                    Remove category <X size={12} />
                  </button>
                )}
              </div>

              {/* PRODUCT CARDS */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 sm:gap-y-12 xl:grid-cols-3">
                  {filteredProducts.map((product, index) => (
                    <article key={product.id} className="group">
                      <Link
                        href={`/products/${product.slug}`}
                        className="block"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#e8dece]">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading={index < 3 ? "eager" : "lazy"}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                          />

                          {product.badge && (
                            <span className="absolute top-3 left-3 bg-[#f1e8d8] px-2.5 py-2 font-mono text-[7px] tracking-[0.12em] text-[#470d20] sm:top-4 sm:left-4 sm:text-[8px]">
                              {product.badge}
                            </span>
                          )}

                          <span className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f1e8d8] text-[#470d20] transition-all duration-300 group-hover:rotate-45 sm:right-4 sm:bottom-4 sm:h-10 sm:w-10">
                            <ArrowUpRight size={16} />
                          </span>
                        </div>
                      </Link>

                      <div className="pt-4">
                        <p className="font-mono text-[7px] leading-5 tracking-[0.1em] text-[#8b6d66] sm:text-[8px] sm:tracking-[0.13em]">
                          {product.category.toUpperCase()}
                        </p>

                        <Link href={`/products/${product.slug}`}>
                          <h3 className="mt-1 font-serif text-xl leading-tight text-[#470d20] transition-colors group-hover:text-[#8b6d66] sm:text-2xl">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold text-[#470d20]">
                            formatPrice(product.price)
                          </span>

                          {product.oldPrice && (
                            <span className="text-xs text-[#9a8980] line-through">
                              formatPrice(product.oldPrice)
                            </span>
                          )}
                        </div>

                        <p className="mt-2 flex items-center gap-2 text-[9px] text-[#8b6d66]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#71866b]" />
                          {product.availability}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center border border-dashed border-[#470d20]/20 px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#470d20]/15">
                    <Search size={21} className="text-[#8b6d66]" />
                  </div>

                  <p className="mt-6 font-mono text-[9px] tracking-[0.18em] text-[#8b6d66]">
                    NOTHING FOUND
                  </p>

                  <h3 className="mt-3 font-serif text-3xl">
                    A different discovery awaits.
                  </h3>

                  <p className="mt-3 max-w-[340px] text-sm leading-6 text-[#76645d]">
                    We couldn&apos;t find anything matching your search. Try
                    another term or explore the full collection.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-7 inline-flex items-center gap-3 bg-[#470d20] px-6 py-4 text-[9px] tracking-[0.15em] text-[#f1e8d8] uppercase transition-colors hover:bg-[#64152f]"
                  >
                    Clear all filters <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING EDITORIAL STRIP */}
      <section className="bg-[#470d20] px-5 py-14 text-center text-[#f1e8d8] sm:px-8 sm:py-16">
        <p className="font-mono text-[9px] tracking-[0.2em] text-[#d2bea5]">
          AURELIS — BEYOND ORDINARY, WITHIN REACH.
        </p>
        <p className="mx-auto mt-4 max-w-[550px] font-serif text-3xl leading-tight sm:text-4xl">
          Good things are worth taking your time to discover.
        </p>
      </section>
    </main>
  );
}
