"use client";

import { useFormStatus } from "react-dom";

type SellerDeleteProductButtonProps = {
  idleLabel?: string;
  pendingLabel?: string;
};

export function SellerDeleteProductButton({
  idleLabel = "Remove product",
  pendingLabel = "Removing...",
}: SellerDeleteProductButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="seller-delete-btn" disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
