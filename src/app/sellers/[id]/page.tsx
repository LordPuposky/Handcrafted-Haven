import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getProductsBySellerIdFromDb, getSellerByIdFromDb } from "@/data/marketplace-supabase";

type SellerDetailsProps = {
  params: Promise<{ id: string }>;
};

export default async function SellerDetailsPage({ params }: SellerDetailsProps) {
  const { id } = await params;
  const seller = await getSellerByIdFromDb(id);

  if (!seller) {
    notFound();
  }

  const sellerProducts = await getProductsBySellerIdFromDb(seller.id);

  return (
    <section className="section-block seller-public-shell">
      <div className="panel seller-public-hero">
        <div className="seller-public-summary">
          <div className="seller-public-avatar" aria-hidden="true">
            <span>{seller.avatarEmoji}</span>
          </div>

          <div className="seller-public-copy">
            <p className="badge">{seller.specialty}</p>
            <h1 className="seller-detail-title">{seller.name}</h1>
            <p className="seller-public-location">{seller.location}</p>
            <p className="seller-public-bio">{seller.bio}</p>

            <div className="seller-public-stats" aria-label="Seller highlights">
              <span className="seller-public-stat">
                <strong>{sellerProducts.length}</strong>
                <span>products</span>
              </span>
              <span className="seller-public-stat">Handmade in small batches</span>
            </div>
          </div>
        </div>

        <article className="seller-public-story">
          <h2>Studio story</h2>
          <p className="seller-story-copy">{seller.story}</p>
        </article>
      </div>

      <section className="section-block seller-public-collection">
        <div className="section-title-row seller-public-collection-header">
          <div>
            <h2>Selected collection</h2>
            <p className="seller-public-collection-copy">
              Explore the handcrafted pieces currently available from this artisan.
            </p>
          </div>
        </div>

        <div className="product-grid seller-products-grid">
          {sellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} showAddToCart={false} />
          ))}
        </div>
      </section>
    </section>
  );
}
