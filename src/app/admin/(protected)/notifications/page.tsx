import { NotificationKind } from "@/generated/prisma/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
import { getNotificationSummary } from "@/lib/notifications/actions";

const KIND_LABELS: Record<NotificationKind, string> = {
  EVENT_REMINDER: "Event reminder",
  GROUP_ANNOUNCEMENT: "Group announcement",
  VISITOR_FOLLOW_UP: "Visitor follow-up",
  VISITOR_AUTOMATED_REMINDER: "Visitor auto-reminder",
  CONTACT_INQUIRY: "Contact message",
  CONTACT_CONFIRMATION: "Contact confirmation",
  VISITOR_SIGNUP: "Visit signup",
  VISITOR_CONFIRMATION: "Visit confirmation",
  EMAIL_TEST: "Test email",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  SENT: "Sent",
  FAILED: "Failed",
  SKIPPED: "Skipped",
};

export default async function AdminNotificationsPage() {
  const { recent, sentCount, failedCount, skippedCount } =
    await getNotificationSummary();

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Phase 7" title="Notifications" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card header={<p className="text-sm font-medium">Sent</p>}>
          <p className="text-3xl font-semibold text-foreground">{sentCount}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Failed</p>}>
          <p className="text-3xl font-semibold text-foreground">{failedCount}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Skipped</p>}>
          <p className="text-3xl font-semibold text-foreground">{skippedCount}</p>
          {/*
          <p className="mt-1 text-xs text-muted-foreground">
            Usually means email/SMS provider keys are not configured yet.
          </p>
          */}
        </Card>
      </div>

      <Card header={<p className="text-sm font-medium">Automated visitor reminders</p>}>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Follow-up date due or overdue</li>
          <li>Not contacted in {process.env.VISITOR_NOT_CONTACTED_DAYS || 7} days</li>
          <li>Returned visitor (status: Returning)</li>
          <li>Interested / returning but not in a cell group</li>
        </ul>
      </Card>

      <Card header={<p className="text-sm font-medium">Recent deliveries</p>}>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">When</th>
                  <th className="px-2 py-2">Kind</th>
                  <th className="px-2 py-2">Channel</th>
                  <th className="px-2 py-2">Recipient</th>
                  <th className="px-2 py-2">Image</th>
                  <th className="px-2 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/60">
                    <td className="px-2 py-3 text-muted-foreground">
                      {entry.createdAt.toLocaleString()}
                    </td>
                    <td className="px-2 py-3">
                      {KIND_LABELS[entry.kind] ?? entry.kind}
                    </td>
                    <td className="px-2 py-3">{entry.channel}</td>
                    <td className="px-2 py-3 font-mono text-xs">{entry.recipient}</td>
                    <td className="px-2 py-3">
                      {entry.imageUrl ? (
                        <a href={entry.imageUrl} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={entry.imageUrl}
                            alt=""
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {STATUS_LABELS[entry.status] ?? entry.status}
                      {entry.errorMessage ? (
                        <span className="block text-xs text-red-600">
                          {entry.errorMessage}
                        </span>
                      ) : null}
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
