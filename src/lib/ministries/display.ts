import { MINISTRY_CLUSTERS } from "@/lib/church-ministries";

type MinistryOption = {
  id: string;
  name: string;
  clusterName: string | null;
};

export function groupMinistriesByCluster(ministries: MinistryOption[]) {
  const byCluster = new Map<string, MinistryOption[]>();

  for (const ministry of ministries) {
    const cluster = ministry.clusterName?.trim() || "Other";
    const list = byCluster.get(cluster) ?? [];
    list.push(ministry);
    byCluster.set(cluster, list);
  }

  const clusterOrder = MINISTRY_CLUSTERS.map((cluster) => cluster.title);
  const clusterTitleSet = new Set<string>(clusterOrder);
  const orderedClusters = [
    ...clusterOrder.filter((title) => byCluster.has(title)),
    ...[...byCluster.keys()].filter((title) => !clusterTitleSet.has(title)).sort(),
  ];

  return orderedClusters.map((title) => ({
    title,
    ministries: (byCluster.get(title) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  }));
}

type ZoneOption = {
  id: string;
  name: string;
  region: { id: string; name: string };
};

export function groupZonesByRegion(zones: ZoneOption[]) {
  const byRegion = new Map<string, ZoneOption[]>();

  for (const zone of zones) {
    const list = byRegion.get(zone.region.name) ?? [];
    list.push(zone);
    byRegion.set(zone.region.name, list);
  }

  return [...byRegion.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, zoneList]) => ({
      title,
      zones: zoneList.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
