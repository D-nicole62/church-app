import type { PropsWithChildren, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { FACEBOOK_URL, YOUTUBE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

type PageShellProps = PropsWithChildren<{
  hero?: ReactNode;
  className?: string;
}>;

const navItems = [
  { href: "/", label: "Home" },
  { href: "/visit", label: "Plan Your Visit" },
  { href: "/events", label: "Events" },
  { href: "/sermons", label: "Sermons" },
  { href: "/groups", label: "Groups" },
  { href: "/give", label: "Give" },
  { href: "/contact", label: "Contact" },
];

export function PageShell({ hero, className, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-muted text-foreground">
      <header className="border-b border-border bg-card/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src="/tod-logo.png"
              alt="Tabernacle of David Assembly City Mission Church logo"
              width={220}
              height={64}
              className="h-9 w-auto sm:h-10"
              priority
            />
            <span className="hidden max-w-[11rem] text-xs leading-snug text-muted-foreground lg:inline">
              A place to know Jesus & find community
            </span>
          </Link>
          <nav className="hidden gap-4 text-xs font-medium text-muted-foreground sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1 text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

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

      <footer className="border-t border-border bg-card/80 py-6 text-xs text-muted-foreground backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <Image
              src="/tod-logo.png"
              alt=""
              width={160}
              height={48}
              className="h-8 w-auto opacity-90 dark:opacity-80"
            />
            <div>
              <p className="font-medium text-foreground">
                Tabernacle of David Missons Church
              </p>
              <p>Given Lubinda Road, Lusaka</p>
              <p>Sundays 9:00am & 11:00am</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <a
                href="mailto:TOD@gmail.com"
                className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                TOD@gmail.com
              </a>
              <a
                href="tel:+15555550123"
                className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                +1 (555) 555-0123
              </a>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
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
        </div>
      </footer>
    </div>
  );
}

