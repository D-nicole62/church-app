import {
  GroupMembershipRole,
  GroupType,
  NotificationKind,
  NotificationStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type AttendanceTrend = "up" | "down" | "flat" | "insufficient";

function computeTrend(values: number[]): AttendanceTrend {
  if (values.length < 2) {
    return "insufficient";
  }

  const midpoint = Math.floor(values.length / 2);
  const recent = values.slice(0, midpoint);
  const older = values.slice(midpoint);

  if (recent.length === 0 || older.length === 0) {
    return "insufficient";
  }

  const recentAvg =
    recent.reduce((sum, value) => sum + value, 0) / recent.length;
  const olderAvg = older.reduce((sum, value) => sum + value, 0) / older.length;
  const delta = recentAvg - olderAvg;

  if (Math.abs(delta) < 1) {
    return "flat";
  }

  return delta > 0 ? "up" : "down";
}

export async function getGroupReports() {
  const [groups, announcementCounts] = await Promise.all([
    prisma.group.findMany({
      include: {
        campus: true,
        memberships: true,
        cellAttendances: {
          orderBy: { meetingDate: "desc" },
          take: 8,
        },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
    prisma.notificationLog.groupBy({
      by: ["entityId"],
      where: {
        kind: NotificationKind.GROUP_ANNOUNCEMENT,
        status: NotificationStatus.SENT,
        entityType: "group",
        entityId: { not: null },
      },
      _count: { _all: true },
    }),
  ]);

  const announcementsByGroup = new Map(
    announcementCounts
      .filter((entry) => entry.entityId)
      .map((entry) => [entry.entityId as string, entry._count._all]),
  );

  const rows = groups.map((group) => {
    const leaders = group.memberships.filter(
      (membership) => membership.role === GroupMembershipRole.LEADER,
    ).length;
    const members = group.memberships.filter(
      (membership) => membership.role === GroupMembershipRole.MEMBER,
    ).length;
    const attendanceValues = group.cellAttendances.map(
      (record) => record.presentCount,
    );
    const avgAttendance =
      attendanceValues.length > 0
        ? attendanceValues.reduce((sum, value) => sum + value, 0) /
          attendanceValues.length
        : null;

    return {
      id: group.id,
      name: group.name,
      type: group.type,
      campus: group.campus?.name ?? "—",
      leaders,
      members,
      totalPeople: group.memberships.length,
      meetingCount: group.cellAttendances.length,
      avgAttendance,
      attendanceTrend: computeTrend(attendanceValues),
      announcementsSent: announcementsByGroup.get(group.id) ?? 0,
      recentMeetings: group.cellAttendances.map((record) => ({
        date: record.meetingDate,
        presentCount: record.presentCount,
      })),
    };
  });

  const cellGroups = rows.filter((row) => row.type === GroupType.CELL_GROUP);
  const ministries = rows.filter((row) => row.type === GroupType.MINISTRY);
  const otherGroups = rows.filter(
    (row) => row.type !== GroupType.CELL_GROUP && row.type !== GroupType.MINISTRY,
  );

  const summary = {
    totalGroups: rows.length,
    cellGroups: cellGroups.length,
    totalMembers: rows.reduce((sum, row) => sum + row.totalPeople, 0),
    groupsWithAttendance: rows.filter((row) => row.meetingCount > 0).length,
    avgCellAttendance:
      cellGroups.filter((row) => row.avgAttendance !== null).length > 0
        ? cellGroups
            .filter((row) => row.avgAttendance !== null)
            .reduce((sum, row) => sum + (row.avgAttendance ?? 0), 0) /
          cellGroups.filter((row) => row.avgAttendance !== null).length
        : null,
  };

  return { summary, cellGroups, ministries, otherGroups };
}

export function attendanceTrendLabel(trend: AttendanceTrend) {
  switch (trend) {
    case "up":
      return "Trending up";
    case "down":
      return "Trending down";
    case "flat":
      return "Stable";
    case "insufficient":
      return "Not enough data";
    default: {
      const exhaustive: never = trend;
      return exhaustive;
    }
  }
}
