export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  availability: string;
  image: string;
  slug: string;
  date: number;
  description: string;
  details: string[];
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(price);
}
