import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EventImageField } from "@/components/admin/EventImageField";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminLookups } from "@/lib/admin/lookups";
import { createEventAction } from "@/lib/events/actions";

type NewEventPageProps = {
  searchParams?: Promise<{ error?: string; detail?: string }>;
};

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const query = (await searchParams) ?? {};
  const { campuses } = await getAdminLookups();
  const dbUnavailable = campuses.length === 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Events"
        title="Create event"
        description="Published events appear on the public events page."
      />
      {dbUnavailable ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Could not load campus options — check your database connection in{" "}
          <code className="font-mono text-xs">.env</code>. You can still create
          an event without selecting a campus.
        </p>
      ) : null}
      {query.error === "invalid-image" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {query.detail || "The image could not be uploaded."}
        </p>
      ) : null}
      <Card header={<p className="text-sm font-medium">Event details</p>}>
        <form action={createEventAction} className="space-y-4">
          <Input name="title" placeholder="Event title" required />
          <Textarea name="description" placeholder="Description" rows={3} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input type="datetime-local" name="startsAt" required />
            <Input type="datetime-local" name="endsAt" />
          </div>
          <Input name="location" placeholder="Location" />
          <EventImageField />
          <AdminSelect name="campusId" defaultValue="">
            <option value="">All campuses</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </AdminSelect>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="isFeatured" />
            Featured event
          </label>
          <Button type="submit">Create event</Button>
        </form>
      </Card>
    </div>
  );
}
