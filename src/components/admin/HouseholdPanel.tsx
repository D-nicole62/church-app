import Link from "next/link";
import { HouseholdRoster } from "@/components/admin/HouseholdRoster";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { assignHouseholdFromProfileAction } from "@/lib/households/actions";
import { HOUSEHOLD_ROLES } from "@/lib/households/display";

type HouseholdPerson = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string | null;
  dateOfBirth: Date | null;
  householdRole: string | null;
  member: { id: string } | null;
};

type HouseholdPanelProps = {
  memberId: string;
  currentPersonId: string;
  householdRole: string | null;
  household: {
    id: string;
    name: string;
    persons: HouseholdPerson[];
  } | null;
  households: { id: string; name: string }[];
};

export function HouseholdPanel({
  memberId,
  currentPersonId,
  householdRole,
  household,
  households,
}: HouseholdPanelProps) {
  const assignAction = assignHouseholdFromProfileAction.bind(null, memberId);

  return (
    <Card
      header={
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">Household</p>
          {household ? (
            <Link
              href={`/admin/households/${household.id}`}
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Manage
            </Link>
          ) : null}
        </div>
      }
    >
      {household ? (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">{household.name}</p>
          <HouseholdRoster people={household.persons} currentPersonId={currentPersonId} />
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">
          This member is not in a household yet.
        </p>
      )}

      <form action={assignAction} className="mt-4 space-y-3 border-t border-border pt-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            {household ? "Create a different household" : "Create household"}
          </label>
          <Input
            name="newHouseholdName"
            placeholder="Head of the house, e.g. Chibuye Lubumbe"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Usually the head of the house. A name here creates the household and attaches this member. Leave it blank to use the household selected below.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Or link an existing household
          </label>
          <AdminSelect name="householdId" defaultValue={household?.id ?? ""}>
            <option value="">None</option>
            {households.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </AdminSelect>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Role in the household
          </label>
          <AdminSelect name="householdRole" defaultValue={householdRole ?? (household ? "" : "head")}>
            <option value="">Not set</option>
            {HOUSEHOLD_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </AdminSelect>
        </div>
        <Button type="submit">{household ? "Save household" : "Create household"}</Button>
      </form>
    </Card>
  );
}
