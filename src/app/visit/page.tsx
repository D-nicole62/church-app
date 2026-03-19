import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

async function registerVisitor(formData: FormData) {
  "use server";

  const firstName = (formData.get("firstName") || "").toString().trim();
  const lastName = (formData.get("lastName") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const phone = (formData.get("phone") || "").toString().trim();
  const serviceTime = (formData.get("serviceTime") || "").toString().trim();
  const attendingWithChildren = formData.get("attendingWithChildren") === "on";
  const numberOfChildrenRaw = (formData.get("numberOfChildren") || "")
    .toString()
    .trim();
  const howDidYouHear = (formData.get("howDidYouHear") || "")
    .toString()
    .trim();
  const notes = (formData.get("notes") || "").toString().trim();

  if (!firstName || !lastName || (!email && !phone)) {
    redirect("/visit?error=missing-required");
  }

  const numberOfChildren = numberOfChildrenRaw
    ? Number.parseInt(numberOfChildrenRaw, 10)
    : null;

  if (!supabase) {
    redirect("/visit?error=save-failed");
  }

  const { error } = await supabase.from("visitors").insert({
    first_name: firstName,
    last_name: lastName,
    email: email || null,
    phone: phone || null,
    service_time: serviceTime || null,
    attending_with_children: attendingWithChildren,
    number_of_children: Number.isNaN(numberOfChildren)
      ? null
      : numberOfChildren,
    how_did_you_hear: howDidYouHear || null,
    notes: notes || null,
  });

  if (error) {
    redirect("/visit?error=save-failed");
  }

  redirect("/visit?success=1");
}

type VisitPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VisitPage(props: VisitPageProps) {
  const searchParams = await props.searchParams;
  const success = searchParams?.success === "1";
  const error = typeof searchParams?.error === "string" ? searchParams.error : null;

  return (
    <PageShell
      hero={
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
            Plan Your Visit
          </p>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            We&apos;re saving a seat for you.
          </h1>
          <p className="max-w-2xl text-sm text-zinc-200 sm:text-base">
            Let us know when you&apos;re coming so our team can welcome you,
            help you check in kids, and answer any questions before you arrive.
          </p>
        </div>
      }
      className="grid gap-8 md:grid-cols-[minmax(0,1.7fr),minmax(0,1.3fr)]"
    >
      <Card
        header={
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
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

        <form action={registerVisitor} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                First name *
              </label>
              <Input name="firstName" autoComplete="given-name" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Last name *
              </label>
              <Input name="lastName" autoComplete="family-name" required />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-200">
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
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Mobile phone
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="(555) 555-0123"
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Which service are you planning to attend?
              </label>
              <select
                name="serviceTime"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">I&apos;m not sure yet</option>
                <option value="9:00am">9:00am service</option>
                <option value="11:00am">11:00am service</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                Coming with kids?
              </label>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-700 dark:text-zinc-300">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="attendingWithChildren"
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:border-zinc-700"
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
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-200">
                How did you hear about Tabernacle of David Missions Church?
              </label>
              <Input
                name="howDidYouHear"
                placeholder="Friend, social media, drove by..."
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-200">
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              What to expect
            </p>
          }
        >
          <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>Services are about 70 minutes with music and teaching.</li>
            <li>
              Come as you are—most people dress casually and comfortably.
            </li>
            <li>
              TOD Kids is a safe, fun environment for children from birth
              through 5th grade.
            </li>
          </ul>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Location & parking
            </p>
          }
        >
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            We&apos;re located at Given Lubinda Road, Lusaka. Guest parking is
            available near the main entrance and clearly marked when you
            arrive.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}

