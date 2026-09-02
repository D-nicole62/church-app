import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

type AdminEventsPageProps = {
  searchParams?: Promise<{ success?: string }>;
};

export default async function AdminEventsPage({ searchParams }: AdminEventsPageProps) {
  const query = (await searchParams) ?? {};
  const events = await prisma.event.findMany({
    include: { _count: { select: { rsvps: true } } },
    orderBy: { startsAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phase 5"
        title="Events"
        description="Create events that appear on the public /events page with RSVP capture."
        action={
          <Link href="/admin/events/new">
            <Button>New event</Button>
          </Link>
        }
      />

      {query.success === "created" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Event created. It will appear on the public{" "}
          <Link href="/events" className="font-medium underline underline-offset-4">
            events page
          </Link>{" "}
          if the start date is still in the future.
        </p>
      ) : null}
      {query.success === "updated" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Event updated.
        </p>
      ) : null}
      {query.success === "deleted" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Event deleted.
        </p>
      ) : null}

      <Card header={<p className="text-sm font-medium">All events</p>}>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">Title</th>
                  <th className="px-2 py-2">Starts</th>
                  <th className="px-2 py-2">RSVPs</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-border/60">
                    <td className="px-2 py-3 font-medium">{event.title}</td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {event.startsAt.toLocaleString()}
                    </td>
                    <td className="px-2 py-3">{event._count.rsvps}</td>
                    <td className="px-2 py-3 text-right">
                      <Link
                        href={`/admin/events/${event.id}`}
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
