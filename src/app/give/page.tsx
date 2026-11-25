import Link from "next/link";
import { GivingForm } from "@/components/giving/GivingForm";
import { OnlineGivingPaused } from "@/components/giving/OnlineGivingPaused";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { getPaymentTimeoutSeconds } from "@/lib/lipila";
import { paymentsEnabled } from "@/lib/payments";
import { pageMetadata } from "@/lib/seo";
import { CHURCH_NAME, CONTACT } from "@/lib/site";

export async function generateMetadata() {
  return pageMetadata({
    title: "Give",
    description: paymentsEnabled()
      ? `Give online with mobile money or card, or give in person during Sunday services at ${CHURCH_NAME}.`
      : `Online giving is coming soon at ${CHURCH_NAME}. Give in person during Sunday services, or contact the church.`,
    path: "/give",
  });
}

type GivePageProps = {
  searchParams?: Promise<{ status?: string; referenceId?: string }>;
};

export default async function GivePage({ searchParams }: GivePageProps) {
  const params = (await searchParams) ?? {};
  const onlineGivingOpen = paymentsEnabled();
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
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Give online
          </h2>
        }
      >
        {onlineGivingOpen ? (
          <>
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
          </>
        ) : (
          <OnlineGivingPaused />
        )}
      </Card>

      <div className="space-y-4">
        <Card
          header={
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Other ways to give
            </h2>
          }
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Give in person using the giving boxes during Sunday services.</li>
            <li>
              For any other way to give, email{" "}
              <Link
                href={`mailto:${CONTACT.email}`}
                className="text-primary underline underline-offset-4 hover:opacity-90"
              >
                {CONTACT.email}
              </Link>
              .
            </li>
          </ul>
        </Card>

        <Card
          header={
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Why we give
            </h2>
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
