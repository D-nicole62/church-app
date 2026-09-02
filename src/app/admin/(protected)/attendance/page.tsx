import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminLookups } from "@/lib/admin/lookups";
import {
  createCellGroupAttendanceAction,
  createServiceAttendanceAction,
} from "@/lib/attendance/actions";
import { prisma } from "@/lib/prisma";

export default async function AdminAttendancePage() {
  const [lookups, serviceRecords, cellRecords] = await Promise.all([
    getAdminLookups(),
    prisma.serviceAttendance.findMany({ orderBy: { serviceDate: "desc" }, take: 10 }),
    prisma.cellGroupAttendance.findMany({
      include: { group: true },
      orderBy: { meetingDate: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phase 4"
        title="Attendance"
        description="Record service-level attendance and generic cell group meeting counts."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card header={<p className="text-sm font-medium">Service attendance</p>}>
          <form action={createServiceAttendanceAction} className="space-y-3">
            <Input type="date" name="serviceDate" required />
            <Input name="serviceName" placeholder="Second Service" required />
            <AdminSelect name="campusId" defaultValue="">
              <option value="">All campuses</option>
              {lookups.campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </AdminSelect>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" name="menCount" min={0} placeholder="Men" />
              <Input type="number" name="womenCount" min={0} placeholder="Women" />
              <Input type="number" name="boysCount" min={0} placeholder="Boys" />
              <Input type="number" name="girlsCount" min={0} placeholder="Girls" />
            </div>
            <Textarea name="notes" placeholder="Notes" rows={2} />
            <Button type="submit">Save service attendance</Button>
          </form>
        </Card>

        <Card header={<p className="text-sm font-medium">Cell group attendance</p>}>
          <form action={createCellGroupAttendanceAction} className="space-y-3">
            <AdminSelect name="groupId" required defaultValue="">
              <option value="" disabled>
                Select cell group
              </option>
              {lookups.cellGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </AdminSelect>
            <Input type="date" name="meetingDate" required />
            <Input type="number" name="presentCount" min={0} placeholder="Present count" />
            <Textarea name="notes" placeholder="Notes" rows={2} />
            <Button type="submit">Save cell attendance</Button>
          </form>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card header={<p className="text-sm font-medium">Recent service records</p>}>
          {serviceRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No records yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {serviceRecords.map((record) => (
                <li key={record.id} className="rounded-lg border border-border px-3 py-2">
                  <p className="font-medium">
                    {record.serviceName} · {record.serviceDate.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    M {record.menCount} · W {record.womenCount} · B {record.boysCount} · G{" "}
                    {record.girlsCount}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card header={<p className="text-sm font-medium">Recent cell records</p>}>
          {cellRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No records yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {cellRecords.map((record) => (
                <li key={record.id} className="rounded-lg border border-border px-3 py-2">
                  <p className="font-medium">
                    {record.group.name} · {record.meetingDate.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Present: {record.presentCount}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
