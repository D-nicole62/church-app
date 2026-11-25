import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@/generated/prisma/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  resetAdminPasswordAction,
  setAdminActiveAction,
  updateAdminUserAction,
} from "@/lib/admin/user-actions";
import { requireSuperAdmin } from "@/lib/auth/guard";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

type UserDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string; detail?: string }>;
};

export default async function AdminUserDetailPage({ params, searchParams }: UserDetailPageProps) {
  const actor = await requireSuperAdmin();
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user) notFound();

  const detail = query.detail ? decodeURIComponent(query.detail) : "";
  const update = updateAdminUserAction.bind(null, id);
  const reset = resetAdminPasswordAction.bind(null, id);
  const deactivate = setAdminActiveAction.bind(null, id, false);
  const activate = setAdminActiveAction.bind(null, id, true);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Access"
        title={user.name || user.email}
        description={user.email}
        action={
          <Link href="/admin/users">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />
      {query.success === "created" ? <Banner tone="green">Admin created. They must change the temporary password at the next sign-in.</Banner> : null}
      {query.success === "updated" ? <Banner tone="green">Role saved.</Banner> : null}
      {query.success === "password-reset" ? <Banner tone="green">Password reset. They must choose a new one at the next sign-in.</Banner> : null}
      {query.success === "deactivated" ? <Banner tone="amber">Account deactivated. They can no longer sign in.</Banner> : null}
      {query.success === "activated" ? <Banner tone="green">Account activated.</Banner> : null}
      {query.error === "last-super-admin" ? <Banner tone="red">The church needs at least one active super admin.</Banner> : null}
      {query.error === "own-role" ? <Banner tone="red">Ask another super admin to change your role.</Banner> : null}
      {query.error === "deactivate-self" ? <Banner tone="red">Ask another super admin to deactivate your account.</Banner> : null}
      {query.error === "password" ? <Banner tone="red">{detail || "Choose a stronger password."}</Banner> : null}

      <Card header={<p className="text-sm font-medium">Role</p>}>
        <form action={update} className="space-y-4">
          <div>
            <label htmlFor="user-name" className="mb-1 block text-xs font-medium">Name</label>
            <Input id="user-name" name="name" defaultValue={user.name ?? ""} />
          </div>
          <div>
            <label htmlFor="user-role" className="mb-1 block text-xs font-medium">Role</label>
            <AdminSelect id="user-role" name="role" defaultValue={user.role}>
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </AdminSelect>
          </div>
          <Button type="submit">Save role</Button>
        </form>
      </Card>

      <Card header={<p className="text-sm font-medium">Reset password</p>}>
        <form action={reset} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="reset-password" className="mb-1 block text-xs font-medium">Temporary password</label>
            <Input id="reset-password" name="password" type="password" required />
          </div>
          <div>
            <label htmlFor="reset-confirm" className="mb-1 block text-xs font-medium">Confirm</label>
            <Input id="reset-confirm" name="confirm" type="password" required />
          </div>
          <Button type="submit" className="sm:col-span-2 sm:w-fit">Reset password</Button>
        </form>
      </Card>

      <Card header={<p className="text-sm font-medium">{user.active ? "Deactivate" : "Activate"}</p>}>
        {user.active ? (
          actor.id === user.id ? (
            <p className="text-sm text-muted-foreground">You cannot deactivate your own account.</p>
          ) : (
            <ConfirmDeleteButton
              action={deactivate}
              label="Deactivate account"
              confirm="Deactivate this admin? They will not be able to sign in."
            />
          )
        ) : (
          <form action={activate}>
            <Button type="submit">Activate account</Button>
          </form>
        )}
      </Card>
    </div>
  );
}

function Banner({ tone, children }: { tone: "green" | "red" | "amber"; children: ReactNode }) {
  const className =
    tone === "green"
      ? "border-green-200 bg-green-50 text-green-800"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-red-200 bg-red-50 text-red-800";
  return <p className={`rounded-lg border px-3 py-2 text-sm ${className}`}>{children}</p>;
}
