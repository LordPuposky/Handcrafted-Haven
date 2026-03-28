import { CartPageClient } from "@/components/cart-page-client";
import { products } from "@/data/marketplace";

export default function CartPage() {
  return <CartPageClient products={products} />;
}
