import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Partner lead-import API (POST /api/partner-import):
 * - Users gets `auth.useAPIKey`, which adds Payload's three API-key columns
 *   (column names are db-postgres' snake_case of enableAPIKey / apiKey /
 *   apiKeyIndex).
 * - Users.role gains the "partner" value — API-key-only accounts that can
 *   neither open the admin nor read anything.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`
ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'partner';

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "enable_a_p_i_key" boolean,
  ADD COLUMN IF NOT EXISTS "api_key" varchar,
  ADD COLUMN IF NOT EXISTS "api_key_index" varchar;`);
};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`
ALTER TABLE "users"
  DROP COLUMN IF EXISTS "enable_a_p_i_key",
  DROP COLUMN IF EXISTS "api_key",
  DROP COLUMN IF EXISTS "api_key_index";`);
  // Postgres cannot remove an enum value in place; leaving 'partner' is harmless.
};
