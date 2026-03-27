export default function AboutPage() {
  return (
    <section className="section-block">
      <div className="about-hero">
        <p className="eyebrow">About Us</p>
        <h1>About Handcrafted Haven</h1>
        <p className="about-intro">
          Handcrafted Haven is a community-centered marketplace built to connect
          talented artisans with people who value originality, craftsmanship,
          and thoughtful shopping. We believe handmade products are more than
          items for sale. They carry stories, culture, skill, and heart.
        </p>
      </div>

      <div className="details-grid" style={{ marginTop: "2rem" }}>
        <article className="panel">
          <h2>Our Mission</h2>
          <p style={{ marginTop: "0.75rem" }}>
            Our mission is to empower small makers by giving them a platform to
            reach wider audiences while preserving authenticity, fair value, and
            the human touch behind every product.
          </p>
        </article>

        <article className="panel">
          <h2>What We Believe</h2>
          <p style={{ marginTop: "0.75rem" }}>
            We believe shopping should feel personal and meaningful. By
            supporting handcrafted goods, customers invest in creativity,
            tradition, and the livelihoods of real people.
          </p>
        </article>

        <article className="panel">
          <h2>Our Commitment</h2>
          <p style={{ marginTop: "0.75rem" }}>
            We are committed to promoting responsible sourcing, local
            production, transparency, and stronger relationships between makers
            and buyers in a digital marketplace.
          </p>
        </article>

        <article className="panel">
          <h2>Our Community</h2>
          <p style={{ marginTop: "0.75rem" }}>
            Handcrafted Haven is more than an online shop. It is a growing
            community of artisans, customers, and supporters who appreciate
            creativity, sustainability, and the value of handmade work.
          </p>
        </article>
      </div>
    </section>
  );
}