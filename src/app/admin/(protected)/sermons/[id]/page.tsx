import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SermonForm } from "@/components/admin/SermonForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteSermonAction, updateSermonAction } from "@/lib/sermons/actions";
import { findStoredSermon } from "@/lib/sermons/store";

type SermonDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string; schema?: string }>;
};

export default async function SermonDetailPage({
  params,
  searchParams,
}: SermonDetailPageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const sermon = await findStoredSermon(id);
  if (!sermon) {
    notFound();
  }

  const updateAction = updateSermonAction.bind(null, id);
  const removeAction = deleteSermonAction.bind(null, id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Sermons"
        title={sermon.title}
        description={
          sermon.youtubeVideoId
            ? "This video is on the YouTube channel. Speaker, series, and scripture added here show on the public page."
            : "Update this message or remove it from the public Sermons page."
        }
        action={
          <Link href="/admin/sermons">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />
      {query.success === "created" || query.success === "updated" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Sermon saved. It is listed on the public sermons page.
        </p>
      ) : null}
      {query.success === "imported" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Imported from YouTube. Add the speaker, series, and scripture, then save.
        </p>
      ) : null}
      {query.error === "missing-required" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Title, date, and media URL are required.
        </p>
      ) : null}
      {query.schema === "pending" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          The video link and speaker were saved. Series, scripture, and the YouTube id
          need the database update before they can be stored.
        </p>
      ) : null}
      {query.error === "duplicate-video" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Another sermon already uses that YouTube video.
        </p>
      ) : null}
      <Card header={<p className="text-sm font-medium">Edit sermon</p>}>
        <SermonForm action={updateAction} sermon={sermon} submitLabel="Save changes" />
      </Card>
      <form action={removeAction}>
        <Button type="submit" variant="secondary">
          Delete sermon
        </Button>
      </form>
    </div>
  );
}
