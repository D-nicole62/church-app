export function isDatabaseConfigured() {
  return Boolean(
    process.env.DATABASE_URL?.trim() || process.env.DIRECT_URL?.trim(),
  );
}

/** Prisma pg adapter: prefer session/direct URL (port 5432) over transaction pooler (6543). */
export function getPrismaConnectionString() {
  return (
    process.env.DIRECT_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    ""
  );
}

export async function queryDatabase<T>(
  query: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!isDatabaseConfigured()) {
    return fallback;
  }

  try {
    return await query();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[database] query failed:", error);
    }
    return fallback;
  }
}
