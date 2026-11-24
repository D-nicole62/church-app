"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState, type ReactNode } from "react";
import { ChurchLogo } from "@/components/layout/ChurchLogo";
import {
  CELL_CHURCH_STRUCTURE,
  cellAnchor,
  regionAnchor,
} from "@/lib/cell-church-structure";
import { MINISTRY_CLUSTERS, clusterAnchor } from "@/lib/church-ministries";

const NAV_BEFORE_GROUPS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/visit", label: "Plan Your Visit" },
  { href: "/events", label: "Events" },
  { href: "/sermons", label: "Sermons" },
] as const;

const NAV_AFTER_GROUPS = [
  { href: "/children", label: "Children's Church" },
  { href: "/missions", label: "Missions" },
  { href: "/give", label: "Give" },
  { href: "/contact", label: "Contact" },
] as const;

export const PUBLIC_NAV_ITEMS = [
  ...NAV_BEFORE_GROUPS,
  { href: "/groups#ministry-clusters", label: "Ministry clusters" },
  { href: "/groups#cell-church-regions", label: "Cell church regions" },
  { href: "/groups#cell-groups", label: "Cell groups" },
  ...NAV_AFTER_GROUPS,
] as const;

const linkClass =
  "inline-flex min-h-11 items-center rounded-md px-2 py-2 text-xs font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary";

function clusterLinks() {
  return MINISTRY_CLUSTERS.map((cluster) => ({
    href: `/groups#${clusterAnchor(cluster.title)}`,
    label: cluster.title,
  }));
}

function regionLinks() {
  return CELL_CHURCH_STRUCTURE.regions.map((region) => ({
    href: `/groups#${regionAnchor(region.name)}`,
    label: region.name,
  }));
}

function cellLinks() {
  return CELL_CHURCH_STRUCTURE.regions.map((region) => ({
    title: region.name,
    links: region.zones.flatMap((zone) =>
      zone.cells.map((cell) => ({
        href: `/groups#${cellAnchor(region.name, cell)}`,
        label: cell,
      })),
    ),
  }));
}

function MenuLinks({ items }: { items: ReadonlyArray<{ href: string; label: string }> }) {
  return items.map((item) => (
    <Link key={item.href} href={item.href} className={linkClass}>
      {item.label}
    </Link>
  ));
}

function DesktopDropdown({
  label,
  open,
  onToggle,
  align = "start",
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  align?: "start" | "end";
  children: ReactNode;
}) {
  const panelId = useId();

  return (
    <div className="relative">
      <button
        type="button"
        className={`${linkClass} gap-1`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {label}
        <span aria-hidden className="text-[10px]">
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open ? (
        <div
          id={panelId}
          className={`absolute top-full z-40 mt-1 max-h-80 w-72 max-w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border bg-card p-2 text-sm shadow-lg ${
            align === "end" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function ClusterMenuList() {
  return (
    <ul className="space-y-0.5">
      {clusterLinks().map((cluster) => (
        <li key={cluster.href}>
          <a
            href={cluster.href}
            className="flex min-h-11 items-center rounded-md px-2 py-2 text-foreground hover:bg-primary/10 hover:text-primary"
          >
            {cluster.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function RegionMenuList() {
  return (
    <ul className="space-y-0.5">
      {regionLinks().map((region) => (
        <li key={region.href}>
          <a
            href={region.href}
            className="flex min-h-11 items-center rounded-md px-2 py-2 text-foreground hover:bg-primary/10 hover:text-primary"
          >
            {region.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function CellMenuList() {
  return (
    <div className="space-y-3">
      {cellLinks().map((region) =>
        region.links.length === 0 ? null : (
          <div key={region.title}>
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {region.title}
            </p>
            <ul className="mt-1 space-y-0.5">
              {region.links.map((cell) => (
                <li key={cell.href}>
                  <a
                    href={cell.href}
                    className="flex min-h-11 items-center rounded-md px-2 py-2 text-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    {cell.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ),
      )}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState<
    "clusters" | "regions" | "cells" | null
  >(null);
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
    setDesktopMenu(null);
  }

  function toggleDesktop(menu: "clusters" | "regions" | "cells") {
    setDesktopMenu((current) => (current === menu ? null : menu));
  }

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 rounded-lg outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChurchLogo variant="header" />
          <span className="hidden max-w-[14rem] text-[11px] leading-snug text-muted-foreground 2xl:inline">
            A perfect place for imperfect people to meet a perfect Christ
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 flex-wrap items-center justify-end gap-x-0.5 gap-y-1 text-xs font-medium text-muted-foreground lg:flex"
          aria-label="Primary"
        >
          <MenuLinks items={NAV_BEFORE_GROUPS} />
          <DesktopDropdown
            label="Ministry clusters"
            open={desktopMenu === "clusters"}
            onToggle={() => toggleDesktop("clusters")}
          >
            <ClusterMenuList />
          </DesktopDropdown>
          <DesktopDropdown
            label="Cell church regions"
            open={desktopMenu === "regions"}
            onToggle={() => toggleDesktop("regions")}
          >
            <RegionMenuList />
          </DesktopDropdown>
          <DesktopDropdown
            label="Cell groups"
            open={desktopMenu === "cells"}
            onToggle={() => toggleDesktop("cells")}
            align="end"
          >
            <CellMenuList />
          </DesktopDropdown>
          <MenuLinks items={NAV_AFTER_GROUPS} />
        </nav>

        <button
          type="button"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-primary-nav"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span aria-hidden className="text-base leading-none">
            {menuOpen ? "✕" : "☰"}
          </span>
          Menu
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-primary-nav"
          className="border-t border-border bg-card px-4 py-3 lg:hidden"
          aria-label="Primary"
        >
          <ul className="flex flex-col gap-1">
            {NAV_BEFORE_GROUPS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <details className="rounded-lg px-3 py-2">
                <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-foreground">
                  Ministry clusters
                </summary>
                <div className="mt-2">
                  <ClusterMenuList />
                </div>
              </details>
            </li>
            <li>
              <details className="rounded-lg px-3 py-2">
                <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-foreground">
                  Cell church regions
                </summary>
                <div className="mt-2">
                  <RegionMenuList />
                </div>
              </details>
            </li>
            <li>
              <details className="rounded-lg px-3 py-2">
                <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-foreground">
                  Cell groups
                </summary>
                <div className="mt-2 max-h-72 overflow-y-auto">
                  <CellMenuList />
                </div>
              </details>
            </li>
            {NAV_AFTER_GROUPS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary"
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
