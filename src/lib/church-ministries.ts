/** Ministry clusters and ministries (TOD Assembly org structure). */
export const MINISTRY_CLUSTERS = [
  {
    title: "Church Operations",
    ministries: [
      "Administration",
      "Finance & Stewardship",
      "Facilities & Maintenance",
      "Hospitality",
      "Ushers & Greeters",
      "Protocol & Security",
      "Creativity and Sanctuary Keepers",
      "Events",
    ],
  },
  {
    title: "Spiritual Formation & Discipleship",
    ministries: [
      "Worship & Music",
      "Prayer & Intercession",
      "Bible Study & Teaching",
      "Discipleship Programs",
      "Pre & Post Marriage Counselling",
      "Follow Up & Visitation",
    ],
  },
  {
    title: "Community & Engagement",
    ministries: [
      "Digital Communications",
      "Benevolence (Incl. Hearts of Compassion)",
      "Student Support",
    ],
  },
  {
    title: "Family Life & Support",
    ministries: [
      "Couples",
      "Men",
      "Women",
      "Youth",
      "Children's Church",
    ],
  },
  {
    title: "Projects & Business Ventures",
    ministries: [
      "Infrastructure Development",
      "Infrastructure Projects",
      "Land and property Acquisitions",
      "Legal (Contracts)",
      "TOD Capital Ventures",
    ],
  },
  {
    title: "Care and Counselling Cluster",
    ministries: [
      "Psychological & Social Support (PSS)",
      "Funeral Support",
      "Substance Abuse",
      "Post Sexual/ Traumatic Abuse",
      "Senior Citizens Care (incl. Dementia etc)",
      "Care for the Carers",
      "Pastoral Care",
    ],
  },
  {
    title: "Evangelism & Missions",
    ministries: ["Missions", "Evangelism"],
  },
] as const;

export type MinistryCluster = (typeof MINISTRY_CLUSTERS)[number];
export type MinistryName = MinistryCluster["ministries"][number];

/** Former seed entries that were cluster titles, not individual ministries. */
export const RETIRED_MINISTRY_GROUP_NAMES = [
  "The Cell Church",
  "Evangelism and Missions",
  "Church Operations",
  "Spiritual Formation and Discipleship",
  "Community and Engagement",
  "Family Life and Support",
  "Projects and Business Ventures",
  "Care and Counselling",
] as const;

export function getAllMinistryNames(): string[] {
  return MINISTRY_CLUSTERS.flatMap((cluster) => [...cluster.ministries]);
}

export function getMinistryCount(): number {
  return getAllMinistryNames().length;
}
