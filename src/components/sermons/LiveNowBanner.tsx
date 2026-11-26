import Link from "next/link";
import type { LiveStream } from "@/lib/sermons/youtube-api";

export function LiveNowBanner({ live }: { live: LiveStream }) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-2xl border border-brand-green/40 bg-brand-green-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="min-w-0 text-sm font-medium text-foreground">
        <span className="mr-2 inline-flex items-center rounded-full bg-brand-green px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-green-foreground">
          Live now
        </span>
        <span className="break-words">{live.title}</span>
      </p>
      <Link
        href={`/sermons/${live.id}`}
        className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        Watch the live service
      </Link>
    </div>
  );
}
