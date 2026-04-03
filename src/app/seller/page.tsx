import type { Metadata } from "next";
import Link from "next/link";
import { SellerProductManagerCard } from "@/components/seller-product-manager-card";
import { formatPrice } from "@/data/marketplace";
import { getProductsBySellerIdFromDb } from "@/data/marketplace-supabase";
import { requireSeller } from "@/lib/auth/authorization";

export const metadata: Metadata = {
  title: "Seller area",
  description: "Private workspace for sellers to manage their storefront and products.",
};

type SellerDashboardPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const statusMessages: Record<string, { tone: "success" | "error"; text: string }> = {
  deleted: {
    tone: "success",
    text: "Product removed from your storefront successfully.",
  },
  updated: {
    tone: "success",
    text: "Product details updated successfully.",
  },
  "profile-updated": {
    tone: "success",
    text: "Your public seller profile is now live with the latest updates.",
  },
  "delete-error": {
    tone: "error",
    text: "The product could not be removed. Please try again.",
  },
  "edit-error": {
    tone: "error",
    text: "The product could not be updated. Please review the fields and try again.",
  },
  unauthorized: {
    tone: "error",
    text: "You do not have permission to manage that product.",
  },
  invalid: {
    tone: "error",
    text: "Choose a valid product before trying to manage it.",
  },
};

export default async function SellerDashboardPage({ searchParams }: SellerDashboardPageProps) {
  const params = await searchParams;
  const { user, client, seller } = await requireSeller("/seller");
  const sellerId = seller?.id ?? user.id;
  const sellerName = seller?.name ?? client?.name ?? user.user_metadata?.full_name ?? "Seller";
  const sellerProducts = await getProductsBySellerIdFromDb(sellerId);
  const featuredCount = sellerProducts.filter((product) => product.featured).length;
  const averagePrice =
    sellerProducts.length > 0
      ? sellerProducts.reduce((sum, product) => sum + product.price, 0) / sellerProducts.length
      : 0;
  const statusMessage = params.status ? statusMessages[params.status] : null;

  return (
    <section className="section-block seller-dashboard-shell">
      <div className="seller-dashboard-header">
        <div className="seller-dashboard-intro">
          <span className="badge">Seller workspace</span>
          <h1>Manage your storefront</h1>
          <p>
            Welcome back, <strong>{sellerName}</strong>. Review your catalog, publish new items,
            and keep your artisan shop up to date.
          </p>
        </div>

        <div className="seller-dashboard-actions">
          <Link className="btn-primary" href="/seller/products/new">
            Add new product
          </Link>
          <Link className="btn-secondary" href="/seller/profile">
            Edit public profile
          </Link>
          <Link className="btn-secondary" href={`/sellers/${sellerId}`}>
            View public profile
          </Link>
        </div>
      </div>

      {statusMessage ? (
        statusMessage.tone === "error" ? (
          <div className="seller-feedback seller-feedback--error" role="alert">
            {statusMessage.text}
          </div>
        ) : (
          <div className="seller-feedback seller-feedback--success" role="status">
            {statusMessage.text}
          </div>
        )
      ) : null}

      <div className="seller-dashboard-stats" aria-label="Seller storefront stats">
        <article className="panel seller-stat-card">
          <span className="seller-stat-label">Published products</span>
          <strong className="seller-stat-value">{sellerProducts.length}</strong>
        </article>

        <article className="panel seller-stat-card">
          <span className="seller-stat-label">Featured items</span>
          <strong className="seller-stat-value">{featuredCount}</strong>
        </article>

        <article className="panel seller-stat-card">
          <span className="seller-stat-label">Average price</span>
          <strong className="seller-stat-value">
            {sellerProducts.length > 0 ? formatPrice(averagePrice) : "—"}
          </strong>
        </article>
      </div>

      <section className="section-block">
        <div className="section-title-row">
          <h2>Your published products</h2>
          <Link href="/seller/products/new">Add another product</Link>
        </div>

        {sellerProducts.length === 0 ? (
          <article className="panel seller-dashboard-empty">
            <h3>Your storefront is still empty</h3>
            <p>
              Publish your first handmade item to start appearing in the public catalog and seller
              directory.
            </p>
            <div>
              <Link className="btn-primary" href="/seller/products/new">
                Publish first product
              </Link>
            </div>
          </article>
        ) : (
          <div className="seller-manage-grid">
            {sellerProducts.map((product) => (
              <SellerProductManagerCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
