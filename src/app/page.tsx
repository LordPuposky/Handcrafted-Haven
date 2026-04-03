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
      <section className="hero">
        <p className="hero-kicker">crafted with heart</p>
        <h1>Discover handcrafted treasures at Handcrafted Haven.</h1>
        <p>
          We connect passionate makers with conscious shoppers. Explore unique
          pieces, learn each artisan story, and shop with confidence.
        </p>
        <div className="hero-actions">
          <Link className="btn-primary" href="/products">
            Explore products
          </Link>
          <Link className="btn-secondary" href="/sellers">
            Meet artisans
          </Link>
        </div>
      </section>

      <section className="section-block">
        <div className="section-title-row">
          <h2>Weekly highlights</h2>
          <Link href="/products">View full catalog</Link>
        </div>
        <div className="product-grid" aria-label="Featured products">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-title-row">
          <h2>Featured artisans</h2>
          <Link href="/sellers">View all profiles</Link>
        </div>
        <div className="seller-grid">
          {highlightedSellers.map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      </section>
    </>
  );
}
