import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

type AdminGroupsPageProps = {
  searchParams?: Promise<{ success?: string }>;
};

export default async function AdminGroupsPage({ searchParams }: AdminGroupsPageProps) {
  const query = (await searchParams) ?? {};
  const groups = await prisma.group.findMany({
    include: {
      campus: true,
      zone: { include: { region: true } },
      _count: { select: { memberships: true } },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phase 1"
        title="Groups"
        description="Manage cell groups, ministries, committees, and other group types."
        action={
          <Link href="/admin/groups/new">
            <Button>New group</Button>
          </Link>
        }
      />

      {query.success === "deleted" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Group deleted.
        </p>
      ) : null}

      <Card header={<p className="text-sm font-medium">All groups</p>}>
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No groups yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">Region</th>
                  <th className="px-2 py-2">Zone</th>
                  <th className="px-2 py-2">Campus</th>
                  <th className="px-2 py-2">Members</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id} className="border-b border-border/60">
                    <td className="px-2 py-3 font-medium">{group.name}</td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {group.type.replaceAll("_", " ")}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {group.zone?.region.name ?? "—"}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {group.zone?.name ?? "—"}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {group.campus?.name ?? "—"}
                    </td>
                    <td className="px-2 py-3">{group._count.memberships}</td>
                    <td className="px-2 py-3 text-right">
                      <Link
                        href={`/admin/groups/${group.id}`}
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
        )}
      </Card>
    </div>
  );
}
