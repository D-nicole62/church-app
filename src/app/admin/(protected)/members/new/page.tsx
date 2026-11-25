import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemberForm } from "@/components/admin/MemberForm";
import { Card } from "@/components/ui/card";
import { getAdminLookups } from "@/lib/admin/lookups";
import { createMemberAction } from "@/lib/members/actions";

type NewMemberPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewMemberPage({ searchParams }: NewMemberPageProps) {
  const query = (await searchParams) ?? {};
  const lookups = await getAdminLookups();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Members"
        title="Register member"
        description="Creates a Person record, assigns a membership number, and queues Sage sync."
      />
      {query.error === "missing-required" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          First name, last name, and campus are required.
        </p>
      ) : null}
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
