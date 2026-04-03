import type { Metadata } from "next";
import { SellerProductForm } from "@/components/seller-product-form";
import { requireSeller } from "@/lib/auth/authorization";

export const metadata: Metadata = {
  title: "Add product",
  description: "Seller-only workspace for publishing handcrafted products.",
};

export default async function NewSellerProductPage() {
  const { client } = await requireSeller("/seller/products/new");
  const sellerName = client?.name ?? "Seller";

  return (
    <section className="section-block seller-product-shell">
      <div className="section-title-row seller-product-header">
        <div>
          <h1>Add a new product</h1>
          <p>Publish your handmade piece with server-side validation and seller-only access.</p>
        </div>
        <span className="badge">Seller only</span>
      </div>

      <article className="panel seller-product-panel">
        <SellerProductForm sellerName={sellerName} />
      </article>
    </section>
  );
}
