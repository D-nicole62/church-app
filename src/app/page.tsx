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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
              Welcome Home
            </p>
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              Know Jesus. Find community. Live on mission.
            </h1>
            <p className="max-w-xl text-sm text-zinc-200 sm:text-base">
              Tabernacle of David Missons Church is a modern, Jesus-centered church in Your City.
              We would love to help you plan your first visit and get connected.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/visit">
                <Button variant="primary">Plan Your Visit</Button>
              </Link>
              <Link href="/sermons">
                <Button variant="secondary">Watch a Message</Button>
              </Link>
            </div>
          </div>
          <div className="mt-6 w-full max-w-xs space-y-2 rounded-2xl bg-zinc-900/40 p-4 text-xs text-zinc-200 ring-1 ring-zinc-700/60 sm:mt-0">
            <p className="font-semibold text-zinc-50">This Sunday</p>
            <p>Sundays 9:00am & 11:00am</p>
            <p>Given Lubinda Road, Lusaka.</p>
            <p className="text-zinc-400">
              Kids ministry is available at every service.
            </p>
          </div>
        </div>
      }
    >
      <section className="grid gap-6 md:grid-cols-3">
        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              This Week
            </p>
          }
          footer={
            <Link
              href="/events"
              className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              View all events
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Upcoming gatherings & moments you can join.
          </p>
          <p>
            Join us this Sunday for worship and teaching, plus our midweek
            prayer night every Wednesday at 7:00pm.
          </p>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Messages
            </p>
          }
          footer={
            <Link
              href="/sermons"
              className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Browse sermons
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Catch up or share an encouraging word.
          </p>
          <p>
            Watch or listen to recent sermons from our current teaching series
            and share them with a friend.
          </p>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Community
            </p>
          }
          footer={
            <Link
              href="/groups"
              className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Explore groups
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Plan Your Visit
            </p>
          }
          footer={
            <Link
              href="/visit"
              className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Tell us you&apos;re coming
            </Link>
          }
          className="h-full"
        >
          <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            We&apos;ll save you a seat.
          </p>
          <p className="mb-3">
            Share a few details and our team will be ready to welcome you,
            answer questions, and help with kids check-in and parking when you
            arrive.
          </p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-700 dark:text-zinc-300">
            <li>Friendly hosts from the moment you pull in.</li>
            <li>Safe, fun environments for children.</li>
            <li>Services are about 70 minutes.</li>
          </ul>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Give
            </p>
          }
          footer={
            <Link
              href="/give"
              className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
            >
              Give online
            </Link>
          }
        >
          <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
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

