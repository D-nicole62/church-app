import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            About
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            A modern church to help people know Jesus and find community.
          </h1>
        </div>
      }
      className="grid gap-8 md:grid-cols-[minmax(0,1.7fr),minmax(0,1.3fr)]"
    >
      <Card>
        <p className="mb-3 text-sm font-medium text-foreground">
          Who we are
        </p>
        <p className="mb-3 text-sm text-muted-foreground">
          Tabernacle Of David City Missions Church is a mission based church that prioritizes missions and spreading the gospel.
          We gather on Sundays to worship together and scatter throughout the
          week in homes and across our city.
        </p>
        <p className="mb-3 text-sm text-muted-foreground">
          However you&apos;re exploring faith—whether you&apos;re new to
          church, coming back after some time away, or have been following
          Jesus for years—you are welcome here.
        </p>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-foreground">
          What we believe
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Jesus is the center of everything we do.</li>
          <li>The Bible is God&apos;s Word and our guide for life.</li>
          <li>We are called to be a people of grace, truth, and love.</li>
        </ul>
      </Card>
    </PageShell>
  );
}

