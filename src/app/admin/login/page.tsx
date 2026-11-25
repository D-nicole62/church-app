import Link from "next/link";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDatabaseHealth } from "@/lib/db-health";
import { CHURCH_NAME_SHORT } from "@/lib/site";

type AdminLoginPageProps = {
  searchParams?: Promise<{ error?: string; callbackUrl?: string; password?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const hasInvalidCredentials = params?.error === "invalid";
  const hasDatabaseError = params?.error === "database";
  const hasInactiveAccount = params?.error === "inactive";
  const passwordUpdated = params?.password === "updated";
  const callbackUrl = params?.callbackUrl ?? "/admin";
  const dbHealth = await getDatabaseHealth();
  const databaseMessage =
    dbHealth.status === "ok"
      ? "Sign-in failed because the database was unreachable. Fix DATABASE_URL / DIRECT_URL, run db:push and db:seed, then try again."
      : dbHealth.message;
  const showDatabaseWarning =
    dbHealth.status !== "ok" || hasDatabaseError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {CHURCH_NAME_SHORT}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Admin sign in
          </h1>
        </div>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Credentials
            </p>
          }
        >
          {showDatabaseWarning && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
              <p className="font-semibold">Database unavailable</p>
              <p className="mt-1">{databaseMessage}</p>
              {process.env.NODE_ENV === "development" && (
                <p className="mt-2 text-[11px] opacity-90">
                  Dev tip: confirm Supabase is active, env vars are loaded, then run{" "}
                  <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">
                    npm run db:push
                  </code>{" "}
                  and{" "}
                  <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">
                    npm run db:seed
                  </code>
                  .
                </p>
              )}
            </div>
          )}

          {passwordUpdated ? (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              Password updated. Sign in with your new password.
            </div>
          ) : null}
          {hasInactiveAccount ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              This admin account is deactivated. Ask a super admin to turn it back on.
            </div>
          ) : null}
          {hasInvalidCredentials && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
              Invalid email or password.
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1 block text-xs font-medium text-foreground/80"
              >
                Email
              </label>
              <Input
                id="admin-email"
                type="email"
                name="email"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label
                htmlFor="admin-password"
                className="mb-1 block text-xs font-medium text-foreground/80"
              >
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to public site
          </Link>
        </p>
      </div>
    </div>
  );
}
