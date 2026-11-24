import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { pageMetadata } from "@/lib/seo";
import { CHURCH_NAME, CONTACT, PUBLIC_ADDRESS } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy",
  description: `How ${CHURCH_NAME} uses information submitted through this website, and how to ask for it to be removed.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <PageShell
      hero={
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            Privacy
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Privacy policy
          </h1>
          <p className="max-w-2xl text-sm text-white/85 sm:text-base">
            This note explains what this church website collects and how to ask
            us to delete it. It is a plain description of this site, not legal
            advice.
          </p>
        </div>
      }
      className="grid gap-6"
    >
      <Card>
        <h2 className="mb-3 text-sm font-medium text-foreground">Who we are</h2>
        <p className="text-sm text-muted-foreground">
          {CHURCH_NAME} operates this website. The church office is at{" "}
          {PUBLIC_ADDRESS}, Zambia. You can reach us at{" "}
          <a
            href={`mailto:${CONTACT.email}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {CONTACT.email}
          </a>{" "}
          or by phone at{" "}
          {CONTACT.phones.map((phone, index) => (
            <span key={phone.tel}>
              {index > 0 ? " or " : ""}
              <a
                href={`tel:${phone.tel}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {phone.display}
              </a>
            </span>
          ))}
          .
        </p>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-foreground">
          What the forms collect
        </h2>
        <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Plan Your Visit.</span>{" "}
            Your name and at least an email or phone number. Optional details
            include gender, date of birth, the date you plan to visit, the
            service, campus, residential area, who invited you, whether children
            are coming and how many, a ministry you are interested in, a prayer
            request, and notes such as accessibility needs.
          </li>
          <li>
            <span className="font-medium text-foreground">Contact.</span> Your
            name, email, message, and an optional phone number.
          </li>
          <li>
            <span className="font-medium text-foreground">Give.</span> The gift
            amount and purpose, and either a mobile-money number or the name,
            phone, email, and billing address needed to start a card payment.
            Card numbers are entered on Lipila&apos;s hosted page. This website
            does not store card numbers.
          </li>
          <li>
            <span className="font-medium text-foreground">Event RSVP.</span>{" "}
            Your name, and an optional email or phone number, when you say you
            will attend an event.
          </li>
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-foreground">Why we keep it</h2>
        <p className="text-sm text-muted-foreground">
          Visit and contact details are used so the church can welcome you,
          answer your message, and follow up if you asked us to. Giving details
          are used to start and record the gift. Event RSVPs are used to know
          who plans to attend. We do not sell this information.
        </p>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-foreground">
          Children&apos;s information
        </h2>
        <p className="text-sm text-muted-foreground">
          Parents or guardians may tell us that children are coming, how many,
          and anything we should know to welcome them in Children&apos;s Church.
          Children are not asked to fill in these forms themselves. If you want
          information about your child removed, contact the church office and
          we will delete what we hold from these forms.
        </p>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-foreground">
          Asking us to remove your information
        </h2>
        <p className="text-sm text-muted-foreground">
          Email{" "}
          <a
            href={`mailto:${CONTACT.email}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {CONTACT.email}
          </a>{" "}
          or call the numbers above and tell us which form you used and the
          name or email on it. We will delete the visit, contact, or RSVP
          record we can match. A completed gift may need to stay in the
          church&apos;s giving records. The Give page also keeps a payment
          reference in your browser&apos;s session storage until that payment
          finishes or times out; closing the browser tab clears it.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          <Link
            href="/contact"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Use the contact form
          </Link>{" "}
          if you would rather write to us from the website.
        </p>
      </Card>
    </PageShell>
  );
}
