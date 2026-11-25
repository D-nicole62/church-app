import { Field } from "@/components/forms/Field";
import { PhoneField } from "@/components/forms/PhoneField";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isPlaceholderEvent } from "@/lib/content/placeholder-records";
import { queryDatabase } from "@/lib/db";
import { getPublicEvents } from "@/lib/events/queries";
import { rsvpToEventAction } from "@/lib/events/actions";
import { pageMetadata } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

export const metadata = pageMetadata({
  title: "Events",
  description:
    "Upcoming gatherings at Tabernacle of David Assembly-City Mission Church in Lusaka, and a way to RSVP.",
  path: "/events",
});

function formatDateRange(startsAt: Date, endsAt: Date | null) {
  const startDate = startsAt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startTime = startsAt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (!endsAt) {
    return `${startDate} · ${startTime}`;
  }

  const sameDay =
    startsAt.getFullYear() === endsAt.getFullYear() &&
    startsAt.getMonth() === endsAt.getMonth() &&
    startsAt.getDate() === endsAt.getDate();

  const endTime = endsAt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (sameDay) {
    return `${startDate} · ${startTime}–${endTime}`;
  }

  const endDate = endsAt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${startDate} ${startTime} → ${endDate} ${endTime}`;
}

type EventsPageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const now = new Date();
  let events: Awaited<ReturnType<typeof getPublicEvents>> = [];
  let loadError = false;

  const prismaEvents = await queryDatabase(() => getPublicEvents(), null);
  if (prismaEvents) {
    events = prismaEvents;
  } else if (supabase) {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true });

    if (error) {
      loadError = true;
    } else {
      events = (data || []).map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startsAt: new Date(event.starts_at),
        endsAt: event.ends_at ? new Date(event.ends_at) : null,
        location: event.location,
        imageUrl: event.image_url ?? null,
        isFeatured: event.is_featured,
        campusId: null,
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.created_at),
      }));
    }
  } else {
    loadError = true;
  }

  events = events.filter((event) => !isPlaceholderEvent(event));

  const upcoming = events.filter((event) => event.startsAt >= now);
  const past = events.filter((event) => event.startsAt < now).reverse();
  const hasPastOnly = upcoming.length === 0 && past.length > 0;

  const hero = (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
        Events
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Upcoming gatherings at TOD.
      </h1>
      <p className="max-w-2xl text-sm text-white/85 sm:text-base">
        Worship services, classes, groups, and ways to serve—there&apos;s a
        next step for you.
      </p>
    </div>
  );

  if (loadError) {
    return (
      <PageShell hero={hero}>
        <p className="text-sm text-red-600 dark:text-red-300">
          We weren&apos;t able to load events right now. Please try again later.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell hero={hero}>
      {params?.success === "rsvp" && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          Thanks for your RSVP. We look forward to seeing you.
        </div>
      )}
      {params?.error === "invalid-phone" ||
      params?.error === "invalid-email" ||
      params?.error === "rsvp-invalid" ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {params.error === "invalid-phone"
            ? "Enter a valid phone number (e.g. 0971234567)."
            : params.error === "invalid-email"
              ? "Enter a valid email address."
              : "Please enter your name and at least an email or phone number."}
        </div>
      ) : null}

      <section className="space-y-6">
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Upcoming
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {hasPastOnly
                ? "There are no upcoming events right now. See recent events below, or join us on Sunday."
                : "There are no upcoming events scheduled right now. Check back soon or join us on Sunday."}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((event) => (
                <Card
                  key={event.id}
                  header={
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {formatDateRange(event.startsAt, event.endsAt)}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {event.title}
                      </p>
                    </div>
                  }
                  footer={
                    event.location ? (
                      <p className="text-xs text-muted-foreground">
                        {event.location}
                      </p>
                    ) : undefined
                  }
                >
                  {event.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="mb-3 h-44 w-full rounded-xl object-cover"
                    />
                  ) : null}
                  <p>{event.description}</p>
                  {prismaEvents && (
                    <form action={rsvpToEventAction} className="mt-4 space-y-2 border-t border-border pt-4">
                      <input type="hidden" name="eventId" value={event.id} />
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        RSVP
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Field id={`rsvp-first-${event.id}`} label="First name">
                          <Input
                            id={`rsvp-first-${event.id}`}
                            name="firstName"
                            autoComplete="given-name"
                            required
                          />
                        </Field>
                        <Field id={`rsvp-last-${event.id}`} label="Last name">
                          <Input
                            id={`rsvp-last-${event.id}`}
                            name="lastName"
                            autoComplete="family-name"
                            required
                          />
                        </Field>
                        <Field id={`rsvp-email-${event.id}`} label="Email (optional)">
                          <Input
                            id={`rsvp-email-${event.id}`}
                            type="email"
                            name="email"
                            autoComplete="email"
                          />
                        </Field>
                        <Field id={`rsvp-phone-${event.id}`} label="Phone (optional)">
                          <PhoneField id={`rsvp-phone-${event.id}`} />
                        </Field>
                      </div>
                      <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                        I&apos;ll be there
                      </Button>
                    </form>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {past.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Recent
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {past.slice(0, 4).map((event) => (
                <Card
                  key={event.id}
                  header={
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {formatDateRange(event.startsAt, event.endsAt)}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {event.title}
                      </p>
                    </div>
                  }
                >
                  {event.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="mb-3 h-32 w-full rounded-xl object-cover"
                    />
                  ) : null}
                  <p className="line-clamp-2 text-ellipsis">
                    {event.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
