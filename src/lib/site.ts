/**
 * Church content from Website Write up-TOD.pptx
 * Public URLs can be overridden via .env.local
 */

export const CHURCH_NAME =
  "Tabernacle of David Assembly-City Mission Church";

export const CHURCH_NAME_SHORT = "TOD Assembly";

export const SENIOR_PASTOR = {
  name: "Bishop Harrison Sakala",
  title: "Senior Pastor",
} as const;

export const ESTABLISHED_YEAR = 2004;
export const LAUNCHED_DATE = "15 April 2005";

export const AFFILIATION =
  "Pentecostal Assemblies of God Zambia";

export const VISION =
  "One Church multiple campuses; Moving people from emptiness to fullness of life found in Christ.";

export const MISSION =
  "Tabernacle of David Assembly-City Mission Church is a Cell-Based Church whose mission is to contribute to the achievement of the Great Commission by equipping saints for the end time harvest of precious souls through the power of the Holy Spirit in partnership with strategic alliances worldwide.";

export const WELCOME_INTRO =
  "We are delighted to welcome you to our church family and online platform.";

export const WELCOME_BODY = [
  `Established in ${ESTABLISHED_YEAR}, ${CHURCH_NAME} is a Bible-believing church committed to spreading the Gospel of Jesus Christ and reaching the lost with the message of hope and salvation.`,
  "We believe that church is a perfect place for imperfect people to meet a perfect Christ.",
] as const;

export const WELCOME_CLOSING =
  "It is our prayer that as you fellowship with us, you will experience the love and grace found in Jesus Christ. May God richly bless you and your family.";

export const WHO_WE_ARE = [
  `${CHURCH_NAME} is a ministry under the ${AFFILIATION}. It is a Pentecostal, cell-based church with a strong emphasis on evangelism and missions, focusing on reaching out to communities with the Gospel of Jesus Christ.`,
  "The church is more outward-looking than inward-looking, with a passion for winning souls and impacting lives through ministry and outreach.",
  `The church was established in ${ESTABLISHED_YEAR} by Bishop Harrison Sakala and his dear wife, the late Rev. Elizabeth Sakala, and was officially launched on ${LAUNCHED_DATE}.`,
] as const;

export const CHILDREN_CHURCH = {
  title: "Children's Church",
  subtitle: "A safe, joyful place for kids to know Jesus",
  description: [
    "Our Children's Church helps boys and girls encounter Jesus through age-appropriate worship, Bible stories, and caring leaders—while parents worship in the main service.",
    "We want every child to feel welcomed, loved, and excited to learn about God's Word in a fun and safe environment.",
  ],
  highlights: [
    "Available during Sunday services for children",
    "Engaging worship and Bible teaching tailored for kids",
    "Caring volunteers who prioritize safety and encouragement",
    "Families welcome—let us know when you are visiting",
  ],
} as const;

export const SERVICE_TIMES = [
  { id: "first", label: "First Service", time: "07:00 – 08:30" },
  { id: "second", label: "Second Service", time: "09:00 – 10:30" },
  {
    id: "youth",
    label: "Youth Service (Potter's Wheel)",
    time: "11:00 – 12:30",
  },
] as const;

export const CONTACT = {
  phones: [
    { display: "0977 819404", tel: "+260977819404" },
    { display: "0966 788234", tel: "+260966788234" },
  ],
  email: "church@todassembly.com",
  address: "Along Given Lubinda Road (formerly Lilayi Road)",
  city: "Lusaka, Zambia",
  postal: "P.O. Box 32089, Lusaka, Zambia",
} as const;

export { MINISTRY_CLUSTERS } from "@/lib/church-ministries";

export const FACEBOOK_URL =
  process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() ||
  "https://www.facebook.com/todassembly";

export const YOUTUBE_URL =
  process.env.NEXT_PUBLIC_YOUTUBE_URL?.trim() ||
  "https://www.youtube.com/@TabernacleofDavidAssembly";

export const SITE_DESCRIPTION =
  "A Bible-believing, cell-based church in Lusaka committed to the Gospel, evangelism, and equipping saints for the Great Commission.";
