import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { changePasswordAction, signOutAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { CHURCH_NAME_SHORT } from "@/lib/site";

type PasswordPageProps = {
  searchParams?: Promise<{ error?: string; detail?: string }>;
};

export default async function ChangePasswordPage({ searchParams }: PasswordPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
  });
  if (!admin || !admin.active) {
    redirect("/admin/login?error=inactive");
  }

  const query = (await searchParams) ?? {};
  const detail = query.detail ? decodeURIComponent(query.detail) : "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {CHURCH_NAME_SHORT}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {admin.mustChangePassword ? "Choose a new password" : "Change your password"}
          </h1>
          {admin.mustChangePassword ? (
            <p className="mt-2 text-sm text-muted-foreground">
              The setup password cannot be used for day-to-day admin work. Choose a new one to continue.
            </p>
          ) : null}
        </div>
        <Card>
          {query.error === "current" ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              The current password is not correct.
            </p>
          ) : null}
          {query.error === "password" ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {detail || "Choose a stronger password."}
            </p>
          ) : null}
          <form action={changePasswordAction} className="space-y-4">
            <div>
              <label htmlFor="current-password" className="mb-1 block text-xs font-medium">
                Current password
              </label>
              <Input id="current-password" name="current" type="password" autoComplete="current-password" required />
            </div>
            <div>
              <label htmlFor="new-password" className="mb-1 block text-xs font-medium">
                New password
              </label>
              <Input id="new-password" name="password" type="password" autoComplete="new-password" required />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-xs font-medium">
                Confirm new password
              </label>
              <Input id="confirm-password" name="confirm" type="password" autoComplete="new-password" required />
            </div>
            <Button type="submit" className="w-full">
              Save password
            </Button>
          </form>
        </Card>
        <form action={signOutAction} className="text-center">
          <button type="submit" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Sign out
          </button>
        </form>
        {admin.mustChangePassword ? null : (
          <p className="text-center text-sm">
            <Link href="/admin" className="font-medium text-primary underline-offset-4 hover:underline">
              Back to admin
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
