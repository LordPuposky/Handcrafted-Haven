import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SellerProductForm } from "@/components/seller-product-form";
import { getProductByIdFromDb } from "@/data/marketplace-supabase";
import { requireSeller } from "@/lib/auth/authorization";

export const metadata: Metadata = {
  title: "Edit product",
  description: "Private seller workspace for updating an existing product listing.",
};

type EditSellerProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSellerProductPage({ params }: EditSellerProductPageProps) {
  const { id } = await params;
  const { user, seller } = await requireSeller(`/seller/products/${id}`);
  const product = await getProductByIdFromDb(id);
  const sellerId = seller?.id ?? user.id;

  if (!product || product.sellerId !== sellerId) {
    notFound();
  }

  return (
    <section className="section-block seller-product-shell">
      <div className="section-title-row seller-product-header">
        <div>
          <h1>Edit product</h1>
          <p>Update the details of your listing and keep your storefront information fresh.</p>
        </div>
        <span className="badge">Seller only</span>
      </div>

      <article className="panel seller-product-panel">
        <SellerProductForm mode="edit" product={product} />
      </article>
    </section>
  );
}
