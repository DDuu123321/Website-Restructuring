import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "public"."_locales" AS ENUM('en', 'zh');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_quotes_status" AS ENUM('new', 'contacted', 'booked', 'won', 'lost');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_quotes_best_time" AS ENUM('anytime', 'morning', 'afternoon', 'evening', 'email-only');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_quotes_property_type" AS ENUM('House', 'Townhouse / Unit', 'Commercial');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_quotes_state" AS ENUM('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_quotes_timeline" AS ENUM('asap', '1-month', '1-3-months', 'researching');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_quotes_components" AS ENUM('Solar', 'Battery', 'EV', 'Heat pump');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_quotes_usage_pattern" AS ENUM('daytime', 'mixed', 'evening');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_assessments_status" AS ENUM('new', 'contacted', 'qualified', 'converted', 'lost');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_assessments_state" AS ENUM('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_assessments_answers_major_loads" AS ENUM('Ducted air conditioning', 'Pool pump', 'Electric hot water', 'EV charger', 'Spa / workshop / granny flat', 'No major loads');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_assessments_answers_main_goal" AS ENUM('Lower my electricity bills', 'Use more of my solar energy', 'Backup during blackouts', 'Prepare for future energy needs', 'Join a Virtual Power Plant (VPP)', 'Take advantage of free midday charging', 'Not sure yet');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_news_category" AS ENUM('industry', 'policy', 'knowledge', 'company', 'case-study');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_projects_system_type" AS ENUM('solar', 'solar-battery', 'solar-ev', 'full', 'commercial', 'battery-retrofit');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_faq_category" AS ENUM('general', 'pricing', 'installation', 'products', 'support', 'grid', 'solar', 'battery');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "quotes_components" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum_quotes_components",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "enum_quotes_status",
	"internal_notes" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar,
	"full_name" varchar,
	"email" varchar,
	"phone" varchar NOT NULL,
	"bestTime" "enum_quotes_best_time",
	"propertyType" "enum_quotes_property_type",
	"roof_type" varchar,
	"address" varchar,
	"suburb" varchar,
	"state" "enum_quotes_state",
	"postcode" varchar,
	"timeline" "enum_quotes_timeline",
	"system_kw" numeric,
	"battery_kwh" numeric,
	"monthly_bill" numeric,
	"usagePattern" "enum_quotes_usage_pattern",
	"notes" varchar,
	"source_referrer" varchar,
	"source_utm_source" varchar,
	"source_utm_campaign" varchar,
	"source_package_preset" varchar,
	"hp" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "assessments_answers_major_loads" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum_assessments_answers_major_loads",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "assessments_answers_main_goal" (
	"order" integer NOT NULL,
	"parent_id" integer NOT NULL,
	"value" "enum_assessments_answers_main_goal",
	"id" serial PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS "assessments_result_bill_reasons" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"reason" varchar
);

CREATE TABLE IF NOT EXISTS "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "enum_assessments_status",
	"internal_notes" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar,
	"full_name" varchar,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"address" varchar,
	"suburb" varchar,
	"state" "enum_assessments_state",
	"postcode" varchar NOT NULL,
	"answers_home_size" varchar,
	"answers_occupants" varchar,
	"answers_activity_time" varchar,
	"answers_solar_status" varchar,
	"answers_battery_status" varchar,
	"answers_bill_level" varchar,
	"result_household_type" varchar,
	"result_recommendation_type" varchar,
	"result_fit_level" varchar,
	"result_summary" varchar,
	"result_next_step" varchar,
	"result_profile_usage" varchar,
	"result_profile_daytime" varchar,
	"result_profile_night" varchar,
	"result_profile_load" varchar,
	"result_profile_backup" varchar,
	"result_scores" jsonb,
	"source_referrer" varchar,
	"source_utm_source" varchar,
	"source_utm_campaign" varchar,
	"hp" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"source" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"published_at" timestamp(3) with time zone,
	"category" "enum_news_category" NOT NULL,
	"featured" boolean,
	"title" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"summary" varchar NOT NULL,
	"content" jsonb NOT NULL,
	"author" varchar,
	"read_time" numeric,
	"seo_meta_title" varchar,
	"seo_meta_description" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "news_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
);

CREATE TABLE IF NOT EXISTS "projects_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"caption" varchar
);

CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"featured" boolean,
	"sort_order" numeric,
	"title" varchar NOT NULL,
	"slug" varchar,
	"location" varchar NOT NULL,
	"systemType" "enum_projects_system_type" NOT NULL,
	"specs_solar_kw" numeric,
	"specs_battery_kwh" numeric,
	"specs_panels" numeric,
	"specs_inverter" varchar,
	"specs_battery" varchar,
	"specs_completion_year" numeric,
	"summary" varchar NOT NULL,
	"description" jsonb,
	"testimonial_quote" varchar,
	"testimonial_customer_name" varchar,
	"testimonial_customer_suburb" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "projects_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
);

