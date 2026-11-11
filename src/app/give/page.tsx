import Link from "next/link";
import { GivingForm } from "@/components/giving/GivingForm";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { getPaymentTimeoutSeconds } from "@/lib/lipila";
import { CHURCH_NAME, CONTACT } from "@/lib/site";

type GivePageProps = {
  searchParams?: Promise<{ status?: string; referenceId?: string }>;
};

export default async function GivePage({ searchParams }: GivePageProps) {
  const params = (await searchParams) ?? {};
  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            Give
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Practice generosity together.
          </h1>
          <p className="max-w-2xl text-sm text-white/85 sm:text-base">
            Your giving helps people know Jesus, find community, and live on
            mission in our city and beyond.
          </p>
        </div>
      }
      className="grid gap-8 md:grid-cols-[minmax(0,1.7fr),minmax(0,1.3fr)]"
    >
      <Card
        header={
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Give online
          </p>
        }
      >
        <p className="mb-2 text-sm font-medium text-foreground">
          Give securely with Mobile Money or Card
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          Powered by Lipila. Mobile Money sends a prompt to your phone to
          approve. Card payments use a secure hosted page—we never store your
          card details.
        </p>
        <GivingForm
          paymentTimeoutSeconds={getPaymentTimeoutSeconds()}
          returnStatus={params.status}
          returnReferenceId={params.referenceId}
        />
      </Card>

      <div className="space-y-4">
        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Other ways to give
            </p>
          }
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Give in person using the giving boxes during services.</li>
            <li>
              Mail checks to {CHURCH_NAME}, {CONTACT.address}, {CONTACT.city}.
            </li>
          </ul>
        </Card>

        <Card
          header={
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Why we give
            </p>
          }
        >
          <p className="mb-2 text-sm text-muted-foreground">
            We believe generosity is our joyful response to the generosity of
            Jesus. Your giving fuels ministry to kids and students, supports
            outreach in our city, and advances the gospel around the world.
          </p>
          <p className="text-xs text-muted-foreground">
            If you have questions about giving,{" "}
            <Link
              href={`mailto:${CONTACT.email}`}
              className="text-primary underline underline-offset-4 hover:opacity-90"
            >
              contact our team
            </Link>
            .
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
