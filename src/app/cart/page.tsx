import { CartPageClient } from "@/components/cart-page-client";
import { getMarketplaceData } from "@/data/marketplace-supabase";

export default async function CartPage() {
  const { products } = await getMarketplaceData();

  return <CartPageClient products={products} />;
}
