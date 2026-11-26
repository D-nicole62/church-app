import Image from "next/image";
import Link from "next/link";
import { SermonDetails } from "@/components/sermons/SermonDetails";
import type { PublicSermon } from "@/lib/sermons/catalog";
import { youtubeThumbnailUrl } from "@/lib/sermons/media";
import { formatSermonDate, shortDescription } from "@/lib/sermons/text";

export function SermonCard({ sermon }: { sermon: PublicSermon }) {
  const summary = shortDescription(sermon.description);
  const dateLabel = formatSermonDate(sermon.date);

  return (
    <article className="min-w-0">
      <Link
        href={`/sermons/${sermon.id}`}
        className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card/90 shadow-sm shadow-slate-900/5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-video bg-muted">
          {sermon.youtubeId ? (
            <Image
              src={youtubeThumbnailUrl(sermon.youtubeId)}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {sermon.mediaType === "AUDIO" ? "Audio" : "Video"}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <time dateTime={sermon.date.toISOString()} className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {dateLabel}
            {sermon.youtubeId ? null : sermon.mediaType === "AUDIO" ? " · Audio" : " · Video"}
          </time>
          <h3 className="break-words text-sm font-medium text-foreground">{sermon.title}</h3>
          {summary ? <p className="line-clamp-3 text-sm text-muted-foreground">{summary}</p> : null}
          <div className="mt-auto">
            <SermonDetails sermon={sermon} />
          </div>
        </div>
      </Link>
    </article>
  );
}
