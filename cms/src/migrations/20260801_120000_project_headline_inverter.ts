import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Data fix (client-confirmed 2026-08-01): in the imported project photos, a
 * filename with a SINGLE kW figure carries the inverter rating, not the solar
 * array size — the importer had headlined it as "NkW Solar". Only the 13.3 kW
 * WA install (whose filename carried array AND inverter figures) genuinely
 * describes its array, so it keeps the Solar headline.
 *
 * Order matters: the specs/summary updates key off the OLD title text, so the
 * title rename runs last.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

UPDATE "projects" SET "specs_inverter" = "specs_solar_kw"::text || ' kW'
WHERE "title" LIKE '%kW Solar +%' AND "title" NOT LIKE '13.3kW %'
  AND "specs_solar_kw" IS NOT NULL
  AND ("specs_inverter" IS NULL OR "specs_inverter" = '');

UPDATE "projects" SET "specs_solar_kw" = NULL
WHERE "title" LIKE '%kW Solar +%' AND "title" NOT LIKE '13.3kW %';

UPDATE "projects" SET "summary" = replace("summary", ' kW of solar with ', ' kW inverter with ')
WHERE "title" LIKE '%kW Solar +%' AND "title" NOT LIKE '13.3kW %';

UPDATE "projects" SET "title" = replace("title", 'kW Solar +', 'kW Inverter +')
WHERE "title" LIKE '%kW Solar +%' AND "title" NOT LIKE '13.3kW %';`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

UPDATE "projects" SET "title" = replace("title", 'kW Inverter +', 'kW Solar +')
WHERE "title" LIKE '%kW Inverter +%';

UPDATE "projects" SET "summary" = replace("summary", ' kW inverter with ', ' kW of solar with ')
WHERE "summary" LIKE '% kW inverter with %';

-- specs_solar_kw / specs_inverter are not mechanically restorable.`);

};
