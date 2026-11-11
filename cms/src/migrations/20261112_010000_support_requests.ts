import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * After-sales support requests (the /support form) plus the Site Settings
 * fields that route and gate their notifications.
 *
 * Column naming follows what Payload 2's db-postgres generates: text/number
 * fields are snake_cased, select (enum) columns keep their camelCase field
 * name — compare "bestTime" / "propertyType" on "quotes" in the initial
 * migration.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "public"."enum_support_requests_status" AS ENUM('new', 'in-progress', 'resolved', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_support_requests_state" AS ENUM('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_support_requests_issue_type" AS ENUM('no-production', 'inverter-fault', 'battery', 'monitoring', 'ev-charger', 'warranty', 'delivery', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "support_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "enum_support_requests_status",
	"internal_notes" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar,
	"full_name" varchar,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"address" varchar,
	"state" "enum_support_requests_state",
	"postcode" varchar NOT NULL,
	"issueType" "enum_support_requests_issue_type" NOT NULL,
	"product" varchar,
	"installed_when" varchar,
	"description" varchar NOT NULL,
	"source_referrer" varchar,
	"hp" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "support_requests_created_at_idx" ON "support_requests" USING btree ("created_at");

ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "support_email" varchar;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "operations_email" varchar;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "notifications_email_on_support" boolean;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "notifications_admin_on_support" boolean;`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE IF EXISTS "support_requests";
DROP TYPE IF EXISTS "public"."enum_support_requests_issue_type";
DROP TYPE IF EXISTS "public"."enum_support_requests_state";
DROP TYPE IF EXISTS "public"."enum_support_requests_status";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "support_email";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "operations_email";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "notifications_email_on_support";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "notifications_admin_on_support";`);

};
