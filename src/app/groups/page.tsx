import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type Group = {
  id: string;
  name: string;
  description: string | null;
  meets_when: string | null;
  location: string | null;
  contact_name: string | null;
  contact_email: string | null;
};

export default async function GroupsPage() {
  if (!supabase) {
    return (
      <PageShell
        hero={
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
              Groups
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Circles where you can belong.
            </h1>
          </div>
        }
      >
        <p className="text-sm text-red-600 dark:text-red-300">
          We couldn&apos;t load groups right now. Please try again later.
        </p>
      </PageShell>
    );
  }

  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return (
      <PageShell
        hero={
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
              Groups
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Circles where you can belong.
            </h1>
          </div>
        }
      >
        <p className="text-sm text-red-600 dark:text-red-300">
          We couldn&apos;t load groups right now. Please try again later.
        </p>
      </PageShell>
    );
  }

  const groups = (data || []) as Group[];

  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            Groups
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Circles where you can belong.
          </h1>
          <p className="max-w-2xl text-sm text-white/85 sm:text-base">
            Find a smaller community where you can know others, be known, and
            grow together.
          </p>
        </div>
      }
    >
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Groups for the upcoming season will be announced soon. In the
          meantime, join us on Sundays and at other events.
        </p>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <Card
              key={group.id}
              header={
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {group.name}
                  </p>
                  {group.meets_when && (
                    <p className="text-xs text-muted-foreground">{group.meets_when}</p>
                  )}
                </div>
              }
              footer={
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {group.location && <span>{group.location}</span>}
                  {group.contact_email && (
                    <Link
                      href={`mailto:${group.contact_email}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Email leader
                    </Link>
                  )}
                </div>
              }
            >
              <p>{group.description}</p>
              {group.contact_name && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Led by {group.contact_name}
                </p>
              )}
            </Card>
          ))}
        </section>
      )}
    </PageShell>
  );
}

