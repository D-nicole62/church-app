import type { PublicSermon } from "@/lib/sermons/catalog";

export function SermonDetails({ sermon }: { sermon: PublicSermon }) {
  if (!sermon.speaker && !sermon.series && !sermon.scripture) return null;

  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      {sermon.speaker ? <p>Taught by {sermon.speaker}</p> : null}
      {sermon.series ? <p>Series: {sermon.series}</p> : null}
      {sermon.scripture ? <p>Scripture: {sermon.scripture}</p> : null}
    </div>
  );
}
