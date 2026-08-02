import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { sql } from 'drizzle-orm'

/**
 * Owner decision 2026-08-02: drop fields that were stored for months but
 * rendered/populated by nothing —
 * - site_settings: address / social / Default-SEO / announcement-bar groups
 *   (site_settings_rels existed only for the seo.ogImage upload relation)
 * - quotes: roofType, usagePattern, source.utm_*, source.packagePreset
 *   (the multi-step form and ?pack= presets that fed them are gone)
 * - assessments: source.utm_*
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
await payload.db.drizzle.execute(sql`
ALTER TABLE "site_settings"
  DROP COLUMN IF EXISTS "address_street",
  DROP COLUMN IF EXISTS "address_suburb",
  DROP COLUMN IF EXISTS "address_state",
  DROP COLUMN IF EXISTS "address_postcode",
  DROP COLUMN IF EXISTS "address_country",
  DROP COLUMN IF EXISTS "social_facebook",
  DROP COLUMN IF EXISTS "social_instagram",
  DROP COLUMN IF EXISTS "social_linkedin",
  DROP COLUMN IF EXISTS "social_youtube",
  DROP COLUMN IF EXISTS "seo_site_name",
  DROP COLUMN IF EXISTS "seo_default_description",
  DROP COLUMN IF EXISTS "seo_google_analytics_id",
  DROP COLUMN IF EXISTS "announcement_enabled",
  DROP COLUMN IF EXISTS "announcement_text",
  DROP COLUMN IF EXISTS "announcement_link_text",
  DROP COLUMN IF EXISTS "announcement_link_url";

DROP TABLE IF EXISTS "site_settings_rels";

ALTER TABLE "quotes"
  DROP COLUMN IF EXISTS "roof_type",
  DROP COLUMN IF EXISTS "usagePattern",
  DROP COLUMN IF EXISTS "source_utm_source",
  DROP COLUMN IF EXISTS "source_utm_campaign",
  DROP COLUMN IF EXISTS "source_package_preset";

DROP TYPE IF EXISTS "public"."enum_quotes_usage_pattern";

ALTER TABLE "assessments"
  DROP COLUMN IF EXISTS "source_utm_source",
  DROP COLUMN IF EXISTS "source_utm_campaign";`);
};

export async function down({ payload }: MigrateDownArgs): Promise<void> {
await payload.db.drizzle.execute(sql`
CREATE TYPE "public"."enum_quotes_usage_pattern" AS ENUM('daytime', 'mixed', 'evening');
ALTER TABLE "quotes"
  ADD COLUMN IF NOT EXISTS "roof_type" varchar,
  ADD COLUMN IF NOT EXISTS "usagePattern" "enum_quotes_usage_pattern",
  ADD COLUMN IF NOT EXISTS "source_utm_source" varchar,
  ADD COLUMN IF NOT EXISTS "source_utm_campaign" varchar,
  ADD COLUMN IF NOT EXISTS "source_package_preset" varchar;
ALTER TABLE "assessments"
  ADD COLUMN IF NOT EXISTS "source_utm_source" varchar,
  ADD COLUMN IF NOT EXISTS "source_utm_campaign" varchar;
ALTER TABLE "site_settings"
  ADD COLUMN IF NOT EXISTS "address_street" varchar,
  ADD COLUMN IF NOT EXISTS "address_suburb" varchar,
  ADD COLUMN IF NOT EXISTS "address_state" varchar,
  ADD COLUMN IF NOT EXISTS "address_postcode" varchar,
  ADD COLUMN IF NOT EXISTS "address_country" varchar,
  ADD COLUMN IF NOT EXISTS "social_facebook" varchar,
  ADD COLUMN IF NOT EXISTS "social_instagram" varchar,
  ADD COLUMN IF NOT EXISTS "social_linkedin" varchar,
  ADD COLUMN IF NOT EXISTS "social_youtube" varchar,
  ADD COLUMN IF NOT EXISTS "seo_site_name" varchar,
  ADD COLUMN IF NOT EXISTS "seo_default_description" varchar,
  ADD COLUMN IF NOT EXISTS "seo_google_analytics_id" varchar,
  ADD COLUMN IF NOT EXISTS "announcement_enabled" boolean,
  ADD COLUMN IF NOT EXISTS "announcement_text" varchar,
  ADD COLUMN IF NOT EXISTS "announcement_link_text" varchar,
  ADD COLUMN IF NOT EXISTS "announcement_link_url" varchar;
-- site_settings_rels is not recreated (its data is unrecoverable anyway).`);
};
