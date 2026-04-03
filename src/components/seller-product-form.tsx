"use client";

import { useActionState } from "react";
import { createProduct, updateProduct } from "@/app/actions/products";
import type { Product } from "@/data/marketplace";
import { categories } from "@/data/marketplace";

const productCategories = categories.filter((category) => category !== "All");

type SellerProductFormProps = {
  sellerName?: string;
  mode?: "create" | "edit";
  product?: Product;
};

export function SellerProductForm({
  sellerName = "Seller",
  mode = "create",
  product,
}: SellerProductFormProps) {
  const actionToUse = mode === "edit" ? updateProduct : createProduct;
  const [state, action, pending] = useActionState(actionToUse, undefined);
  const titleValue = state?.values?.title ?? product?.title ?? "";
  const categoryValue = state?.values?.category ?? product?.category ?? "Decor";
  const priceValue = state?.values?.price ?? (product ? String(product.price) : "");
  const descriptionValue = state?.values?.description ?? product?.description ?? "";
  const imageEmojiValue = state?.values?.imageEmoji ?? product?.imageEmoji ?? "🏺";
  const featuredValue = state?.values?.featured ?? product?.featured ?? false;

  return (
    <form action={action} className="seller-product-form" noValidate>
      {mode === "edit" && product ? <input type="hidden" name="productId" value={product.id} /> : null}

      <div className="seller-product-note">
        <p>
          {mode === "edit" ? (
            <>
              Editing <strong>{product?.title ?? "your product"}</strong>.
            </>
          ) : (
            <>
              Publishing as <strong>{sellerName}</strong>.
            </>
          )}
        </p>
        <p>
          {mode === "edit"
            ? "Update the details below and save your storefront changes securely."
            : "Only seller accounts can access and submit this form."}
        </p>
      </div>

      {state?.message ? (
        <div className="auth-alert" role="alert">
          {state.message}
        </div>
      ) : null}

      <div className="seller-product-grid">
        <div className="field seller-product-field-wide">
          <label htmlFor="title">Product name</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Ex: Aurora ceramic vase"
            defaultValue={titleValue}
            required
          />
          {state?.errors?.title ? (
            <span className="field-error">{state.errors.title[0]}</span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={categoryValue}>
            {productCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {state?.errors?.category ? (
            <span className="field-error">{state.errors.category[0]}</span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="price">Price (R$)</label>
          <input
            id="price"
            name="price"
            type="number"
            min="1"
            step="0.01"
            placeholder="129.90"
            defaultValue={priceValue}
            required
          />
          {state?.errors?.price ? (
            <span className="field-error">{state.errors.price[0]}</span>
          ) : null}
        </div>

        <div className="field seller-product-field-wide">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            placeholder="Describe materials, finishing, and what makes this piece special."
            defaultValue={descriptionValue}
            required
          />
          {state?.errors?.description ? (
            <span className="field-error">{state.errors.description[0]}</span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="imageEmoji">Product emoji</label>
          <input
            id="imageEmoji"
            name="imageEmoji"
            type="text"
            maxLength={4}
            placeholder="🏺"
            defaultValue={imageEmojiValue}
            required
          />
          <span className="field-hint">Suggestion: 🏺 👜 🧵 📒 🕯️</span>
          {state?.errors?.imageEmoji ? (
            <span className="field-error">{state.errors.imageEmoji[0]}</span>
          ) : null}
        </div>

        <label className="seller-product-checkbox">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            defaultChecked={featuredValue}
          />
          Highlight this product on the catalog
        </label>
      </div>

      <div className="seller-product-actions">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending
            ? mode === "edit"
              ? "Saving changes..."
              : "Publishing product..."
            : mode === "edit"
              ? "Save changes"
              : "Publish product"}
        </button>
      </div>
    </form>
  );
}
