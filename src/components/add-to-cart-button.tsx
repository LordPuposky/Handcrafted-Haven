"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";

type AddToCartButtonProps = {
  productId: string;
  className?: string;
};

export function AddToCartButton({ productId, className }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem(productId, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1300);
  }

  return (
    <button
      type="button"
      className={className ?? "btn-primary"}
      onClick={handleAddToCart}
      aria-live="polite"
    >
      {added ? "Added" : "Add to cart"}
    </button>
  );
}
