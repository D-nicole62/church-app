import { prisma } from "@/lib/prisma";

export async function getPublicEvents() {
  return prisma.event.findMany({
    orderBy: { startsAt: "asc" },
  });
}
