import { NextResponse } from "next/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabasePublicEnv()) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Supabase env vars are missing. Add NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY to .env.local.",
      },
      { status: 503 },
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("products").select("id", { head: true, count: "exact" });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: "Connected to Supabase, but could not query the products table.",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, message: "Supabase connection is healthy." });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Supabase connection failed.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}