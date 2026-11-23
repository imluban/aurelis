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

export const categories = [
  "All products",
  "Fashion & Accessories",
  "Electronics & Gadgets",
  "Home & Living",
  "Beauty & Personal Care",
  "Lifestyle & Everyday Essentials",
];

export const products: Product[] = [
  {
    id: "aur-001",
    name: "The Everyday Carry",
    category: "Fashion & Accessories",
    price: 2450,
    oldPrice: null,
    badge: "CURATED PICK",
    availability: "Available",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
    slug: "the-everyday-carry",
    date: 6,
    description:
      "A considered everyday companion, designed to bring effortless character to your daily essentials. A timeless silhouette meets practical everyday function.",
    details: [
      "Versatile everyday design",
      "Thoughtful storage space",
      "Designed for everyday use",
      "AURELIS curated selection",
    ],
  },
  {
    id: "aur-002",
    name: "Studio Headphones",
    category: "Electronics & Gadgets",
    price: 3850,
    oldPrice: 4250,
    badge: "SPECIAL EDIT",
    availability: "Available",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
    slug: "studio-headphones",
    date: 5,
    description:
      "Make room for the sound you love. A clean, modern audio essential selected for its expressive design and everyday versatility.",
    details: [
      "Over-ear headphone design",
      "Comfort-focused ear cushions",
      "Modern minimalist finish",
      "AURELIS curated selection",
    ],
  },
  {
    id: "aur-003",
    name: "The Quiet Corner",
    category: "Home & Living",
    price: 1850,
    oldPrice: null,
    badge: null,
    availability: "Available",
    image:
      "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1200&q=85",
    slug: "the-quiet-corner",
    date: 4,
    description:
      "Bring a little more calm into your surroundings. This home edit celebrates considered details and the beauty of a thoughtfully arranged space.",
    details: [
      "Designed for considered interiors",
      "Minimal, versatile aesthetic",
      "A thoughtful home accent",
      "AURELIS curated selection",
    ],
  },
  {
    id: "aur-004",
    name: "Daily Ritual Set",
    category: "Beauty & Personal Care",
    price: 1650,
    oldPrice: null,
    badge: "NEW ARRIVAL",
    availability: "Available",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=85",
    slug: "daily-ritual-set",
    date: 3,
    description:
      "Make everyday care feel a little more intentional. A curated beauty selection for the small rituals that make a difference.",
    details: [
      "Everyday personal-care edit",
      "A considered gifting option",
      "Simple, elegant presentation",
      "AURELIS curated selection",
    ],
  },
  {
    id: "aur-005",
    name: "Modern Form Watch",
    category: "Lifestyle & Everyday Essentials",
    price: 2950,
    oldPrice: null,
    badge: null,
    availability: "Available",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    slug: "modern-form-watch",
    date: 2,
    description:
      "A refined everyday accessory with a clean silhouette. Designed to complement personal style without asking for attention.",
    details: [
      "Minimal everyday styling",
      "Classic watch silhouette",
      "Versatile accessory",
      "AURELIS curated selection",
    ],
  },
  {
    id: "aur-006",
    name: "Essential Leather Tote",
    category: "Fashion & Accessories",
    price: 3200,
    oldPrice: null,
    badge: "EDITOR'S PICK",
    availability: "Available",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85",
    slug: "essential-leather-tote",
    date: 1,
    description:
      "An understated carry-all for days that ask for a little more. Its versatile shape makes it an easy addition to an everyday wardrobe.",
    details: [
      "Classic tote silhouette",
      "Everyday carry design",
      "Versatile styling",
      "AURELIS curated selection",
    ],
  },
  {
    id: "aur-007",
    name: "Sound in Balance",
    category: "Electronics & Gadgets",
    price: 2150,
    oldPrice: null,
    badge: null,
    availability: "Available",
    image:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85",
    slug: "sound-in-balance",
    date: 0,
    description:
      "A compact audio essential with a simple, purposeful design. A considered choice for bringing your favourite sounds into everyday life.",
    details: [
      "Compact audio design",
      "Everyday listening essential",
      "Minimal aesthetic",
      "AURELIS curated selection",
    ],
  },
  {
    id: "aur-008",
    name: "A Softer Space",
    category: "Home & Living",
    price: 2750,
    oldPrice: null,
    badge: null,
    availability: "Available",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85",
    slug: "a-softer-space",
    date: -1,
    description:
      "Create a space that feels like your own. This home-inspired selection brings together soft visual details and a calm, considered aesthetic.",
    details: [
      "Home and interior inspiration",
      "Soft, versatile aesthetic",
      "Designed for everyday spaces",
      "AURELIS curated selection",
    ],
  },
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
