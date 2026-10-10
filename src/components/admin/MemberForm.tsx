import type { Member, Person } from "@/generated/prisma/client";
import type { AdminLookups } from "@/lib/admin/lookups";
import { AdminSelect } from "@/components/admin/AdminSelect";
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
};

export function MemberForm({
  action,
  lookups,
  member,
  submitLabel,
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

      <div>
        <label className="mb-1 block text-xs font-medium text-foreground/80">
          Household
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

      {member && (
        <p className="text-xs text-muted-foreground">
          Membership number: {member.membershipNumber}
        </p>
      )}

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
