import { isDatabaseConfigured } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export type DatabaseHealth =
  | { status: "ok" }
  | { status: "not_configured"; message: string }
  | { status: "unreachable"; message: string };

function collectErrorText(error: unknown): string {
  if (error instanceof Error) {
    return [error.message, error.cause instanceof Error ? error.cause.message : ""]
      .filter(Boolean)
      .join(" ");
  }
  return String(error);
}

export function getDatabaseErrorMessage(error: unknown): string {
  const text = collectErrorText(error);

  if (text.includes("tenant/user") && text.includes("not found")) {
    return "Supabase could not find this database project. Restore or recreate the project in the Supabase dashboard, then update DATABASE_URL and DIRECT_URL.";
  }
  if (text.includes("ENOTFOUND") || text.includes("getaddrinfo")) {
    return "Database host could not be reached. Check DATABASE_URL, DIRECT_URL, and that the Supabase project is active.";
  }
  if (text.includes("ECONNREFUSED")) {
    return "Database refused the connection. Verify the host, port, and Supabase pooler settings.";
  }
  if (text.includes("password authentication failed")) {
    return "Database rejected the password. Reset the database password in Supabase and update your env vars.";
  }
  if (text.includes("P1001")) {
    return "Prisma could not reach the database server. Check network access and connection strings.";
  }

  const firstLine = text.split("\n").find((line) => line.trim())?.trim();
  return firstLine || "Database connection failed.";
}

export function isDatabaseConnectionError(error: unknown): boolean {
  const text = collectErrorText(error);
  return (
    text.includes("Database error") ||
    text.includes("Raw query failed") ||
    text.includes("ENOTFOUND") ||
    text.includes("tenant/user") ||
    text.includes("ECONNREFUSED") ||
    text.includes("P1001") ||
    text.includes("getaddrinfo")
  );
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  if (!isDatabaseConfigured()) {
    return {
      status: "not_configured",
      message: "DATABASE_URL or DIRECT_URL is not set in the environment.",
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[database] health check failed:", error);
    }
    return {
      status: "unreachable",
      message: getDatabaseErrorMessage(error),
    };
  }
}
