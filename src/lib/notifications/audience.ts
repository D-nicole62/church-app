import { GroupType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type EventAudience = "rsvps" | "group" | "campus" | "all_people";

export async function resolveEventAudience(
  eventId: string,
  audience: EventAudience,
  groupId?: string | null,
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return [];
  }

  if (audience === "rsvps") {
    const rsvps = await prisma.eventRSVP.findMany({
      where: { eventId },
      include: { person: true },
    });
    return rsvps
      .map((rsvp) => ({
        email: rsvp.person.email,
        phone: rsvp.person.phone,
        name: `${rsvp.person.firstName} ${rsvp.person.lastName}`.trim(),
      }))
      .filter((person) => person.email || person.phone);
  }

  if (audience === "group" && groupId) {
    const memberships = await prisma.groupMembership.findMany({
      where: { groupId },
      include: { person: true },
    });
    return memberships
      .map((membership) => ({
        email: membership.person.email,
        phone: membership.person.phone,
        name: `${membership.person.firstName} ${membership.person.lastName}`.trim(),
      }))
      .filter((person) => person.email || person.phone);
  }

  if (audience === "campus" && event.campusId) {
    const people = await prisma.person.findMany({
      where: { campusId: event.campusId },
    });
    return people
      .map((person) => ({
        email: person.email,
        phone: person.phone,
        name: `${person.firstName} ${person.lastName}`.trim(),
      }))
      .filter((person) => person.email || person.phone);
  }

  if (audience !== "all_people") {
    return [];
  }

  const people = await prisma.person.findMany({ take: 500 });
  return people
    .map((person) => ({
      email: person.email,
      phone: person.phone,
      name: `${person.firstName} ${person.lastName}`.trim(),
    }))
    .filter((person) => person.email || person.phone);
}

export async function resolveGroupAudience(groupId: string) {
  const memberships = await prisma.groupMembership.findMany({
    where: { groupId },
    include: { person: true },
  });

  return memberships
    .map((membership) => ({
      email: membership.person.email,
      phone: membership.person.phone,
      name: `${membership.person.firstName} ${membership.person.lastName}`.trim(),
    }))
    .filter((person) => person.email || person.phone);
}

export async function getGroupOptionsForEvent(eventId: string) {
  return prisma.group.findMany({
    where: { type: { in: [GroupType.CELL_GROUP, GroupType.MINISTRY] } },
    orderBy: { name: "asc" },
  });
}
