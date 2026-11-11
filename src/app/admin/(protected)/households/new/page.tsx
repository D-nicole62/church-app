import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createHouseholdAction } from "@/lib/households/actions";

type NewHouseholdPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewHouseholdPage({ searchParams }: NewHouseholdPageProps) {
  const query = (await searchParams) ?? {};

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Households"
        title="Create household"
        description="Use the head of the house as the household name, for example Sakala."
      />
      {query.error === "missing-name" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Enter a household name.
        </p>
      ) : null}
      <Card header={<p className="text-sm font-medium">Household name</p>}>
        <form action={createHouseholdAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground/80">
              Name *
            </label>
            <Input name="name" placeholder="Head of the house" required />
            <p className="mt-1 text-[11px] text-muted-foreground">
              This is normally the head of the house. You can attach members on the next screen.
            </p>
          </div>
          <Button type="submit">Create household</Button>
        </form>
      </Card>
    </div>
  );
}
