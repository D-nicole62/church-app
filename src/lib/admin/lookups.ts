import { GroupType } from "@/generated/prisma/client";
import { queryDatabase } from "@/lib/db";
import { prisma } from "@/lib/prisma";

const emptyLookups = {
  campuses: [],
  regions: [],
  cellGroups: [],
  ministryGroups: [],
  households: [],
  persons: [],
  officers: [],
};

export async function getAdminLookups() {
  return queryDatabase(async () => {
    const [campuses, regions, cellGroups, ministryGroups, households, persons, officers] =
      await Promise.all([
        prisma.campus.findMany({ orderBy: { name: "asc" } }),
        prisma.region.findMany({ orderBy: { name: "asc" } }),
        prisma.group.findMany({
          where: { type: GroupType.CELL_GROUP },
          orderBy: { name: "asc" },
        }),
        prisma.group.findMany({
          where: { type: GroupType.MINISTRY },
          orderBy: { name: "asc" },
        }),
        prisma.household.findMany({ orderBy: { name: "asc" }, take: 100 }),
        prisma.person.findMany({
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
          take: 200,
        }),
        prisma.adminUser.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true, email: true, role: true },
        }),
      ]);

    return {
      campuses,
      regions,
      cellGroups,
      ministryGroups,
      households,
      persons,
      officers,
    };
  }, emptyLookups);
}

export type AdminLookups = Awaited<ReturnType<typeof getAdminLookups>>;
