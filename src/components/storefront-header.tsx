"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/products";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

const categories = [
  {
    number: "01",
    label: "Fashion & Accessories",
    href: "/categories/fashion-accessories",
    description: "Personal style, thoughtfully selected.",
  },
  {
    number: "02",
    label: "Electronics & Gadgets",
    href: "/categories/electronics-gadgets",
    description: "Technology for the way you live.",
  },
  {
    number: "03",
    label: "Home & Living",
    href: "/categories/home-living",
    description: "Make room for better living.",
  },
  {
    number: "04",
    label: "Beauty & Personal Care",
    href: "/categories/beauty-personal-care",
    description: "Everyday rituals, elevated.",
  },
  {
    number: "05",
    label: "Lifestyle & Everyday Essentials",
    href: "/categories/lifestyle-essentials",
    description: "The little things that matter.",
  },
];

export default function StorefrontHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);

  const { items, updateQuantity, removeItem } = useCart();

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  function closeAll() {
    setMenuOpen(false);
    setSearchOpen(false);
    setBagOpen(false);
  }

  function togglePanel(panel: "menu" | "search" | "bag") {
    setMenuOpen(panel === "menu" ? !menuOpen : false);
    setSearchOpen(panel === "search" ? !searchOpen : false);
    setBagOpen(panel === "bag" ? !bagOpen : false);
  }

  return (
    <>
      <header className="relative z-40 bg-[#f1e8d8] text-[#470d20]">
        {/* MAIN NAVIGATION */}
        <div className="mx-auto flex h-[78px] max-w-[1600px] items-center justify-between border-b border-[#470d20]/15 px-5 sm:px-8 lg:px-16">
          {/* DESKTOP LINKS */}
          <nav className="hidden h-full items-center gap-8 lg:flex">
            <button
              type="button"
              aria-expanded={menuOpen}
              onClick={() => togglePanel("menu")}
              className={`flex h-full items-center gap-2 text-[10px] tracking-[0.17em] uppercase transition-colors ${
                menuOpen ? "text-[#8b5c62]" : "hover:text-[#9b6b70]"
              }`}
            >
              Discover
              <ChevronDown
                size={13}
                className={`transition-transform duration-300 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <Link
              href="/collections"
              className="text-[10px] tracking-[0.17em] uppercase transition-colors hover:text-[#9b6b70]"
            >
              Collections
            </Link>

            <Link
              href="/about"
              className="text-[10px] tracking-[0.17em] uppercase transition-colors hover:text-[#9b6b70]"
            >
              Our Story
            </Link>
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => togglePanel("menu")}
            className="flex items-center gap-2 text-[#470d20] transition-colors hover:text-[#9b6b70] lg:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}

            <span className="hidden font-mono text-[9px] tracking-[0.15em] uppercase sm:inline">
              Menu
            </span>
          </button>

          {/* BRAND WORDMARK */}
          <Link
            href="/"
            onClick={closeAll}
            aria-label="AURELIS homepage"
            className="absolute left-1/2 -translate-x-1/2 text-center"
          >
            <span className="block font-serif text-[27px] font-medium tracking-[0.2em] text-[#470d20] sm:text-[31px]">
              AURELIS
            </span>

            <span className="mt-1 hidden font-mono text-[7px] tracking-[0.2em] text-[#80645b] sm:block">
              BEYOND ORDINARY, WITHIN REACH
            </span>
          </Link>

          {/* ACTION ICONS */}
          <div className="ml-auto flex items-center gap-5">
            <button
              type="button"
              aria-label="Open search"
              aria-expanded={searchOpen}
              onClick={() => togglePanel("search")}
              className="text-[#470d20] transition-colors hover:text-[#9b6b70]"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            <button
              type="button"
              aria-label={`Open shopping bag, ${itemCount} items`}
              aria-expanded={bagOpen}
              onClick={() => togglePanel("bag")}
              className="relative text-[#470d20] transition-colors hover:text-[#9b6b70]"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />

              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#470d20] px-1 text-[9px] text-[#f1e8d8]">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* DESKTOP MEGA MENU */}
        {menuOpen && (
          <div className="absolute top-full right-0 left-0 hidden border-t border-white/10 bg-[#470d20] text-[#f1e8d8] shadow-2xl lg:block">
            <div className="mx-auto grid max-w-[1600px] grid-cols-[1.4fr_0.8fr] gap-16 px-16 py-12">
              <div>
                <div className="mb-9 flex items-end justify-between gap-6">
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.2em] text-[#b9a58a]">
                      THE AURELIS DIRECTORY
                    </p>

                    <h2 className="mt-3 font-serif text-4xl text-[#f1e8d8]">
                      Explore our world.
                    </h2>
                  </div>

                  <Link
                    href="/shop"
                    onClick={closeAll}
                    className="mb-1 flex shrink-0 items-center gap-2 text-[9px] tracking-[0.15em] text-[#d2bea5] uppercase transition-colors hover:text-white"
                  >
                    View all products
                    <ArrowUpRight size={15} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-x-10">
                  {categories.map((category) => (
                    <Link
                      key={category.number}
                      href={category.href}
                      onClick={closeAll}
                      className="group flex items-start gap-4 border-t border-white/15 py-5"
                    >
                      <span className="pt-1 font-mono text-[9px] text-[#b9a58a]">
                        {category.number}
                      </span>

                      <div>
                        <h3 className="font-serif text-xl text-[#f1e8d8] transition-colors group-hover:text-[#d2bea5]">
                          {category.label}
                        </h3>

                        <p className="mt-1 text-xs text-[#d0bdb5]">
                          {category.description}
                        </p>
                      </div>

                      <ArrowUpRight
                        size={15}
                        className="ml-auto shrink-0 text-[#b9a58a] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </Link>
                  ))}
                </div>
              </div>

              {/* FEATURED EDITORIAL PANEL */}
              <div className="relative flex min-h-[330px] flex-col justify-end overflow-hidden bg-[#350817] p-8">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-55 transition-transform duration-700 hover:scale-105"
                  style={{
                    backgroundImage:
                      "linear-gradient(0deg,rgba(35,5,15,.95), rgba(71,13,32,.15) 85%), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85')",
                  }}
                />

                <div className="relative z-10">
                  <p className="font-mono text-[9px] tracking-[0.2em] text-[#d2bea5]">
                    THE AURELIS EXPERIENCE
                  </p>

                  <h3 className="mt-3 max-w-[300px] font-serif text-4xl leading-tight text-[#f1e8d8]">
                    Beyond Ordinary,
                    <span className="block italic text-[#d2bea5]">
                      Within Reach.
                    </span>
                  </h3>

                  <Link
                    href="/about"
                    onClick={closeAll}
                    className="mt-6 inline-flex items-center gap-3 border-b border-[#d2bea5]/60 pb-2 text-[9px] tracking-[0.15em] text-[#f1e8d8] uppercase transition-colors hover:text-white"
                  >
                    Discover our story
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="absolute top-full right-0 left-0 max-h-[calc(100vh-78px)] overflow-y-auto border-t border-white/10 bg-[#470d20] px-6 py-8 text-[#f1e8d8] shadow-2xl lg:hidden">
            <div className="mb-7">
              <p className="font-mono text-[9px] tracking-[0.2em] text-[#b9a58a]">
                THE AURELIS DIRECTORY
              </p>

              <h2 className="mt-3 font-serif text-3xl text-[#f1e8d8]">
                Explore our world.
              </h2>
            </div>

            <nav className="flex flex-col">
              {categories.map((category) => (
                <Link
                  key={category.number}
                  href={category.href}
                  onClick={closeAll}
                  className="group flex items-center justify-between border-t border-white/15 py-5"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[9px] text-[#b9a58a]">
                      {category.number}
                    </span>

                    <span className="font-serif text-xl text-[#f1e8d8] transition-colors group-hover:text-[#d2bea5]">
                      {category.label}
                    </span>
                  </div>

                  <ArrowUpRight size={17} className="text-[#b9a58a]" />
                </Link>
              ))}
            </nav>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                href="/collections"
                onClick={closeAll}
                className="border border-white/25 px-4 py-4 text-center text-[9px] tracking-[0.15em] text-[#f1e8d8] uppercase transition-colors hover:bg-[#f1e8d8] hover:text-[#470d20]"
              >
                Collections
              </Link>

              <Link
                href="/about"
                onClick={closeAll}
                className="border border-white/25 px-4 py-4 text-center text-[9px] tracking-[0.15em] text-[#f1e8d8] uppercase transition-colors hover:bg-[#f1e8d8] hover:text-[#470d20]"
              >
                Our Story
              </Link>
            </div>

            <p className="mt-8 font-mono text-[8px] tracking-[0.16em] text-[#b9a58a]">
              BEYOND ORDINARY, WITHIN REACH.
            </p>
          </div>
        )}

        {/* SEARCH PANEL */}
        {searchOpen && (
          <div className="absolute top-full right-0 left-0 border-t border-[#470d20]/15 bg-[#f1e8d8] text-[#470d20] shadow-2xl">
            <div className="mx-auto max-w-[1000px] px-6 py-9 sm:px-10 sm:py-12">
              <div className="mb-7 flex items-center justify-between gap-5">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.2em] text-[#80645b]">
                    AURELIS SEARCH
                  </p>

                  <h2 className="mt-2 font-serif text-3xl text-[#470d20] sm:text-4xl">
                    What are you looking for?
                  </h2>
                </div>

                <button
                  type="button"
                  aria-label="Close search"
                  onClick={() => setSearchOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#470d20]/20 text-[#470d20] transition-colors hover:bg-[#470d20] hover:text-[#f1e8d8]"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                action="/shop"
                method="GET"
                className="flex min-h-[62px] items-center gap-3 border-b-2 border-[#470d20] bg-white/35 px-4 transition-colors focus-within:border-[#64152f] focus-within:bg-white/60 sm:px-6"
              >
                <Search size={20} className="shrink-0 text-[#470d20]" />

                <input
                  type="text"
                  name="q"
                  autoFocus
                  placeholder="Search products, categories, collections..."
                  className="h-[60px] min-w-0 flex-1 border-0 bg-transparent text-sm text-[#470d20] outline-none ring-0 placeholder:text-[#80645b] focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none sm:text-base"
                />

                <button
                  type="submit"
                  className="flex shrink-0 items-center gap-2 bg-[#470d20] px-4 py-3 text-[9px] font-semibold tracking-[0.13em] text-[#f1e8d8] uppercase transition-colors hover:bg-[#64152f] sm:px-6"
                >
                  Search
                  <ArrowUpRight size={15} />
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="font-mono text-[8px] tracking-[0.15em] text-[#80645b]">
                  EXPLORE
                </span>

                {["Fashion", "Electronics", "Home", "Beauty"].map((term) => (
                  <Link
                    key={term}
                    href={`/shop?q=${encodeURIComponent(term)}`}
                    onClick={closeAll}
                    className="border border-[#470d20]/15 px-3 py-2 text-[10px] text-[#470d20] transition-colors hover:border-[#470d20] hover:bg-[#470d20] hover:text-[#f1e8d8]"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* SHOPPING BAG DRAWER */}
      {bagOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close shopping bag"
            onClick={() => setBagOpen(false)}
            className="absolute inset-0 cursor-default bg-black/60"
          />

          <aside className="absolute top-0 right-0 flex h-full w-full max-w-[460px] flex-col bg-[#f1e8d8] text-[#470d20] shadow-2xl">
            {/* DRAWER HEADER */}
            <div className="flex items-center justify-between border-b border-[#470d20]/15 px-7 py-7">
              <div>
                <p className="font-mono text-[9px] tracking-[0.18em] text-[#80645b]">
                  YOUR SELECTION
                </p>

                <h2 className="mt-2 font-serif text-3xl text-[#470d20]">
                  Shopping bag
                  <span className="ml-2 font-sans text-sm text-[#80645b]">
                    ({itemCount})
                  </span>
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close shopping bag"
                onClick={() => setBagOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#470d20]/20 text-[#470d20] transition-colors hover:bg-[#470d20] hover:text-[#f1e8d8]"
              >
                <X size={18} />
              </button>
            </div>

            {/* EMPTY BAG OR CART CONTENT */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-full border border-[#470d20]/20">
                  <ShoppingBag
                    size={27}
                    strokeWidth={1}
                    className="text-[#470d20]"
                  />
                </div>

                <p className="font-mono text-[9px] tracking-[0.2em] text-[#80645b]">
                  A FRESH START
                </p>

                <h3 className="mt-3 font-serif text-3xl text-[#470d20]">
                  Your bag is empty.
                </h3>

                <p className="mt-4 max-w-[270px] text-sm leading-7 text-[#62534d]">
                  There is something wonderful waiting to be discovered. Find
                  pieces that feel like they belong to you.
                </p>

                <Link
                  href="/shop"
                  onClick={closeAll}
                  style={{ color: "#f1e8d8" }}
                  className="mt-9 inline-flex min-h-[52px] items-center justify-center gap-4 bg-[#470d20] px-8 py-4 text-[10px] font-semibold tracking-[0.15em] uppercase transition-colors hover:bg-[#64152f]"
                >
                  Explore the Shop
                  <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <>
                {/* CART ITEMS */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 border-b border-[#470d20]/15 pb-6"
                      >
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeAll}
                          className="h-28 w-24 shrink-0 overflow-hidden bg-[#e8dece]"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={closeAll}
                              className="font-serif text-xl leading-tight hover:underline"
                            >
                              {item.name}
                            </Link>

                            <button
                              type="button"
                              aria-label={`Remove ${item.name} from bag`}
                              onClick={() => removeItem(item.id)}
                              className="shrink-0 text-[#80645b] transition-colors hover:text-red-800"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <p className="mt-2 text-sm font-semibold">
                            {formatPrice(item.price)}
                          </p>

                          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                            {/* QUANTITY CONTROLS */}
                            <div className="flex h-8 items-center border border-[#470d20]/25">
                              <button
                                type="button"
                                aria-label={`Decrease ${item.name} quantity`}
                                disabled={item.quantity <= 1}
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="flex h-full w-8 items-center justify-center transition-colors hover:bg-[#470d20] hover:text-[#f1e8d8] disabled:opacity-30"
                              >
                                <Minus size={12} />
                              </button>

                              <span className="w-7 text-center text-xs tabular-nums">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                aria-label={`Increase ${item.name} quantity`}
                                disabled={item.quantity >= 10}
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="flex h-full w-8 items-center justify-center transition-colors hover:bg-[#470d20] hover:text-[#f1e8d8] disabled:opacity-30"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <span className="text-xs font-semibold">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SUBTOTAL */}
                <div className="border-t border-[#470d20]/20 px-6 py-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.14em]">
                      SUBTOTAL
                    </span>

                    <span className="text-lg font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-[#80645b]">
                    Delivery charges are calculated at checkout.
                  </p>

                  <button
                    type="button"
                    disabled
                    className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 bg-[#470d20] px-6 py-4 font-mono text-[10px] tracking-[0.15em] text-[#f1e8d8] uppercase opacity-70"
                  >
                    Checkout — coming next
                    <ArrowRight size={15} />
                  </button>

                  <Link
                    href="/shop"
                    onClick={closeAll}
                    className="mt-4 block text-center font-mono text-[9px] tracking-[0.13em] text-[#80645b] underline underline-offset-4 transition-colors hover:text-[#470d20]"
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>
              </>
            )}

            {/* DRAWER FOOTER */}
            <div className="border-t border-[#470d20]/15 px-6 py-5">
              <p className="text-center font-mono text-[8px] tracking-[0.16em] text-[#80645b]">
                BEYOND ORDINARY, WITHIN REACH.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
