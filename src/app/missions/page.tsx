import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { missionsPhotos } from "@/lib/church-photos";
import { pageMetadata } from "@/lib/seo";
import { CHURCH_NAME, MISSION, WHO_WE_ARE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Missions",
  description: `Evangelism and missions at ${CHURCH_NAME}, equipping saints for the end-time harvest.`,
  path: "/missions",
});

export default function MissionsPage() {
  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            Evangelism &amp; Missions
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Fulfilling the Great Commission together
          </h1>
          <p className="max-w-2xl text-sm text-white/85 sm:text-base">
            {CHURCH_NAME} is outward-looking—with a passion for winning souls
            and impacting lives through ministry and outreach.
          </p>
        </div>
      }
      className="grid gap-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {missionsPhotos.map((photo) => (
          <div
            key={photo.src}
            className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border shadow-sm"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-foreground">Our focus</h2>
        <p className="mb-3 text-sm text-muted-foreground">{WHO_WE_ARE[1]}</p>
        <p className="text-sm text-muted-foreground">{MISSION}</p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-medium text-foreground">
            Evangelism &amp; outreach
          </h2>
          <p className="text-sm text-muted-foreground">
            Soul winning, outreach programs, and community impact initiatives
            that bring the message of salvation, hope, and restoration to
            people across Lusaka and beyond.
          </p>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-medium text-foreground">
            Strategic partnerships
          </h2>
          <p className="text-sm text-muted-foreground">
            Equipping saints for the end-time harvest through the power of the
            Holy Spirit in partnership with strategic alliances worldwide. Ask
            our team how you can pray, give, or serve.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
