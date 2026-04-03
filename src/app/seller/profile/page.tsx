import type { Metadata } from "next";
import Link from "next/link";
import { SellerProfileForm } from "@/components/seller-profile-form";
import type { Seller } from "@/data/marketplace";
import { requireSeller } from "@/lib/auth/authorization";

export const metadata: Metadata = {
  title: "Edit public profile",
  description: "Private seller workspace for updating the public artisan profile.",
};

export default async function SellerProfilePage() {
  const { user, client, seller } = await requireSeller("/seller/profile");

  const fallbackName =
    seller?.name ?? client?.name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Seller";

  const sellerProfile: Seller = {
    id: seller?.id ?? user.id,
    name: fallbackName,
    location: seller?.location ?? "Your studio location",
    specialty: seller?.specialty ?? "Handcrafted creations",
    bio: seller?.bio ?? `${fallbackName} is a verified artisan on Handcrafted Haven.`,
    story:
      seller?.story ??
      "Share the inspiration, materials, and process behind the pieces you create for your storefront.",
    avatarEmoji: seller?.avatarEmoji ?? client?.avatarEmoji ?? "🧵",
  };

  return (
    <section className="section-block seller-product-shell">
      <div className="section-title-row seller-product-header">
        <div>
          <h1>Edit public seller profile</h1>
          <p>
            Refine how your studio appears across the seller directory and your public artisan page.
          </p>
        </div>
        <div className="seller-dashboard-actions">
          <Link className="btn-secondary" href="/seller">
            Back to seller area
          </Link>
          <Link className="btn-secondary" href={`/sellers/${sellerProfile.id}`}>
            View public profile
          </Link>
        </div>
      </div>

      <article className="panel seller-product-panel">
        <SellerProfileForm seller={sellerProfile} />
      </article>
    </section>
  );
}
