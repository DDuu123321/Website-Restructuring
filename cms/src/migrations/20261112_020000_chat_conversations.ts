import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * AI chat conversations (transcript on every turn, hand-over summary when
 * Sunny passes a case to a team) plus the two Site Settings notification
 * toggles that gate the hand-over email and the admin badge.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "public"."enum_chat_conversations_status" AS ENUM('open', 'new', 'reviewed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_chat_conversations_type" AS ENUM('new_enquiry', 'existing_order', 'service', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_chat_conversations_priority" AS ENUM('urgent', 'high', 'normal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "chat_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "enum_chat_conversations_status",
	"type" "enum_chat_conversations_type",
	"priority" "enum_chat_conversations_priority",
	"routed_to" varchar,
	"quote_id" numeric,
	"internal_notes" varchar,
	"title" varchar,
	"summary" varchar,
	"request" varchar,
	"keywords" varchar,
	"missing" varchar,
	"customer_name" varchar,
	"customer_phone" varchar,
	"customer_email" varchar,
	"postcode" varchar,
	"details" jsonb,
	"transcript" varchar,
	"message_count" numeric,
	"conversation_id" varchar NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_conversations_conversation_id_idx" ON "chat_conversations" USING btree ("conversation_id");
CREATE INDEX IF NOT EXISTS "chat_conversations_created_at_idx" ON "chat_conversations" USING btree ("created_at");

ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "notifications_email_on_chat" boolean;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "notifications_admin_on_chat" boolean;`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE IF EXISTS "chat_conversations";
DROP TYPE IF EXISTS "public"."enum_chat_conversations_priority";
DROP TYPE IF EXISTS "public"."enum_chat_conversations_type";
DROP TYPE IF EXISTS "public"."enum_chat_conversations_status";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "notifications_email_on_chat";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "notifications_admin_on_chat";`);

};
