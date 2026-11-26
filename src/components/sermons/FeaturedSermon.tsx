import Link from "next/link";
import { SermonDetails } from "@/components/sermons/SermonDetails";
import { SermonPlayer } from "@/components/sermons/SermonPlayer";
import { YouTubeFacade } from "@/components/sermons/YouTubeFacade";
import type { PublicSermon } from "@/lib/sermons/catalog";
import { formatSermonDate, shortDescription } from "@/lib/sermons/text";

export function FeaturedSermon({ sermon }: { sermon: PublicSermon }) {
  const summary = shortDescription(sermon.description, 280);
  const dateLabel = formatSermonDate(sermon.date);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card/90 shadow-sm shadow-slate-900/5">
      {sermon.youtubeId ? (
        <YouTubeFacade
          videoId={sermon.youtubeId}
          title={sermon.title}
          priority
          sizes="(min-width: 1024px) 1152px, 100vw"
        />
      ) : (
        <div className="p-5 pb-0">
          <SermonPlayer
            mediaType={sermon.mediaType}
            mediaUrl={sermon.mediaUrl}
            title={sermon.title}
            priority
          />
        </div>
      )}
      <div className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Latest message ·{" "}
          <time dateTime={sermon.date.toISOString()}>{dateLabel}</time>
        </p>
        <h2 className="break-words text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          <Link href={`/sermons/${sermon.id}`} className="underline-offset-4 hover:underline">
            {sermon.title}
          </Link>
        </h2>
        {summary ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{summary}</p> : null}
        <SermonDetails sermon={sermon} />
        <Link
          href={`/sermons/${sermon.id}`}
          className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Sermon details
        </Link>
      </div>
    </article>
  );
}
