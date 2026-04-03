import { SellerCard } from "@/components/seller-card";
import { getMarketplaceData } from "@/data/marketplace-supabase";

export default async function SellersPage() {
  const { sellers } = await getMarketplaceData();
  return (
    <section className="section-block">
      <h1>Seller profiles</h1>
      <p>
        Meet the creators behind every product and discover the story of each
        studio.
      </p>
      <div className="seller-grid" style={{ marginTop: "1rem" }}>
        {sellers.map((seller) => (
          <SellerCard key={seller.id} seller={seller} />
        ))}
      </div>
    </section>
  );
}
