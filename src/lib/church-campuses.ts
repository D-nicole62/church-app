/** TOD Assembly campuses (membership, visitors, events). */
export const CHURCH_CAMPUSES = [
  "City Mission Campus",
  "Kasama",
  "Situmbeko",
  "Chideza Miracle Centre",
  "Pondo Emmanuel Church",
  "Lilongwe Malawi",
] as const;

export type ChurchCampusName = (typeof CHURCH_CAMPUSES)[number];

/** Church-wide ministries are seeded against this campus (HQ). */
export const PRIMARY_CAMPUS_NAME: ChurchCampusName = "City Mission Campus";
