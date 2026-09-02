import { VisitorStatus } from "@/generated/prisma/client";
import { formatMonthKey, monthKey } from "@/lib/reports/format";
import { prisma } from "@/lib/prisma";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function monthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setHours(0, 0, 0, 0);
  return date;
}

function incrementCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function sortedEntries(map: Map<string, number>) {
  return [...map.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([key, count]) => ({ key, label: key, count }));
}

export async function getVisitorAnalytics(monthsBack = 12) {
  const since = monthsAgo(monthsBack);
  const today = startOfToday();

  const visitors = await prisma.visitor.findMany({
    where: { createdAt: { gte: since } },
    include: {
      person: {
        include: {
          campus: true,
          member: true,
        },
      },
      followUps: {
        orderBy: { interactionDate: "desc" },
        take: 1,
      },
    },
  });

  const allTimeVisitors = await prisma.visitor.count();
  const convertedCount = await prisma.visitor.count({
    where: { status: VisitorStatus.MEMBER_REGISTERED },
  });

  const statusCounts = new Map<string, number>();
  const byMonth = new Map<string, number>();
  const byCampus = new Map<string, number>();
  const byService = new Map<string, number>();
  let returningCount = 0;
  let awaitingFollowUp = 0;
  const conversionDurations: number[] = [];

  for (const visitor of visitors) {
    incrementCount(statusCounts, visitor.status);

    const visitDate = visitor.firstVisitDate ?? visitor.createdAt;
    incrementCount(byMonth, monthKey(visitDate));

    const campusLabel = visitor.person.campus?.name ?? "Unassigned";
    incrementCount(byCampus, campusLabel);

    const serviceLabel = visitor.serviceAttended?.trim() || "Not specified";
    incrementCount(byService, serviceLabel);

    if (
      visitor.status === VisitorStatus.RETURNING ||
      visitor.status === VisitorStatus.FOLLOW_UP_ASSIGNED ||
      visitor.status === VisitorStatus.IN_PROGRESS ||
      visitor.status === VisitorStatus.MEMBER_REGISTERED
    ) {
      returningCount += 1;
    }

    const latestFollowUp = visitor.followUps[0];
    const followUpDue =
      latestFollowUp?.nextFollowUpDate &&
      latestFollowUp.nextFollowUpDate <= today;
    const needsFollowUp =
      visitor.status === VisitorStatus.FOLLOW_UP_ASSIGNED ||
      visitor.status === VisitorStatus.IN_PROGRESS ||
      Boolean(followUpDue);

    if (
      needsFollowUp &&
      visitor.status !== VisitorStatus.MEMBER_REGISTERED &&
      visitor.status !== VisitorStatus.NO_LONGER_ATTENDING
    ) {
      awaitingFollowUp += 1;
    }

    if (visitor.person.member) {
      const start = visitor.firstVisitDate ?? visitor.createdAt;
      const end = visitor.person.member.createdAt;
      conversionDurations.push(
        Math.max(0, (end.getTime() - start.getTime()) / MS_PER_DAY),
      );
    }
  }

  const totalInRange = visitors.length;
  const firstTimeInRange = visitors.filter(
    (visitor) => visitor.status === VisitorStatus.FIRST_TIME,
  ).length;

  const avgTimeToMember =
    conversionDurations.length > 0
      ? conversionDurations.reduce((sum, days) => sum + days, 0) /
        conversionDurations.length
      : null;

  const byMonthFormatted = sortedEntries(byMonth).map((entry) => ({
    ...entry,
    label: formatMonthKey(entry.key),
  }));

  return {
    monthsBack,
    summary: {
      totalInRange,
      allTimeVisitors,
      convertedCount,
      conversionRate: allTimeVisitors > 0 ? convertedCount / allTimeVisitors : 0,
      returnRate: totalInRange > 0 ? returningCount / totalInRange : 0,
      awaitingFollowUp,
      avgTimeToMember,
      firstTimeInRange,
    },
    statusCounts: [...statusCounts.entries()].map(([status, count]) => ({
      status,
      count,
    })),
    byMonth: byMonthFormatted,
    byCampus: sortedEntries(byCampus),
    byService: sortedEntries(byService).sort((left, right) => right.count - left.count),
  };
}
