import {
  TransactionSource,
  TransactionStatus,
  type Prisma,
} from "@/generated/prisma/client";
import { isDatabaseConfigured } from "@/lib/db";
import { queueSageSync } from "@/lib/integrations/sage";
import type { CollectionStatus } from "@/lib/lipila";
import { prisma } from "@/lib/prisma";

type PendingLipilaInput = {
  type: "momo" | "card";
  referenceId: string;
  amount: number;
  currency: string;
  purpose: string;
  accountNumber?: string;
  email?: string;
  payerName?: string;
  payerPhone?: string;
};

async function queueFinanceSageSync(transactionId: string) {
  const transaction = await prisma.financeTransaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction || transaction.status !== TransactionStatus.SUCCESSFUL) {
    return;
  }

  await queueSageSync("finance_transaction", transaction.id, {
    referenceId: transaction.referenceId,
    amount: transaction.amount,
    currency: transaction.currency,
    purpose: transaction.purpose,
    source: transaction.source,
    payerName: transaction.payerName,
    transactionDate: transaction.transactionDate.toISOString(),
  });
}

export async function recordPendingLipilaTransaction(input: PendingLipilaInput) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const source =
    input.type === "card"
      ? TransactionSource.LIPILA_CARD
      : TransactionSource.LIPILA_MOMO;

  return prisma.financeTransaction.upsert({
    where: { referenceId: input.referenceId },
    update: {
      amount: input.amount,
      currency: input.currency,
      purpose: input.purpose,
      accountNumber: input.accountNumber,
      payerEmail: input.email,
      payerName: input.payerName,
      payerPhone: input.payerPhone,
    },
    create: {
      source,
      status: TransactionStatus.PENDING,
      referenceId: input.referenceId,
      amount: input.amount,
      currency: input.currency,
      purpose: input.purpose,
      accountNumber: input.accountNumber,
      payerEmail: input.email,
      payerName: input.payerName,
      payerPhone: input.payerPhone,
      transactionDate: new Date(),
    },
  });
}

export async function recordSuccessfulLipilaFromStatus(status: CollectionStatus) {
  if (!isDatabaseConfigured() || !status.referenceId) {
    return null;
  }

  if ((status.status || "").toLowerCase() !== "successful") {
    return null;
  }

  const source =
    status.paymentType?.toLowerCase().includes("card") ||
    status.type?.toLowerCase().includes("card")
      ? TransactionSource.LIPILA_CARD
      : TransactionSource.LIPILA_MOMO;

  const lipilaPayload = status as Prisma.InputJsonValue;

  const transaction = await prisma.financeTransaction.upsert({
    where: { referenceId: status.referenceId },
    update: {
      source,
      status: TransactionStatus.SUCCESSFUL,
      amount: status.amount ?? undefined,
      currency: status.currency ?? undefined,
      accountNumber: status.accountNumber ?? undefined,
      paymentMethod: status.paymentType ?? status.type,
      externalId: status.externalId,
      receiptId: status.identifier,
      lipilaPayload,
      transactionDate: new Date(),
    },
    create: {
      source,
      status: TransactionStatus.SUCCESSFUL,
      referenceId: status.referenceId,
      amount: status.amount ?? 0,
      currency: status.currency ?? "ZMW",
      accountNumber: status.accountNumber,
      paymentMethod: status.paymentType ?? status.type,
      externalId: status.externalId,
      receiptId: status.identifier,
      lipilaPayload,
      transactionDate: new Date(),
    },
  });

  await queueFinanceSageSync(transaction.id);
  return transaction;
}

export async function recordFailedLipilaFromStatus(status: CollectionStatus) {
  if (!isDatabaseConfigured() || !status.referenceId) {
    return null;
  }

  if ((status.status || "").toLowerCase() !== "failed") {
    return null;
  }

  return prisma.financeTransaction.updateMany({
    where: { referenceId: status.referenceId },
    data: { status: TransactionStatus.FAILED },
  });
}
