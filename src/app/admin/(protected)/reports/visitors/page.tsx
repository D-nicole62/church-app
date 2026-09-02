import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDays, formatPercent } from "@/lib/reports/format";
import { getVisitorAnalytics } from "@/lib/reports/visitor-analytics";

const STATUS_LABELS: Record<string, string> = {
  FIRST_TIME: "First-time",
  RETURNING: "Returning",
  FOLLOW_UP_ASSIGNED: "Follow-up assigned",
  IN_PROGRESS: "In progress",
  MEMBER_REGISTERED: "Member registered",
  NO_LONGER_ATTENDING: "No longer attending",
};

type VisitorReportsPageProps = {
  searchParams?: Promise<{ months?: string }>;
};

export default async function VisitorReportsPage({
  searchParams,
}: VisitorReportsPageProps) {
  const query = (await searchParams) ?? {};
  const monthsBack = Number.parseInt(query.months || "12", 10);
  const safeMonths = Number.isNaN(monthsBack) ? 12 : Math.min(Math.max(monthsBack, 1), 36);

  const analytics = await getVisitorAnalytics(safeMonths);
  const { summary } = analytics;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Reports"
        title="Visitor analytics"
        description="First-timers by month, campus, and service — plus conversion and follow-up metrics."
        action={
          <Link href="/admin/reports">
            <Button variant="secondary">Back to reports</Button>
          </Link>
        }
      />

      <Card header={<p className="text-sm font-medium">Time range</p>}>
        <div className="flex flex-wrap gap-2">
          {[6, 12, 24].map((months) => (
            <Link key={months} href={`/admin/reports/visitors?months=${months}`}>
              <Button
                variant={safeMonths === months ? "primary" : "secondary"}
                className="h-8 text-xs"
              >
                Last {months} months
              </Button>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card header={<p className="text-sm font-medium">Visitors in range</p>}>
          <p className="text-3xl font-semibold">{summary.totalInRange}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Conversion rate</p>}>
          <p className="text-3xl font-semibold">
            {formatPercent(summary.convertedCount, summary.allTimeVisitors)}
          </p>
        </Card>
        <Card header={<p className="text-sm font-medium">Return rate</p>}>
          <p className="text-3xl font-semibold">
            {formatPercent(
              Math.round(summary.returnRate * summary.totalInRange),
              summary.totalInRange,
            )}
          </p>
        </Card>
        <Card header={<p className="text-sm font-medium">Awaiting follow-up</p>}>
          <p className="text-3xl font-semibold">{summary.awaitingFollowUp}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Avg. time to member</p>}>
          <p className="text-3xl font-semibold">{formatDays(summary.avgTimeToMember)}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportTable
          title="First-timers by month"
          rows={analytics.byMonth.map((entry) => ({
            label: entry.label,
            count: entry.count,
          }))}
        />
        <ReportTable
          title="By campus"
          rows={analytics.byCampus.map((entry) => ({
            label: entry.label,
            count: entry.count,
          }))}
        />
        <ReportTable
          title="By service attended"
          rows={analytics.byService.map((entry) => ({
            label: entry.label,
            count: entry.count,
          }))}
        />
        <Card header={<p className="text-sm font-medium">Pipeline status</p>}>
          {analytics.statusCounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visitors in this range.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {analytics.statusCounts.map((entry) => (
                <li
                  key={entry.status}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <span>{STATUS_LABELS[entry.status] ?? entry.status}</span>
                  <span className="font-medium">{entry.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function ReportTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  return (
    <Card header={<p className="text-sm font-medium">{title}</p>}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <span className="truncate pr-3">{row.label}</span>
              <span className="font-medium">{row.count}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
