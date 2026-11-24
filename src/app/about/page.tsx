import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { PhotoGrid } from "@/components/ui/photo-grid";
import { aboutGalleryPhotos } from "@/lib/church-photos";
import { pageMetadata } from "@/lib/seo";
import {
  AFFILIATION,
  CHURCH_NAME,
  MISSION,
  SENIOR_PASTOR,
  VISION,
  WHO_WE_ARE,
} from "@/lib/site";

export const metadata = pageMetadata({
  title: "About",
  description: `Who we are, our vision, and our mission at ${CHURCH_NAME}, a cell-based church in Lusaka.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            Who we are
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {CHURCH_NAME}
          </h1>
          <p className="max-w-2xl text-sm text-white/85 sm:text-base">
            A Pentecostal, cell-based ministry under the {AFFILIATION}.
          </p>
        </div>
      }
      className="grid gap-8"
    >
      <Card>
        <h2 className="mb-3 text-sm font-medium text-foreground">Who we are</h2>
        {WHO_WE_ARE.map((paragraph) => (
          <p
            key={paragraph.slice(0, 40)}
            className="mb-3 text-sm text-muted-foreground last:mb-0"
          >
            {paragraph}
          </p>
        ))}
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-sm font-semibold text-foreground">
            {SENIOR_PASTOR.name}
          </p>
          <p className="text-xs text-muted-foreground">{SENIOR_PASTOR.title}</p>
          <p className="text-xs text-muted-foreground">{CHURCH_NAME}</p>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-medium text-foreground">Our vision</h2>
          <p className="text-sm text-muted-foreground">{VISION}</p>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-medium text-foreground">Our mission</h2>
          <p className="text-sm text-muted-foreground">{MISSION}</p>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Life at TOD</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Worship, community, and ministry across our church family.
          </p>
        </div>
        <PhotoGrid photos={aboutGalleryPhotos} />
      </section>
    </PageShell>
  );
}
