import { Field } from "@/components/forms/Field";
import { FormConsent } from "@/components/forms/FormConsent";
import { PhoneField } from "@/components/forms/PhoneField";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { GroupType } from "@/generated/prisma/client";
import { MINISTRY_CLUSTERS } from "@/lib/church-ministries";
import { queryDatabase } from "@/lib/db";
import { groupMinistriesByCluster } from "@/lib/ministries/display";
import { prisma } from "@/lib/prisma";
import { pageMetadata } from "@/lib/seo";
import { CHURCH_NAME, CONTACT, SERVICE_TIMES } from "@/lib/site";
import { registerVisitorAction } from "@/lib/visitors/actions";

export const metadata = pageMetadata({
  title: "Plan Your Visit",
  description:
    "Tell Tabernacle of David Assembly-City Mission Church you are coming. Sunday services are 07:00–08:30, 09:00–10:30, and 11:00–12:30 in Lusaka.",
  path: "/visit",
});

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
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Your details
            </h2>
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
              : error === "invalid-phone"
                ? "Enter a valid phone number (e.g. 0971234567)."
                : error === "invalid-email"
                  ? "Enter a valid email address."
                  : "Something went wrong while saving your visit. Please try again."}
          </div>
        )}

        <form action={registerVisitorAction} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="visit-first-name" label="First name *">
              <Input id="visit-first-name" name="firstName" autoComplete="given-name" required />
            </Field>
            <Field id="visit-last-name" label="Last name *">
              <Input id="visit-last-name" name="lastName" autoComplete="family-name" required />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="visit-email" label="Email">
              <Input
                id="visit-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Field>
            <Field id="visit-phone" label="Mobile phone">
              <PhoneField id="visit-phone" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="visit-gender" label="Gender (optional)">
              <NativeSelect id="visit-gender" name="gender">
                <option value="">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </NativeSelect>
            </Field>
            <Field id="visit-dob" label="Date of birth (optional)">
              <Input id="visit-dob" type="date" name="dateOfBirth" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="visit-area" label="Residential area (optional)">
              <Input id="visit-area" name="residentialArea" placeholder="e.g. Woodlands" />
            </Field>
            <Field id="visit-campus" label="Campus (optional)">
              <NativeSelect id="visit-campus" name="campusId">
                <option value="">Select campus</option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="visit-service" label="Which service are you planning to attend?">
              <NativeSelect id="visit-service" name="serviceTime">
                <option value="">I&apos;m not sure yet</option>
                {SERVICE_TIMES.map((service) => (
                  <option key={service.id} value={service.time}>
                    {service.label} ({service.time})
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field id="visit-planned-date" label="Planned visit date (optional)">
              <Input id="visit-planned-date" type="date" name="plannedVisitDate" />
            </Field>
          </div>

          <Field id="visit-invited-by" label="Invited by (optional)">
            <Input id="visit-invited-by" name="invitedBy" placeholder="Friend, family member..." />
          </Field>

          <fieldset className="space-y-2">
            <legend className="mb-1 block text-xs font-medium text-foreground/80">
              Coming with kids? (optional)
            </legend>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center">
              <label
                htmlFor="visit-with-children"
                className="inline-flex min-h-11 items-center gap-3"
              >
                <input
                  id="visit-with-children"
                  type="checkbox"
                  name="attendingWithChildren"
                  className="h-5 w-5 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
                <span>Yes, we&apos;ll have kids with us</span>
              </label>
              <Field id="visit-child-count" label="Number of children" className="sm:max-w-[12rem]">
                <Input id="visit-child-count" type="number" name="numberOfChildren" min={0} />
              </Field>
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="visit-hear" label={`How did you hear about ${CHURCH_NAME}? (optional)`}>
              <Input
                id="visit-hear"
                name="howDidYouHear"
                placeholder="Friend, social media, drove by..."
              />
            </Field>
            <Field id="visit-ministry" label="Interested ministry (optional)">
              <NativeSelect id="visit-ministry" name="interestedMinistry">
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
              </NativeSelect>
            </Field>
          </div>

          <Field id="visit-prayer" label="Prayer request (optional)">
            <Textarea
              id="visit-prayer"
              name="prayerRequest"
              placeholder="Optional prayer request for our pastoral team"
            />
          </Field>

          <Field id="visit-notes" label="Anything we should know to make your visit great? (optional)">
            <Textarea
              id="visit-notes"
              name="notes"
              placeholder="Allergies, accessibility needs, questions you have..."
            />
          </Field>

          <FormConsent />

          <div className="pt-2">
            <Button type="submit" className="w-full sm:w-auto">
              Submit your visit
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <Card
          header={
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              What to expect
            </h2>
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
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Location &amp; parking
            </h2>
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
