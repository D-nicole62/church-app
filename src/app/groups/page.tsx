import Link from "next/link";
import { OpenHashedDetails } from "@/components/groups/OpenHashedDetails";
import { PageShell } from "@/components/layout/PageShell";
import {
  CELL_CHURCH_STRUCTURE,
  cellAnchor,
  regionAnchor,
} from "@/lib/cell-church-structure";
import { MINISTRY_CLUSTERS, clusterAnchor } from "@/lib/church-ministries";
import { CHURCH_NAME } from "@/lib/site";
import { isDatabaseConfigured } from "@/lib/db";
import { getPublicCellGroups } from "@/lib/groups/queries";

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
  let cellGroups: Awaited<ReturnType<typeof getPublicCellGroups>> = [];
  let loadError = false;

  if (isDatabaseConfigured()) {
    try {
      cellGroups = await getPublicCellGroups();
    } catch {
      loadError = true;
    }
  } else {
    loadError = true;
  }

  const groupsByName = new Map(
    cellGroups.map((group) => [group.name.trim().toLowerCase(), group]),
  );

  return (
    <PageShell hero={groupsHero}>
      <OpenHashedDetails />
      <section id="ministry-clusters" className="space-y-4 scroll-mt-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Ministry clusters
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a cluster to see the ministries in it.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {MINISTRY_CLUSTERS.map((cluster) => (
            <details
              key={cluster.title}
              id={clusterAnchor(cluster.title)}
              className="scroll-mt-6 rounded-2xl border border-border bg-card/90 p-4 shadow-sm"
            >
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                {cluster.title}
              </summary>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {cluster.ministries.map((ministry) => (
                  <li key={ministry}>{ministry}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <section id="cell-church-regions" className="space-y-4 scroll-mt-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Cell church regions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a region to see its zones and cells across {CHURCH_NAME}.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {CELL_CHURCH_STRUCTURE.regions.map((region) => (
            <details
              key={region.name}
              id={regionAnchor(region.name)}
              className="scroll-mt-6 rounded-2xl border border-border bg-card/90 p-4 shadow-sm"
            >
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                {region.name}
              </summary>
              <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                {region.zones.map((zone) => (
                  <li key={zone.name}>
                    <p className="font-medium text-foreground/90">{zone.name}</p>
                    {zone.cells.length > 0 ? (
                      <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1">
                        {zone.cells.map((cell) => (
                          <li key={cell}>
                            <a href={`#${cellAnchor(region.name, cell)}`}>{cell}</a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs italic">Cells to be announced</p>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <section id="cell-groups" className="space-y-4 scroll-mt-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Cell groups</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a cell group to see where it meets and who leads it.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {CELL_CHURCH_STRUCTURE.regions.flatMap((region) =>
            region.zones.flatMap((zone) =>
              zone.cells.map((cell) => {
                const group = groupsByName.get(cell.trim().toLowerCase());
                const leader = group?.memberships[0]?.person;

                return (
                  <details
                    key={`${region.name}-${cell}`}
                    id={cellAnchor(region.name, cell)}
                    className="scroll-mt-6 rounded-2xl border border-border bg-card/90 p-4 shadow-sm"
                  >
                    <summary className="cursor-pointer text-sm font-medium text-foreground">
                      {cell}
                    </summary>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p>
                        {region.name} · {zone.name}
                      </p>
                      {group?.meetsWhen ? <p>{group.meetsWhen}</p> : null}
                      {group?.location ? <p>{group.location}</p> : null}
                      {group?.description ? <p>{group.description}</p> : null}
                      {leader ? (
                        <p>
                          Led by {leader.firstName} {leader.lastName}
                          {leader.email ? (
                            <>
                              {" · "}
                              <Link
                                href={`mailto:${leader.email}`}
                                className="font-medium text-primary underline-offset-4 hover:underline"
                              >
                                Email leader
                              </Link>
                            </>
                          ) : null}
                        </p>
                      ) : null}
                    </div>
                  </details>
                );
              }),
            ),
          )}
        </div>
        {loadError ? (
          <p className="text-sm text-muted-foreground">
            Meeting details are unavailable right now.{" "}
            <Link
              href="/contact"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Contact us
            </Link>{" "}
            to get connected.
          </p>
        ) : null}
      </section>
    </PageShell>
  );
}
