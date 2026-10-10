import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { attendanceTrendLabel, getGroupReports } from "@/lib/reports/group-reports";

export default async function GroupReportsPage() {
  const { summary, cellGroups, ministries, otherGroups } = await getGroupReports();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Reports"
        title="Group reports"
        description="Membership counts, cell attendance trends, and announcement activity. Final layout can be adjusted when sample cell-group reports are provided."
        action={
          <Link href="/admin/reports">
            <Button variant="secondary">Back to reports</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card header={<p className="text-sm font-medium">Total groups</p>}>
          <p className="text-3xl font-semibold">{summary.totalGroups}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Cell groups</p>}>
          <p className="text-3xl font-semibold">{summary.cellGroups}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">People assigned</p>}>
          <p className="text-3xl font-semibold">{summary.totalMembers}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Avg. cell attendance</p>}>
          <p className="text-3xl font-semibold">
            {summary.avgCellAttendance !== null
              ? Math.round(summary.avgCellAttendance * 10) / 10
              : "—"}
          </p>
        </Card>
      </div>

      <GroupReportTable title="Cell groups" rows={cellGroups} />
      <GroupReportTable title="Ministries" rows={ministries} />
      {otherGroups.length > 0 ? (
        <GroupReportTable title="Other groups" rows={otherGroups} />
      ) : null}
    </div>
  );
}

type GroupRow = Awaited<ReturnType<typeof getGroupReports>>["cellGroups"][number];

function GroupReportTable({ title, rows }: { title: string; rows: GroupRow[] }) {
  return (
    <Card header={<p className="text-sm font-medium">{title}</p>}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No groups in this category.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2">Group</th>
                <th className="px-2 py-2">Region</th>
                <th className="px-2 py-2">Zone</th>
                <th className="px-2 py-2">Campus</th>
                <th className="px-2 py-2">Leaders</th>
                <th className="px-2 py-2">Members</th>
                <th className="px-2 py-2">Meetings logged</th>
                <th className="px-2 py-2">Avg. present</th>
                <th className="px-2 py-2">Trend</th>
                <th className="px-2 py-2">Announcements</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((group) => (
                <tr key={group.id} className="border-b border-border/60">
                  <td className="px-2 py-3 font-medium">
                    <Link
                      href={`/admin/groups/${group.id}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {group.name}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{group.region}</td>
                  <td className="px-2 py-3 text-muted-foreground">{group.zone}</td>
                  <td className="px-2 py-3 text-muted-foreground">{group.campus}</td>
                  <td className="px-2 py-3">{group.leaders}</td>
                  <td className="px-2 py-3">{group.members}</td>
                  <td className="px-2 py-3">{group.meetingCount}</td>
                  <td className="px-2 py-3">
                    {group.avgAttendance !== null
                      ? Math.round(group.avgAttendance * 10) / 10
                      : "—"}
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">
                    {attendanceTrendLabel(group.attendanceTrend)}
                  </td>
                  <td className="px-2 py-3">{group.announcementsSent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
