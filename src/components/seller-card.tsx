import Link from "next/link";
import type { Seller } from "@/data/marketplace";

type SellerCardProps = {
  seller: Seller;
};

export function SellerCard({ seller }: SellerCardProps) {
  return (
    <article className="card" aria-label={`Seller profile ${seller.name}`}>
      <div className="card-body">
        <span className="badge">{seller.specialty}</span>
        <h3 className="card-title">
          {seller.avatarEmoji} {seller.name}
        </h3>
        <p className="card-meta">{seller.location}</p>
        <p>{seller.bio}</p>
        <Link className="btn-secondary" href={`/sellers/${seller.id}`}>
          View profile
        </Link>
      </div>
    </article>
  );
}
