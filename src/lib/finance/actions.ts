"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  TransactionSource,
  TransactionStatus,
} from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guard";
import { queueSageSync } from "@/lib/integrations/sage";
import { prisma } from "@/lib/prisma";

const MANUAL_SOURCES = [
  TransactionSource.CASH,
  TransactionSource.IN_PERSON,
  TransactionSource.BANK_TRANSFER,
] as const;

function parseManualSource(value: FormDataEntryValue | null): TransactionSource {
  const raw = value?.toString();
  if (MANUAL_SOURCES.includes(raw as (typeof MANUAL_SOURCES)[number])) {
    return raw as TransactionSource;
  }
  return TransactionSource.CASH;
}

export async function createManualTransactionAction(formData: FormData) {
  await requireAdmin();
  const source = parseManualSource(formData.get("source"));
  const amountRaw = formData.get("amount")?.toString().trim() ?? "";
  const purpose = formData.get("purpose")?.toString().trim() || null;
  const payerName = formData.get("payerName")?.toString().trim() || null;
  const payerEmail = formData.get("payerEmail")?.toString().trim() || null;
  const payerPhone = formData.get("payerPhone")?.toString().trim() || null;
  const campusId = formData.get("campusId")?.toString().trim() || null;
  const notes = formData.get("notes")?.toString().trim() || null;
  const transactionDateRaw = formData.get("transactionDate")?.toString().trim();

  const amount = Number.parseFloat(amountRaw);
  if (!amountRaw || Number.isNaN(amount) || amount <= 0) {
    redirect("/admin/finance/new?error=invalid-amount");
  }

  const transaction = await prisma.financeTransaction.create({
    data: {
      source,
      status: TransactionStatus.SUCCESSFUL,
      amount,
      currency: "ZMW",
      purpose,
      payerName,
      payerEmail,
      payerPhone,
      campusId,
      notes,
      transactionDate: transactionDateRaw
        ? new Date(transactionDateRaw)
        : new Date(),
    },
  });

  await queueSageSync("finance_transaction", transaction.id, {
    referenceId: transaction.referenceId,
    amount: transaction.amount,
    currency: transaction.currency,
    purpose: transaction.purpose,
    source: transaction.source,
    payerName: transaction.payerName,
    transactionDate: transaction.transactionDate.toISOString(),
    manualEntry: true,
  });

  revalidatePath("/admin/finance");
  redirect(`/admin/finance/${transaction.id}?success=created`);
}

export async function getFinanceSummary() {
  const [transactions, successfulTotal, pendingCount, syncPending] =
    await Promise.all([
      prisma.financeTransaction.findMany({
        include: { campus: true },
        orderBy: { transactionDate: "desc" },
      }),
      prisma.financeTransaction.aggregate({
        where: { status: TransactionStatus.SUCCESSFUL },
        _sum: { amount: true },
      }),
      prisma.financeTransaction.count({
        where: { status: TransactionStatus.PENDING },
      }),
      prisma.syncQueue.count({
        where: {
          entityType: "finance_transaction",
          status: "PENDING",
        },
      }),
    ]);

  return {
    transactions,
    successfulTotal: successfulTotal._sum.amount ?? 0,
    pendingCount,
    syncPending,
  };
}

export async function deleteFinanceTransactionAction(transactionId: string) {
  await requireAdmin();
  await prisma.syncQueue.deleteMany({
    where: { entityType: "finance_transaction", entityId: transactionId },
  });
  await prisma.financeTransaction.delete({ where: { id: transactionId } }).catch(() => null);
  revalidatePath("/admin/finance");
  redirect("/admin/finance?success=deleted");
}
