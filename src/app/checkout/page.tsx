import { redirect } from "next/navigation";
import { CheckoutPageClient } from "@/components/checkout-page-client";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function CheckoutPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/checkout");
  }

  const initialName =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "";

  return (
    <CheckoutPageClient
      initialName={initialName}
      initialEmail={user.email ?? ""}
    />
  );
}
