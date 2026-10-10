import { GroupMembershipRole, GroupType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getPublicCellGroups() {
  return prisma.group.findMany({
    where: { type: GroupType.CELL_GROUP },
    include: {
      campus: true,
      zone: { include: { region: true } },
      memberships: {
        where: { role: GroupMembershipRole.LEADER },
        include: { person: true },
        take: 3,
      },
    },
    orderBy: { name: "asc" },
  });
}
