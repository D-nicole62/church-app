import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { SermonPlayer } from "@/components/sermons/SermonPlayer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { queryDatabase } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { pageMetadata } from "@/lib/seo";
import { YOUTUBE_UPLOADS_PLAYLIST_ID, YOUTUBE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Sermons",
  description:
    "Watch Sunday services and recent messages from Tabernacle of David Assembly-City Mission Church on YouTube.",
  path: "/sermons",
});

const hero = (
  <div className="space-y-3">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
      Messages
    </p>
    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
      Watch or listen to recent sermons.
    </h1>
    <p className="max-w-2xl text-sm text-white/85 sm:text-base">
      Be encouraged and strengthened by teaching from God&apos;s Word.
    </p>
  </div>
);

export default async function SermonsPage() {
  const sermons = await queryDatabase(
    () => prisma.sermon.findMany({ orderBy: { date: "desc" } }),
    [],
  );

  return (
    <PageShell hero={hero}>
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Watch our services on YouTube
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Recent uploads from the church channel play below. You can also
              open the channel to watch a full service.
            </p>
          </div>
          <Link
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto">Watch on YouTube</Button>
          </Link>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
          <iframe
            title="Latest uploads from Tabernacle of David Assembly on YouTube"
            src={`https://www.youtube-nocookie.com/embed/videoseries?list=${YOUTUBE_UPLOADS_PLAYLIST_ID}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </section>
      {sermons.length === 0 ? null : (
        <section className="grid gap-4 md:grid-cols-2">
          {sermons.map((sermon) => (
            <Card
              key={sermon.id}
              header={
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {sermon.date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" · "}
                    {sermon.mediaType === "AUDIO" ? "Audio" : "Video"}
                  </p>
                  <h3 className="text-sm font-medium text-foreground">{sermon.title}</h3>
                </div>
              }
            >
              {sermon.description ? <p>{sermon.description}</p> : null}
              {sermon.speaker ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Taught by {sermon.speaker}
                </p>
              ) : null}
              <SermonPlayer
                mediaType={sermon.mediaType}
                mediaUrl={sermon.mediaUrl}
                title={sermon.title}
              />
            </Card>
          ))}
        </section>
      )}
    </PageShell>
  );
}
