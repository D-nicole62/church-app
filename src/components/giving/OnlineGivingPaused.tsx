import Link from "next/link";
import { CONTACT, SERVICE_TIMES } from "@/lib/site";

export function OnlineGivingPaused() {
  return (
    <div className="space-y-4" data-testid="online-giving-paused">
      <p className="text-base font-medium text-foreground">
        Online giving is coming soon
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        We are preparing a new way to give online. Until that is ready, please
        give in person during Sunday services, or contact the church and we
        will help you.
      </p>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {SERVICE_TIMES.map((service) => (
          <li key={service.id}>
            <span className="font-medium text-foreground">{service.label}.</span>{" "}
            {service.time}
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        <Link
          href="/contact"
          className="font-medium text-primary underline underline-offset-4 hover:opacity-90"
        >
          Contact the church
        </Link>{" "}
        or email{" "}
        <a
          href={`mailto:${CONTACT.email}`}
          className="font-medium text-primary underline underline-offset-4 hover:opacity-90"
        >
          {CONTACT.email}
        </a>
        .
      </p>
    </div>
  );
}
