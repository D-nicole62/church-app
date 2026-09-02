/**
 * Sage ERP integration stub.
 * Writes pending rows to SyncQueue until SAGE_API_* credentials are provided.
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type SageSyncPayload = Prisma.InputJsonValue;

export async function queueSageSync(
  entityType: string,
  entityId: string,
  payload: SageSyncPayload,
) {
  return prisma.syncQueue.create({
    data: {
      entityType,
      entityId,
      payload,
    },
  });
}

export async function pushPendingSyncToSage() {
  const baseUrl = process.env.SAGE_API_BASE_URL;
  const apiKey = process.env.SAGE_API_KEY;

  if (!baseUrl || !apiKey) {
    return { pushed: 0, skipped: true, reason: "Sage credentials not configured" };
  }

  // Live Sage API calls will be implemented once the payload schema is supplied.
  return { pushed: 0, skipped: true, reason: "Sage integration not implemented yet" };
}
