import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

type ProductRow = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  price_paisa: number;
  compare_at_price_paisa: number | null;
  stock_quantity: number;
  weight_grams: number | null;
  product_type: "physical" | "digital";
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
};

export type StorefrontCatalogue = {
  categories: StorefrontCategory[];
  products: Product[];
  error: string | null;
};

function mapProduct(row: ProductRow, categoryName: string): Product {
  return {
    id: row.id,
    name: row.name,
    category: categoryName,
    price: Number(row.price_paisa) / 100,
    oldPrice:
      row.compare_at_price_paisa === null
        ? null
        : Number(row.compare_at_price_paisa) / 100,
    badge: row.is_featured ? "FEATURED" : null,
    availability: row.stock_quantity > 0 ? "Available" : "Sold out",
    image: row.image_url ?? "",
    slug: row.slug,
    date: new Date(row.created_at).getTime(),
    description:
      row.description ||
      row.short_description ||
      "Discover this considered AURELIS selection.",
    details: [],
  };
}

export async function getStorefrontCatalogue(): Promise<StorefrontCatalogue> {
  const supabase = await createClient();

  const [categoryResult, productResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, description, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

    supabase
      .from("products")
      .select(
        "id, category_id, name, slug, sku, short_description, description, price_paisa, compare_at_price_paisa, stock_quantity, weight_grams, product_type, image_url, is_featured, created_at",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
  ]);

  if (categoryResult.error) {
    console.error(
      "AURELIS category query failed:",
      categoryResult.error.message,
    );

    return {
      categories: [],
      products: [],
      error: "We couldn't load the collection categories.",
    };
  }

  if (productResult.error) {
    console.error("AURELIS product query failed:", productResult.error.message);

    return {
      categories: [],
      products: [],
      error: "We couldn't load the product collection.",
    };
  }

  const categoryRows = (categoryResult.data ?? []) as CategoryRow[];
  const productRows = (productResult.data ?? []) as ProductRow[];

  const categoryMap = new Map(
    categoryRows.map((category) => [category.id, category.name]),
  );

  const categories: StorefrontCategory[] = categoryRows.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    sortOrder: category.sort_order,
  }));

  const products = productRows.map((product) =>
    mapProduct(
      product,
      product.category_id
        ? (categoryMap.get(product.category_id) ?? "Uncategorised")
        : "Uncategorised",
    ),
  );

  return {
    categories,
    products,
    error: null,
  };
}

export async function getStorefrontProductBySlug(
  slug: string,
): Promise<Product | null> {
  const catalogue = await getStorefrontCatalogue();

  if (catalogue.error) {
    throw new Error(catalogue.error);
  }

  return catalogue.products.find((product) => product.slug === slug) ?? null;
}

export async function getRelatedStorefrontProducts(
  product: Product,
  limit = 3,
): Promise<Product[]> {
  const catalogue = await getStorefrontCatalogue();

  if (catalogue.error) {
    return [];
  }

  return catalogue.products
    .filter((item) => item.id !== product.id)
    .sort((a, b) => {
      const aSameCategory = a.category === product.category ? 1 : 0;
      const bSameCategory = b.category === product.category ? 1 : 0;

      return bSameCategory - aSameCategory;
    })
    .slice(0, limit);
}
