import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import path from 'path'
import UnreadBadges from './admin/UnreadBadges'
import DashboardLeadStats from './admin/DashboardLeadStats'

import Users from './collections/Users'
import Media from './collections/Media'
import News from './collections/News'
import Projects from './collections/Projects'
import FAQ from './collections/FAQ'
import Quotes from './collections/Quotes'
import Assessments from './collections/Assessments'
import Testimonials from './collections/Testimonials'
import Brands from './collections/Brands'
import TeamMembers from './collections/TeamMembers'
import SiteSettings from './globals/SiteSettings'

export default buildConfig({
  serverURL: process.env.SERVER_URL || 'http://localhost:3001',

  editor: lexicalEditor({}),

  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    meta: {
      titleSuffix: ' — Bluven CMS',
      favicon: '/favicon.svg',
      ogImage: '/uploads/og-default.jpg',
    },
    css: path.resolve(__dirname, 'admin-overrides.css'),
    components: {
      beforeNavLinks: [UnreadBadges],
      beforeDashboard: [DashboardLeadStats],
    },
  },

  collections: [
    // ── Leads ──
    Quotes,
    Assessments,
    Testimonials,

    // ── Content ──
    News,
    Projects,
    FAQ,
    Brands,
    TeamMembers,

    // ── System ──
    Users,
    Media,
  ],

  globals: [
    SiteSettings,
  ],

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/bluven',
    },
    // Optional: set ssl behaviour for managed Postgres providers (Railway/Neon/Supabase)
    // pool: { connectionString: ..., ssl: { rejectUnauthorized: false } },
  }),

  // Upload storage (local for now — swap to S3/R2 later)
  upload: {
    limits: {
      fileSize: 10_000_000, // 10 MB
    },
  },

  // CORS — allow frontend origin
  cors: [
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:5500',
    process.env.SERVER_URL || '',
  ].filter(Boolean),

  csrf: [
    'http://localhost:3001',
    process.env.SERVER_URL || '',
  ].filter(Boolean),

  // Payload's built-in rate limiter applies to ALL /api requests (GET too).
  // 200/15min was eating admin sessions: badge polling (6/min × 3 collections)
  // + admin list browsing burns through the quota in a few minutes.
  // Bumped to 10k/15min ≈ 11 req/sec sustained — way above normal admin use,
  // still a DDoS floor. Form-submission spam is handled by submitLimiter
  // in server.ts (10 POST/min on the three lead endpoints).
  rateLimit: {
    window: 15 * 60 * 1000,
    max: 10000,
  },

  graphQL: {
    disable: false,
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },

  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  // Admin UI language (different concern from `localization` below, which
  // controls per-locale CONTENT). Payload bundles zh-CN translations for
  // the shell — users switch in their profile (top-right avatar).
  // Our custom labels in collections use { en, zh } records to translate
  // alongside the built-in shell strings.
  i18n: {
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh'],
  },

  localization: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    fallback: true,
  },
})
