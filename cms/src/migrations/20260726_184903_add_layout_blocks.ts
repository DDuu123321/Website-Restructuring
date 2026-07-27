import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DO $$ BEGIN
 CREATE TYPE "public"."enum_news_blocks_image_text_image_side" AS ENUM('left', 'right');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_news_blocks_gallery_columns" AS ENUM('2', '3');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_projects_blocks_image_text_image_side" AS ENUM('left', 'right');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."enum_projects_blocks_gallery_columns" AS ENUM('2', '3');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "news_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" jsonb NOT NULL,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "news_blocks_image_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"imageSide" "enum_news_blocks_image_text_image_side",
	"heading" varchar,
	"body" jsonb NOT NULL,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "news_blocks_gallery_images" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"caption" varchar
);

CREATE TABLE IF NOT EXISTS "news_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"columns" "enum_news_blocks_gallery_columns",
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "news_blocks_stats_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"value" varchar NOT NULL,
	"label" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "news_blocks_stats" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "news_blocks_pull_quote" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar NOT NULL,
	"name" varchar,
	"detail" varchar,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "news_blocks_call_to_action" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar NOT NULL,
	"text" varchar,
	"button_label" varchar,
	"button_href" varchar,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "news_blocks_video" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"url" varchar NOT NULL,
	"caption" varchar,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "projects_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" jsonb NOT NULL,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "projects_blocks_image_text" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"imageSide" "enum_projects_blocks_image_text_image_side",
	"heading" varchar,
	"body" jsonb NOT NULL,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "projects_blocks_gallery_images" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"caption" varchar
);

CREATE TABLE IF NOT EXISTS "projects_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"columns" "enum_projects_blocks_gallery_columns",
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "projects_blocks_stats_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"value" varchar NOT NULL,
	"label" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "projects_blocks_stats" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "projects_blocks_pull_quote" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar NOT NULL,
	"name" varchar,
	"detail" varchar,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "projects_blocks_call_to_action" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar NOT NULL,
	"text" varchar,
	"button_label" varchar,
	"button_href" varchar,
	"block_name" varchar
);

CREATE TABLE IF NOT EXISTS "projects_blocks_video" (
	"_order" integer NOT NULL,
	"_parent_id" integer NOT NULL,
	"_path" text NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"url" varchar NOT NULL,
	"caption" varchar,
	"block_name" varchar
);

