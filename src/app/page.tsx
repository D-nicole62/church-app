import Image from "next/image";
import Link from "next/link";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { homeFeaturedPhoto } from "@/lib/church-photos";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CHILDREN_CHURCH,
  CHURCH_NAME,
  SENIOR_PASTOR,
  SERVICE_TIMES,
  VISION,
  WELCOME_BODY,
  WELCOME_CLOSING,
  WELCOME_INTRO,
} from "@/lib/site";

export default function Home() {
  return (
    <PageShell
      hero={
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="space-y-4 lg:max-w-xl lg:shrink-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
              Welcome
            </p>
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Welcome to {CHURCH_NAME}
            </h1>
            <p className="max-w-xl text-sm text-white/85 sm:text-base">
              {WELCOME_INTRO} {WELCOME_BODY[0]}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/visit">
                <Button variant="primary">Plan Your Visit</Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="ghost"
                  className="border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15"
                >
                  Who We Are
                </Button>
              </Link>
            </div>
            <div className="w-full max-w-md space-y-2 rounded-2xl border border-white/15 bg-white/10 p-4 text-xs text-white/85 backdrop-blur-sm">
              <p className="font-semibold text-white">Sunday worship</p>
              <ul className="space-y-1">
                {SERVICE_TIMES.map((service) => (
                  <li key={service.id}>
                    <span className="text-white/90">{service.label}:</span>{" "}
                    {service.time}
                  </li>
                ))}
              </ul>
              <p className="pt-1 text-white/65">
                Along Given Lubinda Road, Lusaka
              </p>
            </div>
          </div>
          <div className="flex w-full min-w-0 flex-1 flex-col self-stretch sm:max-w-md lg:max-w-lg">
            <HeroSlideshow className="flex-1" />
          </div>
        </div>
      }
    >
      <section className="overflow-hidden rounded-2xl border border-border bg-card/90 shadow-sm">
        <div className="grid gap-0 md:grid-cols-[1.1fr,1fr]">
          <div className="relative aspect-[4/3] min-h-[220px] md:aspect-auto md:min-h-[280px]">
            <Image
              src={homeFeaturedPhoto.src}
              alt={homeFeaturedPhoto.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center p-6">
            <p className="mb-3 text-sm text-muted-foreground">
              {WELCOME_BODY[1]}
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              {WELCOME_CLOSING}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {SENIOR_PASTOR.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {SENIOR_PASTOR.title}
            </p>
            <p className="text-xs text-muted-foreground">{CHURCH_NAME}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Our Vision
            </p>
          }
          footer={
            <Link
              href="/about"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Learn more about us
            </Link>
          }
        >
          <p className="text-sm font-medium text-foreground">{VISION}</p>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Cell Church
            </p>
          }
          footer={
            <Link
              href="/groups"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Ministry clusters
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-foreground">
            Strong relationships. Active participation.
          </p>
          <p>
            We are a cell-based church where believers grow together in
            community and live out the vision God has given us.
          </p>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Evangelism &amp; Missions
            </p>
          }
          footer={
            <Link
              href="/missions"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Our mission focus
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-foreground">
            Reaching communities with the Gospel.
          </p>
          <p>
            Soul winning, outreach, and mission activities that bring salvation,
            hope, and restoration to our city and beyond.
          </p>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {CHILDREN_CHURCH.title}
            </p>
          }
          footer={
            <Link
              href="/children"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Learn about Children&apos;s Church
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-foreground">
            {CHILDREN_CHURCH.subtitle}
          </p>
          <p>{CHILDREN_CHURCH.description[0]}</p>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Plan Your Visit
            </p>
          }
          footer={
            <Link
              href="/visit"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Tell us you&apos;re coming
            </Link>
          }
          className="h-full"
        >
          <p className="mb-2 text-sm font-medium text-foreground">
            We warmly invite you to worship with us.
          </p>
          <p className="mb-3">
            Choose a Sunday service and let our team know you are coming so we
            can welcome you and your family.
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {SERVICE_TIMES.map((service) => (
              <li key={service.id}>
                {service.label}: {service.time}
              </li>
            ))}
          </ul>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Contact
            </p>
          }
          footer={
            <Link
              href="/contact"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Full contact details
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-foreground">
            We would love to hear from you.
          </p>
          <p>
            Visit us along Given Lubinda Road in Lusaka, call, or email our
            office—we are here to help you connect with our church family.
          </p>
        </Card>
      </section>
    </PageShell>
  );
}
