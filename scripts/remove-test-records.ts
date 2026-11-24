/**
 * List (and, only with --apply, delete) database rows whose titles are
 * clearly test or placeholder content.
 *
 * Does nothing unless DATABASE_URL or DIRECT_URL is set in the environment.
 * Default is a dry run. This file is not run by the app or by CI.
 *
 *   npx tsx scripts/remove-test-records.ts
 *   npx tsx scripts/remove-test-records.ts --apply
 *
 * Records seen on the public site before this change (server-rendered dates):
 *   - title "TESTING EVENTS", description "Women's conference"
 *     Fri, Oct 30, 6:07 PM → Thu, Nov 5, 9:09 AM
 *   - title "rops", description "rops"
 *     Fri, Aug 28, 12:35 PM → Mon, Aug 31, 12:35 PM
 *
 * "Women's conference" is the description of the TESTING EVENTS row, not a
 * separate title. A real event later titled "Women's conference" is kept.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  isPlaceholderLabel,
  PLACEHOLDER_LABELS,
} from "../src/lib/content/placeholder-records";

const apply = process.argv.includes("--apply");

function connectionString() {
  return process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || "";
}

async function main() {
  const databaseUrl = connectionString();
  if (!databaseUrl) {
    console.error(
      "DATABASE_URL or DIRECT_URL is not set. This script was not connected to any database.",
    );
    process.exitCode = 1;
    return;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("supabase.com")
      ? { rejectUnauthorized: false }
      : undefined,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  console.log(apply ? "APPLY: matching rows will be deleted." : "DRY RUN: no rows will be deleted.");
  console.log(`Exact labels: ${PLACEHOLDER_LABELS.join(", ")}`);

  try {
    const [events, sermons, groups] = await Promise.all([
      prisma.event.findMany({
        include: {
          rsvps: {
            include: { person: { select: { firstName: true, lastName: true, email: true } } },
          },
        },
        orderBy: { startsAt: "asc" },
      }),
      prisma.sermon.findMany({ orderBy: { date: "desc" } }),
      prisma.group.findMany({ orderBy: { name: "asc" } }),
    ]);

    const testEvents = events.filter((event) => isPlaceholderLabel(event.title));
    const testSermons = sermons.filter((sermon) => isPlaceholderLabel(sermon.title));
    const testGroups = groups.filter((group) => isPlaceholderLabel(group.name));

    console.log(`\nEvents matched: ${testEvents.length}`);
    for (const event of testEvents) {
      console.log(
        `- ${event.id} | ${event.title} | ${event.description ?? ""} | ${event.startsAt.toISOString()} → ${event.endsAt?.toISOString() ?? ""} | rsvps ${event.rsvps.length}`,
      );
      for (const rsvp of event.rsvps) {
        console.log(
          `    rsvp person kept: ${rsvp.person.firstName} ${rsvp.person.lastName} ${rsvp.person.email ?? ""}`,
        );
      }
    }

    console.log(`\nSermons matched: ${testSermons.length}`);
    for (const sermon of testSermons) {
      console.log(`- ${sermon.id} | ${sermon.title} | ${sermon.date.toISOString()}`);
    }

    console.log(`\nGroups matched: ${testGroups.length}`);
    for (const group of testGroups) {
      console.log(`- ${group.id} | ${group.name} | ${group.type}`);
    }

    if (!apply) {
      console.log("\nRe-run with --apply to delete the matched events, sermons, and groups.");
      console.log("Event RSVPs are removed with the event. People records are not deleted.");
      return;
    }

    if (testEvents.length > 0) {
      const deleted = await prisma.event.deleteMany({
        where: { id: { in: testEvents.map((event) => event.id) } },
      });
      console.log(`\nDeleted events: ${deleted.count}`);
    }
    if (testSermons.length > 0) {
      const deleted = await prisma.sermon.deleteMany({
        where: { id: { in: testSermons.map((sermon) => sermon.id) } },
      });
      console.log(`Deleted sermons: ${deleted.count}`);
    }
    if (testGroups.length > 0) {
      const deleted = await prisma.group.deleteMany({
        where: { id: { in: testGroups.map((group) => group.id) } },
      });
      console.log(`Deleted groups: ${deleted.count}`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
