import { NotificationChannel } from "@/generated/prisma/client";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type NotificationComposerProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  defaultSubject: string;
  defaultBody: string;
  showAudience?: boolean;
  groupOptions?: { id: string; name: string }[];
};

export function NotificationComposer({
  action,
  submitLabel,
  defaultSubject,
  defaultBody,
  showAudience = false,
  groupOptions = [],
}: NotificationComposerProps) {
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Channel
          </label>
          <AdminSelect name="channel" defaultValue={NotificationChannel.EMAIL}>
            <option value={NotificationChannel.EMAIL}>Email</option>
            <option value={NotificationChannel.SMS}>SMS</option>
          </AdminSelect>
        </div>
        {showAudience && (
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Audience
            </label>
            <AdminSelect name="audience" defaultValue="rsvps">
              <option value="rsvps">Event RSVPs</option>
              <option value="group">Specific group</option>
              <option value="campus">Event campus</option>
              <option value="all_people">All people (max 500)</option>
            </AdminSelect>
          </div>
        )}
      </div>

      {showAudience && groupOptions.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Group (when audience is &quot;Specific group&quot;)
          </label>
          <AdminSelect name="groupId" defaultValue="">
            <option value="">Select group</option>
            {groupOptions.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </AdminSelect>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-foreground/80">
          Subject
        </label>
        <Input name="subject" defaultValue={defaultSubject} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-foreground/80">
          Message
        </label>
        <Textarea
          name="body"
          rows={4}
          defaultValue={defaultBody}
          placeholder="Use {name} to personalize."
          required
        />
      </div>

      <Button type="submit" variant="secondary">
        {submitLabel}
      </Button>
    </form>
  );
}
