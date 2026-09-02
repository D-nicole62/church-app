import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemberForm } from "@/components/admin/MemberForm";
import { Card } from "@/components/ui/card";
import { getAdminLookups } from "@/lib/admin/lookups";
import { createMemberAction } from "@/lib/members/actions";

export default async function NewMemberPage() {
  const lookups = await getAdminLookups();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Members"
        title="Register member"
        description="Creates a Person record, assigns a membership number, and queues Sage sync."
      />
      <Card header={<p className="text-sm font-medium">Member details</p>}>
        <MemberForm
          action={createMemberAction}
          lookups={lookups}
          submitLabel="Create member"
        />
      </Card>
    </div>
  );
}
