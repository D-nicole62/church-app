import Link from "next/link";
import { Card } from "@/components/ui/card";
import { auth } from "@/auth";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { formatCurrency } from "@/lib/finance/format";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await auth();
  const [campusCount, groupCount, memberCount, visitorCount, eventCount, financeTotal] =
    await Promise.all([
      prisma.campus.count(),
      prisma.group.count(),
      prisma.member.count(),
      prisma.visitor.count(),
      prisma.event.count(),
      prisma.financeTransaction.aggregate({
        where: { status: "SUCCESSFUL" },
        _sum: { amount: true },
      }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Admin dashboard
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          TOD church operations
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Signed in as {session?.user.email} (
          {session?.user.role ? ROLE_LABELS[session.user.role] : "Admin"}).
          Phases 1–8 modules are available from the sidebar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card header={<p className="text-sm font-medium">Campuses</p>}>
          <p className="text-3xl font-semibold text-foreground">{campusCount}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Groups</p>}>
          <p className="text-3xl font-semibold text-foreground">{groupCount}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Members</p>}>
          <p className="text-3xl font-semibold text-foreground">{memberCount}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Visitors</p>}>
          <p className="text-3xl font-semibold text-foreground">{visitorCount}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Events</p>}>
          <p className="text-3xl font-semibold text-foreground">{eventCount}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Giving (YTD total)</p>}>
          <p className="text-2xl font-semibold text-foreground">
            {formatCurrency(financeTotal._sum.amount ?? 0)}
          </p>
        </Card>
      </div>

      <Card header={<p className="text-sm font-medium text-foreground">Quick links</p>}>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/admin/groups" className="font-medium text-primary underline-offset-4 hover:underline">
              Manage groups
            </Link>
          </li>
          <li>
            <Link href="/admin/members/new" className="font-medium text-primary underline-offset-4 hover:underline">
              Register a member
            </Link>
          </li>
          <li>
            <Link href="/admin/visitors" className="font-medium text-primary underline-offset-4 hover:underline">
              Review visitors
            </Link>
          </li>
          <li>
            <Link href="/admin/events/new" className="font-medium text-primary underline-offset-4 hover:underline">
              Create an event
            </Link>
          </li>
          <li>
            <Link href="/admin/finance" className="font-medium text-primary underline-offset-4 hover:underline">
              Review giving & finance
            </Link>
          </li>
          <li>
            <Link href="/admin/notifications" className="font-medium text-primary underline-offset-4 hover:underline">
              Notification log & visitor reminders
            </Link>
          </li>
          <li>
            <Link href="/admin/reports" className="font-medium text-primary underline-offset-4 hover:underline">
              Reports & analytics
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}
