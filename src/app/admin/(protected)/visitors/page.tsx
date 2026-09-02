import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<string, string> = {
  FIRST_TIME: "First-time",
  RETURNING: "Returning",
  FOLLOW_UP_ASSIGNED: "Follow-up assigned",
  IN_PROGRESS: "In progress",
  MEMBER_REGISTERED: "Member registered",
  NO_LONGER_ATTENDING: "No longer attending",
};

export default async function AdminVisitorsPage() {
  const visitors = await prisma.visitor.findMany({
    include: {
      person: { include: { campus: true } },
      assignedOfficer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phase 3"
        title="Visitors"
        description="Track visitor intake, follow-up assignments, and conversion to membership."
      />

      <Card header={<p className="text-sm font-medium">Visitor pipeline</p>}>
        {visitors.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No visitors yet. Submissions from the public /visit form will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Campus</th>
                  <th className="px-2 py-2">Service</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor.id} className="border-b border-border/60">
                    <td className="px-2 py-3 font-medium">
                      {visitor.person.firstName} {visitor.person.lastName}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {STATUS_LABELS[visitor.status] ?? visitor.status}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {visitor.person.campus?.name ?? "—"}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {visitor.serviceAttended ?? "—"}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Link
                        href={`/admin/visitors/${visitor.id}`}
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
