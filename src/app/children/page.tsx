import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PhotoGrid } from "@/components/ui/photo-grid";
import { childrenChurchPhotos } from "@/lib/church-photos";
import { pageMetadata } from "@/lib/seo";
import { CHILDREN_CHURCH, CHURCH_NAME, SERVICE_TIMES } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Children's Church",
  description: `${CHILDREN_CHURCH.subtitle} during Sunday services at ${CHURCH_NAME}.`,
  path: "/children",
});

const youthService = SERVICE_TIMES.find((s) => s.id === "youth");

export default function ChildrenChurchPage() {
  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            {CHILDREN_CHURCH.title}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {CHILDREN_CHURCH.subtitle}
          </h1>
          <p className="max-w-2xl text-sm text-white/85 sm:text-base">
            {CHILDREN_CHURCH.description[0]}
          </p>
        </div>
      }
      className="grid gap-8"
    >
      <Card>
        <h2 className="mb-3 text-sm font-medium text-foreground">
          Growing in faith, step by step
        </h2>
        {CHILDREN_CHURCH.description.slice(1).map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className="mb-3 text-sm text-muted-foreground last:mb-0"
          >
            {paragraph}
          </p>
        ))}
        <ul className="mt-4 list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
          {CHILDREN_CHURCH.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      {youthService && (
        <Card>
          <h2 className="mb-2 text-sm font-medium text-foreground">
            Potter&apos;s Wheel — Youth Service
          </h2>
          <p className="text-sm text-muted-foreground">
            Older children and youth are also invited to our{" "}
            <span className="font-medium text-foreground">
              {youthService.label}
            </span>{" "}
            every Sunday from {youthService.time}, where young people worship
            and grow together.
          </p>
        </Card>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Our children in ministry
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Worship, teaching, and joyful moments from Children&apos;s Church and
            related ministries.
          </p>
        </div>
        <PhotoGrid photos={childrenChurchPhotos} columns={3} />
      </section>

      <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            Visiting with children?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan your visit and tell us how many children are coming—we will be
            ready to welcome your family.
          </p>
        </div>
        <Link href="/visit" className="inline-flex w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            Plan Your Visit
          </Button>
        </Link>
      </Card>
    </PageShell>
  );
}
