import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "public"."enum_subscribers_status" AS ENUM('new', 'seen');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "subscribers" ADD COLUMN "status" "enum_subscribers_status";
-- Pre-existing signups are history, not unread work — don't light the badge up.
UPDATE "subscribers" SET "status" = 'seen' WHERE "status" IS NULL;
ALTER TABLE "site_settings" ADD COLUMN "notifications_email_on_subscriber" boolean;
ALTER TABLE "site_settings" ADD COLUMN "notifications_admin_on_subscriber" boolean;`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

ALTER TABLE "subscribers" DROP COLUMN IF EXISTS "status";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "notifications_email_on_subscriber";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "notifications_admin_on_subscriber";`);

};
