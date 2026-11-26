import type { ReactNode } from "react";
import Link from "next/link";
import { FeaturedSermon } from "@/components/sermons/FeaturedSermon";
import { LiveNowBanner } from "@/components/sermons/LiveNowBanner";
import { SermonCard } from "@/components/sermons/SermonCard";
import { UploadsFallback } from "@/components/sermons/UploadsFallback";
import { Button } from "@/components/ui/button";
import type { SermonCatalog } from "@/lib/sermons/catalog";
import { YOUTUBE_URL } from "@/lib/site";

function ChannelLink() {
  return (
    <Link
      href={YOUTUBE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full sm:w-auto"
    >
      <Button className="w-full sm:w-auto">Watch on YouTube</Button>
    </Link>
  );
}

function SermonGrid({ sermons }: { sermons: SermonCatalog["rest"] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sermons.map((sermon) => (
        <SermonCard key={sermon.dbId ?? sermon.id} sermon={sermon} />
      ))}
    </div>
  );
}

export function SermonBrowser({ catalog }: { catalog: SermonCatalog }) {
  const intro =
    catalog.status === "fallback"
      ? "The channel list could not be loaded just now. Recent uploads still play below, and you can open the channel for the full archive."
      : "The latest messages from the church YouTube channel, newest first. Choose one to watch it here.";

  let body: ReactNode;
  switch (catalog.status) {
    case "fallback":
      body = (
        <>
          <UploadsFallback />
          {catalog.rest.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Saved sermons</h2>
              <SermonGrid sermons={catalog.rest} />
            </section>
          ) : null}
        </>
      );
      break;
    case "page-unavailable":
      body = (
        <div className="rounded-2xl border border-border bg-card/90 p-5">
          <h2 className="text-lg font-semibold text-foreground">That page of sermons is unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Go back to the latest messages, or open the channel on YouTube.
          </p>
          <Link
            href="/sermons"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to the latest
          </Link>
        </div>
      );
      break;
    case "ready":
      body = (
        <>
          {catalog.featured ? <FeaturedSermon sermon={catalog.featured} /> : null}
          {catalog.rest.length > 0 ? (
            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {catalog.featured || !catalog.isFirstPage ? "More sermons" : "Recent sermons"}
                </h2>
                {catalog.isFirstPage ? null : (
                  <Link
                    href="/sermons"
                    className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Back to the latest
                  </Link>
                )}
              </div>
              <SermonGrid sermons={catalog.rest} />
            </section>
          ) : null}
          {catalog.featured || catalog.rest.length > 0 ? null : (
            <p className="text-sm text-muted-foreground">
              No messages have been posted on the channel yet.
            </p>
          )}
          {catalog.nextPageToken ? (
            <Link
              href={`/sermons?page=${encodeURIComponent(catalog.nextPageToken)}`}
              className="inline-flex min-h-11 items-center self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              More sermons
            </Link>
          ) : null}
        </>
      );
      break;
    default: {
      const unreachable: never = catalog.status;
      body = unreachable;
    }
  }

  return (
    <>
      {catalog.live ? <LiveNowBanner live={catalog.live} /> : null}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">Watch our services on YouTube</p>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{intro}</p>
          </div>
          <ChannelLink />
        </div>
      </section>
      {body}
    </>
  );
}
