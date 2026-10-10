import {
  GroupType,
  type Campus,
  type Group,
  type Zone,
} from "@/generated/prisma/client";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { groupZonesByRegion } from "@/lib/ministries/display";

const GROUP_TYPES = Object.values(GroupType);

type ZoneWithRegion = Zone & {
  region: { id: string; name: string };
};

type GroupFormProps = {
  action: (formData: FormData) => Promise<void>;
  campuses: Campus[];
  zones: ZoneWithRegion[];
  group?: Group;
  submitLabel: string;
};

export function GroupForm({
  action,
  campuses,
  zones,
  group,
  submitLabel,
}: GroupFormProps) {
  const isCellGroup =
    (group?.type ?? GroupType.CELL_GROUP) === GroupType.CELL_GROUP;
  const zonesByRegion = groupZonesByRegion(zones);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Name *
          </label>
          <Input name="name" defaultValue={group?.name ?? ""} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Type *
          </label>
          <AdminSelect name="type" defaultValue={group?.type ?? GroupType.CELL_GROUP}>
            {GROUP_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replaceAll("_", " ")}
              </option>
            ))}
          </AdminSelect>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-foreground/80">
          Description
        </label>
        <Textarea
          name="description"
          defaultValue={group?.description ?? ""}
          rows={3}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Meets when
          </label>
          <Input name="meetsWhen" defaultValue={group?.meetsWhen ?? ""} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Location
          </label>
          <Input name="location" defaultValue={group?.location ?? ""} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Zone {isCellGroup ? "*" : ""}
          </label>
          <AdminSelect name="zoneId" defaultValue={group?.zoneId ?? ""}>
            <option value="">Select zone</option>
            {zonesByRegion.map((region) => (
              <optgroup key={region.title} label={region.title}>
                {region.zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </AdminSelect>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Cell groups belong to a region through a zone (region → zone → cell).
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/80">
            Campus
          </label>
          <AdminSelect name="campusId" defaultValue={group?.campusId ?? ""}>
            <option value="">No campus selected</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </AdminSelect>
        </div>
      </div>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
