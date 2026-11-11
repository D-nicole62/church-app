import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HouseholdRoster } from "@/components/admin/HouseholdRoster";
import { HOUSEHOLD_ROLES } from "@/lib/households/display";
import {
  attachMemberToHouseholdAction,
  deleteHouseholdAction,
  removeMemberFromHouseholdAction,
  updateHouseholdAction,
} from "@/lib/households/actions";
import { prisma } from "@/lib/prisma";

type HouseholdDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function HouseholdDetailPage({
  params,
  searchParams,
}: HouseholdDetailPageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const [household, members] = await Promise.all([
    prisma.household.findUnique({
      where: { id },
      include: {
        persons: {
          include: { member: { select: { id: true, membershipNumber: true } } },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        },
      },
    }),
    prisma.member.findMany({
      include: { person: { include: { household: true } } },
      orderBy: [{ person: { lastName: "asc" } }, { person: { firstName: "asc" } }],
    }),
  ]);

  if (!household) {
    notFound();
  }

  const attachedIds = new Set(
    household.persons.map((person) => person.member?.id).filter(Boolean),
  );
  const availableMembers = members.filter((member) => !attachedIds.has(member.id));
  const updateAction = updateHouseholdAction.bind(null, id);
  const attachAction = attachMemberToHouseholdAction.bind(null, id);
  const removeAction = deleteHouseholdAction.bind(null, id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Households"
        title={household.name}
        description={`${household.persons.length} member${household.persons.length === 1 ? "" : "s"} attached`}
        action={
          <Link href="/admin/households">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />

      {query.success === "created" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Household created. Attach members below.
        </p>
      ) : null}
      {query.success === "updated" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Household name saved.
        </p>
      ) : null}
      {query.success === "member-added" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Member attached to this household.
        </p>
      ) : null}
      {query.success === "member-removed" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Member removed from this household.
        </p>
      ) : null}
      {query.error === "missing-name" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Enter a household name.
        </p>
      ) : null}
      {query.error === "missing-member" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Choose a member to attach.
        </p>
      ) : null}

      <Card header={<p className="text-sm font-medium">Household name</p>}>
        <form action={updateAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Name *
            </label>
            <Input name="name" defaultValue={household.name} required />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Usually the head of the house.
            </p>
          </div>
          <Button type="submit">Save name</Button>
        </form>
      </Card>

      <Card header={<p className="text-sm font-medium">Members in this household</p>}>
        <HouseholdRoster
          people={household.persons}
          trailing={(person) => (
            <form action={removeMemberFromHouseholdAction.bind(null, id, person.id)}>
              <Button type="submit" variant="secondary">
                Remove
              </Button>
            </form>
          )}
        />

        <form action={attachAction} className="mt-4 space-y-3 border-t border-border pt-4">
          <label className="block text-xs font-medium text-foreground/80">
            Attach a member
          </label>
          {availableMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every member is already in this household.
            </p>
          ) : (
            <>
              <AdminSelect name="memberId" defaultValue="">
                <option value="">Select member</option>
                {availableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.person.lastName}, {member.person.firstName}
                    {member.person.household
                      ? ` (currently ${member.person.household.name})`
                      : ""}
                  </option>
                ))}
              </AdminSelect>
              <AdminSelect name="householdRole" defaultValue="member">
                {HOUSEHOLD_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </AdminSelect>
              <p className="text-[11px] text-muted-foreground">
                A member can belong to one household. Choosing someone from another household moves them here.
              </p>
              <Button type="submit">Attach member</Button>
            </>
          )}
        </form>
      </Card>

      <form action={removeAction}>
        <Button type="submit" variant="secondary">
          Delete household
        </Button>
      </form>
    </div>
  );
}
