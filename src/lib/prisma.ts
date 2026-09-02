import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getPrismaConnectionString } from "@/lib/db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  poolConnectionString: string | undefined;
};

function createPrismaClient() {
  const connectionString = getPrismaConnectionString();

  if (
    globalForPrisma.pool &&
    globalForPrisma.poolConnectionString !== connectionString
  ) {
    void globalForPrisma.pool.end();
    globalForPrisma.pool = undefined;
    globalForPrisma.prisma = undefined;
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      ssl: connectionString.includes("supabase.com")
        ? { rejectUnauthorized: false }
        : undefined,
      max: 10,
      connectionTimeoutMillis: 15_000,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
    globalForPrisma.poolConnectionString = connectionString;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
