import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SOURCE_LABELS,
  STATUS_LABELS,
  formatCurrency,
} from "@/lib/finance/format";
import { deleteFinanceTransactionAction } from "@/lib/finance/actions";
import { prisma } from "@/lib/prisma";

type FinanceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FinanceDetailPage({ params }: FinanceDetailPageProps) {
  const { id } = await params;

  const [transaction, syncRows] = await Promise.all([
    prisma.financeTransaction.findUnique({
      where: { id },
      include: { campus: true },
    }),
    prisma.syncQueue.findMany({
      where: { entityType: "finance_transaction", entityId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Finance"
        title={formatCurrency(transaction.amount, transaction.currency)}
        description={
          SOURCE_LABELS[transaction.source] ?? transaction.source
        }
        action={
          <Link href="/admin/finance">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card header={<p className="text-sm font-medium">Transaction</p>}>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd>{STATUS_LABELS[transaction.status] ?? transaction.status}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Date</dt>
              <dd>{transaction.transactionDate.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Purpose</dt>
              <dd>{transaction.purpose ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Payer</dt>
              <dd>
                {transaction.payerName ?? "—"}
                {transaction.payerEmail ? ` · ${transaction.payerEmail}` : ""}
                {transaction.payerPhone ? ` · ${transaction.payerPhone}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Campus</dt>
              <dd>{transaction.campus?.name ?? "—"}</dd>
            </div>
            {transaction.referenceId && (
              <div>
                <dt className="text-xs text-muted-foreground">Lipila reference</dt>
                <dd className="font-mono text-xs">{transaction.referenceId}</dd>
              </div>
            )}
            {transaction.receiptId && (
              <div>
                <dt className="text-xs text-muted-foreground">Receipt</dt>
                <dd className="font-mono text-xs">{transaction.receiptId}</dd>
              </div>
            )}
            {transaction.notes && (
              <div>
                <dt className="text-xs text-muted-foreground">Notes</dt>
                <dd>{transaction.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card header={<p className="text-sm font-medium">Sage sync</p>}>
          {syncRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No Sage sync row yet. Successful Lipila and manual entries queue
              automatically once recorded.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {syncRows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-lg border border-border px-3 py-2"
                >
                  <p className="font-medium">{row.status}</p>
                  <p className="text-xs text-muted-foreground">
                    Queued {row.createdAt.toLocaleString()}
                  </p>
                  {row.lastError && (
                    <p className="mt-1 text-xs text-red-600">{row.lastError}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Live Sage API calls remain disabled until SAGE_API credentials are
            provided.
          </p>
        </Card>
      </div>
      <ConfirmDeleteButton
        action={deleteFinanceTransactionAction.bind(null, id)}
        label="Delete transaction"
        confirm="Delete this giving record permanently?"
      />
    </div>
  );
}
