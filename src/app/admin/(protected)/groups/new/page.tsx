import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GroupForm } from "@/components/admin/GroupForm";
import { Card } from "@/components/ui/card";
import { getAdminLookups } from "@/lib/admin/lookups";
import { createGroupAction } from "@/lib/groups/actions";

type NewGroupPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewGroupPage({ searchParams }: NewGroupPageProps) {
  const query = (await searchParams) ?? {};
  const { campuses, zones } = await getAdminLookups();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Groups"
        title="Create group"
        description="Add a cell group, ministry, committee, choir, or department."
      />
      {query.error === "missing-name" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Enter a group name.
        </p>
      ) : null}
      {query.error === "missing-zone" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Cell groups need a zone.
        </p>
      ) : null}
      <Card header={<p className="text-sm font-medium">Group details</p>}>
        <GroupForm
          action={createGroupAction}
          campuses={campuses}
          zones={zones}
          submitLabel="Create group"
        />
      </Card>
    </div>
  );
}
