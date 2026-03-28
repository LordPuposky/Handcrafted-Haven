import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  formatPrice,
  getAverageRating,
  getProductById,
  getReviewsByProductId,
  getSellerById,
  getStars,
} from "@/data/marketplace";

type ProductDetailsProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const seller = getSellerById(product.sellerId);
  const productReviews = getReviewsByProductId(product.id);
  const average = getAverageRating(product.id);

  return (
    <section className="section-block">
      <h1>{product.title}</h1>
      <p>{product.description}</p>

      <div className="details-grid">
        <article className="panel">
          <p className="badge">{product.category}</p>
          <h2 style={{ marginTop: "0.7rem" }}>Product details</h2>
          <p style={{ marginTop: "0.4rem" }}>
            Price: <strong>{formatPrice(product.price)}</strong>
          </p>
          <div className="product-detail-add">
            <AddToCartButton productId={product.id} />
          </div>
          <p style={{ marginTop: "0.4rem" }}>
            Seller: <strong>{seller?.name ?? "Profile unavailable"}</strong>
          </p>
          <p style={{ marginTop: "0.4rem" }}>
            Average rating: <strong>{average || "No reviews yet"}</strong>
          </p>
          <p className="rating" style={{ marginTop: "0.4rem" }}>
            <span className="stars" aria-hidden="true">
              {getStars(average || 4)}
            </span>
          </p>
        </article>

        <article className="panel">
          <h2>Reviews ({productReviews.length})</h2>
          {productReviews.length === 0 ? (
            <p style={{ marginTop: "0.6rem" }}>This product has not received reviews yet.</p>
          ) : (
            <div className="review-list">
              {productReviews.map((review) => (
                <div key={review.id} className="review-item">
                  <p>
                    <strong>{review.author}</strong> • {review.rating}/5
                  </p>
                  <p style={{ marginTop: "0.4rem" }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
