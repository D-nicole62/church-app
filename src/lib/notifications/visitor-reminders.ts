import {
  NotificationChannel,
  NotificationKind,
  UserRole,
  VisitorReminderReason,
  VisitorStatus,
} from "@/generated/prisma/client";
import { isDatabaseConfigured } from "@/lib/db";
import { deliverNotification } from "@/lib/notifications/send";
import { CHURCH_NAME_SHORT } from "@/lib/site";
import { prisma } from "@/lib/prisma";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function notContactedDays() {
  const parsed = Number.parseInt(
    process.env.VISITOR_NOT_CONTACTED_DAYS || "7",
    10,
  );
  return Number.isNaN(parsed) ? 7 : parsed;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

async function wasReminderSentRecently(
  visitorId: string,
  reason: VisitorReminderReason,
) {
  const since = new Date(Date.now() - MS_PER_DAY);
  const existing = await prisma.visitorReminderLog.findFirst({
    where: {
      visitorId,
      reason,
      createdAt: { gte: since },
    },
  });
  return Boolean(existing);
}

async function getOfficerRecipients(visitor: {
  assignedOfficer: { email: string; name: string | null } | null;
}) {
  if (visitor.assignedOfficer?.email) {
    return [visitor.assignedOfficer.email];
  }

  const fallbackOfficers = await prisma.adminUser.findMany({
    where: {
      role: {
        in: [UserRole.FOLLOW_UP_OFFICER, UserRole.SUPER_ADMIN, UserRole.CAMPUS_ADMIN],
      },
    },
    select: { email: true },
  });

  return fallbackOfficers.map((officer) => officer.email);
}

type VisitorWithRelations = Awaited<
  ReturnType<typeof loadVisitorsForReminders>
>[number];

async function loadVisitorsForReminders() {
  return prisma.visitor.findMany({
    where: {
      status: {
        notIn: [VisitorStatus.MEMBER_REGISTERED, VisitorStatus.NO_LONGER_ATTENDING],
      },
    },
    include: {
      person: {
        include: {
          groupMemberships: { include: { group: true } },
        },
      },
      assignedOfficer: true,
      followUps: { orderBy: { interactionDate: "desc" }, take: 1 },
    },
  });
}

function visitorLabel(visitor: VisitorWithRelations) {
  return `${visitor.person.firstName} ${visitor.person.lastName}`.trim();
}

function buildReminderMessage(
  reason: VisitorReminderReason,
  visitor: VisitorWithRelations,
) {
  const name = visitorLabel(visitor);
  const base = `Visitor follow-up reminder (${CHURCH_NAME_SHORT})`;

  switch (reason) {
    case VisitorReminderReason.FOLLOW_UP_DUE:
      return {
        subject: `${base}: follow-up due for ${name}`,
        body: `${name} has a follow-up date due today or overdue. Status: ${visitor.status}. Service: ${visitor.serviceAttended ?? "n/a"}.`,
      };
    case VisitorReminderReason.NOT_CONTACTED:
      return {
        subject: `${base}: no contact in ${notContactedDays()} days for ${name}`,
        body: `${name} has not been contacted in the last ${notContactedDays()} days. Please reach out via call, SMS, WhatsApp, or visit.`,
      };
    case VisitorReminderReason.RETURNED_AGAIN:
      return {
        subject: `${base}: returning visitor ${name}`,
        body: `${name} is marked as returning. Welcome them back and help them connect to a cell group if needed.`,
      };
    case VisitorReminderReason.NO_CELL_GROUP:
      return {
        subject: `${base}: no cell group for ${name}`,
        body: `${name} has attended multiple times or shown interest (${visitor.interestedMinistry ?? "general"}) but is not linked to a cell group yet.`,
      };
  }
}

async function evaluateReasons(visitor: VisitorWithRelations) {
  const reasons: VisitorReminderReason[] = [];
  const today = startOfToday();
  const cutoff = new Date(Date.now() - notContactedDays() * MS_PER_DAY);
  const latestFollowUp = visitor.followUps[0];
  const hasCellGroup = visitor.person.groupMemberships.some(
    (membership) => membership.group.type === "CELL_GROUP",
  );

  if (
    latestFollowUp?.nextFollowUpDate &&
    latestFollowUp.nextFollowUpDate <= today
  ) {
    reasons.push(VisitorReminderReason.FOLLOW_UP_DUE);
  }

  const lastContact = latestFollowUp?.interactionDate ?? visitor.createdAt;
  if (lastContact <= cutoff) {
    reasons.push(VisitorReminderReason.NOT_CONTACTED);
  }

  if (visitor.status === VisitorStatus.RETURNING) {
    reasons.push(VisitorReminderReason.RETURNED_AGAIN);
  }

  if (
    !hasCellGroup &&
    (visitor.status === VisitorStatus.RETURNING ||
      visitor.status === VisitorStatus.IN_PROGRESS ||
      Boolean(visitor.interestedMinistry))
  ) {
    reasons.push(VisitorReminderReason.NO_CELL_GROUP);
  }

  return [...new Set(reasons)];
}

export async function runVisitorReminderCron() {
  if (!isDatabaseConfigured()) {
    return { sent: 0, skipped: 0, errors: 0, message: "Database not configured" };
  }

  const visitors = await loadVisitorsForReminders();
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const visitor of visitors) {
    const reasons = await evaluateReasons(visitor);
    if (reasons.length === 0) {
      continue;
    }

    const recipients = await getOfficerRecipients(visitor);
    if (recipients.length === 0) {
      skipped += reasons.length;
      continue;
    }

    for (const reason of reasons) {
      if (await wasReminderSentRecently(visitor.id, reason)) {
        skipped += 1;
        continue;
      }

      const message = buildReminderMessage(reason, visitor);

      for (const recipient of recipients) {
        const result = await deliverNotification({
          kind: NotificationKind.VISITOR_AUTOMATED_REMINDER,
          channel: NotificationChannel.EMAIL,
          recipient,
          subject: message.subject,
          body: message.body,
          entityType: "visitor",
          entityId: visitor.id,
          visitorId: visitor.id,
        });

        if (result.status === "SENT") {
          sent += 1;
        } else if (result.status === "FAILED") {
          errors += 1;
        } else {
          skipped += 1;
        }
      }

      await prisma.visitorReminderLog.create({
        data: { visitorId: visitor.id, reason },
      });
    }
  }

  return { sent, skipped, errors, visitorsChecked: visitors.length };
}
