import { CELL_CHURCH_STRUCTURE } from "@/lib/cell-church-structure";

/** TOD Assembly regions (cell church hierarchy). */
export const CHURCH_REGIONS = CELL_CHURCH_STRUCTURE.regions.map(
  (region) => region.name,
);

export type ChurchRegionName =
  (typeof CELL_CHURCH_STRUCTURE.regions)[number]["name"];
