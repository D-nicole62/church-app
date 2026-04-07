import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { FACEBOOK_URL, YOUTUBE_URL } from "@/lib/site";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            Contact
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            We&apos;d love to hear from you.
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
          action="mailto:TOD@gamil.com"
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
              Message
            </label>
            <Textarea name="message" />
          </div>
          <Button type="submit">Send email</Button>
        </form>
      </Card>

      <div className="space-y-4">
        <Card>
          <p className="mb-2 text-sm font-medium text-foreground">
            Visit us
          </p>
          <p className="text-sm text-muted-foreground">
            Given Lubinda Road
            <br />
            Lusaka
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Sundays at 9:00am &amp; 11:00am
          </p>
          <Link
            href="https://maps.google.com"
            target="_blank"
            className="mt-3 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Open in Google Maps
          </Link>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-medium text-foreground">
            Other ways to connect
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              Email:{" "}
              <Link
                href="mailto:TOD@gmail.com"
                className="text-primary underline underline-offset-4 hover:opacity-90"
              >
                TOD@gmail.com
              </Link>
            </li>
            <li>
              Phone:{" "}
              <Link
                href="tel:+260971794359"
                className="text-primary underline underline-offset-4 hover:opacity-90"
              >
                +260971794359
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
                Follow us on Facebook
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

