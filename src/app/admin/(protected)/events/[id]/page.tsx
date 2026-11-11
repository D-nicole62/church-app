import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { DeleteEventButton } from "@/components/admin/DeleteEventButton";
import { EventImageField } from "@/components/admin/EventImageField";
import { NotificationComposer } from "@/components/admin/NotificationComposer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminLookups } from "@/lib/admin/lookups";
import { toChurchDateTimeLocalValue } from "@/lib/events/datetime";
import { deleteEventAction, updateEventAction } from "@/lib/events/actions";
import { sendEventReminderAction } from "@/lib/notifications/actions";
import { getGroupOptionsForEvent } from "@/lib/notifications/audience";
import { prisma } from "@/lib/prisma";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string; detail?: string }>;
};

function toLocalInputValue(date: Date) {
  return toChurchDateTimeLocalValue(date);
}

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const [event, lookups, groupOptions] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        rsvps: {
          include: { person: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    getAdminLookups(),
    getGroupOptionsForEvent(id),
  ]);

  if (!event) {
    notFound();
  }

  const updateAction = updateEventAction.bind(null, id);
  const reminderAction = sendEventReminderAction.bind(null, id);
  const defaultBody = `Hi {name},\n\nReminder: ${event.title} is coming up on ${event.startsAt.toLocaleString()}${event.location ? ` at ${event.location}` : ""}.\n\nWe look forward to seeing you!`;

  return (
    <div className="space-y-6">
      {query.error === "missing-message" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Please enter a message before sending.
        </p>
      ) : null}
      {query.error === "invalid-image" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {query.detail || "The image could not be uploaded."}
        </p>
      ) : null}
      {query.error === "no-recipients" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No recipients found for the selected audience and channel.
        </p>
      ) : null}
      {query.success === "reminder-sent" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Event reminder queued and logged.
        </p>
      ) : null}
      <AdminPageHeader
        eyebrow="Events"
        title={event.title}
        description={`${event.rsvps.length} RSVP(s)`}
        action={
          <Link href="/admin/events">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />

      <Card header={<p className="text-sm font-medium">Edit event</p>}>
        <form action={updateAction} className="space-y-4">
          <Input name="title" defaultValue={event.title} required />
          <Textarea
            name="description"
            defaultValue={event.description ?? ""}
            rows={3}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="datetime-local"
              name="startsAt"
              defaultValue={toLocalInputValue(event.startsAt)}
              required
            />
            <Input
              type="datetime-local"
              name="endsAt"
              defaultValue={event.endsAt ? toLocalInputValue(event.endsAt) : ""}
            />
          </div>
          <Input name="location" defaultValue={event.location ?? ""} />
          <EventImageField currentUrl={event.imageUrl} />
          <AdminSelect name="campusId" defaultValue={event.campusId ?? ""}>
            <option value="">All campuses</option>
            {lookups.campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </AdminSelect>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={event.isFeatured}
            />
            Featured event
          </label>
          <Button type="submit">Save changes</Button>
        </form>
      </Card>

      <Card header={<p className="text-sm font-medium">Send reminder</p>}>
        <NotificationComposer
          action={reminderAction}
          submitLabel="Send event reminder"
          defaultSubject={`Reminder: ${event.title}`}
          defaultBody={defaultBody}
          showAudience
          groupOptions={groupOptions.map((group) => ({
            id: group.id,
            name: group.name,
          }))}
        />
      </Card>

      <Card header={<p className="text-sm font-medium">RSVPs</p>}>
        {event.rsvps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No RSVPs yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {event.rsvps.map((rsvp) => (
              <li key={rsvp.id} className="rounded-lg border border-border px-3 py-2">
                {rsvp.person.firstName} {rsvp.person.lastName}
                {rsvp.person.email ? ` · ${rsvp.person.email}` : ""}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <DeleteEventButton action={deleteEventAction.bind(null, id)} />
    </div>
  );
}
