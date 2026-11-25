import Link from "next/link";
import { notFound } from "next/navigation";
import { VisitorStatus } from "@/generated/prisma/client";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminLookups } from "@/lib/admin/lookups";
import {
  addFollowUpAction,
  deleteVisitorAction,
  updateVisitorStatusAction,
} from "@/lib/visitors/actions";
import { convertVisitorToMemberAction } from "@/lib/members/actions";
import { prisma } from "@/lib/prisma";

type VisitorDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function VisitorDetailPage({
  params,
  searchParams,
}: VisitorDetailPageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const [visitor, lookups] = await Promise.all([
    prisma.visitor.findUnique({
      where: { id },
      include: {
        person: { include: { campus: true, member: true } },
        assignedOfficer: true,
        followUps: {
          include: { officer: true },
          orderBy: { interactionDate: "desc" },
        },
      },
    }),
    getAdminLookups(),
  ]);

  if (!visitor) {
    notFound();
  }

  const updateStatusAction = updateVisitorStatusAction.bind(null, id);
  const followUpAction = addFollowUpAction.bind(null, id);
  const convertAction = convertVisitorToMemberAction.bind(null, id);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Visitors"
        title={`${visitor.person.firstName} ${visitor.person.lastName}`}
        description={visitor.person.email ?? visitor.person.phone ?? "No contact info"}
        action={
          <Link href="/admin/visitors">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />

      {query.success === "updated" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Visitor status updated.
        </p>
      ) : null}
      {query.success === "follow-up-added" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Follow-up saved.
        </p>
      ) : null}
      {query.error === "invalid-status" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Choose a valid visitor status.
        </p>
      ) : null}
      {query.error === "invalid-follow-up" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Choose a channel and a date for the follow-up.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card header={<p className="text-sm font-medium">Visitor details</p>}>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Residential area</dt>
              <dd>{visitor.residentialArea ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Invited by</dt>
              <dd>{visitor.invitedBy ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Interested ministry</dt>
              <dd>{visitor.interestedMinistry ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Prayer request</dt>
              <dd>{visitor.prayerRequest ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Notes</dt>
              <dd>{visitor.notes ?? "—"}</dd>
            </div>
          </dl>
        </Card>

        <Card header={<p className="text-sm font-medium">Status & assignment</p>}>
          <form action={updateStatusAction} className="space-y-3">
            <AdminSelect name="status" defaultValue={visitor.status}>
              {Object.values(VisitorStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect
              name="assignedOfficerId"
              defaultValue={visitor.assignedOfficerId ?? ""}
            >
              <option value="">No officer assigned</option>
              {lookups.officers.map((officer) => (
                <option key={officer.id} value={officer.id}>
                  {officer.name ?? officer.email}
                </option>
              ))}
            </AdminSelect>
            <Button type="submit">Update status</Button>
          </form>

          {!visitor.person.member && visitor.status !== VisitorStatus.MEMBER_REGISTERED && (
            <form action={convertAction} className="mt-4">
              <Button type="submit" variant="secondary">
                Convert to member
              </Button>
            </form>
          )}
        </Card>
      </div>

      <Card header={<p className="text-sm font-medium">Follow-up interactions</p>}>
        {visitor.followUps.length === 0 ? (
          <p className="mb-4 text-sm text-muted-foreground">No interactions logged yet.</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {visitor.followUps.map((followUp) => (
              <li
                key={followUp.id}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <p className="font-medium">
                  {followUp.channel} ·{" "}
                  {followUp.interactionDate.toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {followUp.officer?.name ?? followUp.officer?.email ?? "Unassigned"}
                  {followUp.outcome ? ` · ${followUp.outcome}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}

        <form action={followUpAction} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium">Channel</label>
            <AdminSelect name="channel" defaultValue="CALL">
              <option value="CALL">Call</option>
              <option value="SMS">SMS</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="VISIT">Visit</option>
              <option value="EMAIL">Email</option>
            </AdminSelect>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Date</label>
            <Input type="date" name="interactionDate" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Officer</label>
            <AdminSelect name="officerId" defaultValue="">
              <option value="">Unassigned</option>
              {lookups.officers.map((officer) => (
                <option key={officer.id} value={officer.id}>
                  {officer.name ?? officer.email}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Next follow-up</label>
            <Input type="date" name="nextFollowUpDate" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium">Outcome</label>
            <Textarea name="outcome" rows={2} />
          </div>
          <Button type="submit">Log interaction</Button>
        </form>
      </Card>

      <ConfirmDeleteButton
        action={deleteVisitorAction.bind(null, id)}
        label="Delete visitor"
        confirm="Delete this visitor permanently? Their visit record will be removed."
      />
    </div>
  );
}
