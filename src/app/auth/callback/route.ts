import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNext(requestUrl: URL) {
  const next = requestUrl.searchParams.get("next")?.trim() ?? "/profile";

  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/profile";
  }

  return next;
}

function buildRedirectUrl(
  requestUrl: URL,
  status: "success" | "error",
  next: string,
  message?: string,
) {
  const redirectUrl = new URL("/auth/confirm", requestUrl.origin);

  redirectUrl.searchParams.set("status", status);
  redirectUrl.searchParams.set("next", next);

  if (message) {
    redirectUrl.searchParams.set("message", message);
  }

  return redirectUrl;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = getSafeNext(requestUrl);
  const supabase = await getSupabaseServerClient();

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(
      buildRedirectUrl(
        requestUrl,
        "error",
        next,
        "The confirmation link is missing the required token.",
      ),
    );
  }

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        throw error;
      }
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType,
      });

      if (error) {
        throw error;
      }
    }

    return NextResponse.redirect(buildRedirectUrl(requestUrl, "success", next));
  } catch {
    return NextResponse.redirect(
      buildRedirectUrl(
        requestUrl,
        "error",
        next,
        "This confirmation link is invalid or has expired. Please request a new one.",
      ),
    );
  }
}
