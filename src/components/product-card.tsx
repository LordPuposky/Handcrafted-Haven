import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { Product } from "@/data/marketplace";
import { formatPrice, getStars } from "@/data/marketplace";
import { getAverageRatingFromDb, getSellerByIdFromDb } from "@/data/marketplace-supabase";

type ProductCardProps = {
  product: Product;
};

export async function ProductCard({ product }: ProductCardProps) {
  const [seller, average] = await Promise.all([
    getSellerByIdFromDb(product.sellerId),
    getAverageRatingFromDb(product.id),
  ]);

  return (
    <article className="card" aria-label={`Product ${product.title}`}>
      <div className="card-media" aria-hidden="true">
        <span>{product.imageEmoji}</span>
      </div>
      <div className="card-body">
        <span className="badge">{product.category}</span>
        <h3 className="card-title">{product.title}</h3>
        <p className="card-meta">by {seller?.name ?? "Seller"}</p>
        <div className="price-and-rating">
          <span className="price">{formatPrice(product.price)}</span>
          <span className="rating" aria-label={`Rating ${average} out of 5`}>
            <span className="stars" aria-hidden="true">
              {getStars(average || 4)}
            </span>{" "}
            {average || "New"}
          </span>
        </div>
        <Link className="btn-secondary" href={`/products/${product.id}`}>
          View details
        </Link>
        <AddToCartButton productId={product.id} className="btn-primary" />
      </div>
    </article>
  );
}
