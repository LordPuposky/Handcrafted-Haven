import Link from "next/link";

type EmailConfirmPageProps = {
  searchParams: Promise<{
    status?: string;
    next?: string;
    message?: string;
  }>;
};

function getSafeNext(next?: string) {
  const value = next?.trim() ?? "/profile";

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/profile";
  }

  return value;
}

export default async function EmailConfirmPage({
  searchParams,
}: EmailConfirmPageProps) {
  const params = await searchParams;
  const isSuccess = params.status === "success";
  const next = getSafeNext(params.next);
  const title = isSuccess
    ? "Email validated successfully"
    : "We could not validate your email";
  const description =
    params.message ??
    (isSuccess
      ? "Your email has been confirmed. You can continue to your account safely."
      : "The confirmation link is invalid or expired. Please request a new validation email and try again.");

  return (
    <main className="page-shell">
      <div className="container auth-shell">
        <section className="auth-card">
          <div className="auth-header">
            <span className="auth-icon" aria-hidden="true">
              {isSuccess ? "✓" : "!"}
            </span>
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{description}</p>
          </div>

          {isSuccess ? (
            <p className="badge auth-badge-center">Email confirmed</p>
          ) : (
            <div className="auth-alert" role="alert">
              {description}
            </div>
          )}

          <div className="auth-form">
            <Link className="btn-primary auth-submit" href={isSuccess ? next : "/login"}>
              {isSuccess ? "Continue" : "Go to sign in"}
            </Link>
          </div>

          <p className="auth-switch">
            {isSuccess ? (
              <>
                Need to sign in with another account? <Link href="/login">Sign in</Link>
              </>
            ) : (
              <>
                Need a new confirmation email? <Link href="/register">Create account again</Link>
              </>
            )}
          </p>
        </section>
      </div>
    </main>
  );
}
