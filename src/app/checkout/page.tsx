import { CheckoutPageClient } from "@/components/checkout-page-client";
import { getMarketplaceData } from "@/data/marketplace-supabase";
import { requireBuyer } from "@/lib/auth/authorization";

export default async function CheckoutPage() {
  const { user } = await requireBuyer("/checkout");

  const initialName =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "";
  const { products } = await getMarketplaceData();

  return (
    <CheckoutPageClient
      initialName={initialName}
      initialEmail={user.email ?? ""}
      products={products}
    />
  );
}
