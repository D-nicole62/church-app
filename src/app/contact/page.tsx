import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
            Contact
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            We&apos;d love to hear from you.
          </h1>
        </div>
      }
      className="grid gap-8 md:grid-cols-[minmax(0,1.6fr),minmax(0,1.4fr)]"
    >
      <Card>
        <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
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
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Name
              </label>
              <Input name="name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Email
              </label>
              <Input type="email" name="email" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-200">
              Message
            </label>
            <Textarea name="message" />
          </div>
          <Button type="submit">Send email</Button>
        </form>
      </Card>

      <div className="space-y-4">
        <Card>
          <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Visit us
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            123 Hope Street
            <br />
            Your City, ST 00000
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Sundays at 9:00am &amp; 11:00am
          </p>
          <Link
            href="https://maps.google.com"
            target="_blank"
            className="mt-3 inline-block text-xs font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-200"
          >
            Open in Google Maps
          </Link>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Other ways to connect
          </p>
          <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            <li>
              Email:{" "}
              <Link
                href="mailto:TOD@gmail.com"
                className="underline underline-offset-4"
              >
                TOD@gmail.com
              </Link>
            </li>
            <li>
              Phone:{" "}
              <Link
                href="tel:+260971794359"
                className="underline underline-offset-4"
              >
                +260971794359
              </Link>
            </li>
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}

