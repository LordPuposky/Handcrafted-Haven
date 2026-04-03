import "server-only";

import { cache } from "react";
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
  const supabase = await getSupabaseServerClient();
  const baseQuery = supabase.from(table).select("*");
  const query =
    table === "products"
      ? baseQuery.order("featured", { ascending: false }).order("id", { ascending: true })
      : baseQuery.order("id", { ascending: true });
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as T[];
}

function normalizeProduct(product: Product & { price: number | string }): Product {
  return {
    ...product,
    price: Number(product.price),
  };
}

function normalizeReview(review: ProductReview & { rating: number | string }): ProductReview {
  return {
    ...review,
    rating: Number(review.rating),
  };
}

function normalizeMergeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function mergeByKey<T>(remote: T[], fallback: T[], getKey: (item: T) => string) {
  const merged = new Map(fallback.map((item) => [normalizeMergeKey(getKey(item)), item]));

  for (const item of remote) {
    merged.set(normalizeMergeKey(getKey(item)), item);
  }

  return Array.from(merged.values());
}

export const getMarketplaceData = cache(async (): Promise<MarketplaceData> => {
  if (!hasSupabasePublicEnv()) {
    return localData;
  }

  const [sellersResult, productsResult, reviewsResult] = await Promise.allSettled([
    fetchTable<Seller>("sellers"),
    fetchTable<Product & { price: number | string }>("products"),
    fetchTable<ProductReview & { rating: number | string }>("reviews"),
  ]);

  const remoteSellers = sellersResult.status === "fulfilled" ? sellersResult.value : [];
  const remoteProducts = productsResult.status === "fulfilled" ? productsResult.value : [];
  const remoteReviews = reviewsResult.status === "fulfilled" ? reviewsResult.value : [];

  return {
    sellers:
      remoteSellers.length > 0
        ? mergeByKey(remoteSellers, localData.sellers, (seller) => `${seller.name}::${seller.location}`)
        : localData.sellers,
    products:
      remoteProducts.length > 0
        ? mergeByKey(
            remoteProducts.map(normalizeProduct),
            localData.products,
            (product) => `${product.title}::${product.category}::${product.description}`
          )
        : localData.products,
    reviews:
      remoteReviews.length > 0
        ? mergeByKey(
            remoteReviews.map(normalizeReview),
            localData.reviews,
            (review) => `${review.author}::${review.rating}::${review.comment}`
          )
        : localData.reviews,
  };
});

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