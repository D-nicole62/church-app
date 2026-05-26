import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { CHURCH_NAME, MINISTRY_CLUSTERS } from "@/lib/site";
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

const groupsHero = (
  <div className="space-y-3">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
      Groups &amp; ministries
    </p>
    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
      Cell church &amp; ministry clusters
    </h1>
    <p className="max-w-2xl text-sm text-white/85 sm:text-base">
      {CHURCH_NAME} is organized around cells and ministry clusters that equip
      believers and serve our community.
    </p>
  </div>
);

export default async function GroupsPage() {
  let groups: Group[] = [];
  let loadError = false;

  if (supabase) {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      loadError = true;
    } else {
      groups = (data || []) as Group[];
    }
  } else {
    loadError = true;
  }

  return (
    <PageShell hero={groupsHero}>
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Ministry clusters
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            How we structure ministry across the church.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {MINISTRY_CLUSTERS.map((cluster) => (
            <Card
              key={cluster.title}
              header={
                <p className="text-sm font-medium text-foreground">
                  {cluster.title}
                </p>
              }
            >
              <p className="text-sm text-muted-foreground">
                {cluster.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Cell groups</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect with a smaller community for fellowship and growth.
          </p>
        </div>

        {loadError ? (
          <p className="text-sm text-muted-foreground">
            Cell groups for the upcoming season will be announced soon. In the
            meantime, worship with us on Sundays or{" "}
            <Link
              href="/contact"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              contact us
            </Link>{" "}
            to get connected.
          </p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Cell groups for the upcoming season will be announced soon. In the
            meantime, join us on Sundays and connect through our ministry
            clusters.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => (
              <Card
                key={group.id}
                header={
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {group.name}
                    </p>
                    {group.meets_when && (
                      <p className="text-xs text-muted-foreground">
                        {group.meets_when}
                      </p>
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
          </div>
        )}
      </section>
    </PageShell>
  );
}
