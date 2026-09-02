import { prisma } from "@/lib/prisma";

export async function generateMembershipNumber() {
  const year = new Date().getFullYear();
  const prefix = `TOD-${year}-`;

  const latest = await prisma.member.findFirst({
    where: { membershipNumber: { startsWith: prefix } },
    orderBy: { membershipNumber: "desc" },
    select: { membershipNumber: true },
  });

  const lastSequence = latest
    ? Number.parseInt(latest.membershipNumber.replace(prefix, ""), 10)
    : 0;

  return `${prefix}${String(lastSequence + 1).padStart(5, "0")}`;
}
