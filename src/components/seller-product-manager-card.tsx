import Link from "next/link";
import { deleteProduct } from "@/app/actions/products";
import { SellerDeleteProductButton } from "@/components/seller-delete-product-button";
import type { Product } from "@/data/marketplace";
import { formatPrice } from "@/data/marketplace";

export function SellerProductManagerCard({ product }: { product: Product }) {
  return (
    <article className="panel seller-manage-card">
      <div className="seller-manage-head">
        <div className="seller-manage-emoji" aria-hidden="true">
          {product.imageEmoji}
        </div>

        <div className="seller-manage-meta">
          <div className="seller-manage-title-row">
            <h2>{product.title}</h2>
            {product.featured ? <span className="badge">Featured</span> : null}
          </div>
          <p className="card-meta">{product.category}</p>
          <p className="seller-manage-description">{product.description}</p>
        </div>
      </div>

      <div className="seller-manage-footer">
        <p className="seller-manage-price">{formatPrice(product.price)}</p>

        <div className="seller-manage-actions">
          <Link className="btn-secondary" href={`/products/${product.id}`}>
            View listing
          </Link>
          <Link className="btn-secondary" href={`/seller/products/${product.id}`}>
            Edit product
          </Link>

          <form action={deleteProduct} className="seller-delete-form">
            <input type="hidden" name="productId" value={product.id} />
            <SellerDeleteProductButton />
          </form>
        </div>
      </div>
    </article>
  );
}
