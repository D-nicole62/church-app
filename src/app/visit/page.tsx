import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GroupType } from "@/generated/prisma/client";
import { MINISTRY_CLUSTERS } from "@/lib/church-ministries";
import { queryDatabase } from "@/lib/db";
import { groupMinistriesByCluster } from "@/lib/ministries/display";
import { prisma } from "@/lib/prisma";
import { CHURCH_NAME, CONTACT, SERVICE_TIMES } from "@/lib/site";
import { registerVisitorAction } from "@/lib/visitors/actions";

type VisitPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VisitPage(props: VisitPageProps) {
  const searchParams = await props.searchParams;
  const success = searchParams?.success === "1";
  const error = typeof searchParams?.error === "string" ? searchParams.error : null;

  const { campuses, ministries } = await queryDatabase(
    async () => {
      const [campuses, ministries] = await Promise.all([
        prisma.campus.findMany({ orderBy: { name: "asc" } }),
        prisma.group.findMany({
          where: { type: GroupType.MINISTRY },
          orderBy: [{ clusterName: "asc" }, { name: "asc" }],
          select: { id: true, name: true, clusterName: true },
        }),
      ]);
      return { campuses, ministries };
    },
    { campuses: [], ministries: [] },
  );

  const ministryClusters =
    ministries.length > 0
      ? groupMinistriesByCluster(ministries)
      : MINISTRY_CLUSTERS.map((cluster) => ({
          title: cluster.title,
          ministries: cluster.ministries.map((name) => ({
            id: name,
            name,
            clusterName: cluster.title,
          })),
        }));

  return (
    <PageShell
      hero={
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            Plan Your Visit
          </p>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            We&apos;re saving a seat for you.
          </h1>
          <p className="max-w-2xl text-sm text-white/85 sm:text-base">
            Let us know when you&apos;re coming so our team can welcome you,
            help you check in kids, and answer any questions before you arrive.
          </p>
        </div>
      }
      className="grid gap-8 md:grid-cols-[minmax(0,1.7fr),minmax(0,1.3fr)]"
    >
      <Card
        header={
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Your details
          </p>
        }
      >
        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            Thanks for planning your visit. Our team will be ready for you this
            Sunday.
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error === "missing-required"
              ? "Please fill in your name and at least one way to contact you."
              : "Something went wrong while saving your visit. Please try again."}
          </div>
        )}

        <form action={registerVisitorAction} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                First name *
              </label>
              <Input name="firstName" autoComplete="given-name" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Last name *
              </label>
              <Input name="lastName" autoComplete="family-name" required />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Email
              </label>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Mobile phone
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="0977 000000"
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Gender
              </label>
              <select
                name="gender"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <option value="">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Date of birth
              </label>
              <Input type="date" name="dateOfBirth" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Residential area
              </label>
              <Input name="residentialArea" placeholder="e.g. Woodlands" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Campus
              </label>
              <select
                name="campusId"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <option value="">Select campus</option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Which service are you planning to attend?
              </label>
              <select
                name="serviceTime"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <option value="">I&apos;m not sure yet</option>
                {SERVICE_TIMES.map((service) => (
                  <option key={service.id} value={service.time}>
                    {service.label} ({service.time})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Invited by
              </label>
              <Input name="invitedBy" placeholder="Friend, family member..." />
            </div>
          </div>

          <div className="space-y-2">
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Coming with kids?
            </label>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="attendingWithChildren"
                  className="h-3.5 w-3.5 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
                <span>Yes, we&apos;ll have kids with us</span>
              </label>
              <div className="flex items-center gap-2">
                <span>Number of children</span>
                <Input
                  type="number"
                  name="numberOfChildren"
                  min={0}
                  className="h-8 w-20 px-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                How did you hear about {CHURCH_NAME}?
              </label>
              <Input
                name="howDidYouHear"
                placeholder="Friend, social media, drove by..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Interested ministry
              </label>
              <select
                name="interestedMinistry"
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <option value="">Not sure yet</option>
                {ministryClusters.map((cluster) => (
                  <optgroup key={cluster.title} label={cluster.title}>
                    {cluster.ministries.map((ministry) => (
                      <option key={ministry.id} value={ministry.name}>
                        {ministry.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Prayer request
            </label>
            <Textarea
              name="prayerRequest"
              placeholder="Optional prayer request for our pastoral team"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Anything we should know to make your visit great?
            </label>
            <Textarea
              name="notes"
              placeholder="Allergies, accessibility needs, questions you have..."
            />
          </div>

          <div className="pt-2">
            <Button type="submit">Submit your visit</Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              What to expect
            </p>
          }
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              Sunday services: First (07:00–08:30), Second (09:00–10:30), and
              Youth — Potter&apos;s Wheel (11:00–12:30).
            </li>
            <li>
              Come as you are—most people dress casually and comfortably.
            </li>
            <li>
              Children&apos;s Church is available during Sunday services—see our{" "}
              <a
                href="/children"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Children&apos;s Church
              </a>{" "}
              page for more.
            </li>
            <li>
              Potter&apos;s Wheel youth service meets Sundays 11:00–12:30.
            </li>
          </ul>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Location & parking
            </p>
          }
        >
          <p className="text-sm text-muted-foreground">
            {CONTACT.address}, {CONTACT.city}. Guest parking is available near
            the main entrance when you arrive.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
