import "server-only";

import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "buyer" | "seller";

type ClientProfileRow = {
  id: string;
  name: string;
  email: string;
  role?: AppRole | null;
  avatarEmoji?: string | null;
};

type SellerProfileRow = {
  id: string;
  name: string;
  location: string;
  specialty: string;
  bio: string;
  story: string;
  avatarEmoji: string;
};

async function getClientProfile(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  user: User
) {
  const { data, error } = await supabase
    .from("clients")
    .select('id, name, email, role, "avatarEmoji"')
    .eq("id", user.id)
    .maybeSingle();

  if (!error) {
    return (data as ClientProfileRow | null) ?? null;
  }

  if (!error.message.toLowerCase().includes("role")) {
    console.error("Unable to load client profile.", { userId: user.id, error });
    return null;
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("clients")
    .select('id, name, email, "avatarEmoji"')
    .eq("id", user.id)
    .maybeSingle();

  if (fallbackError) {
    console.error("Unable to load fallback client profile.", {
      userId: user.id,
      error: fallbackError,
    });
    return null;
  }

  return fallbackData
    ? ({ ...(fallbackData as Omit<ClientProfileRow, "role">), role: null } as ClientProfileRow)
    : null;
}

async function getSellerProfile(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from("sellers")
    .select('id, name, location, specialty, bio, story, "avatarEmoji"')
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Unable to load seller profile.", { userId, error });
    return null;
  }

  return (data as SellerProfileRow | null) ?? null;
}

export const getCurrentAuthContext = cache(async () => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      client: null,
      seller: null,
      role: null as AppRole | null,
    };
  }

  const client = await getClientProfile(supabase, user);
  const role: AppRole =
    client?.role === "seller" || user.user_metadata?.role === "seller"
      ? "seller"
      : "buyer";
  const seller = role === "seller" ? await getSellerProfile(supabase, user.id) : null;

  return {
    supabase,
    user,
    client,
    seller,
    role,
  };
});

export async function requireUser(nextPath = "/profile") {
  const context = await getCurrentAuthContext();

  if (!context.user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return context as typeof context & { user: User; role: AppRole };
}

export async function requireSeller(nextPath = "/seller/products/new") {
  const context = await requireUser(nextPath);

  if (context.role !== "seller") {
    redirect("/profile");
  }

  return context as typeof context & { user: User; role: "seller" };
}

export async function requireBuyer(nextPath = "/checkout") {
  const context = await requireUser(nextPath);

  if (context.role !== "buyer") {
    redirect("/profile");
  }

  return context as typeof context & { user: User; role: "buyer" };
}
