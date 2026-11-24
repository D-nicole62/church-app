import { isPlaceholderEvent } from "@/lib/content/placeholder-records";
import { prisma } from "@/lib/prisma";

export async function getPublicEvents() {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
  });
  return events.filter((event) => !isPlaceholderEvent(event));
}
