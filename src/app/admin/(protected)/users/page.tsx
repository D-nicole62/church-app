import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireSuperAdmin } from "@/lib/auth/guard";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

type UsersPageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  await requireSuperAdmin();
  const query = (await searchParams) ?? {};
  const users = await prisma.adminUser.findMany({ orderBy: [{ role: "asc" }, { email: "asc" }] });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Access"
        title="Admin users"
        description="Super admins can add staff, change roles, reset passwords, and deactivate accounts."
        action={
          <Link href="/admin/users/new">
            <Button>New admin</Button>
          </Link>
        }
      />
      {query.error === "not-found" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          That admin account no longer exists.
        </p>
      ) : null}
      <Card header={<p className="text-sm font-medium">Accounts</p>}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/60">
                  <td className="px-2 py-3 font-medium">{user.name || "—"}</td>
                  <td className="px-2 py-3">{user.email}</td>
                  <td className="px-2 py-3 text-muted-foreground">{ROLE_LABELS[user.role]}</td>
                  <td className="px-2 py-3 text-muted-foreground">
                    {user.active ? "Active" : "Deactivated"}
                    {user.mustChangePassword ? " · Password change required" : ""}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
