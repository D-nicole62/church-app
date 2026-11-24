import { CHURCH_NAME, CONTACT, FACEBOOK_URL, SITE_URL, YOUTUBE_URL } from "@/lib/site";

const services = [
  { opens: "07:00", closes: "08:30" },
  { opens: "09:00", closes: "10:30" },
  { opens: "11:00", closes: "12:30" },
] as const;

export function ChurchJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": `${SITE_URL}/#church`,
    name: CHURCH_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/icons/og.png`,
    logo: `${SITE_URL}/icons/icon-512.png`,
    email: CONTACT.email,
    telephone: CONTACT.phones.map((phone) => phone.tel),
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address,
      addressLocality: "Lusaka",
      addressCountry: "ZM",
    },
    openingHoursSpecification: services.map((service) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "https://schema.org/Sunday",
      opens: service.opens,
      closes: service.closes,
    })),
    sameAs: [FACEBOOK_URL, YOUTUBE_URL],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
