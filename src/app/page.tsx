import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <PageShell
      hero={
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
              Welcome Home
            </p>
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Know Jesus. Find community. Live on mission.
            </h1>
            <p className="max-w-xl text-sm text-white/85 sm:text-base">
              Tabernacle of David Missons Church is a modern, Jesus-centered church in Your City.
              We would love to help you plan your first visit and get connected.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/visit">
                <Button variant="primary">Plan Your Visit</Button>
              </Link>
              <Link href="/sermons">
                <Button
                  variant="ghost"
                  className="border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15"
                >
                  Watch a Message
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-6 w-full max-w-xs space-y-2 rounded-2xl border border-white/15 bg-white/10 p-4 text-xs text-white/85 backdrop-blur-sm sm:mt-0">
            <p className="font-semibold text-white">This Sunday</p>
            <p>Sundays 9:00am & 11:00am</p>
            <p>Given Lubinda Road, Lusaka.</p>
            <p className="text-white/65">
              Kids ministry is available at every service.
            </p>
          </div>
        </div>
      }
    >
      <section className="grid gap-6 md:grid-cols-3">
        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              This Week
            </p>
          }
          footer={
            <Link
              href="/events"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              View all events
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-foreground">
            Upcoming gatherings & moments you can join.
          </p>
          <p>
            Join us this Sunday for worship and teaching, plus our midweek
            prayer night every Wednesday at 7:00pm.
          </p>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Messages
            </p>
          }
          footer={
            <Link
              href="/sermons"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Browse sermons
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-foreground">
            Catch up or share an encouraging word.
          </p>
          <p>
            Watch or listen to recent sermons from our current teaching series
            and share them with a friend.
          </p>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Community
            </p>
          }
          footer={
            <Link
              href="/groups"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Explore groups
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-foreground">
            Circles, not rows.
          </p>
          <p>
            Find a small group where you can know others, be known, and grow in
            your faith together.
          </p>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-[2fr,1.4fr]">
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
            We&apos;ll save you a seat.
          </p>
          <p className="mb-3">
            Share a few details and our team will be ready to welcome you,
            answer questions, and help with kids check-in and parking when you
            arrive.
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Friendly hosts from the moment you pull in.</li>
            <li>Safe, fun environments for children.</li>
            <li>Services are about 70 minutes.</li>
          </ul>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Give
            </p>
          }
          footer={
            <Link
              href="/give"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Give online
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-foreground">
            Practice generosity.
          </p>
          <p>
            Your generosity fuels the mission of Tabernacle of David Missons Church in our church, our
            city, and around the world.
          </p>
        </Card>
      </section>
    </PageShell>
  );
}

