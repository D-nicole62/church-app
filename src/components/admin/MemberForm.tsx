import type { Member, Person } from "@/generated/prisma/client";
import type { AdminLookups } from "@/lib/admin/lookups";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { HOUSEHOLD_ROLES } from "@/lib/households/display";
import {
  groupMinistriesByCluster,
  groupZonesByRegion,
} from "@/lib/ministries/display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MemberWithPerson = Member & { person: Person };

type MemberFormProps = {
  action: (formData: FormData) => Promise<void>;
  lookups: AdminLookups;
  member?: MemberWithPerson;
  submitLabel: string;
  includeHousehold?: boolean;
};

export function MemberForm({
  action,
  lookups,
  member,
  submitLabel,
  includeHousehold = true,
}: MemberFormProps) {
  const ministryClusters = groupMinistriesByCluster(
    lookups.ministryGroups.map((group) => ({
      id: group.id,
      name: group.name,
      clusterName: group.clusterName,
    })),
  );
  const zonesByRegion = groupZonesByRegion(lookups.zones);
  const person = member?.person;
  const dateOfBirth = person?.dateOfBirth
    ? person.dateOfBirth.toISOString().slice(0, 10)
    : "";
  const baptismDate = member?.baptismDate
    ? member.baptismDate.toISOString().slice(0, 10)
    : "";

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            First name *
          </label>
          <Input name="firstName" defaultValue={person?.firstName ?? ""} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Last name *
          </label>
          <Input name="lastName" defaultValue={person?.lastName ?? ""} required />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Email
          </label>
          <Input type="email" name="email" defaultValue={person?.email ?? ""} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Phone
          </label>
          <Input type="tel" name="phone" defaultValue={person?.phone ?? ""} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Gender
          </label>
          <AdminSelect name="gender" defaultValue={person?.gender ?? ""}>
            <option value="">Prefer not to say</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </AdminSelect>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Date of birth
          </label>
          <Input type="date" name="dateOfBirth" defaultValue={dateOfBirth} />
        </div>
      </div>

      <div className="sm:max-w-[calc(50%-0.375rem)]">
        <label className="mb-1 block text-xs font-medium text-foreground/80">
          Date of baptism
        </label>
        <Input type="date" name="baptismDate" defaultValue={baptismDate} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-foreground/80">
          Campus *
        </label>
        <AdminSelect name="campusId" defaultValue={person?.campusId ?? ""} required>
          <option value="">Select campus</option>
          {lookups.campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
        </AdminSelect>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Cell group
          </label>
          <AdminSelect name="cellGroupId" defaultValue={member?.cellGroupId ?? ""}>
            <option value="">None</option>
            {zonesByRegion.map((region) =>
              region.zones.map((zone) => (
                <optgroup
                  key={zone.id}
                  label={`${region.title} — ${zone.name}`}
                >
                  {lookups.cellGroups
                    .filter((group) => group.zoneId === zone.id)
                    .map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                </optgroup>
              )),
            )}
          </AdminSelect>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Ministry involvement
          </label>
          <AdminSelect
            name="ministryGroupId"
            defaultValue={member?.ministryGroupId ?? ""}
          >
            <option value="">None</option>
            {ministryClusters.map((cluster) => (
              <optgroup key={cluster.title} label={cluster.title}>
                {cluster.ministries.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </AdminSelect>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Selecting a cell group or ministry adds this member to that group.
      </p>

      {includeHousehold ? (
        <div className="space-y-3 rounded-xl border border-border p-3">
          <p className="text-xs font-medium text-foreground">Household</p>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Create household
            </label>
            <Input
              name="newHouseholdName"
              placeholder="Head of the house, e.g. Chibuye Lubumbe"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Usually the head of the house. Saving creates the household and attaches this member.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Or link an existing household
            </label>
            <AdminSelect name="householdId" defaultValue={person?.householdId ?? ""}>
              <option value="">None</option>
              {lookups.households.map((household) => (
                <option key={household.id} value={household.id}>
                  {household.name}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Role in the household
            </label>
            <AdminSelect name="householdRole" defaultValue={person?.householdRole ?? "head"}>
              {HOUSEHOLD_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </AdminSelect>
          </div>
        </div>
      ) : null}

      {member && (
        <p className="text-xs text-muted-foreground">
          Membership number: {member.membershipNumber}
        </p>
      )}

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
