import Link from "next/link";
import { importYouTubeSermonAction, syncYouTubeSermonsAction } from "@/lib/sermons/actions";
import { formatSermonDate } from "@/lib/sermons/text";
import type { YouTubeVideo } from "@/lib/sermons/youtube-feed";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SavedVideo = {
  videoId: string;
  sermonId: string;
};

type YouTubeImportPanelProps = {
  videos: YouTubeVideo[] | null;
  saved: SavedVideo[];
  syncedCount: number | null;
  error: string | null;
};

export function YouTubeImportPanel({
  videos,
  saved,
  syncedCount,
  error,
}: YouTubeImportPanelProps) {
  const savedByVideo = new Map(saved.map((item) => [item.videoId, item.sermonId]));

  return (
    <Card
      header={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-foreground">YouTube channel</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              The public page already lists these videos. Import one to add the speaker,
              series, and scripture.
            </p>
          </div>
          <form action={syncYouTubeSermonsAction}>
            <Button type="submit" variant="secondary">
              Sync from YouTube
            </Button>
          </form>
        </div>
      }
    >
      {syncedCount === 0 ? (
        <p className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          YouTube is already up to date.
        </p>
      ) : null}
      {syncedCount !== null && syncedCount > 0 ? (
        <p className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Imported {syncedCount} {syncedCount === 1 ? "sermon" : "sermons"} from YouTube.
          Add a speaker, series, and scripture on each one.
        </p>
      ) : null}
      {error === "youtube-unavailable" ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          YouTube could not be reached. You can still add a sermon by hand.
        </p>
      ) : null}
      {error === "unknown-video" ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          That video is no longer in the latest channel list.
        </p>
      ) : null}
      {videos === null ? (
        <p className="text-sm text-muted-foreground">
          The channel list is unavailable right now.
        </p>
      ) : videos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No videos were found on the channel.</p>
      ) : (
        <div className="overflow-x-auto">
          <table aria-label="YouTube sermons" className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Published</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => {
                const sermonId = savedByVideo.get(video.id);
                return (
                  <tr key={video.id} className="border-b border-border/60">
                    <td className="max-w-xs px-2 py-3 font-medium text-foreground">{video.title}</td>
                    <td className="whitespace-nowrap px-2 py-3 text-muted-foreground">
                      {formatSermonDate(new Date(video.publishedAt))}
                    </td>
                    <td className="px-2 py-3 text-right">
                      {sermonId ? (
                        <Link
                          href={`/admin/sermons/${sermonId}`}
                          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Edit details
                        </Link>
                      ) : (
                        <form action={importYouTubeSermonAction}>
                          <input type="hidden" name="videoId" value={video.id} />
                          <Button type="submit">Import</Button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
