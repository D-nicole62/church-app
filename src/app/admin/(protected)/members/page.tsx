import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function AdminMembersPage() {
  const members = await prisma.member.findMany({
    include: {
      person: { include: { campus: true } },
      cellGroup: true,
      ministryGroup: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phase 2"
        title="Members"
        description="Church membership records with auto-generated membership numbers."
        action={
          <Link href="/admin/members/new">
            <Button>New member</Button>
          </Link>
        }
      />

      <Card header={<p className="text-sm font-medium">All members</p>}>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">Number</th>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Campus</th>
                  <th className="px-2 py-2">Cell group</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-border/60">
                    <td className="px-2 py-3 font-mono text-xs">
                      {member.membershipNumber}
                    </td>
                    <td className="px-2 py-3 font-medium">
                      {member.person.firstName} {member.person.lastName}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {member.person.campus?.name ?? "—"}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {member.cellGroup?.name ?? "—"}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Link
                        href={`/admin/members/${member.id}`}
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        View
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
