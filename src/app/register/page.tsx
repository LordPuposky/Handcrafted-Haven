"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { signup } from "@/app/actions/auth";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/profile";
  const [state, action, pending] = useActionState(signup, undefined);
  const [selectedRole, setSelectedRole] = useState("");
  const showSellerNote = selectedRole === "seller";

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon" aria-hidden="true">✦</span>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join the artisan community</p>
        </div>

        {state?.message && (
          <div className="auth-alert" role="alert">
            {state.message}
          </div>
        )}

        <form action={action} className="auth-form" noValidate>
          <input type="hidden" name="next" value={next} />

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              required
            />
            {state?.errors?.name && (
              <span className="field-error">{state.errors.name[0]}</span>
            )}
          </div>

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
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
            {state?.errors?.password && (
              <span className="field-error">{state.errors.password[0]}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="role">I am a:</label>
            <select
              id="role"
              name="role"
              defaultValue=""
              onChange={(event) => setSelectedRole(event.target.value)}
              required
            >
              <option value="">Select an option</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
            {state?.errors?.role && (
              <span className="field-error">{state.errors.role[0]}</span>
            )}
          </div>

          {showSellerNote ? (
            <div className="panel auth-role-note" role="note" aria-live="polite">
              <strong>Seller account selected</strong>
              <p>
                Keep signup simple for now — you can personalize your public seller
                profile right after registration inside the Seller Area.
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={pending}
          >
            {pending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
