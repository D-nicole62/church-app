import type { PropsWithChildren, ReactNode } from "react";
import { ChurchLogo } from "@/components/layout/ChurchLogo";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  CHURCH_NAME,
  CONTACT,
  FACEBOOK_URL,
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
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            {hero}
          </div>
        </section>
      )}

      <main
        className={cn(
          "mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12",
          className,
        )}
      >
        {children}
      </main>

      <footer className="border-t border-border bg-card py-8 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-1 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <ChurchLogo variant="footer" className="-ml-4 sm:-ml-2" />
              <p className="max-w-[11rem] text-[11px] font-medium leading-snug text-foreground sm:max-w-xs sm:text-xs">
                {CHURCH_NAME}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Facebook
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                YouTube
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-4">
              <p>{CONTACT.address}</p>
              <p>
                Sundays: {SERVICE_TIMES.map((s) => s.time).join(" · ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                {CONTACT.email}
              </a>
              {CONTACT.phones.map((phone) => (
                <a
                  key={phone.tel}
                  href={`tel:${phone.tel}`}
                  className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
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

