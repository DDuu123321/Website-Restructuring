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
import Subscribers from './collections/Subscribers'
import SiteSettings from './globals/SiteSettings'
import { r2Enabled } from './lib/storage'

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
    // No webpack override needed — `lib/mailer.ts` uses eval('require') to
    // pull in nodemailer at runtime, so webpack's static analyzer never
    // sees the Node-only dependency and the admin SPA bundle stays clean.
  },

  collections: [
    // ── Leads ──
    Quotes,
    Assessments,
    Subscribers,

    // ── Content ──
    News,
    Projects,
    FAQ,

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

  // Upload limits. Media bytes go to Cloudflare R2 when r2Enabled (see plugins
  // below); otherwise Payload writes to local disk (staticDir in Media.ts).
  upload: {
    limits: {
      fileSize: 10_000_000, // 10 MB
    },
  },

  // Cloudflare R2 object storage (S3-compatible) — proxied mode: bytes are
  // served back through Payload at /uploads/**, so the bucket stays private and
  // the frontend needs no remotePatterns change. Enabled only when all four
  // R2_* env vars are present; otherwise falls back to local-disk uploads.
  plugins: r2Enabled
    ? [
        (() => {
          // Late-bind via eval('require') — same trick as lib/mailer.ts — so the
          // admin's webpack bundler can't statically follow the Node-only S3
          // adapter (fs/util/os) into the SPA bundle. Runs server-side only,
          // and only when R2 is configured.
          // eslint-disable-next-line no-eval
          const { cloudStorage } = eval('require')('@payloadcms/plugin-cloud-storage')
          // eslint-disable-next-line no-eval
          const { s3Adapter } = eval('require')('@payloadcms/plugin-cloud-storage/s3')
          return cloudStorage({
            collections: {
              media: {
                adapter: s3Adapter({
                  bucket: process.env.R2_BUCKET as string,
                  // R2 has no ACL support; pass 'private' (it ignores it but
                  // avoids the empty/public-read x-amz-acl header it rejects).
                  acl: 'private',
                  config: {
                    endpoint: process.env.R2_ENDPOINT,
                    region: 'auto',
                    forcePathStyle: true,
                    credentials: {
                      accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
                      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
                    },
                  },
                }),
              },
            },
          })
        })(),
      ]
    : [],

  // CORS — allow frontend origin
  cors: [
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:5500',
    process.env.SERVER_URL || '',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),

  csrf: [
    'http://localhost:3001',
    process.env.SERVER_URL || '',
    process.env.FRONTEND_URL || '',
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

  localization: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    fallback: true,
  },
})
