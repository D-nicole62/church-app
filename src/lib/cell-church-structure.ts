/** Region → zone → cell group hierarchy (TOD Assembly cell church). */
export const CELL_CHURCH_STRUCTURE = {
  regions: [
    {
      name: "Central",
      zones: [
        { name: "Zone 1", cells: ["Nasser Cell"] },
        { name: "Zone 2", cells: ["Nyumba Yanga Ibex", "Woodlands"] },
      ],
    },
    {
      name: "Chilanga/Kafue",
      zones: [
        { name: "Chilanga", cells: ["Chilanga"] },
        { name: "Chawama", cells: ["Chawama"] },
        {
          name: "Lilayi",
          cells: [
            "Lilayi Cell 1",
            "Lilayi Cell 2",
            "Lilayi Cell 3",
            "Lilayi Cell 4",
            "Lilayi Cell 1A",
            "Lilayi Cell 1B",
          ],
        },
      ],
    },
    {
      name: "Eastern",
      zones: [
        {
          name: "Zone 1 (Ibex & surrounding)",
          cells: ["Meanwood Ibex", "Meanwood"],
        },
        {
          name: "Zone 2 (Chelstone & surrounding)",
          cells: ["Chelstone", "UNZA Cell"],
        },
        { name: "Zone 3 (Mutendere)", cells: [] },
        {
          name: "Zone 4 (Meanwood Kwamwena)",
          cells: ["Meanwood Kwamwena"],
        },
        {
          name: "Zone 5 (Meanwood Ndeke)",
          cells: ["Meanwood Ndeke"],
        },
      ],
    },
    {
      name: "Southeast II",
      zones: [
        { name: "Zone 1", cells: ["Water Works Cell"] },
        { name: "Zone 2", cells: ["Libala South"] },
        { name: "Zone 3", cells: ["Kamwala South 1"] },
        { name: "Zone 4", cells: ["Kamwala South 4", "Kamwala Cell"] },
        { name: "Zone 5", cells: ["Kabwata Cell"] },
      ],
    },
    {
      name: "Northern Region",
      zones: [
        { name: "Zone 1", cells: ["Cell 2 Zone 1"] },
        {
          name: "Zone 2",
          cells: ["Cell 2 Zone 3", "Cell 3 Zone 2", "Cell 4 Zone 2"],
        },
      ],
    },
    {
      name: "Northwestern",
      zones: [
        { name: "Matero", cells: ["Matero East"] },
        { name: "Kasupe", cells: ["Kasupe Cell"] },
        { name: "Living Waters", cells: ["Living Waters Cell"] },
      ],
    },
    {
      name: "Western",
      zones: [
        { name: "Garden House", cells: ["Garden House Cell"] },
        {
          name: "Makeni",
          cells: ["New Makeni Farm Cell", "Saint Bonaventure Cell"],
        },
        { name: "Chinika", cells: [] },
      ],
    },
    {
      name: "South East I",
      zones: [
        { name: "Zone 1", cells: ["Libala Zone 1 Cell 1"] },
        { name: "Zone 2", cells: ["Chilenje Zone 2 Cell 1"] },
        {
          name: "Zone 3",
          cells: [
            "Choppies 1 Zone 3 Cell 1",
            "Choppies 2 Zone 3 Cell 2",
            "Zone 3 Cell 3",
          ],
        },
        {
          name: "Zone 4",
          cells: [
            "Chalala Zone 4 Cell 1",
            "Chalala Zone 4 Cell 2",
            "Chalala Zone 4 Cell 3",
          ],
        },
      ],
    },
  ],
} as const;

export type CellChurchRegion = (typeof CELL_CHURCH_STRUCTURE.regions)[number];

export function getCellChurchRegionNames(): string[] {
  return CELL_CHURCH_STRUCTURE.regions.map((region) => region.name);
}

/** Former cell / zone labels replaced by corrected spellings in seed. */
export const RETIRED_CELL_CHURCH_NAMES = {
  cells: ["Gardern House Cell", "Saint Bornaventure Cell", "Living Water Cell"],
  zones: [{ regionName: "Western", zoneName: "Gardern House" }],
} as const;

export function countCellChurchCells(): number {
  return CELL_CHURCH_STRUCTURE.regions.reduce(
    (total, region) =>
      total +
      region.zones.reduce((zoneTotal, zone) => zoneTotal + zone.cells.length, 0),
    0,
  );
}
