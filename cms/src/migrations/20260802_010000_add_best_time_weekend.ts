import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * The /quote form's contact-time dropdown offered "Weekends", but its value
 * was being posted into the WRONG field (timeline) where Payload rejected it —
 * every non-default choice 400'd and lost the lead. The form now posts to
 * bestTime, which needs this extra enum value.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`
ALTER TYPE "public"."enum_quotes_best_time" ADD VALUE IF NOT EXISTS 'weekend';`);
};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Postgres cannot remove an enum value in place; leaving it is harmless.
};
