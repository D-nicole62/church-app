import type { PropsWithChildren, ReactNode } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
              Tabernacle of David Missons Church
            </span>
            <span className="hidden text-xs text-zinc-500 sm:inline">
              A place to know Jesus & find community
            </span>
          </Link>
          <nav className="hidden gap-4 text-xs font-medium text-zinc-600 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {hero && (
        <section className="border-b border-zinc-200 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-zinc-50 dark:border-zinc-800">
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

      <footer className="border-t border-zinc-200 bg-white/80 py-6 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <div>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">
              Tabernacle of David Missons Church
            </p>
            <p>Given Lubinda Road, Lusaka</p>
            <p>Sundays 9:00am & 11:00am</p>
          </div>
          <div className="flex gap-4">
            <a href="mailto:TOD@gmail.com">TOD@gmail.com</a>
            <a href="tel:+15555550123">+1 (555) 555-0123</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

