/**
 * Seed v2: real installation photos named `STATE-INVERTERKW-BATTERYKWH[...].jpg`
 * (e.g. "WA_10KW_53.2KWH_2.jpg") become Media + Project entries with honest,
 * filename-derived specs. Files that differ only by a trailing `_2`/`(2)`
 * counter are treated as extra photos of the SAME install: first file becomes
 * the cover, the rest go into the project's gallery.
 *
 * Photo source is NOT the repo (43MB of originals stay out of git) — pass it:
 *   SEED_DIR=<folder of .jpg> plus the production env (NODE_ENV=production,
 *   DATABASE_URL, PAYLOAD_SECRET, SERVER_URL, R2_*), then from cms/:
 *   PAYLOAD_CONFIG_PATH=src/payload.config.ts npx ts-node --transpile-only src/scripts/seed-projects-v2.ts
 *
 * DRY_RUN=1 prints the parsed grouping table and exits without touching
 * anything — run that first, always.
 */
import 'dotenv/config'
import path from 'path'
import fs from 'fs'

const SRC = process.env.SEED_DIR
  ? path.resolve(process.env.SEED_DIR)
  : path.resolve(__dirname, '../../../frontend/public/examples')

const STATE_NAMES: Record<string, string> = {
  NSW: 'New South Wales', QLD: 'Queensland', VIC: 'Victoria', SA: 'South Australia',
  WA: 'Western Australia', TAS: 'Tasmania', NT: 'Northern Territory', ACT: 'Australian Capital Territory',
}

// Featured on the homepage: biggest/most photogenic installs, one per state + the EV story.
const FEATURED = [
  'WA_13.3KW_10KW_53.2KWH',
  'WA_10KW_53.2KWH',
  'QLD_10KW_53.2KWH',
  'VIC_10KW_53.2KWH',
  'NSW-10KW-30KWH WITH EV CHARGER',
  'SA-10KW-53KWH',
]

/** "QLD_10KW_53.2KWH_3.jpg" -> "QLD_10KW_53.2KWH"; "WA-5KW-40KWH (2).jpg" -> "WA-5KW-40KWH".
 *  Only a trailing 1-2 digit integer counts as a photo counter — "53.2KWH" and
 *  model codes like "9.3S" must survive. */
function groupKey(filename: string): string {
  return filename
    .replace(/\.(jpe?g|png|webp)$/i, '')
    .replace(/\s*\(\d+\)$/, '')
    .replace(/_(\d{1,2})$/, '')
    .trim()
}

interface Parsed {
  key: string
  files: string[]
  state?: string
  solarKw?: number
  batteryKwh?: number
  ev: boolean
  title: string
  slug: string
  location: string
  systemType: string
  summary: string
  featured: boolean
}

function parseGroup(key: string, files: string[]): Parsed {
  const state = (key.match(/^(NSW|QLD|VIC|SA|WA|TAS|NT|ACT)[-_ ]/i) || [])[1]?.toUpperCase()
  const ev = /EV\s*CHARGER/i.test(key)
  const kwh = key.match(/([\d.]+)\s*KWH/i)
  const batteryKwh = kwh ? parseFloat(kwh[1]) : undefined
  // kW figures that are NOT the kWh battery figure. Two values (13.3KW_10KW)
  // mean panel array + inverter — the array size is the headline number.
  const kws = [...key.matchAll(/([\d.]+)\s*KW(?!H)/gi)].map((m) => parseFloat(m[1]))
  const solarKw = kws.length ? Math.max(...kws) : undefined

  const location = state ? STATE_NAMES[state] : 'Australia'
  const title = batteryKwh
    ? `${solarKw}kW Solar + ${batteryKwh}kWh Battery${ev ? ' + EV Charger' : ''} — ${state}`
    : `${solarKw}kW Rooftop Solar${state ? ` — ${state}` : ''}`
  const summary = batteryKwh
    ? `Real Bluven installation in ${location}: ${solarKw} kW of solar with ${batteryKwh} kWh of battery storage${ev ? ' and EV charging' : ''}.`
    : `Real Bluven installation: ${solarKw} kW rooftop solar system.`

  return {
    key, files, state, solarKw, batteryKwh, ev,
    title,
    slug: key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    location,
    systemType: ev ? 'solar-ev' : batteryKwh ? 'solar-battery' : 'solar',
    summary,
    featured: FEATURED.includes(key),
  }
}

function buildPlan(): Parsed[] {
  const files = fs.readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()
  const groups = new Map<string, string[]>()
  for (const f of files) {
    const k = groupKey(f)
    groups.set(k, [...(groups.get(k) || []), f])
  }
  const plan = [...groups.entries()].map(([k, fl]) => parseGroup(k, fl))
  // Featured first (in FEATURED order), then the rest alphabetically.
  plan.sort((a, b) => {
    const ai = a.featured ? FEATURED.indexOf(a.key) : 999
    const bi = b.featured ? FEATURED.indexOf(b.key) : 999
    return ai - bi || a.key.localeCompare(b.key)
  })
  // "-" and "_" filenames are DIFFERENT installs of the same package, but they
  // slugify identically — /projects/[slug] would collide. Suffix later ones.
  const seen = new Map<string, number>()
  for (const p of plan) {
    const n = (seen.get(p.slug) || 0) + 1
    seen.set(p.slug, n)
    if (n > 1) p.slug = `${p.slug}-${n}`
  }
  return plan
}

async function run() {
  const plan = buildPlan()
  console.log(`Source: ${SRC}`)
  console.log(`${plan.reduce((s, p) => s + p.files.length, 0)} photos -> ${plan.length} projects (${plan.filter((p) => p.featured).length} featured)\n`)
  for (const p of plan) {
    console.log(`${p.featured ? '★' : ' '} ${p.title}  [${p.systemType}]  photos=${p.files.length}  slug=${p.slug}`)
  }
  if (process.env.DRY_RUN) { console.log('\nDRY_RUN — nothing written.'); process.exit(0) }

  const payload = (await import('payload')).default
  await payload.init({ secret: process.env.PAYLOAD_SECRET as string, local: true })

  const existing = await payload.find({ collection: 'projects', limit: 1, depth: 0 })
  if (existing.totalDocs > 0) {
    console.log(`\nProjects already exist (${existing.totalDocs}). Delete them (and their media) in the admin first.`)
    process.exit(1)
  }

  let i = 0
  for (const p of plan) {
    const mediaIds: number[] = []
    for (let n = 0; n < p.files.length; n++) {
      const media = await payload.create({
        collection: 'media',
        filePath: path.join(SRC, p.files[n]),
        data: { alt: p.files.length > 1 ? `${p.title} — photo ${n + 1}` : p.title },
      })
      mediaIds.push((media as any).id)
    }
    await payload.create({
      collection: 'projects',
      data: {
        title: p.title,
        slug: p.slug,
        coverImage: mediaIds[0],
        gallery: mediaIds.slice(1).map((id) => ({ image: id })),
        location: p.location,
        systemType: p.systemType,
        summary: p.summary,
        specs: { solarKw: p.solarKw, batteryKwh: p.batteryKwh },
        featured: p.featured,
        sortOrder: p.featured ? (FEATURED.indexOf(p.key) + 1) * 10 : 100 + i,
      } as any,
    })
    i++
    console.log(`  ${i}/${plan.length}  ${p.title}  (${p.files.length} photo${p.files.length > 1 ? 's' : ''})${p.featured ? '  FEATURED' : ''}`)
  }
  console.log('Seed v2 complete.')
  process.exit(0)
}

run().catch((e) => { console.error('Seed failed:', e); process.exit(1) })
