import { products, reviews } from "@/data/marketplace";
import { ReviewPageClient } from "@/components/review-page-client";

export default function ReviewsPage() {
  return (
    <main className="page-shell">
      <div className="container">
        <section className="section-block">
          <div className="section-title-row">
            <div>
              <p className="hero-kicker">Share your experience</p>
              <h1>Product Reviews</h1>
            </div>
          </div>

          <p
            style={{
              maxWidth: "60ch",
              marginTop: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            Select a handcrafted item, read what other buyers think, and leave a
            review with a rating and comment.
          </p>

          <ReviewPageClient products={products} initialReviews={reviews} />
        </section>
      </div>
    </main>
  );
}