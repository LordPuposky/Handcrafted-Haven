"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/supabase/config";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

type UserRole = "buyer" | "seller";

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        role?: string[];
      };
      message?: string;
    }
  | undefined;

async function upsertClientProfile(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  profile: { id: string; name: string; email: string; role: UserRole }
) {
  const { error } = await supabase.from("clients").upsert(
    {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
    },
    { onConflict: "id" }
  );

  if (!error) {
    return;
  }

  if (!error.message.toLowerCase().includes("role")) {
    console.error("Could not sync client profile.", {
      userId: profile.id,
      error,
    });
    return;
  }

  const { error: fallbackError } = await supabase.from("clients").upsert(
    {
      id: profile.id,
      name: profile.name,
      email: profile.email,
    },
    { onConflict: "id" }
  );

  if (fallbackError) {
    console.error("Could not sync fallback client profile.", {
      userId: profile.id,
      error: fallbackError,
    });
  }
}

async function upsertSellerDirectoryProfile(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  profile: { id: string; name: string; role: UserRole }
) {
  if (profile.role !== "seller") {
    return;
  }

  const sellerRecord = {
    id: profile.id,
    name: profile.name,
    location: "New artisan on Handcrafted Haven",
    specialty: "Handcrafted creations",
    bio: `${profile.name} recently joined Handcrafted Haven as a verified seller.`,
    story:
      "This artisan is setting up their storefront and will soon share more of their creative journey.",
    avatarEmoji: "🧵",
  };

  try {
    const admin = getSupabaseAdminClient();
    const { error } = await admin.from("sellers").insert(sellerRecord);

    if (error && !error.message.toLowerCase().includes("duplicate")) {
      throw error;
    }
  } catch {
    const { error: fallbackError } = await supabase.from("sellers").insert(sellerRecord);

    if (fallbackError && !fallbackError.message.toLowerCase().includes("duplicate")) {
      console.error("Could not sync seller directory profile.", {
        userId: profile.id,
        error: fallbackError,
      });
    }
  }
}

function getSafeRedirectTarget(formData: FormData) {
  const requested = String(formData.get("next") ?? "").trim();

  if (!requested.startsWith("/") || requested.startsWith("//")) {
    return "/profile";
  }

  return requested;
}

async function getAuthCallbackUrl(nextTarget: string) {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? null;
  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : getSiteUrl();
  const callbackUrl = new URL("/auth/callback", origin);

  callbackUrl.searchParams.set("next", nextTarget);

  return callbackUrl.toString();
}

// ── Registro ────────────────────────────────────────────────────────────────

export async function signup(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const nextTarget = getSafeRedirectTarget(formData);
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "").trim() as UserRole;

  const errors: NonNullable<AuthFormState>["errors"] = {};

  if (name.length < 2) {
    errors.name = ["Name must be at least 2 characters."];
  }
  if (!email.includes("@")) {
    errors.email = ["Please enter a valid email address."];
  }
  if (password.length < 8) {
    errors.password = ["Password must be at least 8 characters."];
  } else if (!/[a-zA-Z]/.test(password)) {
    errors.password = ["Password must include at least one letter."];
  } else if (!/[0-9]/.test(password)) {
    errors.password = ["Password must include at least one number."];
  }
  if (!["buyer", "seller"].includes(role)) { 
    errors.role = ["Please select a valid role."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await getSupabaseServerClient();
  const emailRedirectTo = await getAuthCallbackUrl(nextTarget);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, role },
      emailRedirectTo,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { errors: { email: ["This email is already in use."] } };
    }
    return { message: "Could not create account. Please try again." };
  }

  if (data.user) {
    await upsertClientProfile(supabase, {
      id: data.user.id,
      name,
      email,
      role,
    });

    await upsertSellerDirectoryProfile(supabase, {
      id: data.user.id,
      name,
      role,
    });
  }

  if (data.user && data.session) {
    redirect(nextTarget);
  }

  return {
    message: "Account created. Check your email to confirm your account before signing in.",
  };
}

// ── Login ────────────────────────────────────────────────────────────────────

export async function login(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const nextTarget = getSafeRedirectTarget(formData);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const errors: NonNullable<AuthFormState>["errors"] = {};

  if (!email.includes("@")) {
    errors.email = ["Please enter a valid email address."];
  }
  if (!password) {
    errors.password = ["Please enter your password."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { message: "Please confirm your email before signing in." };
    }

    return { message: "Invalid email or password." };
  }

  if (data.user) {
    const resolvedName =
      data.user.user_metadata?.full_name ??
      data.user.email?.split("@")[0] ??
      "User";
    const resolvedRole: UserRole = data.user.user_metadata?.role === "seller" ? "seller" : "buyer";

    await upsertClientProfile(supabase, {
      id: data.user.id,
      name: resolvedName,
      email: data.user.email ?? email,
      role: resolvedRole,
    });

    await upsertSellerDirectoryProfile(supabase, {
      id: data.user.id,
      name: resolvedName,
      role: resolvedRole,
    });
  }

  redirect(nextTarget);
}

// ── Logout ───────────────────────────────────────────────────────────────────

export async function logout() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}