import type { UserRole } from "@/generated/prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  CAMPUS_ADMIN: "Campus Admin",
  FINANCE_OFFICER: "Finance Officer",
  CELL_GROUP_LEADER: "Cell Group Leader",
  FOLLOW_UP_OFFICER: "Follow-up Officer",
};

export function canAccessAdmin(role: UserRole): boolean {
  return Object.keys(ROLE_LABELS).includes(role);
}
