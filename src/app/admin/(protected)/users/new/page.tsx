import { UserRole } from "@/generated/prisma/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createAdminUserAction } from "@/lib/admin/user-actions";
import { requireSuperAdmin } from "@/lib/auth/guard";
import { ROLE_LABELS } from "@/lib/auth/roles";

type NewUserPageProps = {
  searchParams?: Promise<{ error?: string; detail?: string }>;
};

export default async function NewAdminUserPage({ searchParams }: NewUserPageProps) {
  await requireSuperAdmin();
  const query = (await searchParams) ?? {};
  const detail = query.detail ? decodeURIComponent(query.detail) : "";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Access"
        title="New admin"
        description="They will be asked to choose their own password the next time they sign in."
      />
      {query.error === "missing-required" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Enter a valid email and choose a role.
        </p>
      ) : null}
      {query.error === "duplicate" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          An admin with that email already exists.
        </p>
      ) : null}
      {query.error === "password" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {detail || "Choose a stronger temporary password."}
        </p>
      ) : null}
      <Card header={<p className="text-sm font-medium">Account</p>}>
        <form action={createAdminUserAction} className="space-y-4">
          <div>
            <label htmlFor="admin-name" className="mb-1 block text-xs font-medium">Name</label>
            <Input id="admin-name" name="name" />
          </div>
          <div>
            <label htmlFor="admin-email" className="mb-1 block text-xs font-medium">Email *</label>
            <Input id="admin-email" name="email" type="email" required />
          </div>
          <div>
            <label htmlFor="admin-role" className="mb-1 block text-xs font-medium">Role *</label>
            <AdminSelect id="admin-role" name="role" defaultValue={UserRole.FOLLOW_UP_OFFICER}>
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </AdminSelect>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="admin-password" className="mb-1 block text-xs font-medium">Temporary password *</label>
              <Input id="admin-password" name="password" type="password" required />
            </div>
            <div>
              <label htmlFor="admin-confirm" className="mb-1 block text-xs font-medium">Confirm password *</label>
              <Input id="admin-confirm" name="confirm" type="password" required />
            </div>
          </div>
          <Button type="submit">Create admin</Button>
        </form>
      </Card>
    </div>
  );
}
