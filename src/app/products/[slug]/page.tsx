import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product-detail";
import { getStorefrontCatalogue } from "@/lib/catalogue";

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
  const catalogue = await getStorefrontCatalogue();

  if (catalogue.error) {
    throw new Error(catalogue.error);
  }

  const product = catalogue.products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = catalogue.products
    .filter((item) => item.id !== product.id)
    .sort((a, b) => {
      const aSameCategory = a.category === product.category ? 1 : 0;
      const bSameCategory = b.category === product.category ? 1 : 0;

      return bSameCategory - aSameCategory;
    })
    .slice(0, 3);

  return <ProductDetail product={product} relatedProducts={relatedProducts} />;
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
