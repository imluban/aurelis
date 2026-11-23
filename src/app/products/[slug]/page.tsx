import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product-detail";
import { getProductBySlug } from "@/lib/products";

export const metadata: Metadata = {
  title: "Discover a Product",
  description: "Explore considered finds from the AURELIS collection.",
};

function ProductLoading() {
  return (
    <main className="min-h-screen bg-[#f8f4ed] px-5 py-12 sm:px-8 lg:px-16">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-2">
        <div className="aspect-[4/5] animate-pulse bg-[#e8dece]" />
        <div className="space-y-6 py-8">
          <div className="h-3 w-32 animate-pulse bg-[#e8dece]" />
          <div className="h-20 w-3/4 animate-pulse bg-[#e8dece]" />
          <div className="h-6 w-28 animate-pulse bg-[#e8dece]" />
          <div className="mt-12 h-24 w-full animate-pulse bg-[#e8dece]" />
          <div className="h-14 w-full animate-pulse bg-[#e8dece]" />
        </div>
      </div>
    </main>
  );
}

async function ProductContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<ProductLoading />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
