import "server-only";

import type { Product, ProductReview, Seller } from "@/data/marketplace";
import {
  categories,
  getAverageRating,
  getFeaturedProducts,
  getProductById,
  getProductsBySellerId,
  getReviewsByProductId,
  getSellerById,
  products,
  reviews,
  sellers,
} from "@/data/marketplace";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type MarketplaceData = {
  sellers: Seller[];
  products: Product[];
  reviews: ProductReview[];
};

const localData: MarketplaceData = {
  sellers,
  products,
  reviews,
};

async function fetchTable<T>(table: "sellers" | "products" | "reviews") {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from(table).select("*");

  if (error) {
    throw error;
  }

  return (data ?? []) as T[];
}

export async function getMarketplaceData(): Promise<MarketplaceData> {
  if (!hasSupabasePublicEnv()) {
    return localData;
  }

  try {
    const [remoteSellers, remoteProducts, remoteReviews] = await Promise.all([
      fetchTable<Seller>("sellers"),
      fetchTable<Product>("products"),
      fetchTable<ProductReview>("reviews"),
    ]);

    return {
      sellers: remoteSellers,
      products: remoteProducts,
      reviews: remoteReviews,
    };
  } catch {
    // Keep the app functional while Supabase schema/keys are still being configured.
    return localData;
  }
}

export async function getSellerByIdFromDb(id: string) {
  const data = await getMarketplaceData();
  return data.sellers.find((seller) => seller.id === id) ?? getSellerById(id);
}

export async function getProductByIdFromDb(id: string) {
  const data = await getMarketplaceData();
  return data.products.find((product) => product.id === id) ?? getProductById(id);
}

export async function getProductsBySellerIdFromDb(sellerId: string) {
  const data = await getMarketplaceData();
  const filtered = data.products.filter((product) => product.sellerId === sellerId);
  return filtered.length ? filtered : getProductsBySellerId(sellerId);
}

export async function getReviewsByProductIdFromDb(productId: string) {
  const data = await getMarketplaceData();
  const filtered = data.reviews.filter((review) => review.productId === productId);
  return filtered.length ? filtered : getReviewsByProductId(productId);
}

export async function getFeaturedProductsFromDb() {
  const data = await getMarketplaceData();
  const featured = data.products.filter((product) => product.featured).slice(0, 4);
  return featured.length ? featured : getFeaturedProducts();
}

export async function getAverageRatingFromDb(productId: string) {
  const itemReviews = await getReviewsByProductIdFromDb(productId);

  if (itemReviews.length === 0) {
    return getAverageRating(productId);
  }

  const total = itemReviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / itemReviews.length).toFixed(1));
}

export const categoriesFromDb = categories;