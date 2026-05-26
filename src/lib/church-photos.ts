/** Curated photos from public/images — used in slideshow and page sections */

export type ChurchPhoto = {
  src: string;
  alt: string;
};

const base = "/images/gallery";

export const slideshowPhotos: ChurchPhoto[] = [
  {
    src: `${base}/worship-youth.jpeg`,
    alt: "Youth and children worshipping together at Tabernacle of David Assembly",
  },
  {
    src: `${base}/worship-prayer.jpeg`,
    alt: "Congregation praying during a worship service",
  },
  {
    src: `${base}/community-celebration.jpeg`,
    alt: "Church community celebrating at a ribbon-cutting ceremony",
  },
  {
    src: `${base}/outreach-prayer.jpeg`,
    alt: "Ministry team praying with someone during community outreach",
  },
  {
    src: `${base}/outreach-teaching.jpeg`,
    alt: "Bible teaching during an outreach session",
  },
];

export const aboutGalleryPhotos: ChurchPhoto[] = [
  {
    src: `${base}/community-celebration.jpeg`,
    alt: "Church family gathered for a special celebration",
  },
  {
    src: `${base}/worship-prayer.jpeg`,
    alt: "Members worshipping and praying together",
  },
  {
    src: `${base}/children-ministry.jpeg`,
    alt: "Children gathered for ministry and teaching",
  },
];

export const missionsPhotos: ChurchPhoto[] = [
  {
    src: `${base}/outreach-prayer.jpeg`,
    alt: "Prayer and care during community outreach",
  },
  {
    src: `${base}/outreach-teaching.jpeg`,
    alt: "Sharing the Word during outreach",
  },
];

export const homeFeaturedPhoto: ChurchPhoto = {
  src: `${base}/worship-youth.jpeg`,
  alt: "Joyful worship with youth and children at TOD Assembly",
};

export const childrenChurchPhotos: ChurchPhoto[] = [
  {
    src: `${base}/children-ministry.jpeg`,
    alt: "Children gathered for teaching and ministry",
  },
  {
    src: `${base}/children-choir.jpeg`,
    alt: "Children's choir presenting during church",
  },
  {
    src: `${base}/children-worship.jpeg`,
    alt: "Children worshipping and performing together",
  },
  {
    src: `${base}/children-prayer.jpeg`,
    alt: "A leader praying with a child during ministry",
  },
  {
    src: `${base}/worship-youth.jpeg`,
    alt: "Youth and children raising hands in worship",
  },
];
