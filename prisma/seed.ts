import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, GroupType, UserRole } from "../src/generated/prisma/client";
import { MINISTRY_CLUSTERS } from "../src/lib/site";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  ssl: (process.env.DIRECT_URL ?? process.env.DATABASE_URL)?.includes("supabase.com")
    ? { rejectUnauthorized: false }
    : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const region = await prisma.region.upsert({
    where: { name: "Lusaka" },
    update: {},
    create: { name: "Lusaka" },
  });

  const campus = await prisma.campus.upsert({
    where: { name: "City Mission Campus" },
    update: { regionId: region.id },
    create: {
      name: "City Mission Campus",
      regionId: region.id,
    },
  });

  for (const cluster of MINISTRY_CLUSTERS) {
    await prisma.group.upsert({
      where: {
        name_type: {
          name: cluster.title,
          type: GroupType.MINISTRY,
        },
      },
      update: {
        description: cluster.description,
        campusId: campus.id,
      },
      create: {
        name: cluster.title,
        description: cluster.description,
        type: GroupType.MINISTRY,
        campusId: campus.id,
      },
    });
  }

  const adminEmail =
    process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase() ||
    "admin@todassembly.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!";
  const passwordHash = await hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log("Seed complete:");
  console.log(`  Region: ${region.name}`);
  console.log(`  Campus: ${campus.name}`);
  console.log(`  Ministry groups: ${MINISTRY_CLUSTERS.length}`);
  console.log(`  Admin user: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
