import { redirect } from "next/navigation";
import { CartPageClient } from "@/components/cart-page-client";
import { getMarketplaceData } from "@/data/marketplace-supabase";
import { getCurrentAuthContext } from "@/lib/auth/authorization";

export default async function CartPage() {
  const { role } = await getCurrentAuthContext();

  if (role === "seller") {
    redirect("/profile");
  }

  const { products } = await getMarketplaceData();

  return <CartPageClient products={products} />;
}
