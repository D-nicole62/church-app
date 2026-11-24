import type { PropsWithChildren, ReactNode } from "react";
import { ChurchLogo } from "@/components/layout/ChurchLogo";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  CHURCH_NAME,
  CONTACT,
  FACEBOOK_URL,
  PUBLIC_ADDRESS,
  SERVICE_TIMES,
  YOUTUBE_URL,
} from "@/lib/site";
import { cn } from "@/lib/utils";

type PageShellProps = PropsWithChildren<{
  hero?: ReactNode;
  className?: string;
}>;

export function PageShell({ hero, className, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-muted text-foreground">
      <SiteHeader />

      {hero && (
        <section className="border-b border-border bg-gradient-to-r from-hero-from via-hero-via to-hero-to text-white">
          <div className="mx-auto min-w-0 max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            {hero}
          </div>
        </section>
      )}

      <main
        className={cn(
          "mx-auto flex min-w-0 w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12",
          className,
        )}
      >
        {children}
      </main>

      <footer className="border-t border-border bg-card py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex min-w-0 max-w-6xl flex-col gap-6 px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <ChurchLogo variant="footer" />
              <p className="min-w-0 text-sm font-medium leading-snug text-foreground">
                {CHURCH_NAME}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Facebook
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                YouTube
              </a>
              <a
                href="/privacy"
                className="inline-flex min-h-11 items-center font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Privacy
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
              <p>{PUBLIC_ADDRESS}</p>
              <p>Sundays: {SERVICE_TIMES.map((s) => s.time).join(" · ")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex min-h-11 items-center text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                {CONTACT.email}
              </a>
              {CONTACT.phones.map((phone) => (
                <a
                  key={phone.tel}
                  href={`tel:${phone.tel}`}
                  className="inline-flex min-h-11 items-center text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {phone.display}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

