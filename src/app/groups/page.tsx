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
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return (
      <PageShell
        hero={
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
              Groups
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
            Groups
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Circles where you can belong.
          </h1>
          <p className="max-w-2xl text-sm text-zinc-200 sm:text-base">
            Find a smaller community where you can know others, be known, and
            grow together.
          </p>
        </div>
      }
    >
      {groups.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
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
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {group.name}
                  </p>
                  {group.meets_when && (
                    <p className="text-xs text-zinc-500">{group.meets_when}</p>
                  )}
                </div>
              }
              footer={
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  {group.location && <span>{group.location}</span>}
                  {group.contact_email && (
                    <Link
                      href={`mailto:${group.contact_email}`}
                      className="font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-200"
                    >
                      Email leader
                    </Link>
                  )}
                </div>
              }
            >
              <p>{group.description}</p>
              {group.contact_name && (
                <p className="mt-3 text-xs text-zinc-500">
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

