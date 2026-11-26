import { PageShell } from "@/components/layout/PageShell";
import { SermonBrowser } from "@/components/sermons/SermonBrowser";
import { pageMetadata } from "@/lib/seo";
import { getSermonCatalog } from "@/lib/sermons/queries";
import { sanitizePageToken } from "@/lib/sermons/youtube-api";

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

type SermonsPageProps = {
  searchParams?: Promise<{ page?: string }>;
};

export default async function SermonsPage({ searchParams }: SermonsPageProps) {
  const params = (await searchParams) ?? {};
  const catalog = await getSermonCatalog(sanitizePageToken(params.page));

  return (
    <PageShell hero={hero}>
      <SermonBrowser catalog={catalog} />
    </PageShell>
  );
}
