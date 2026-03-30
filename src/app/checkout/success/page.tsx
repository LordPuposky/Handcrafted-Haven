import Link from "next/link";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams;
  const orderId = params.order;

  return (
    <section className="section-block checkout-success-shell">
      <div className="panel checkout-success-card">
        <p className="badge">Order confirmed</p>
        <h1>Thank you for your purchase</h1>
        <p>
          Your order was placed successfully and will be processed soon.
        </p>

        {orderId ? (
          <p className="checkout-order-id">
            Order ID: <strong>{orderId}</strong>
          </p>
        ) : null}

        <div className="checkout-success-actions">
          <Link className="btn-primary" href="/products">
            Continue shopping
          </Link>
          <Link className="btn-secondary" href="/profile">
            Go to profile
          </Link>
        </div>
      </div>
    </section>
  );
}
