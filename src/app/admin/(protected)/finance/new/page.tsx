import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminLookups } from "@/lib/admin/lookups";
import { createManualTransactionAction } from "@/lib/finance/actions";

type NewFinancePageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewFinancePage({ searchParams }: NewFinancePageProps) {
  const params = await searchParams;
  const { campuses } = await getAdminLookups();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Finance"
        title="Record manual giving"
        description="Use this for cash, in-person, or bank transfer gifts that did not go through Lipila."
      />

      <Card header={<p className="text-sm font-medium">Transaction details</p>}>
        {params?.error === "invalid-amount" && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            Please enter a valid amount greater than zero.
          </div>
        )}

        <form action={createManualTransactionAction} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Source *
              </label>
              <AdminSelect name="source" defaultValue="CASH">
                <option value="CASH">Cash</option>
                <option value="IN_PERSON">In person (offering box)</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
              </AdminSelect>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Date *
              </label>
              <Input type="date" name="transactionDate" defaultValue={today} required />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Amount (ZMW) *
              </label>
              <Input
                type="number"
                name="amount"
                min={0.01}
                step="0.01"
                placeholder="100.00"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Purpose
              </label>
              <Input name="purpose" placeholder="Tithe / Offering / Missions" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Payer name
              </label>
              <Input name="payerName" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Campus
              </label>
              <AdminSelect name="campusId" defaultValue="">
                <option value="">Not specified</option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Email
              </label>
              <Input type="email" name="payerEmail" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground/80">
                Phone
              </label>
              <Input type="tel" name="payerPhone" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Notes
            </label>
            <Textarea name="notes" rows={3} placeholder="Optional internal notes" />
          </div>

          <Button type="submit">Save transaction</Button>
        </form>
      </Card>
    </div>
  );
}
