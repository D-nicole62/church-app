import { PageShell } from "@/components/layout/PageShell";

export const dynamic = "force-dynamic";
import { SermonPlayer } from "@/components/sermons/SermonPlayer";
import { Card } from "@/components/ui/card";
import { queryDatabase } from "@/lib/db";
import { prisma } from "@/lib/prisma";

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
      {sermons.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sermons available yet.</p>
      ) : (
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
                  <p className="text-sm font-medium text-foreground">{sermon.title}</p>
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
