import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import path from 'path'
import UnreadBadges from './admin/UnreadBadges'

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

  rateLimit: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 200,
  },

  graphQL: {
    disable: false,
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },

  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  localization: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    fallback: true,
  },
})
