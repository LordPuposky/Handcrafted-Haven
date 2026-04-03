import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatPrice, getStars } from "@/data/marketplace";
import {
  getAverageRatingFromDb,
  getProductByIdFromDb,
  getReviewsByProductIdFromDb,
  getSellerByIdFromDb,
} from "@/data/marketplace-supabase";
import { getCurrentAuthContext } from "@/lib/auth/authorization";

type ProductDetailsProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsProps) {
  const { id } = await params;
  const product = await getProductByIdFromDb(id);

  if (!product) {
    notFound();
  }

  const [seller, productReviews, average, authContext] = await Promise.all([
    getSellerByIdFromDb(product.sellerId),
    getReviewsByProductIdFromDb(product.id),
    getAverageRatingFromDb(product.id),
    getCurrentAuthContext(),
  ]);
  const canPurchase = authContext.role !== "seller";

  return (
    <section className="section-block">
      <h1>{product.title}</h1>
      <p>{product.description}</p>

      <div className="details-grid">
        <article className="panel">
          <p className="badge">{product.category}</p>
          <h2 className="product-detail-heading">Product details</h2>
          <p className="product-detail-meta">
            Price: <strong>{formatPrice(product.price)}</strong>
          </p>
          <div className="product-detail-add">
            {canPurchase ? (
              <AddToCartButton productId={product.id} />
            ) : (
              <p className="seller-purchase-lock">
                Seller accounts cannot add items to the cart or proceed to checkout.
              </p>
            )}
          </div>
          <p className="product-detail-meta">
            Seller: <strong>{seller?.name ?? "Profile unavailable"}</strong>
          </p>
          <p className="product-detail-meta">
            Average rating: <strong>{average || "No reviews yet"}</strong>
          </p>
          <p className="rating product-detail-rating">
            <span className="stars" aria-hidden="true">
              {getStars(average || 4)}
            </span>
          </p>
        </article>

        <article className="panel">
          <h2>Reviews ({productReviews.length})</h2>
          {productReviews.length === 0 ? (
            <p className="product-empty-reviews">This product has not received reviews yet.</p>
          ) : (
            <div className="review-list">
              {productReviews.map((review) => (
                <div key={review.id} className="review-item">
                  <p>
                    <strong>{review.author}</strong> • {review.rating}/5
                  </p>
                  <p className="review-copy">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