DO $$ BEGIN
 ALTER TABLE "news_blocks_rich_text" ADD CONSTRAINT "news_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "news_blocks_image_text" ADD CONSTRAINT "news_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "news_blocks_gallery_images" ADD CONSTRAINT "news_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "news_blocks_gallery" ADD CONSTRAINT "news_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "news_blocks_stats_items" ADD CONSTRAINT "news_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "news_blocks_stats" ADD CONSTRAINT "news_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "news_blocks_pull_quote" ADD CONSTRAINT "news_blocks_pull_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "news_blocks_call_to_action" ADD CONSTRAINT "news_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "news_blocks_video" ADD CONSTRAINT "news_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_blocks_rich_text" ADD CONSTRAINT "projects_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_blocks_image_text" ADD CONSTRAINT "projects_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_blocks_gallery_images" ADD CONSTRAINT "projects_blocks_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_blocks_gallery" ADD CONSTRAINT "projects_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_blocks_stats_items" ADD CONSTRAINT "projects_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_blocks_stats" ADD CONSTRAINT "projects_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_blocks_pull_quote" ADD CONSTRAINT "projects_blocks_pull_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_blocks_call_to_action" ADD CONSTRAINT "projects_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "projects_blocks_video" ADD CONSTRAINT "projects_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "news_blocks_rich_text_order_idx" ON "news_blocks_rich_text" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "news_blocks_rich_text_parent_id_idx" ON "news_blocks_rich_text" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "news_blocks_rich_text_path_idx" ON "news_blocks_rich_text" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "news_blocks_image_text_order_idx" ON "news_blocks_image_text" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "news_blocks_image_text_parent_id_idx" ON "news_blocks_image_text" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "news_blocks_image_text_path_idx" ON "news_blocks_image_text" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "news_blocks_gallery_images_order_idx" ON "news_blocks_gallery_images" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "news_blocks_gallery_images_parent_id_idx" ON "news_blocks_gallery_images" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "news_blocks_gallery_order_idx" ON "news_blocks_gallery" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "news_blocks_gallery_parent_id_idx" ON "news_blocks_gallery" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "news_blocks_gallery_path_idx" ON "news_blocks_gallery" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "news_blocks_stats_items_order_idx" ON "news_blocks_stats_items" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "news_blocks_stats_items_parent_id_idx" ON "news_blocks_stats_items" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "news_blocks_stats_order_idx" ON "news_blocks_stats" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "news_blocks_stats_parent_id_idx" ON "news_blocks_stats" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "news_blocks_stats_path_idx" ON "news_blocks_stats" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "news_blocks_pull_quote_order_idx" ON "news_blocks_pull_quote" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "news_blocks_pull_quote_parent_id_idx" ON "news_blocks_pull_quote" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "news_blocks_pull_quote_path_idx" ON "news_blocks_pull_quote" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "news_blocks_call_to_action_order_idx" ON "news_blocks_call_to_action" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "news_blocks_call_to_action_parent_id_idx" ON "news_blocks_call_to_action" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "news_blocks_call_to_action_path_idx" ON "news_blocks_call_to_action" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "news_blocks_video_order_idx" ON "news_blocks_video" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "news_blocks_video_parent_id_idx" ON "news_blocks_video" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "news_blocks_video_path_idx" ON "news_blocks_video" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "projects_blocks_rich_text_order_idx" ON "projects_blocks_rich_text" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "projects_blocks_rich_text_parent_id_idx" ON "projects_blocks_rich_text" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "projects_blocks_rich_text_path_idx" ON "projects_blocks_rich_text" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "projects_blocks_image_text_order_idx" ON "projects_blocks_image_text" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "projects_blocks_image_text_parent_id_idx" ON "projects_blocks_image_text" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "projects_blocks_image_text_path_idx" ON "projects_blocks_image_text" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "projects_blocks_gallery_images_order_idx" ON "projects_blocks_gallery_images" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "projects_blocks_gallery_images_parent_id_idx" ON "projects_blocks_gallery_images" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "projects_blocks_gallery_order_idx" ON "projects_blocks_gallery" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "projects_blocks_gallery_parent_id_idx" ON "projects_blocks_gallery" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "projects_blocks_gallery_path_idx" ON "projects_blocks_gallery" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "projects_blocks_stats_items_order_idx" ON "projects_blocks_stats_items" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "projects_blocks_stats_items_parent_id_idx" ON "projects_blocks_stats_items" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "projects_blocks_stats_order_idx" ON "projects_blocks_stats" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "projects_blocks_stats_parent_id_idx" ON "projects_blocks_stats" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "projects_blocks_stats_path_idx" ON "projects_blocks_stats" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "projects_blocks_pull_quote_order_idx" ON "projects_blocks_pull_quote" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "projects_blocks_pull_quote_parent_id_idx" ON "projects_blocks_pull_quote" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "projects_blocks_pull_quote_path_idx" ON "projects_blocks_pull_quote" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "projects_blocks_call_to_action_order_idx" ON "projects_blocks_call_to_action" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "projects_blocks_call_to_action_parent_id_idx" ON "projects_blocks_call_to_action" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "projects_blocks_call_to_action_path_idx" ON "projects_blocks_call_to_action" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "projects_blocks_video_order_idx" ON "projects_blocks_video" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "projects_blocks_video_parent_id_idx" ON "projects_blocks_video" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "projects_blocks_video_path_idx" ON "projects_blocks_video" USING btree ("_path");`);

};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`

DROP TABLE "news_blocks_rich_text";
DROP TABLE "news_blocks_image_text";
DROP TABLE "news_blocks_gallery_images";
DROP TABLE "news_blocks_gallery";
DROP TABLE "news_blocks_stats_items";
DROP TABLE "news_blocks_stats";
DROP TABLE "news_blocks_pull_quote";
DROP TABLE "news_blocks_call_to_action";
DROP TABLE "news_blocks_video";
DROP TABLE "projects_blocks_rich_text";
DROP TABLE "projects_blocks_image_text";
DROP TABLE "projects_blocks_gallery_images";
DROP TABLE "projects_blocks_gallery";
DROP TABLE "projects_blocks_stats_items";
DROP TABLE "projects_blocks_stats";
DROP TABLE "projects_blocks_pull_quote";
DROP TABLE "projects_blocks_call_to_action";
DROP TABLE "projects_blocks_video";`);

};
