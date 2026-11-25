import { hash } from "bcryptjs";
import { DEFAULT_SEED_PASSWORD } from "../src/lib/auth/password";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, GroupType, UserRole } from "../src/generated/prisma/client";
import {
  MINISTRY_CLUSTERS,
  RETIRED_MINISTRY_GROUP_NAMES,
  getMinistryCount,
} from "../src/lib/church-ministries";
import {
  CHURCH_CAMPUSES,
  PRIMARY_CAMPUS_NAME,
} from "../src/lib/church-campuses";
import {
  CELL_CHURCH_STRUCTURE,
  RETIRED_CELL_CHURCH_NAMES,
  countCellChurchCells,
} from "../src/lib/cell-church-structure";
import { CHURCH_REGIONS } from "../src/lib/church-regions";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  ssl: (process.env.DIRECT_URL ?? process.env.DATABASE_URL)?.includes("supabase.com")
    ? { rejectUnauthorized: false }
    : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.group.deleteMany({
    where: {
      type: GroupType.CELL_GROUP,
      name: { in: [...RETIRED_CELL_CHURCH_NAMES.cells] },
    },
  });

  for (const retiredZone of RETIRED_CELL_CHURCH_NAMES.zones) {
    const region = await prisma.region.findUnique({
      where: { name: retiredZone.regionName },
    });
    if (!region) {
      continue;
    }
    await prisma.zone.deleteMany({
      where: { regionId: region.id, name: retiredZone.zoneName },
    });
  }

  let zoneCount = 0;

  for (const regionDef of CELL_CHURCH_STRUCTURE.regions) {
    const region = await prisma.region.upsert({
      where: { name: regionDef.name },
      update: {},
      create: { name: regionDef.name },
    });

    for (const zoneDef of regionDef.zones) {
      zoneCount += 1;
      const zone = await prisma.zone.upsert({
        where: {
          regionId_name: {
            regionId: region.id,
            name: zoneDef.name,
          },
        },
        update: {},
        create: {
          name: zoneDef.name,
          regionId: region.id,
        },
      });

      for (const cellName of zoneDef.cells) {
        await prisma.group.upsert({
          where: {
            name_type: {
              name: cellName,
              type: GroupType.CELL_GROUP,
            },
          },
          update: { zoneId: zone.id },
          create: {
            name: cellName,
            type: GroupType.CELL_GROUP,
            zoneId: zone.id,
          },
        });
      }
    }
  }

  const campusesByName = new Map<string, { id: string; name: string }>();

  for (const campusName of CHURCH_CAMPUSES) {
    const campus = await prisma.campus.upsert({
      where: { name: campusName },
      update: {},
      create: { name: campusName },
    });
    campusesByName.set(campusName, campus);
  }

  const primaryCampus = campusesByName.get(PRIMARY_CAMPUS_NAME);
  if (!primaryCampus) {
    throw new Error(`Expected primary campus "${PRIMARY_CAMPUS_NAME}" after seeding.`);
  }

  await prisma.group.deleteMany({
    where: {
      type: GroupType.MINISTRY,
      name: { in: [...RETIRED_MINISTRY_GROUP_NAMES] },
    },
  });

  for (const cluster of MINISTRY_CLUSTERS) {
    for (const ministryName of cluster.ministries) {
      await prisma.group.upsert({
        where: {
          name_type: {
            name: ministryName,
            type: GroupType.MINISTRY,
          },
        },
        update: {
          clusterName: cluster.title,
          campusId: primaryCampus.id,
        },
        create: {
          name: ministryName,
          clusterName: cluster.title,
          type: GroupType.MINISTRY,
          campusId: primaryCampus.id,
        },
      });
    }
  }

  const adminEmail =
    process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase() ||
    "admin@todassembly.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || DEFAULT_SEED_PASSWORD;
  const passwordHash = await hash(adminPassword, 12);
  const mustChangePassword = adminPassword === DEFAULT_SEED_PASSWORD;

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
      active: true,
      ...(mustChangePassword ? { mustChangePassword: true } : {}),
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
      active: true,
      mustChangePassword,
    },
  });

  console.log("Seed complete:");
  console.log(`  Regions: ${CHURCH_REGIONS.length} (${CHURCH_REGIONS.join(", ")})`);
  console.log(`  Zones: ${zoneCount}, cell groups: ${countCellChurchCells()}`);
  console.log(
    `  Campuses: ${CHURCH_CAMPUSES.length} (${CHURCH_CAMPUSES.join(", ")})`,
  );
  console.log(
    `  Ministry clusters: ${MINISTRY_CLUSTERS.length}, ministries: ${getMinistryCount()}`,
  );
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
