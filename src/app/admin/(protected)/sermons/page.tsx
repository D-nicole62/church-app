import Link from "next/link";
import { SermonMediaType } from "@/generated/prisma/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { YouTubeImportPanel } from "@/components/admin/YouTubeImportPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { extractYouTubeVideoId } from "@/lib/sermons/media";
import { listStoredSermons } from "@/lib/sermons/store";
import { loadYouTubeCatalog } from "@/lib/sermons/youtube";

type AdminSermonsPageProps = {
  searchParams?: Promise<{ success?: string; error?: string; count?: string }>;
};

export default async function AdminSermonsPage({ searchParams }: AdminSermonsPageProps) {
  const query = (await searchParams) ?? {};
  const [sermons, youtube] = await Promise.all([
    listStoredSermons(),
    loadYouTubeCatalog(null),
  ]);
  const saved = sermons.flatMap((sermon) => {
    const videoId = sermon.youtubeVideoId || extractYouTubeVideoId(sermon.mediaUrl);
    return videoId ? [{ videoId, sermonId: sermon.id }] : [];
  });
  const syncedCount =
    query.success === "synced" && query.count && /^\d+$/.test(query.count)
      ? Number(query.count)
      : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Sermons"
        title="Sermons"
        description="The public page lists the YouTube channel. Import a video when you want to add the speaker, series, or scripture."
        action={
          <Link href="/admin/sermons/new">
            <Button>New sermon</Button>
          </Link>
        }
      />

      {query.success === "deleted" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Sermon deleted.
        </p>
      ) : null}

      <YouTubeImportPanel
        videos={youtube.ok ? youtube.videos : null}
        saved={saved}
        syncedCount={syncedCount}
        error={query.error ?? null}
      />

      <Card header={<h2 className="text-sm font-medium text-foreground">Published sermons</h2>}>
        {sermons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sermons yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table aria-label="Published sermons" className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">Title</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {sermons.map((sermon) => (
                  <tr key={sermon.id} className="border-b border-border/60">
                    <td className="px-2 py-3 font-medium text-foreground">{sermon.title}</td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {sermon.mediaType === SermonMediaType.AUDIO ? "Audio" : "Video"}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {sermon.date.toLocaleDateString()}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Link
                        href={`/admin/sermons/${sermon.id}`}
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
