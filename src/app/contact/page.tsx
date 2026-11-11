import Link from "next/link";
import { PhoneField } from "@/components/forms/PhoneField";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT, FACEBOOK_URL, SERVICE_TIMES, YOUTUBE_URL } from "@/lib/site";

export default function ContactPage() {
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
      <Card>
        <p className="mb-3 text-sm font-medium text-foreground">
          Send us a message
        </p>
        <form
          className="space-y-3"
          action={`mailto:${CONTACT.email}`}
          method="post"
          encType="text/plain"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Name
              </label>
              <Input name="name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Email
              </label>
              <Input type="email" name="email" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Phone
            </label>
            <PhoneField />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Message
            </label>
            <Textarea name="message" />
          </div>
          <Button type="submit">Send email</Button>
        </form>
      </Card>

      <div className="space-y-4">
        <Card>
          <p className="mb-2 text-sm font-medium text-foreground">Visit us</p>
          <p className="text-sm text-muted-foreground">
            {CONTACT.address}
            <br />
            {CONTACT.city}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{CONTACT.postal}</p>
          <p className="mt-3 text-xs font-medium text-foreground">
            Sunday services
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            {SERVICE_TIMES.map((service) => (
              <li key={service.id}>
                {service.label}: {service.time}
              </li>
            ))}
          </ul>
          <Link
            href="https://maps.google.com/?q=Given+Lubinda+Road+Lusaka"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Open in Google Maps
          </Link>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-medium text-foreground">
            Contact details
          </p>
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
