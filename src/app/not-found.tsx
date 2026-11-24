import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { CHURCH_NAME } from "@/lib/site";

export default function NotFound() {
  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            {CHURCH_NAME}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            We can&apos;t find that page
          </h1>
          <p className="max-w-2xl text-sm text-white/85 sm:text-base">
            The link may be out of date. You can go back to the home page or
            plan a Sunday visit.
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="inline-flex w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Go home</Button>
        </Link>
        <Link href="/visit" className="inline-flex w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">
            Plan your visit
          </Button>
        </Link>
        <Link href="/contact" className="inline-flex w-full sm:w-auto">
          <Button variant="ghost" className="w-full border border-border sm:w-auto">
            Contact the church
          </Button>
        </Link>
      </div>
    </PageShell>
  );
}
