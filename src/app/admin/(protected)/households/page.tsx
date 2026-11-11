import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

type HouseholdsPageProps = {
  searchParams?: Promise<{ success?: string }>;
};

export default async function AdminHouseholdsPage({ searchParams }: HouseholdsPageProps) {
  const query = (await searchParams) ?? {};
  const households = await prisma.household.findMany({
    include: { _count: { select: { persons: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Households"
        title="Households"
        description="Name a household after the head of the house, then attach the members who belong to it."
        action={
          <Link href="/admin/households/new">
            <Button>New household</Button>
          </Link>
        }
      />

      {query.success === "deleted" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Household removed. Its members are no longer attached to it.
        </p>
      ) : null}

      <Card header={<p className="text-sm font-medium">All households</p>}>
        {households.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No households yet. Create one using the head of the house as the name.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">Household</th>
                  <th className="px-2 py-2">Members</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {households.map((household) => (
                  <tr key={household.id} className="border-b border-border/60">
                    <td className="px-2 py-3 font-medium">{household.name}</td>
                    <td className="px-2 py-3">{household._count.persons}</td>
                    <td className="px-2 py-3 text-right">
                      <Link
                        href={`/admin/households/${household.id}`}
                        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Manage
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
