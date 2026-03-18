export default function AboutPage() {
  return (
    <section className="section-block">
      <h1>Handcrafted Haven Community</h1>
      <p>
        Our mission is to strengthen small makers, celebrate handcrafted
        processes, and encourage conscious shopping through a welcoming,
        transparent marketplace.
      </p>

      <div className="details-grid" style={{ marginTop: "1rem" }}>
        <article className="panel">
          <h2>Mission</h2>
          <p style={{ marginTop: "0.5rem" }}>
            Connect artisans to a broader audience while preserving
            authenticity, quality, and fair income for makers.
          </p>
        </article>

        <article className="panel">
          <h2>Commitment</h2>
          <p style={{ marginTop: "0.5rem" }}>
            Promote responsible sourcing, local production, and more human
            commercial relationships.
          </p>
        </article>
      </div>
    </section>
  );
}
