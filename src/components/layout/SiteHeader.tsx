"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChurchLogo } from "@/components/layout/ChurchLogo";

export const PUBLIC_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/visit", label: "Plan Your Visit" },
  { href: "/events", label: "Events" },
  { href: "/sermons", label: "Sermons" },
  { href: "/groups", label: "Groups" },
  { href: "/children", label: "Children's Church" },
  { href: "/missions", label: "Missions" },
  { href: "/give", label: "Give" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-1 rounded-lg outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring sm:gap-3"
        >
          <ChurchLogo variant="header" priority className="-ml-1 sm:-ml-2" />
          <span className="hidden max-w-[14rem] text-[11px] leading-snug text-muted-foreground xl:inline">
            A perfect place for imperfect people to meet a perfect Christ
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 text-xs font-medium text-muted-foreground lg:flex"
          aria-label="Primary"
        >
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-1 text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-primary-nav"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden className="text-base leading-none">
            {open ? "✕" : "☰"}
          </span>
          Menu
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-primary-nav"
          className="border-t border-border bg-card px-4 py-3 lg:hidden"
          aria-label="Primary"
        >
          <ul className="flex flex-col gap-1">
            {PUBLIC_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
