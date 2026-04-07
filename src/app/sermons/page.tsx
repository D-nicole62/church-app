import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type Sermon = {
  id: string;
  title: string;
  speaker: string | null;
  series: string | null;
  date: string;
  description: string | null;
  youtube_url: string | null;
  audio_url: string | null;
};

export default async function SermonsPage() {
  if (!supabase) {
    return (
      <PageShell
        hero={
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
              Messages
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Watch or listen to recent sermons.
            </h1>
          </div>
        }
      >
        <p className="text-sm text-red-600 dark:text-red-300">
          We couldn&apos;t load sermons right now. Please try again later.
        </p>
      </PageShell>
    );
  }

  const { data, error } = await supabase
    .from("sermons")
    .select("*")
    .order("date", { ascending: false })
    .limit(24);

  if (error) {
    return (
      <PageShell
        hero={
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
              Messages
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Watch or listen to recent sermons.
            </h1>
          </div>
        }
      >
        <p className="text-sm text-red-600 dark:text-red-300">
          We couldn&apos;t load sermons right now. Please try again later.
        </p>
      </PageShell>
    );
  }

  const sermons = (data || []) as Sermon[];

  return (
    <PageShell
      hero={
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
      }
    >
      {sermons.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sermons will appear here once they&apos;re published.
        </p>
      ) : (
        <section className="grid gap-4 md:grid-cols-3">
          {sermons.map((sermon) => (
            <Card
              key={sermon.id}
              header={
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {new Date(sermon.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {sermon.title}
                  </p>
                  {sermon.series && (
                    <p className="text-xs text-muted-foreground">{sermon.series}</p>
                  )}
                </div>
              }
              footer={
                <div className="flex flex-wrap gap-3">
                  {sermon.youtube_url && (
                    <Link
                      href={sermon.youtube_url}
                      target="_blank"
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Watch
                    </Link>
                  )}
                  {sermon.audio_url && (
                    <Link
                      href={sermon.audio_url}
                      target="_blank"
                      className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Listen
                    </Link>
                  )}
                </div>
              }
            >
              <p className="line-clamp-3 text-ellipsis">
                {sermon.description}
              </p>
              {sermon.speaker && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Taught by {sermon.speaker}
                </p>
              )}
            </Card>
          ))}
        </section>
      )}
    </PageShell>
  );
}

