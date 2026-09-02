import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { attendanceTrendLabel, getGroupReports } from "@/lib/reports/group-reports";
import { formatDays, formatPercent } from "@/lib/reports/format";
import { getVisitorAnalytics } from "@/lib/reports/visitor-analytics";

export default async function AdminReportsPage() {
  const [visitorAnalytics, groupReports] = await Promise.all([
    getVisitorAnalytics(12),
    getGroupReports(),
  ]);

  const { summary: visitorSummary } = visitorAnalytics;
  const { summary: groupSummary } = groupReports;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phase 8"
        title="Reports & analytics"
        description="Visitor conversion metrics and group membership/attendance summaries. Group report layouts can be refined once sample cell-group reports are shared."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card header={<p className="text-sm font-medium">Visitor conversion</p>}>
          <p className="text-3xl font-semibold text-foreground">
            {formatPercent(visitorSummary.convertedCount, visitorSummary.allTimeVisitors)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {visitorSummary.convertedCount} of {visitorSummary.allTimeVisitors} all-time visitors
          </p>
        </Card>
        <Card header={<p className="text-sm font-medium">Return rate (12 mo.)</p>}>
          <p className="text-3xl font-semibold text-foreground">
            {formatPercent(
              Math.round(visitorSummary.returnRate * visitorSummary.totalInRange),
              visitorSummary.totalInRange,
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Visitors who returned or progressed beyond first visit
          </p>
        </Card>
        <Card header={<p className="text-sm font-medium">Awaiting follow-up</p>}>
          <p className="text-3xl font-semibold text-foreground">
            {visitorSummary.awaitingFollowUp}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Assigned, in progress, or overdue next follow-up
          </p>
        </Card>
        <Card header={<p className="text-sm font-medium">Avg. time to member</p>}>
          <p className="text-3xl font-semibold text-foreground">
            {formatDays(visitorSummary.avgTimeToMember)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            From first visit to membership registration
          </p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card header={<p className="text-sm font-medium">Cell groups</p>}>
          <p className="text-3xl font-semibold text-foreground">{groupSummary.cellGroups}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">People in groups</p>}>
          <p className="text-3xl font-semibold text-foreground">{groupSummary.totalMembers}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Groups with attendance</p>}>
          <p className="text-3xl font-semibold text-foreground">
            {groupSummary.groupsWithAttendance}
          </p>
        </Card>
        <Card header={<p className="text-sm font-medium">Avg. cell attendance</p>}>
          <p className="text-3xl font-semibold text-foreground">
            {groupSummary.avgCellAttendance !== null
              ? Math.round(groupSummary.avgCellAttendance * 10) / 10
              : "—"}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          header={
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Visitor analytics</p>
              <Link href="/admin/reports/visitors">
                <Button variant="ghost" className="h-8 text-xs">
                  View full report
                </Button>
              </Link>
            </div>
          }
        >
          <p className="mb-3 text-sm text-muted-foreground">
            {visitorSummary.totalInRange} visitors in the last 12 months ·{" "}
            {visitorSummary.firstTimeInRange} still first-time
          </p>
          {visitorAnalytics.byMonth.slice(0, 6).length === 0 ? (
            <p className="text-sm text-muted-foreground">No visitor data yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {visitorAnalytics.byMonth.slice(0, 6).map((entry) => (
                <li
                  key={entry.key}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <span>{entry.label}</span>
                  <span className="font-medium">{entry.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          header={
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Cell group activity</p>
              <Link href="/admin/reports/groups">
                <Button variant="ghost" className="h-8 text-xs">
                  View full report
                </Button>
              </Link>
            </div>
          }
        >
          {groupReports.cellGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cell groups yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {groupReports.cellGroups.slice(0, 6).map((group) => (
                <li
                  key={group.id}
                  className="rounded-lg border border-border px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/admin/groups/${group.id}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {group.name}
                    </Link>
                    <span className="text-muted-foreground">
                      {group.totalPeople} people
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Avg. present: {group.avgAttendance ?? "—"} ·{" "}
                    {attendanceTrendLabel(group.attendanceTrend)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
