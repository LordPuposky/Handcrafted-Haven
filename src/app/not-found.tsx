import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-block">
      <h1>Page not found</h1>
      <p>The content you tried to access does not exist or has been moved.</p>
      <Link className="btn-primary" href="/" style={{ marginTop: "1rem" }}>
        Back to home
      </Link>
    </section>
  );
}
