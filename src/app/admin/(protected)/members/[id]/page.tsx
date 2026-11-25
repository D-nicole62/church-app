import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HouseholdPanel } from "@/components/admin/HouseholdPanel";
import { MemberForm } from "@/components/admin/MemberForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminLookups } from "@/lib/admin/lookups";
import { updateMemberAction } from "@/lib/members/actions";
import { prisma } from "@/lib/prisma";

type MemberDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
};

function formatBaptismDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function MemberDetailPage({
  params,
  searchParams,
}: MemberDetailPageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const [member, lookups] = await Promise.all([
    prisma.member.findUnique({
      where: { id },
      include: {
        person: {
          include: {
            household: {
              include: {
                persons: {
                  include: { member: { select: { id: true } } },
                  orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
                },
              },
            },
          },
        },
      },
    }),
    getAdminLookups(),
  ]);

  if (!member) {
    notFound();
  }

  const updateAction = updateMemberAction.bind(null, id);
  const baptism = member.baptismDate
    ? ` · Baptised ${formatBaptismDate(member.baptismDate)}`
    : "";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Members"
        title={`${member.person.firstName} ${member.person.lastName}`}
        description={`Membership # ${member.membershipNumber}${baptism}`}
        action={
          <Link href="/admin/members">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />
      {query.success === "created" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Member created.
        </p>
      ) : null}
      {query.success === "updated" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Member updated.
        </p>
      ) : null}
      {query.error === "missing-required" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          First name, last name, and campus are required.
        </p>
      ) : null}
      {query.success === "household" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Household saved. This member is attached.
        </p>
      ) : null}
      {query.error === "missing-household" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Enter a household name or choose an existing household.
        </p>
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card header={<p className="text-sm font-medium">Membership details</p>}>
          <MemberForm
            action={updateAction}
            lookups={lookups}
            member={member}
            submitLabel="Save changes"
            includeHousehold={false}
          />
        </Card>
        <HouseholdPanel
          memberId={member.id}
          currentPersonId={member.personId}
          householdRole={member.person.householdRole}
          household={member.person.household}
          households={lookups.households}
        />
      </div>
    </div>
  );
}
