"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/profile";
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon" aria-hidden="true">✦</span>
          <h1 className="auth-title">Sign in to your account</h1>
          <p className="auth-subtitle">Welcome back to Handcrafted Haven</p>
        </div>

        {state?.message && (
          <div className="auth-alert" role="alert">
            {state.message}
          </div>
        )}

        <form action={action} className="auth-form" noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              required
            />
            {state?.errors?.email && (
              <span className="field-error">{state.errors.email[0]}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            {state?.errors?.password && (
              <span className="field-error">{state.errors.password[0]}</span>
            )}
          </div>

          <input type="hidden" name="next" value={next} />

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={pending}
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
