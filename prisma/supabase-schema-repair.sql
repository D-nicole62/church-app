-- Run in Supabase: SQL Editor → New query → paste → Run
-- Syncs schema when `prisma db push` fails (e.g. P1017 on pooler).

-- Ministry metadata on groups
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "clusterName" TEXT;

-- Cell church: region → zone → cell group
CREATE TABLE IF NOT EXISTS "Zone" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "regionId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Zone_regionId_name_key" ON "Zone"("regionId", "name");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Zone_regionId_fkey'
  ) THEN
    ALTER TABLE "Zone"
      ADD CONSTRAINT "Zone_regionId_fkey"
      FOREIGN KEY ("regionId") REFERENCES "Region"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "zoneId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Group_zoneId_fkey'
  ) THEN
    ALTER TABLE "Group"
      ADD CONSTRAINT "Group_zoneId_fkey"
      FOREIGN KEY ("zoneId") REFERENCES "Zone"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Legacy columns (region on person/campus/group directly)
ALTER TABLE "Group" DROP COLUMN IF EXISTS "regionId";
ALTER TABLE "Person" DROP COLUMN IF EXISTS "regionId";
ALTER TABLE "Campus" DROP COLUMN IF EXISTS "regionId";
