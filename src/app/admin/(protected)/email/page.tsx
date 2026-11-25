import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth/guard";
import { sendTestEmailAction } from "@/lib/mail/actions";
import { describeMailSetup } from "@/lib/mail/config";
import { churchInbox } from "@/lib/mail/notify";

type EmailSettingsPageProps = {
  searchParams?: Promise<{ error?: string; success?: string; detail?: string }>;
};

export default async function EmailSettingsPage({ searchParams }: EmailSettingsPageProps) {
  await requireAdmin();
  const query = (await searchParams) ?? {};
  const setup = describeMailSetup(process.env, churchInbox());
  const detail = query.detail ? decodeURIComponent(query.detail) : "";
  const providerLabel =
    setup.provider === "resend"
      ? "Resend"
      : setup.provider === "smtp"
        ? "SMTP"
        : "Not configured";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Email"
        title="Email settings"
        description="See which sender is configured and send a test. Secrets stay on the server."
      />
      {query.success === "sent" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Test email sent. Check the inbox, and the notification log if it does not arrive.
        </p>
      ) : null}
      {query.error === "invalid-email" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Enter a valid email address.
        </p>
      ) : null}
      {query.error === "send-failed" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {detail || "The test email was not sent."}
        </p>
      ) : null}

      <Card header={<p className="text-sm font-medium">Current setup</p>}>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Provider</dt>
            <dd>{providerLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">From</dt>
            <dd>{setup.from || "Not set"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Church inbox for form notices</dt>
            <dd>{setup.inbox}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Resend key</dt>
            <dd>{setup.resendKeySource ? `Set in ${setup.resendKeySource}` : "Not set"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">SMTP</dt>
            <dd>
              {setup.smtpHost
                ? `${setup.smtpHost}:${setup.smtpPort ?? "—"} · ${setup.smtpUser} · ${setup.smtpSecure ? "SSL" : "STARTTLS"}`
                : "Not set"}
            </dd>
          </div>
          {setup.reason ? (
            <div>
              <dt className="text-xs text-muted-foreground">What is missing</dt>
              <dd>{setup.reason}</dd>
            </div>
          ) : null}
        </dl>
      </Card>

      <Card header={<p className="text-sm font-medium">Send a test email</p>}>
        <form action={sendTestEmailAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="test-email" className="mb-1 block text-xs font-medium">Send to</label>
            <Input id="test-email" name="to" type="email" placeholder="you@example.com" required />
          </div>
          <Button type="submit">Send test</Button>
        </form>
      </Card>
    </div>
  );
}