CREATE TABLE IF NOT EXISTS "faq" (
	"id" serial PRIMARY KEY NOT NULL,
	"published" boolean,
	"sort_order" numeric,
	"category" "enum_faq_category" NOT NULL,
	"question" varchar NOT NULL,
	"answer" jsonb NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"role" "enum_users_role",
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"email" varchar NOT NULL,
	"reset_password_token" varchar,
	"reset_password_expiration" timestamp(3) with time zone,
	"salt" varchar,
	"hash" varchar,
	"login_attempts" numeric,
	"lock_until" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"alt" varchar NOT NULL,
	"caption" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"url" varchar,
	"filename" varchar,
	"mime_type" varchar,
	"filesize" numeric,
	"width" numeric,
	"height" numeric,
	"focal_x" numeric,
	"focal_y" numeric,
	"sizes_thumbnail_url" varchar,
	"sizes_thumbnail_width" numeric,
	"sizes_thumbnail_height" numeric,
	"sizes_thumbnail_mime_type" varchar,
	"sizes_thumbnail_filesize" numeric,
	"sizes_thumbnail_filename" varchar,
	"sizes_card_url" varchar,
	"sizes_card_width" numeric,
	"sizes_card_height" numeric,
	"sizes_card_mime_type" varchar,
	"sizes_card_filesize" numeric,
	"sizes_card_filename" varchar,
	"sizes_hero_url" varchar,
	"sizes_hero_width" numeric,
	"sizes_hero_height" numeric,
	"sizes_hero_mime_type" varchar,
	"sizes_hero_filesize" numeric,
	"sizes_hero_filename" varchar
);

CREATE TABLE IF NOT EXISTS "payload_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar,
	"value" jsonb,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"users_id" integer
);

CREATE TABLE IF NOT EXISTS "payload_migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"batch" numeric,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" varchar,
	"phone_href" varchar,
	"email" varchar,
	"quote_email" varchar,
	"address_street" varchar,
	"address_suburb" varchar,
	"address_state" varchar,
	"address_postcode" varchar,
	"address_country" varchar,
	"social_facebook" varchar,
	"social_instagram" varchar,
	"social_linkedin" varchar,
	"social_youtube" varchar,
	"seo_site_name" varchar,
	"seo_default_description" varchar,
	"seo_google_analytics_id" varchar,
	"announcement_enabled" boolean,
	"announcement_text" varchar,
	"announcement_link_text" varchar,
	"announcement_link_url" varchar,
	"chat_enabled" boolean,
	"chat_greeting" varchar,
	"notifications_email_on_quote" boolean,
	"notifications_admin_on_quote" boolean,
	"notifications_email_on_assessment" boolean,
	"notifications_admin_on_assessment" boolean,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "site_settings_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" integer NOT NULL,
	"path" varchar NOT NULL,
	"media_id" integer
);

DO $$ BEGIN
 ALTER TABLE "quotes_components" ADD CONSTRAINT "quotes_components_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "assessments_answers_major_loads" ADD CONSTRAINT "assessments_answers_major_loads_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "assessments_answers_main_goal" ADD CONSTRAINT "assessments_answers_main_goal_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "assessments_result_bill_reasons" ADD CONSTRAINT "assessments_result_bill_reasons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "news_rels" ADD CONSTRAINT "news_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "quotes_components_order_idx" ON "quotes_components" USING btree ("order");
CREATE INDEX IF NOT EXISTS "quotes_components_parent_idx" ON "quotes_components" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "quotes_created_at_idx" ON "quotes" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "assessments_answers_major_loads_order_idx" ON "assessments_answers_major_loads" USING btree ("order");
CREATE INDEX IF NOT EXISTS "assessments_answers_major_loads_parent_idx" ON "assessments_answers_major_loads" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "assessments_answers_main_goal_order_idx" ON "assessments_answers_main_goal" USING btree ("order");
CREATE INDEX IF NOT EXISTS "assessments_answers_main_goal_parent_idx" ON "assessments_answers_main_goal" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "assessments_result_bill_reasons_order_idx" ON "assessments_result_bill_reasons" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "assessments_result_bill_reasons_parent_id_idx" ON "assessments_result_bill_reasons" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "assessments_created_at_idx" ON "assessments" USING btree ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "subscribers_email_idx" ON "subscribers" USING btree ("email");
CREATE INDEX IF NOT EXISTS "subscribers_created_at_idx" ON "subscribers" USING btree ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "news_slug_idx" ON "news" USING btree ("slug");
CREATE INDEX IF NOT EXISTS "news_created_at_idx" ON "news" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "news_rels_order_idx" ON "news_rels" USING btree ("order");
CREATE INDEX IF NOT EXISTS "news_rels_parent_idx" ON "news_rels" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "news_rels_path_idx" ON "news_rels" USING btree ("path");
CREATE INDEX IF NOT EXISTS "news_rels_media_id_idx" ON "news_rels" USING btree ("media_id");
CREATE INDEX IF NOT EXISTS "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
CREATE UNIQUE INDEX IF NOT EXISTS "projects_slug_idx" ON "projects" USING btree ("slug");
CREATE INDEX IF NOT EXISTS "projects_created_at_idx" ON "projects" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
CREATE INDEX IF NOT EXISTS "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
CREATE INDEX IF NOT EXISTS "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
CREATE INDEX IF NOT EXISTS "faq_created_at_idx" ON "faq" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");
CREATE INDEX IF NOT EXISTS "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
CREATE INDEX IF NOT EXISTS "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
CREATE INDEX IF NOT EXISTS "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
CREATE INDEX IF NOT EXISTS "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
CREATE INDEX IF NOT EXISTS "site_settings_rels_media_id_idx" ON "site_settings_rels" USING btree ("media_id");`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "quotes_components";
DROP TABLE "quotes";
DROP TABLE "assessments_answers_major_loads";
DROP TABLE "assessments_answers_main_goal";
DROP TABLE "assessments_result_bill_reasons";
DROP TABLE "assessments";
DROP TABLE "subscribers";
DROP TABLE "news";
DROP TABLE "news_rels";
DROP TABLE "projects_gallery";
DROP TABLE "projects";
DROP TABLE "projects_rels";
DROP TABLE "faq";
DROP TABLE "users";
DROP TABLE "media";
DROP TABLE "payload_preferences";
DROP TABLE "payload_preferences_rels";
DROP TABLE "payload_migrations";
DROP TABLE "site_settings";
DROP TABLE "site_settings_rels";`);

};
