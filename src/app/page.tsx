import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SellerCard } from "@/components/seller-card";
import { getFeaturedProductsFromDb, getMarketplaceData } from "@/data/marketplace-supabase";

export default async function Home() {
  const [featuredProducts, { sellers }] = await Promise.all([
    getFeaturedProductsFromDb(),
    getMarketplaceData(),
  ]);
  const highlightedSellers = sellers.slice(0, 3);

  return (
    <>
      <section className="section-block seller-dashboard-shell">
        <div className="hero home-hero-panel">
          <div className="seller-dashboard-header home-hero-header">
            <div className="seller-dashboard-intro home-hero-intro">
              <p className="hero-kicker">crafted with heart</p>
              <h1>Discover handcrafted treasures at Handcrafted Haven.</h1>
              <p>
                We connect passionate makers with conscious shoppers. Explore unique
                pieces, learn each artisan story, and shop with confidence.
              </p>
            </div>
            <div className="seller-dashboard-actions home-hero-actions">
              <Link className="btn-primary" href="/products">
                Explore products
              </Link>
              <Link className="btn-secondary" href="/sellers">
                Meet artisans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block seller-dashboard-shell">
        <article className="panel home-showcase-panel">
          <div className="section-title-row">
            <div className="home-section-copy">
              <span className="badge">Curated picks</span>
              <h2>Weekly highlights</h2>
              <p>
                A polished selection of artisan-made pieces chosen for warmth, texture, and charm.
              </p>
            </div>
            <Link href="/products">View full catalog</Link>
          </div>
          <div className="product-grid home-product-grid" aria-label="Featured products">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </article>
      </section>

      <section className="section-block seller-dashboard-shell">
        <article className="panel home-showcase-panel">
          <div className="section-title-row">
            <div className="home-section-copy">
              <span className="badge">Maker spotlight</span>
              <h2>Featured artisans</h2>
              <p>
                Meet a few of the independent studios behind this week&apos;s standout finds.
              </p>
            </div>
            <Link href="/sellers">View all profiles</Link>
          </div>
          <div className="seller-grid home-seller-grid">
            {highlightedSellers.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
