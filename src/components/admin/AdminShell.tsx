import Link from "next/link";
import { signOut } from "@/auth";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { CHURCH_NAME_SHORT } from "@/lib/site";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/groups", label: "Groups" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/visitors", label: "Visitors" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/finance", label: "Finance" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/reports", label: "Reports" },
];

type AdminShellProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: keyof typeof ROLE_LABELS;
  };
  currentPath?: string;
};

export function AdminShell({ children, user, currentPath }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
          <div className="border-b border-border px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Admin
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {CHURCH_NAME_SHORT}
            </p>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  currentPath === item.href ||
                  (item.href !== "/admin" && currentPath?.startsWith(item.href))
                    ? "block rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground"
                    : "block rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-4">
            <p className="text-sm font-medium text-foreground">
              {user.name ?? user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {ROLE_LABELS[user.role]}
            </p>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
              className="mt-3"
            >
              <button
                type="submit"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-border bg-card px-4 py-4 md:hidden">
            <p className="text-sm font-semibold">{CHURCH_NAME_SHORT} Admin</p>
            <p className="text-xs text-muted-foreground">
              {ROLE_LABELS[user.role]}
            </p>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
