import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const rows = await prisma.financeTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      createdAt: true,
      amount: true,
      currency: true,
      purpose: true,
      status: true,
      source: true,
      referenceId: true,
      payerName: true,
      notes: true,
    },
  });
  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
