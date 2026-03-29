"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

async function upsertClientProfile(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  profile: { id: string; name: string; email: string }
) {
  await supabase.from("clients").upsert(
    {
      id: profile.id,
      name: profile.name,
      email: profile.email,
    },
    { onConflict: "id" }
  );
}

// ── Registro ────────────────────────────────────────────────────────────────

export async function signup(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

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

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { errors: { email: ["This email is already in use."] } };
    }
    return { message: "Could not create account. Please try again." };
  }

  if (data.user && data.session) {
    await upsertClientProfile(supabase, {
      id: data.user.id,
      name,
      email,
    });

    redirect("/profile");
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
    await upsertClientProfile(supabase, {
      id: data.user.id,
      name:
        data.user.user_metadata?.full_name ??
        data.user.email?.split("@")[0] ??
        "User",
      email: data.user.email ?? email,
    });
  }

  redirect("/profile");
}

// ── Logout ───────────────────────────────────────────────────────────────────

export async function logout() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
