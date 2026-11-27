import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import ShopExperience from "@/components/shop-experience";
import { getStorefrontCatalogue } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Shop the Collection",
  description:
    "Explore fashion, electronics, home, beauty and lifestyle essentials at AURELIS.",
};

type ShopPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

function ShopLoading() {
  return (
    <main className="min-h-screen bg-[#f8f4ed]">
      <section className="bg-[#350817] px-6 py-24 text-[#f1e8d8]">
        <div className="mx-auto max-w-[1440px]">
          <p className="font-mono text-xs tracking-[0.2em] text-[#d2bea5]">
            THE AURELIS COLLECTION
          </p>
          <h1 className="mt-6 font-serif text-6xl">
            Find your <span className="italic">something.</span>
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="h-8 w-48 animate-pulse bg-[#e8dece]" />
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] animate-pulse bg-[#e8dece]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

async function ShopContent({ searchParams }: ShopPageProps) {
  await connection();

  const [params, catalogue] = await Promise.all([
    searchParams,
    getStorefrontCatalogue(),
  ]);

  const initialQuery = Array.isArray(params.q)
    ? (params.q[0] ?? "")
    : (params.q ?? "");

  return (
    <ShopExperience
      initialQuery={initialQuery}
      categories={catalogue.categories}
      products={catalogue.products}
      catalogueError={catalogue.error}
    />
  );
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent searchParams={searchParams} />
    </Suspense>
  );
}
