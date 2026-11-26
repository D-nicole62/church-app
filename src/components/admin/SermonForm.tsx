import { SermonMediaType } from "@/generated/prisma/client";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SermonFormValues = {
  title: string;
  speaker: string | null;
  series: string | null;
  scripture: string | null;
  date: Date;
  description: string | null;
  mediaType: SermonMediaType;
  mediaUrl: string;
};

type SermonFormProps = {
  action: (formData: FormData) => Promise<void>;
  sermon?: SermonFormValues;
  submitLabel: string;
};

export function SermonForm({ action, sermon, submitLabel }: SermonFormProps) {
  const dateValue = sermon?.date ? sermon.date.toISOString().slice(0, 10) : "";

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="sermon-title" className="mb-1 block text-xs font-medium text-foreground/80">
          Title *
        </label>
        <Input id="sermon-title" name="title" defaultValue={sermon?.title ?? ""} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="sermon-speaker" className="mb-1 block text-xs font-medium text-foreground/80">
            Speaker
          </label>
          <Input id="sermon-speaker" name="speaker" defaultValue={sermon?.speaker ?? ""} />
        </div>
        <div>
          <label htmlFor="sermon-date" className="mb-1 block text-xs font-medium text-foreground/80">
            Date *
          </label>
          <Input id="sermon-date" type="date" name="date" defaultValue={dateValue} required />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="sermon-series" className="mb-1 block text-xs font-medium text-foreground/80">
            Series
          </label>
          <Input id="sermon-series" name="series" defaultValue={sermon?.series ?? ""} />
        </div>
        <div>
          <label htmlFor="sermon-scripture" className="mb-1 block text-xs font-medium text-foreground/80">
            Scripture
          </label>
          <Input
            id="sermon-scripture"
            name="scripture"
            defaultValue={sermon?.scripture ?? ""}
            placeholder="John 3:16"
          />
        </div>
      </div>
      <div>
        <label htmlFor="sermon-description" className="mb-1 block text-xs font-medium text-foreground/80">
          Description
        </label>
        <Textarea
          id="sermon-description"
          name="description"
          defaultValue={sermon?.description ?? ""}
          rows={4}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="sermon-type" className="mb-1 block text-xs font-medium text-foreground/80">
            Type *
          </label>
          <AdminSelect
            id="sermon-type"
            name="mediaType"
            defaultValue={sermon?.mediaType ?? SermonMediaType.VIDEO}
          >
            <option value={SermonMediaType.AUDIO}>Audio</option>
            <option value={SermonMediaType.VIDEO}>Video</option>
          </AdminSelect>
        </div>
        <div>
          <label htmlFor="sermon-media-url" className="mb-1 block text-xs font-medium text-foreground/80">
            Media URL *
          </label>
          <Input
            id="sermon-media-url"
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
