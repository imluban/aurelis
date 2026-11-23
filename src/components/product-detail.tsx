"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { products, formatPrice, type Product } from "@/lib/products";

export default function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState("");
  const { addItem } = useCart();

  const relatedProducts = products
    .filter(
      (item) => item.id !== product.id && item.category === product.category,
    )
    .concat(
      products.filter(
        (item) => item.id !== product.id && item.category !== product.category,
      ),
    )
    .slice(0, 3);

  function addToBag() {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      quantity,
    );

    setAdded(true);
    setMessage(
      `${quantity} ${quantity === 1 ? "item" : "items"} added to your bag.`,
    );

    window.setTimeout(() => {
      setAdded(false);
      setMessage("");
    }, 3000);
  }

  return (
    <main className="min-h-screen bg-[#f8f4ed] text-[#470d20]">
      {/* BREADCRUMB */}
      <div className="mx-auto max-w-[1440px] px-5 pt-7 sm:px-8 lg:px-16">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] tracking-[0.13em] text-[#8b6d66]">
          <Link href="/" className="hover:text-[#470d20]">
            HOME
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#470d20]">
            SHOP
          </Link>
          <span>/</span>
          <span className="text-[#470d20]">{product.name.toUpperCase()}</span>
        </div>
      </div>

      {/* PRODUCT */}
      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-9 sm:px-8 sm:py-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20 lg:px-16 lg:py-16">
        {/* IMAGE */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#e8dece]">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              fetchPriority="high"
            />

            {product.badge && (
              <span className="absolute top-5 left-5 bg-[#f1e8d8] px-3 py-2 font-mono text-[8px] tracking-[0.14em] text-[#470d20]">
                {product.badge}
              </span>
            )}

            <span className="absolute right-5 bottom-5 bg-[#350817] px-4 py-3 font-mono text-[8px] tracking-[0.15em] text-[#f1e8d8]">
              AURELIS SELECTION
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-b border-[#470d20]/15 pb-4">
            <p className="font-mono text-[8px] tracking-[0.14em] text-[#8b6d66]">
              CONSIDERED. CURATED. YOURS.
            </p>
            <p className="font-mono text-[8px] tracking-[0.12em] text-[#8b6d66]">
              PRODUCT / {product.id.toUpperCase()}
            </p>
          </div>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="flex flex-col lg:pt-8">
          <Link
            href="/shop"
            className="mb-10 inline-flex w-fit items-center gap-2 font-mono text-[9px] tracking-[0.13em] text-[#8b6d66] transition-colors hover:text-[#470d20]"
          >
            <ArrowLeft size={13} />
            BACK TO COLLECTION
          </Link>

          <p className="font-mono text-[9px] tracking-[0.19em] text-[#8b6d66]">
            {product.category.toUpperCase()}
          </p>

          <h1 className="mt-5 max-w-[650px] font-serif text-5xl leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">
            {product.name}
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="text-xl font-semibold">
              {formatPrice(product.price)}
            </span>

            {product.oldPrice && (
              <>
                <span className="text-base text-[#9a8980] line-through">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="bg-[#470d20] px-2.5 py-1.5 font-mono text-[8px] tracking-[0.1em] text-[#f1e8d8]">
                  SPECIAL PRICE
                </span>
              </>
            )}
          </div>

          <div className="mt-8 h-px w-full bg-[#470d20]/15" />

          <p className="mt-8 max-w-[520px] text-sm leading-8 text-[#76645d]">
            {product.description}
          </p>

          {/* AVAILABILITY */}
          <div className="mt-8 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#71866b]" />
            <span className="font-mono text-[9px] tracking-[0.13em] text-[#76645d]">
              {product.availability.toUpperCase()}
            </span>
          </div>

          {/* QUANTITY */}
          <div className="mt-10">
            <p className="mb-4 font-mono text-[9px] tracking-[0.15em] text-[#8b6d66]">
              QUANTITY
            </p>

            <div className="flex h-12 w-fit items-center border border-[#470d20]/25">
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-full w-12 items-center justify-center transition-colors hover:bg-[#470d20] hover:text-[#f1e8d8] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Minus size={14} />
              </button>

              <span className="w-10 text-center text-sm tabular-nums">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.min(10, current + 1))
                }
                disabled={quantity >= 10}
                aria-label="Increase quantity"
                className="flex h-full w-12 items-center justify-center transition-colors hover:bg-[#470d20] hover:text-[#f1e8d8] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Plus size={14} />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[#8b6d66]">
              Maximum 10 per addition
            </p>
          </div>

          {/* ADD TO BAG */}
          <button
            type="button"
            onClick={addToBag}
            className="mt-7 flex min-h-14 w-full items-center justify-center gap-3 bg-[#470d20] px-6 py-4 font-mono text-[10px] tracking-[0.16em] text-[#f1e8d8] uppercase transition-colors hover:bg-[#64152f]"
          >
            {added ? <Check size={17} /> : <ShoppingBag size={17} />}
            {added ? "ADDED TO YOUR BAG" : "ADD TO BAG"}
            <ArrowUpRight size={15} className="ml-auto" />
          </button>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className={`mt-3 text-xs ${
                added ? "text-[#52694d]" : "text-[#9b3434]"
              }`}
            >
              {message}
            </p>
          )}

          <div className="mt-8 border-y border-[#470d20]/15">
            <div className="flex items-center justify-between py-5">
              <span className="font-mono text-[9px] tracking-[0.13em] text-[#8b6d66]">
                PRODUCT REFERENCE
              </span>
              <span className="text-xs">{product.id.toUpperCase()}</span>
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="mt-9">
            <p className="font-mono text-[9px] tracking-[0.17em] text-[#8b6d66]">
              THE DETAILS
            </p>

            <ul className="mt-5 space-y-4">
              {product.details.map((detail) => (
                <li
                  key={detail}
                  className="flex items-start gap-3 text-sm text-[#76645d]"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#b9a58a]" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 bg-[#efe6d8] p-6 sm:p-7">
            <p className="font-mono text-[9px] tracking-[0.17em] text-[#8b6d66]">
              THE AURELIS PHILOSOPHY
            </p>
            <p className="mt-3 font-serif text-2xl leading-tight">
              Beyond Ordinary,
              <span className="block italic">Within Reach.</span>
            </p>
          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      <section className="bg-[#350817] px-5 py-16 text-[#f1e8d8] sm:px-8 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="font-mono text-[9px] tracking-[0.18em] text-[#d2bea5]">
                CONTINUE DISCOVERING
              </p>
              <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
                You may also like.
              </h2>
            </div>

            <Link
              href="/shop"
              className="hidden items-center gap-2 font-mono text-[9px] tracking-[0.12em] text-[#d2bea5] transition-colors hover:text-white sm:flex"
            >
              EXPLORE ALL <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            {relatedProducts.map((item) => (
              <Link
                href={`/products/${item.slug}`}
                key={item.id}
                className="group"
              >
                <div className="aspect-[4/5] overflow-hidden bg-[#470d20]">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <p className="mt-4 font-mono text-[7px] tracking-[0.12em] text-[#d2bea5] sm:text-[8px]">
                  {item.category.toUpperCase()}
                </p>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <h3 className="font-serif text-xl sm:text-2xl">
                    {item.name}
                  </h3>
                  <ArrowUpRight
                    size={15}
                    className="mt-1 shrink-0 text-[#d2bea5] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </div>
                <p className="mt-2 text-xs text-[#d2bea5]">
                  {formatPrice(item.price)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
