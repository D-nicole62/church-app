import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SermonForm } from "@/components/admin/SermonForm";
import { Card } from "@/components/ui/card";
import { createSermonAction } from "@/lib/sermons/actions";

type NewSermonPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewSermonPage({ searchParams }: NewSermonPageProps) {
  const query = (await searchParams) ?? {};

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Sermons"
        title="Add sermon"
        description="Audio sermons use an mp3 URL. Video sermons use a YouTube link or an mp4 URL."
      />
      {query.error === "missing-required" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Title, date, and media URL are required.
        </p>
      ) : null}
      <Card header={<p className="text-sm font-medium">Sermon details</p>}>
        <SermonForm action={createSermonAction} submitLabel="Publish sermon" />
      </Card>
    </div>
  );
}
