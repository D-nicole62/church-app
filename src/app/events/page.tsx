import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type Event = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  is_featured: boolean;
};

function formatDateRange(startsAt: string, endsAt: string | null) {
  const start = new Date(startsAt);
  const startDate = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startTime = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (!endsAt) {
    return `${startDate} · ${startTime}`;
  }

  const end = new Date(endsAt);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const endTime = end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (sameDay) {
    return `${startDate} · ${startTime}–${endTime}`;
  }

  const endDate = end.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${startDate} ${startTime} → ${endDate} ${endTime}`;
}

export default async function EventsPage() {
  const nowIso = new Date().toISOString();

  if (!supabase) {
    return (
      <PageShell
        hero={
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
              Events
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Upcoming gatherings at TOD.
            </h1>
          </div>
        }
      >
        <p className="text-sm text-red-600 dark:text-red-300">
          We weren&apos;t able to load events right now. Please try again later.
        </p>
      </PageShell>
    );
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) {
    // In a real app you might log this
    return (
      <PageShell
        hero={
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
              Events
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Upcoming gatherings at TOD.
            </h1>
          </div>
        }
      >
        <p className="text-sm text-red-600 dark:text-red-300">
          We weren&apos;t able to load events right now. Please try again
          later.
        </p>
      </PageShell>
    );
  }

  const events = (data || []) as Event[];
  const upcoming = events.filter((e) => e.starts_at >= nowIso);
  const past = events.filter((e) => e.starts_at < nowIso).reverse();

  return (
    <PageShell
      hero={
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
      }
    >
      <section className="space-y-6">
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Upcoming
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              There are no upcoming events scheduled right now. Check back soon
              or join us on Sunday.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((event) => (
                <Card
                  key={event.id}
                  header={
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {formatDateRange(event.starts_at, event.ends_at)}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {event.title}
                      </p>
                    </div>
                  }
                  footer={
                    event.location && (
                      <p className="text-xs text-muted-foreground">
                        {event.location}
                      </p>
                    )
                  }
                >
                  <p>{event.description}</p>
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
                        {formatDateRange(event.starts_at, event.ends_at)}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {event.title}
                      </p>
                    </div>
                  }
                >
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

