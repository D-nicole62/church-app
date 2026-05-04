import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";

export default function MissionsPage() {
  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            Missions
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Taking the gospel across our city and around the world.
          </h1>
          <p className="max-w-2xl text-sm text-white/85 sm:text-base">
            Tabernacle of David Assembly partners locally and globally to equip
            believers and reach people with the love of Christ.
          </p>
        </div>
      }
      className="grid gap-8 md:grid-cols-[minmax(0,1.7fr),minmax(0,1.3fr)]"
    >
      <Card>
        <p className="mb-3 text-sm font-medium text-foreground">Local outreach</p>
        <p className="text-sm text-muted-foreground">
          We serve Lusaka and surrounding communities through practical help,
          evangelism, and building relationships that point people to Jesus.
        </p>
      </Card>
      <Card>
        <p className="mb-3 text-sm font-medium text-foreground">Global partners</p>
        <p className="text-sm text-muted-foreground">
          We support mission efforts and relationships that advance the Great
          Commission. Ask our team how you can pray, give, or go.
        </p>
      </Card>
    </PageShell>
  );
}
