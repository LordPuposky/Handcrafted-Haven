"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo } from "react";
import { placeOrder } from "@/app/actions/checkout";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/data/marketplace";
import { formatPrice } from "@/data/marketplace";

type CheckoutPageClientProps = {
  initialName: string;
  initialEmail: string;
  products: Product[];
};

export function CheckoutPageClient({
  initialName,
  initialEmail,
  products,
}: CheckoutPageClientProps) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [state, formAction, pending] = useActionState(placeOrder, undefined);

  const itemsWithProduct = useMemo(
    () =>
      items
        .map((entry) => {
          const product = products.find((item) => item.id === entry.productId);

          if (!product) {
            return null;
          }

          return {
            ...entry,
            product,
            lineTotal: entry.quantity * product.price,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [items, products]
  );

  const subtotal = useMemo(
    () => itemsWithProduct.reduce((sum, entry) => sum + entry.lineTotal, 0),
    [itemsWithProduct]
  );

  const shipping = subtotal >= 300 ? 0 : 18;
  const total = subtotal + shipping;

  const formValues = state?.values;

  useEffect(() => {
    if (!state?.success || !state.orderId) {
      return;
    }

    clearCart();
    router.push(`/checkout/success?order=${state.orderId}`);
  }, [state, clearCart, router]);

  if (itemsWithProduct.length === 0) {
    return (
      <section className="section-block checkout-shell">
        <h1>Checkout</h1>
        <p className="cart-empty-text">Your cart is empty.</p>
        <Link className="btn-primary cart-empty-action" href="/products">
          Explore products
        </Link>
      </section>
    );
  }

  return (
    <section className="section-block checkout-shell">
      <div className="section-title-row">
        <h1>Checkout</h1>
        <Link className="btn-secondary" href="/cart">
          Back to cart
        </Link>
      </div>

      <div className="checkout-layout">
        <form action={formAction} className="panel checkout-form" noValidate>
          <h2>Shipping details</h2>

          {state?.message && !state.success ? (
            <p className="auth-alert" role="alert">
              {state.message}
            </p>
          ) : null}

          <input type="hidden" name="items" value={JSON.stringify(items)} />

          <div className="field">
            <label htmlFor="shippingName">Full name</label>
            <input
              id="shippingName"
              name="shippingName"
              defaultValue={formValues?.shippingName ?? initialName}
              required
            />
            {state?.errors?.shippingName ? (
              <span className="field-error">{state.errors.shippingName[0]}</span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="shippingEmail">Email</label>
            <input
              id="shippingEmail"
              name="shippingEmail"
              type="email"
              defaultValue={formValues?.shippingEmail ?? initialEmail}
              required
            />
            {state?.errors?.shippingEmail ? (
              <span className="field-error">{state.errors.shippingEmail[0]}</span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="shippingAddress">Street address</label>
            <input
              id="shippingAddress"
              name="shippingAddress"
              defaultValue={formValues?.shippingAddress ?? ""}
              required
            />
            {state?.errors?.shippingAddress ? (
              <span className="field-error">{state.errors.shippingAddress[0]}</span>
            ) : null}
          </div>

          <div className="checkout-grid-2">
            <div className="field">
              <label htmlFor="shippingCity">City</label>
              <input
                id="shippingCity"
                name="shippingCity"
                defaultValue={formValues?.shippingCity ?? ""}
                required
              />
              {state?.errors?.shippingCity ? (
                <span className="field-error">{state.errors.shippingCity[0]}</span>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="shippingState">State</label>
              <input
                id="shippingState"
                name="shippingState"
                defaultValue={formValues?.shippingState ?? ""}
                required
              />
              {state?.errors?.shippingState ? (
                <span className="field-error">{state.errors.shippingState[0]}</span>
              ) : null}
            </div>
          </div>

          <div className="field">
            <label htmlFor="shippingPostalCode">Postal code</label>
            <input
              id="shippingPostalCode"
              name="shippingPostalCode"
              defaultValue={formValues?.shippingPostalCode ?? ""}
              required
            />
            {state?.errors?.shippingPostalCode ? (
              <span className="field-error">{state.errors.shippingPostalCode[0]}</span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="notes">Order notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              defaultValue={formValues?.notes ?? ""}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Placing order..." : "Place order"}
          </button>
        </form>

        <aside className="panel cart-summary checkout-summary" aria-label="Checkout summary">
          <h2>Order summary</h2>

          <div className="checkout-summary-items">
            {itemsWithProduct.map((entry) => (
              <p key={entry.product.id} className="cart-summary-row">
                <span>
                  {entry.product.title} x{entry.quantity}
                </span>
                <strong>{formatPrice(entry.lineTotal)}</strong>
              </p>
            ))}
          </div>

          <p className="cart-summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </p>
          <p className="cart-summary-row">
            <span>Shipping</span>
            <strong>{shipping === 0 ? "Free" : formatPrice(shipping)}</strong>
          </p>
          <p className="cart-summary-row checkout-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </p>
        </aside>
      </div>
    </section>
  );
}
