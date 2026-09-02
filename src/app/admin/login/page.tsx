import Link from "next/link";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CHURCH_NAME_SHORT } from "@/lib/site";

type AdminLoginPageProps = {
  searchParams?: Promise<{ error?: string; callbackUrl?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "invalid";
  const callbackUrl = params?.callbackUrl ?? "/admin";

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
          <p className="mt-2 text-sm text-muted-foreground">
            Authenticated staff area — not linked from the public site.
          </p>
        </div>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Credentials
            </p>
          }
        >
          {hasError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
              Invalid email or password.
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Email
              </label>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Password
              </label>
              <Input
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
