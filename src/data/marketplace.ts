export type Seller = {
  id: string;
  name: string;
  location: string;
  specialty: string;
  bio: string;
  story: string;
  avatarEmoji: string;
};

export type Product = {
  id: string;
  sellerId: string;
  title: string;
  category: "Decor" | "Accessories" | "Ceramics" | "Textile" | "Stationery";
  description: string;
  price: number;
  imageEmoji: string;
  featured?: boolean;
};

export type ProductReview = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
};

export const sellers: Seller[] = [
  {
    id: "s1",
    name: "Lia Ceramics",
    location: "Belo Horizonte, MG",
    specialty: "Artistic ceramics",
    bio: "Functional and decorative pieces shaped and fired in small batches.",
    story:
      "Lia turns local clay into collections inspired by organic forms. Every piece goes through hand shaping and glazes developed in her own studio.",
    avatarEmoji: "🏺",
  },
  {
    id: "s2",
    name: "Trama Viva Studio",
    location: "Florianopolis, SC",
    specialty: "Weaving and macrame",
    bio: "Natural home textures made with responsibly sourced fibers.",
    story:
      "At Trama Viva, Ana and Joana create textile pieces with recycled cotton and plant fibers. Their focus is to combine visual comfort with conscious production.",
    avatarEmoji: "🧶",
  },
  {
    id: "s3",
    name: "Dourado Workshop",
    location: "Salvador, BA",
    specialty: "Metal and leather accessories",
    bio: "Durable accessories with hand-finished details and original design.",
    story:
      "Dourado Workshop was born from the desire to craft everyday accessories with long-lasting materials and Brazilian identity.",
    avatarEmoji: "👜",
  },
  {
    id: "s4",
    name: "Paper and Bloom",
    location: "Curitiba, PR",
    specialty: "Handmade stationery",
    bio: "Notebooks, cards, and gifts made with hand-binding techniques.",
    story:
      "Using classic binding techniques, Paper and Bloom creates small collections for gifting and daily use, always with certified paper.",
    avatarEmoji: "📒",
  },
];

export const products: Product[] = [
  {
    id: "p1",
    sellerId: "s1",
    title: "Aurora Vase",
    category: "Ceramics",
    description: "Ceramic vase with matte glaze in earthy tones.",
    price: 189,
    imageEmoji: "🏺",
    featured: true,
  },
  {
    id: "p2",
    sellerId: "s2",
    title: "Serra Macrame Wall Panel",
    category: "Textile",
    description: "Wall macrame panel made with natural fibers.",
    price: 229,
    imageEmoji: "🧵",
    featured: true,
  },
  {
    id: "p3",
    sellerId: "s3",
    title: "Pathway Bag",
    category: "Accessories",
    description: "Plant-based leather bag with gold-tone hardware.",
    price: 319,
    imageEmoji: "👜",
    featured: true,
  },
  {
    id: "p4",
    sellerId: "s4",
    title: "Botanical Notebook",
    category: "Stationery",
    description: "Hand-stitched notebook with textured paper cover.",
    price: 89,
    imageEmoji: "📔",
  },
  {
    id: "p5",
    sellerId: "s1",
    title: "Sun Plate",
    category: "Ceramics",
    description: "Hand-painted decorative plate, ideal for table centerpieces.",
    price: 142,
    imageEmoji: "🍽️",
  },
  {
    id: "p6",
    sellerId: "s2",
    title: "Valley Throw",
    category: "Textile",
    description: "Light throw made of recycled cotton for sofa or bed.",
    price: 259,
    imageEmoji: "🧣",
  },
  {
    id: "p7",
    sellerId: "s3",
    title: "Breeze Bracelet",
    category: "Accessories",
    description: "Handcrafted bracelet with leather and brushed metal clasp.",
    price: 74,
    imageEmoji: "📿",
  },
  {
    id: "p8",
    sellerId: "s4",
    title: "Earth Card Set",
    category: "Stationery",
    description: "Set of handmade cards for thoughtful messages.",
    price: 52,
    imageEmoji: "💌",
  },
  {
    id: "p9",
    sellerId: "s2",
    title: "Nest Cushion",
    category: "Decor",
    description: "Embroidered cushion with hypoallergenic filling.",
    price: 136,
    imageEmoji: "🛋️",
  },
];

export const reviews: ProductReview[] = [
  {
    id: "r1",
    productId: "p1",
    author: "Carla M.",
    rating: 5,
    comment: "Impeccable finish and very careful packaging.",
  },
  {
    id: "r2",
    productId: "p1",
    author: "Rafael N.",
    rating: 4,
    comment: "Beautiful and exactly as shown in photos. Fast delivery.",
  },
  {
    id: "r3",
    productId: "p2",
    author: "Aline G.",
    rating: 5,
    comment: "It made my living room so cozy. I loved it.",
  },
  {
    id: "r4",
    productId: "p3",
    author: "Patricia L.",
    rating: 5,
    comment: "Excellent material, it feels like it will last for years.",
  },
  {
    id: "r5",
    productId: "p6",
    author: "Joao T.",
    rating: 4,
    comment: "Very comfortable and a beautiful color combination.",
  },
];

export const categories = ["All", "Decor", "Accessories", "Ceramics", "Textile", "Stationery"] as const;

export function getSellerById(id: string) {
  return sellers.find((seller) => seller.id === id);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getProductsBySellerId(sellerId: string) {
  return products.filter((product) => product.sellerId === sellerId);
}

export function getReviewsByProductId(productId: string) {
  return reviews.filter((review) => review.productId === productId);
}

export function getAverageRating(productId: string) {
  const selectedReviews = getReviewsByProductId(productId);

  if (selectedReviews.length === 0) {
    return 0;
  }

  const total = selectedReviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / selectedReviews.length).toFixed(1));
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured).slice(0, 4);
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getStars(rating: number) {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}
