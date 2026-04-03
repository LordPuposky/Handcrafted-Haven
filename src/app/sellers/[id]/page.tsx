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
    <section className="section-block">
      <p className="badge">{seller.specialty}</p>
      <h1 style={{ marginTop: "0.5rem" }}>
        {seller.avatarEmoji} {seller.name}
      </h1>
      <p>{seller.location}</p>

      <article className="panel" style={{ marginTop: "1rem" }}>
        <h2>Studio story</h2>
        <p style={{ marginTop: "0.6rem" }}>{seller.story}</p>
      </article>

      <section className="section-block">
        <h2>Selected collection</h2>
        <div className="product-grid" style={{ marginTop: "0.9rem" }}>
          {sellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </section>
  );
}
