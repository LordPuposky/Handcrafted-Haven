"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { submitReview } from "@/app/actions/reviews";
import type { Product, ProductReview, Seller } from "@/data/marketplace";
import { formatPrice, getStars } from "@/data/marketplace";

type Props = {
  products: Product[];
  sellers: Seller[];
  initialReviews: ProductReview[];
};

export function ReviewPageClient({ products, sellers, initialReviews }: Props) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "");
  const [reviewList, setReviewList] = useState<ProductReview[]>(initialReviews);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [state, formAction, pending] = useActionState(submitReview, undefined);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId]
  );

  const selectedSeller = selectedProduct
    ? sellers.find((seller) => seller.id === selectedProduct.sellerId)
    : undefined;

  const productReviews = useMemo(
    () => reviewList.filter((review) => review.productId === selectedProductId),
    [reviewList, selectedProductId]
  );

  const averageRating = useMemo(() => {
    if (!selectedProductId) return 0;

    const selected = reviewList.filter(
      (review) => review.productId === selectedProductId
    );

    if (selected.length === 0) return 0;

    const total = selected.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / selected.length).toFixed(1));
  }, [reviewList, selectedProductId]);

  useEffect(() => {
    setReviewList(initialReviews);
  }, [initialReviews]);

  useEffect(() => {
    if (!state?.success || !state.review) {
      return;
    }

    const submittedReview = state.review;

    setReviewList((current) => {
      if (current.some((review) => review.id === submittedReview.id)) {
        return current;
      }

      return [submittedReview, ...current];
    });
    setAuthor("");
    setRating(5);
    setComment("");
    router.refresh();
  }, [router, state]);

  const feedbackClassName = state?.message
    ? `review-feedback ${state.success ? "review-feedback--success" : "review-feedback--error"}`
    : undefined;

  return (
    <div className="details-grid">
      <section className="panel">
        <div className="section-title-row" style={{ marginBottom: "1rem" }}>
          <div>
            <h2>Leave a Review</h2>
            <p style={{ marginTop: "0.35rem" }}>
              Share your thoughts about a product.
            </p>
          </div>
        </div>

        <form action={formAction} className="review-form" aria-busy={pending}>
          <div className="field">
            <label htmlFor="product">Select product</label>
            <select
              id="product"
              name="productId"
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              disabled={pending}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>
            {state?.errors?.productId ? (
              <span className="field-error">{state.errors.productId[0]}</span>
            ) : null}
          </div>

          {selectedProduct && (
            <div className="card" style={{ padding: "1rem" }}>
              <div className="badge">{selectedProduct.category}</div>
              <h3 style={{ marginTop: "0.65rem" }}>{selectedProduct.title}</h3>
              <p style={{ marginTop: "0.25rem" }}>
                by {selectedSeller?.name ?? "Unknown seller"}
              </p>

              <div
                className="price-and-rating"
                style={{ marginTop: "0.85rem", gap: "1rem", flexWrap: "wrap" }}
              >
                <span className="price">{formatPrice(selectedProduct.price)}</span>
                <span className="rating">
                  {averageRating > 0
                    ? `${getStars(Math.round(averageRating))} ${averageRating}/5`
                    : "No reviews yet"}
                </span>
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="author">Your name</label>
            <input
              id="author"
              name="author"
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Enter your name"
              required
              disabled={pending}
            />
            {state?.errors?.author ? (
              <span className="field-error">{state.errors.author[0]}</span>
            ) : null}
          </div>

          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <div className="field">
              <label htmlFor="rating">Rating</label>
              <select
                id="rating"
                name="rating"
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                disabled={pending}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>
              {state?.errors?.rating ? (
                <span className="field-error">{state.errors.rating[0]}</span>
              ) : null}
            </div>

            <div className="panel" style={{ padding: "0.9rem" }}>
              <p style={{ fontWeight: 700 }}>Current rating</p>
              <p style={{ marginTop: "0.3rem" }}>
                {getStars(rating)} ({rating}/5)
              </p>
            </div>
          </div>

          <div className="field">
            <label htmlFor="comment">Comment</label>
            <textarea
              id="comment"
              name="comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              placeholder="Write your review"
              required
              disabled={pending}
            />
            {state?.errors?.comment ? (
              <span className="field-error">{state.errors.comment[0]}</span>
            ) : null}
          </div>

          <div className="review-submit-row">
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Saving review..." : "Submit Review"}
            </button>

            {state?.message ? (
              <p
                className={feedbackClassName}
                role="status"
                aria-live="polite"
              >
                {state.message}
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-title-row" style={{ marginBottom: "1rem" }}>
          <div>
            <h2>Existing Reviews</h2>
            <p style={{ marginTop: "0.35rem" }}>
              Reviews for the selected product
            </p>
          </div>

          <div className="panel" style={{ padding: "0.9rem", minWidth: "140px" }}>
            <p style={{ fontWeight: 700 }}>Average rating</p>
            <p style={{ marginTop: "0.3rem" }}>
              {averageRating > 0 ? `${averageRating} ${getStars(Math.round(averageRating))}` : "—"}
            </p>
          </div>
        </div>

        <div className="review-list">
          {productReviews.length > 0 ? (
            productReviews.map((review) => (
              <article key={review.id} className="review-item">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>{review.author}</strong>
                  <span>
                    {getStars(review.rating)} ({review.rating}/5)
                  </span>
                </div>

                <p style={{ marginTop: "0.65rem" }}>{review.comment}</p>
              </article>
            ))
          ) : (
            <div className="review-item">
              No reviews yet for this product. Be the first to leave one.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}