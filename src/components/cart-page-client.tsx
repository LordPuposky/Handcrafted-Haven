"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/data/marketplace";
import { formatPrice } from "@/data/marketplace";

type CartPageClientProps = {
  products: Product[];
};

export function CartPageClient({ products }: CartPageClientProps) {
  const { items, itemsCount, setItemQuantity, removeItem, clearCart } = useCart();

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

  if (itemsWithProduct.length === 0) {
    return (
      <section className="section-block">
        <h1>Cart</h1>
        <p className="cart-empty-text">Your cart is empty.</p>
        <Link className="btn-primary cart-empty-action" href="/products">
          Explore products
        </Link>
      </section>
    );
  }

  return (
    <section className="section-block">
      <div className="section-title-row">
        <h1>Cart</h1>
        <button type="button" className="btn-secondary cart-clear-btn" onClick={clearCart}>
          Clear cart
        </button>
      </div>

      <div className="cart-layout">
        <div className="cart-list" aria-label="Cart items">
          {itemsWithProduct.map((entry) => (
            <article key={entry.product.id} className="cart-item">
              <div className="cart-item-media" aria-hidden="true">
                <span>{entry.product.imageEmoji}</span>
              </div>

              <div className="cart-item-main">
                <p className="badge">{entry.product.category}</p>
                <h2>{entry.product.title}</h2>
                <p className="cart-item-price">{formatPrice(entry.product.price)} each</p>

                <div className="cart-item-actions">
                  <div className="quantity-control" aria-label={`Quantity for ${entry.product.title}`}>
                    <button
                      type="button"
                      onClick={() => setItemQuantity(entry.product.id, entry.quantity - 1)}
                      aria-label={`Decrease quantity of ${entry.product.title}`}
                    >
                      -
                    </button>

                    <input
                      type="number"
                      min={1}
                      value={entry.quantity}
                      onChange={(event) =>
                        setItemQuantity(entry.product.id, Number(event.target.value))
                      }
                      aria-label={`Quantity of ${entry.product.title}`}
                    />

                    <button
                      type="button"
                      onClick={() => setItemQuantity(entry.product.id, entry.quantity + 1)}
                      aria-label={`Increase quantity of ${entry.product.title}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeItem(entry.product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="cart-item-total">{formatPrice(entry.lineTotal)}</div>
            </article>
          ))}
        </div>

        <aside className="panel cart-summary" aria-label="Order summary">
          <h2>Summary</h2>
          <p className="cart-summary-row">
            <span>Items</span>
            <strong>{itemsCount}</strong>
          </p>
          <p className="cart-summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </p>
          <p className="cart-summary-note">Shipping and taxes calculated at checkout.</p>

          <button type="button" className="btn-primary" disabled>
            Proceed to checkout
          </button>
        </aside>
      </div>
    </section>
  );
}
