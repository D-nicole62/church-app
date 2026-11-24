import Link from "next/link";
import { Field } from "@/components/forms/Field";
import { FormConsent } from "@/components/forms/FormConsent";
import { PhoneField } from "@/components/forms/PhoneField";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactAction } from "@/lib/contact/actions";
import { pageMetadata } from "@/lib/seo";
import {
  CHURCH_NAME,
  CONTACT,
  FACEBOOK_URL,
  PUBLIC_ADDRESS,
  SERVICE_TIMES,
  YOUTUBE_URL,
} from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description: `Contact ${CHURCH_NAME} at ${PUBLIC_ADDRESS}. Call, email, or send a message to the church office.`,
  path: "/contact",
});

const mapsQuery = `${CHURCH_NAME}, ${PUBLIC_ADDRESS}, Zambia`;
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery)}&z=16&output=embed`;

type ContactPageProps = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = (await searchParams) ?? {};
  const error = params.error;

  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            Contact
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            We&apos;d love to hear from you
          </h1>
        </div>
      }
      className="grid gap-8 md:grid-cols-[minmax(0,1.6fr),minmax(0,1.4fr)]"
    >
      <Card
        header={
          <h2 className="text-sm font-medium text-foreground">Send us a message</h2>
        }
      >
        {params.success === "1" ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            Thank you. Your message has been received and the church office will
            follow up.
          </div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error === "missing-required"
              ? "Please enter your name, email, and message."
              : error === "invalid-email"
                ? "Enter a valid email address."
                : error === "invalid-phone"
                  ? "Enter a valid phone number (e.g. 0971234567)."
                  : error === "unavailable"
                    ? `We can't store messages right now. Please email ${CONTACT.email}.`
                    : `Something went wrong while saving your message. Please email ${CONTACT.email}.`}
          </div>
        ) : null}
        <form action={submitContactAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="contact-name" label="Name *">
              <Input id="contact-name" name="name" autoComplete="name" required />
            </Field>
            <Field id="contact-email" label="Email *">
              <Input
                id="contact-email"
                type="email"
                name="email"
                autoComplete="email"
                required
              />
            </Field>
          </div>
          <Field id="contact-phone" label="Phone (optional)">
            <PhoneField id="contact-phone" />
          </Field>
          <Field id="contact-message" label="Message *">
            <Textarea id="contact-message" name="message" required />
          </Field>
          <FormConsent />
          <Button type="submit" className="w-full sm:w-auto">
            Send message
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        <Card
          header={<h2 className="text-sm font-medium text-foreground">Visit us</h2>}
        >
          <p className="text-sm text-muted-foreground">
            {PUBLIC_ADDRESS}
            <br />
            Zambia
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{CONTACT.postal}</p>
          <h3 className="mt-3 text-xs font-medium text-foreground">Sunday services</h3>
          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            {SERVICE_TIMES.map((service) => (
              <li key={service.id}>
                {service.label}: {service.time}
              </li>
            ))}
          </ul>
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-border">
            <iframe
              title={`Map search for ${CHURCH_NAME} along Given Lubinda Road, Lusaka`}
              src={mapsEmbed}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <Link
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Open in Google Maps
          </Link>
        </Card>

        <Card
          header={
            <h2 className="text-sm font-medium text-foreground">Contact details</h2>
          }
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              Call:{" "}
              {CONTACT.phones.map((phone, index) => (
                <span key={phone.tel}>
                  {index > 0 && " / "}
                  <Link
                    href={`tel:${phone.tel}`}
                    className="text-primary underline underline-offset-4 hover:opacity-90"
                  >
                    {phone.display}
                  </Link>
                </span>
              ))}
            </li>
            <li>
              Email:{" "}
              <Link
                href={`mailto:${CONTACT.email}`}
                className="text-primary underline underline-offset-4 hover:opacity-90"
              >
                {CONTACT.email}
              </Link>
            </li>
            <li>
              Facebook:{" "}
              <Link
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:opacity-90"
              >
                facebook.com/todassembly
              </Link>
            </li>
            <li>
              YouTube:{" "}
              <Link
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:opacity-90"
              >
                Watch on YouTube
              </Link>
            </li>
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
