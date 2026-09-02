import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemberForm } from "@/components/admin/MemberForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminLookups } from "@/lib/admin/lookups";
import { updateMemberAction } from "@/lib/members/actions";
import { prisma } from "@/lib/prisma";

type MemberDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = await params;
  const [member, lookups] = await Promise.all([
    prisma.member.findUnique({
      where: { id },
      include: { person: true },
    }),
    getAdminLookups(),
  ]);

  if (!member) {
    notFound();
  }

  const updateAction = updateMemberAction.bind(null, id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Members"
        title={`${member.person.firstName} ${member.person.lastName}`}
        description={`Membership # ${member.membershipNumber}`}
        action={
          <Link href="/admin/members">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />
      <Card header={<p className="text-sm font-medium">Edit member</p>}>
        <MemberForm
          action={updateAction}
          lookups={lookups}
          member={member}
          submitLabel="Save changes"
        />
      </Card>
    </div>
  );
}
