import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { SermonDetails } from "@/components/sermons/SermonDetails";
import { SermonPlayer } from "@/components/sermons/SermonPlayer";
import { Button } from "@/components/ui/button";
import { CHURCH_NAME, SITE_URL, YOUTUBE_URL } from "@/lib/site";
import { watchUrlFor, type PublicSermon } from "@/lib/sermons/catalog";
import { getSermonByPublicId } from "@/lib/sermons/queries";
import { pageMetadata } from "@/lib/seo";
import { formatSermonDate, shortDescription } from "@/lib/sermons/text";

export const dynamic = "force-dynamic";

type SermonPageProps = {
  params: Promise<{ id: string }>;
};

function sermonDescription(sermon: PublicSermon) {
  return (
    shortDescription(sermon.description, 300) ||
    `A message from ${CHURCH_NAME}.`
  );
}

function videoJsonLd(sermon: PublicSermon) {
  if (!sermon.youtubeId || !sermon.thumbnailUrl) return null;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: sermon.title,
    description: sermonDescription(sermon),
    thumbnailUrl: [sermon.thumbnailUrl],
    uploadDate: sermon.date.toISOString(),
    embedUrl: `https://www.youtube-nocookie.com/embed/${sermon.youtubeId}`,
    contentUrl: watchUrlFor(sermon),
    publisher: {
      "@type": "Church",
      name: CHURCH_NAME,
      url: SITE_URL,
    },
  };
}

export async function generateMetadata({ params }: SermonPageProps): Promise<Metadata> {
  const { id } = await params;
  const sermon = await getSermonByPublicId(id);
  if (!sermon) {
    return pageMetadata({
      title: "Sermon",
      description: `Messages from ${CHURCH_NAME}.`,
      path: "/sermons",
    });
  }

  return pageMetadata({
    title: sermon.title,
    description: sermonDescription(sermon),
    path: `/sermons/${sermon.id}`,
    image: sermon.thumbnailUrl
      ? { url: sermon.thumbnailUrl, alt: sermon.title, width: 480, height: 360 }
      : undefined,
    openGraphType: sermon.youtubeId ? "video.other" : "article",
  });
}

export default async function SermonDetailPage({ params }: SermonPageProps) {
  const { id } = await params;
  const sermon = await getSermonByPublicId(id);
  if (!sermon) notFound();

  const jsonLd = videoJsonLd(sermon);
  const dateLabel = formatSermonDate(sermon.date);
  const externalUrl = sermon.youtubeId ? watchUrlFor(sermon) : null;

  const hero = (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
        Messages
      </p>
      <h1 className="break-words text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {sermon.title}
      </h1>
      <p className="max-w-2xl text-sm text-white/85 sm:text-base">
        <time dateTime={sermon.date.toISOString()}>{dateLabel}</time>
        {sermon.speaker ? ` · ${sermon.speaker}` : ""}
      </p>
    </div>
  );

  return (
    <PageShell hero={hero}>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/sermons"
          className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          All sermons
        </Link>
        {externalUrl ? (
          <Link
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto"
          >
            <Button variant="secondary" className="w-full sm:w-auto">
              Watch on YouTube
            </Button>
          </Link>
        ) : (
          <Link href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Church channel
            </Button>
          </Link>
        )}
      </div>
      <article className="overflow-hidden rounded-2xl border border-border bg-card/90 shadow-sm shadow-slate-900/5">
        <div className="p-5">
          <SermonPlayer
            mediaType={sermon.mediaType}
            mediaUrl={sermon.mediaUrl}
            title={sermon.title}
            priority
          />
          <div className="mt-4 space-y-3">
            <SermonDetails sermon={sermon} />
            {sermon.description ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {sermon.description}
              </p>
            ) : null}
          </div>
        </div>
      </article>
    </PageShell>
  );
}
