import { SellerCard } from "@/components/seller-card";
import { getMarketplaceData } from "@/data/marketplace-supabase";

export default async function SellersPage() {
  const { sellers } = await getMarketplaceData();

  return (
    <section className="section-block seller-dashboard-shell">
      <article className="panel product-catalog-panel">
        <div className="product-catalog-intro">
          <span className="badge">Artisan directory</span>
          <h1>Seller profiles</h1>
          <p>
            Meet the creators behind every product and discover the story of each
            studio.
          </p>
        </div>

        <div className="product-results-shell">
          <p className="product-results-count" aria-live="polite">
            {sellers.length} seller profile(s) found
          </p>

          <div className="seller-grid home-seller-grid seller-grid-spaced">
            {sellers.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
