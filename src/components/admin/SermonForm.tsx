import { SermonMediaType, type Sermon } from "@/generated/prisma/client";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SermonFormProps = {
  action: (formData: FormData) => Promise<void>;
  sermon?: Sermon;
  submitLabel: string;
};

export function SermonForm({ action, sermon, submitLabel }: SermonFormProps) {
  const dateValue = sermon?.date ? sermon.date.toISOString().slice(0, 10) : "";

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground/80">
          Title *
        </label>
        <Input name="title" defaultValue={sermon?.title ?? ""} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Speaker
          </label>
          <Input name="speaker" defaultValue={sermon?.speaker ?? ""} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Date *
          </label>
          <Input type="date" name="date" defaultValue={dateValue} required />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground/80">
          Description
        </label>
        <Textarea name="description" defaultValue={sermon?.description ?? ""} rows={4} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Type *
          </label>
          <AdminSelect
            name="mediaType"
            defaultValue={sermon?.mediaType ?? SermonMediaType.VIDEO}
          >
            <option value={SermonMediaType.AUDIO}>Audio</option>
            <option value={SermonMediaType.VIDEO}>Video</option>
          </AdminSelect>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Media URL *
          </label>
          <Input
            name="mediaUrl"
            type="url"
            defaultValue={sermon?.mediaUrl ?? ""}
            placeholder="https://… (YouTube, mp3, or mp4)"
            required
          />
        </div>
      </div>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
