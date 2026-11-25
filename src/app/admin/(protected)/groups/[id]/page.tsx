import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupMembershipRole } from "@/generated/prisma/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { GroupForm } from "@/components/admin/GroupForm";
import { NotificationComposer } from "@/components/admin/NotificationComposer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminLookups } from "@/lib/admin/lookups";
import {
  addGroupMemberAction,
  deleteGroupAction,
  removeGroupMemberAction,
  updateGroupAction,
} from "@/lib/groups/actions";
import { sendGroupAnnouncementAction } from "@/lib/notifications/actions";
import { prisma } from "@/lib/prisma";

type GroupDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string; detail?: string }>;
};

export default async function GroupDetailPage({
  params,
  searchParams,
}: GroupDetailPageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const [group, lookups] = await Promise.all([
    prisma.group.findUnique({
      where: { id },
      include: {
        campus: true,
        zone: { include: { region: true } },
        memberships: {
          include: { person: true },
          orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        },
      },
    }),
    getAdminLookups(),
  ]);

  if (!group) {
    notFound();
  }

  const updateAction = updateGroupAction.bind(null, id);
  const addMemberAction = addGroupMemberAction.bind(null, id);
  const announcementAction = sendGroupAnnouncementAction.bind(null, id);

  return (
    <div className="space-y-6">
      {query.error === "missing-message" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Please enter a message before sending.
        </p>
      ) : null}
      {query.error === "invalid-image" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {query.detail || "The image could not be uploaded."}
        </p>
      ) : null}
      {query.error === "no-recipients" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No group members have contact details for the selected channel.
        </p>
      ) : null}
      {query.error === "email-failed" || query.error === "email-skipped" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {query.detail
            ? decodeURIComponent(query.detail)
            : "The announcement was not sent. See the notification log for details."}
        </p>
      ) : null}
      {query.error === "missing-name" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Enter a group name.
        </p>
      ) : null}
      {query.error === "missing-zone" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Cell groups need a zone.
        </p>
      ) : null}
      {query.success === "created" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Group created.
        </p>
      ) : null}
      {query.success === "updated" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Group updated.
        </p>
      ) : null}
      {query.success === "announcement-sent" ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Group announcement queued and logged.
        </p>
      ) : null}
      <AdminPageHeader
        eyebrow="Groups"
        title={group.name}
        description={[
          group.type.replaceAll("_", " "),
          group.zone?.region.name,
          group.zone?.name,
          group.campus?.name,
        ]
          .filter(Boolean)
          .join(" · ")}
        action={
          <Link href="/admin/groups">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />

      <Card header={<p className="text-sm font-medium">Edit group</p>}>
        <GroupForm
          action={updateAction}
          campuses={lookups.campuses}
          zones={lookups.zones}
          group={group}
          submitLabel="Save changes"
        />
      </Card>

      <Card header={<p className="text-sm font-medium">Leaders & members</p>}>
        {group.memberships.length === 0 ? (
          <p className="mb-4 text-sm text-muted-foreground">
            No people assigned yet.
          </p>
        ) : (
          <ul className="mb-4 space-y-2">
            {group.memberships.map((membership) => (
              <li
                key={membership.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {membership.person.firstName} {membership.person.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {membership.role === GroupMembershipRole.LEADER
                      ? "Leader"
                      : "Member"}
                  </p>
                </div>
                <form action={removeGroupMemberAction.bind(null, id, membership.id)}>
                  <Button type="submit" variant="ghost" className="text-xs">
                    Remove
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={addMemberAction} className="grid gap-3 sm:grid-cols-[1fr,auto,auto]">
          <AdminSelect name="personId" required defaultValue="">
            <option value="" disabled>
              Select person
            </option>
            {lookups.persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.lastName}, {person.firstName}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect name="role" defaultValue={GroupMembershipRole.MEMBER}>
            <option value={GroupMembershipRole.MEMBER}>Member</option>
            <option value={GroupMembershipRole.LEADER}>Leader</option>
          </AdminSelect>
          <Button type="submit">Add</Button>
        </form>
      </Card>

      <Card header={<p className="text-sm font-medium">Send announcement</p>}>
        <NotificationComposer
          action={announcementAction}
          submitLabel="Send to group members"
          defaultSubject={`${group.name} update`}
          defaultBody={`Hi {name},\n\nQuick update from ${group.name}:\n\n`}
        />
      </Card>

      <form action={deleteGroupAction.bind(null, id)}>
        <Button type="submit" variant="secondary">
          Delete group
        </Button>
      </form>
    </div>
  );
}
