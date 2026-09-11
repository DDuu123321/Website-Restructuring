import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Three free-text fields on quotes for context that partner lead feeds
 * supply and the website form never asked: household size, customer goals,
 * product preference. Populated via /api/partner-import.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`
ALTER TABLE "quotes"
  ADD COLUMN IF NOT EXISTS "household_size" varchar,
  ADD COLUMN IF NOT EXISTS "goals" varchar,
  ADD COLUMN IF NOT EXISTS "product_preference" varchar;`);
};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`
ALTER TABLE "quotes"
  DROP COLUMN IF EXISTS "household_size",
  DROP COLUMN IF EXISTS "goals",
  DROP COLUMN IF EXISTS "product_preference";`);
};
