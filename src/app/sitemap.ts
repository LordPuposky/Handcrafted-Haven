import type { MetadataRoute } from "next";
import { getMarketplaceData } from "@/data/marketplace-supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://handcrafted-haven.example";
  const { products, sellers } = await getMarketplaceData();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/sellers",
    "/about",
    "/cart",
    "/profile",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const sellerRoutes: MetadataRoute.Sitemap = sellers.map((seller) => ({
    url: `${baseUrl}/sellers/${seller.id}`,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  return [...staticRoutes, ...productRoutes, ...sellerRoutes];
}
