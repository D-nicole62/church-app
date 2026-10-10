import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GroupForm } from "@/components/admin/GroupForm";
import { Card } from "@/components/ui/card";
import { getAdminLookups } from "@/lib/admin/lookups";
import { createGroupAction } from "@/lib/groups/actions";

export default async function NewGroupPage() {
  const { campuses, zones } = await getAdminLookups();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Groups"
        title="Create group"
        description="Add a cell group, ministry, committee, choir, or department."
      />
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
