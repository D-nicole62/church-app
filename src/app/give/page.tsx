import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";

const GIVING_URL = "https://your-giving-provider.example.com/tod";

export default function GivePage() {
  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            Give
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Practice generosity together.
          </h1>
          <p className="max-w-2xl text-sm text-white/85 sm:text-base">
            Your giving helps people know Jesus, find community, and live on
            mission in our city and beyond.
          </p>
        </div>
      }
      className="grid gap-8 md:grid-cols-[minmax(0,1.6fr),minmax(0,1.4fr)]"
    >
      <Card>
        <p className="mb-3 text-sm font-medium text-foreground">
          Ways to give
        </p>
        <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
          <li>Give securely online (one-time or recurring).</li>
          <li>Give in person using the giving boxes during services.</li>
          <li>Mail checks to Tabernacle of David Missons Church, Given Lubinda Road, Lusaka.</li>
        </ul>
        <Link
          href={GIVING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Give online
        </Link>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-foreground">
          Why we give
        </p>
        <p className="mb-2 text-sm text-muted-foreground">
          We believe generosity is our joyful response to the generosity of
          Jesus. Your giving fuels ministry to kids and students, supports
          outreach in our city, and advances the gospel around the world.
        </p>
        <p className="text-xs text-muted-foreground">
          All gifts are tax-deductible as allowed by law. If you have questions
          about giving,{" "}
          <Link
            href="mailto:finance@tod.com"
            className="text-primary underline underline-offset-4 hover:opacity-90"
          >
            contact our team
          </Link>
          .
        </p>
      </Card>
    </PageShell>
  );
}

