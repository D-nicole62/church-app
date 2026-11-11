import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFinanceSummary } from "@/lib/finance/actions";
import {
  SOURCE_LABELS,
  STATUS_LABELS,
  formatCurrency,
} from "@/lib/finance/format";

export default async function AdminFinancePage() {
  const { transactions, successfulTotal, pendingCount, syncPending } =
    await getFinanceSummary();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phase 6"
        title="Finance"
        action={
          <Link href="/admin/finance/new">
            <Button>Record giving</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card header={<p className="text-sm font-medium">Successful giving</p>}>
          <p className="text-3xl font-semibold text-foreground">
            {formatCurrency(successfulTotal)}
          </p>
        </Card>
        <Card header={<p className="text-sm font-medium">Pending Lipila</p>}>
          <p className="text-3xl font-semibold text-foreground">{pendingCount}</p>
        </Card>
        <Card header={<p className="text-sm font-medium">Sage sync queue</p>}>
          <p className="text-3xl font-semibold text-foreground">{syncPending}</p>
          {/*
          <p className="mt-1 text-xs text-muted-foreground">
            Pending rows until Sage API credentials are supplied.
          </p>
          */}
        </Card>
      </div>

      <Card header={<p className="text-sm font-medium">All transactions</p>}>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No transactions yet. Lipila gifts appear here after payment
            confirmation, or record cash/in-person giving manually.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Source</th>
                  <th className="px-2 py-2">Payer</th>
                  <th className="px-2 py-2">Purpose</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border/60">
                    <td className="px-2 py-3 text-muted-foreground">
                      {transaction.transactionDate.toLocaleDateString()}
                    </td>
                    <td className="px-2 py-3">
                      {SOURCE_LABELS[transaction.source] ?? transaction.source}
                    </td>
                    <td className="px-2 py-3">
                      {transaction.payerName ||
                        transaction.payerEmail ||
                        transaction.accountNumber ||
                        "—"}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {transaction.purpose ?? "—"}
                    </td>
                    <td className="px-2 py-3 font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {STATUS_LABELS[transaction.status] ?? transaction.status}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Link
                        href={`/admin/finance/${transaction.id}`}
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
