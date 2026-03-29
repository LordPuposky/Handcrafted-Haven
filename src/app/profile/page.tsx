import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "User";

  return (
    <section className="section-block profile-shell">
      <div className="profile-header">
        <div className="profile-avatar" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="profile-name">{name}</h1>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      <div className="profile-body">
        <div className="panel profile-info-panel">
          <h2>Account information</h2>
          <dl className="profile-dl">
            <div>
              <dt>Name</dt>
              <dd>{name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>

        <form action={logout}>
          <button type="submit" className="btn-logout">
            Sign out
          </button>
        </form>
      </div>
    </section>
  );
}
