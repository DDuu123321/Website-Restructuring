/**
 * Incremental project import — adds ONLY photos that are not in the CMS yet.
 *
 * Unlike seed-projects-v2 (a one-shot seeder that refuses to run once any
 * project exists), this is safe to re-run: it reads the media filenames already
 * uploaded, skips those, and creates one Media + one Project per new photo.
 * Existing projects — including hand-picked `featured` flags and hand-edited
 * slugs — are never touched.
 *
 * Every photo is a separate customer install (client confirmed), so one file =
 * one project. New projects are created UNFEATURED: which installs headline the
 * homepage is an editorial decision, made in the admin.
 *
 * Talks to the CMS over its REST API rather than the database, so it runs
 * against any environment without direct DB access:
 *
 *   CMS_URL=https://cms.example  CMS_TOKEN=<jwt>  DRY_RUN=1 \
 *     npx ts-node --transpile-only src/scripts/import-new-projects.ts
 *
 * CMS_TOKEN is a normal admin JWT — e.g. from POST /api/users/refresh-token in
 * a logged-in admin session, or the `token` returned by /api/users/login.
 * Drop DRY_RUN to write. SEED_DIR overrides the photo folder.
 */
import 'dotenv/config'
import path from 'path'
import fs from 'fs'

const SRC = process.env.SEED_DIR
  ? path.resolve(process.env.SEED_DIR)
  : path.resolve(__dirname, '../../../frontend/public/examples')
const CMS_URL = (process.env.CMS_URL || 'http://localhost:3001').replace(/\/$/, '')
const TOKEN = process.env.CMS_TOKEN || ''
const DRY = Boolean(process.env.DRY_RUN)

const STATE_NAMES: Record<string, string> = {
  NSW: 'New South Wales', QLD: 'Queensland', VIC: 'Victoria', SA: 'South Australia',
  WA: 'Western Australia', TAS: 'Tasmania', NT: 'Northern Territory', ACT: 'Australian Capital Territory',
}

interface Parsed {
  file: string
  slug: string
  title: string
  location: string
  systemType: string
  summary: string
  solarKw?: number
  inverterKw?: number
  batteryKwh?: number
  battery?: string
  warnings: string[]
}

/** Strip the extension and any trailing photo counter ("_2", " (2)").
 *  Only a trailing 1-2 digit integer counts — "53.2KWH" and model codes
 *  like "9.3S" must survive. */
function specKey(filename: string): string {
  return filename
    .replace(/\.(jpe?g|png|webp)$/i, '')
    .replace(/\s*\(\d+\)$/, '')
    .replace(/_(\d{1,2})$/, '')
    .trim()
}

function parse(file: string): Parsed {
  const key = specKey(file)
  const warnings: string[] = []

  // State may sit at either end ("NSW-10KW-…", "tesla-…-NSW"), so match it
  // anywhere on a separator boundary rather than only as a prefix.
  const state = (key.match(/(?:^|[-_ ])(NSW|QLD|VIC|SA|WA|TAS|NT|ACT)(?:[-_ ]|$)/i) || [])[1]?.toUpperCase()
  if (!state) warnings.push('state not found in filename')

  const ev = /EV\s*CHARGER/i.test(key)

  const kwhMatch = key.match(/([\d.]+)\s*KWH/i)
  const batteryKwh = kwhMatch ? parseFloat(kwhMatch[1]) : undefined

  // kW figures that are NOT the kWh battery figure. Two values (13.3KW_10KW)
  // mean panel array + inverter — the array size is the headline number. A
  // SINGLE value is the inverter rating, not the array (client confirmed
  // 2026-08-01), so it headlines as "Inverter" and stays out of specs.solarKw.
  // "WK" is accepted as a transposition of "KW" (present in the source files).
  const kws = [...key.matchAll(/([\d.]+)\s*(?:KW|WK)(?!H)/gi)].map((m) => parseFloat(m[1]))
  const solarKw = kws.length >= 2 ? Math.max(...kws) : undefined
  const inverterKw = kws.length === 1 ? kws[0] : kws.length >= 2 ? Math.min(...kws) : undefined
  if (/\d\s*WK/i.test(key)) warnings.push('filename says "WK" — read as kW')
  if (kws.length === 0) warnings.push('no kW figure found')
  if (batteryKwh === undefined) warnings.push('battery kWh not found')

  // The filename is the only source for a brand; never invent one.
  const battery = /tesla/i.test(key) ? 'Tesla' : undefined

  const location = state ? STATE_NAMES[state] : 'Australia'
  const headline =
    solarKw !== undefined ? `${solarKw}kW Solar`
    : inverterKw !== undefined ? `${inverterKw}kW Inverter`
    : 'Rooftop Solar'
  const title = batteryKwh !== undefined
    ? `${headline} + ${batteryKwh}kWh Battery${ev ? ' + EV Charger' : ''}${state ? ` — ${state}` : ''}`
    : solarKw !== undefined
      ? `${solarKw}kW Rooftop Solar${state ? ` — ${state}` : ''}`
      : inverterKw !== undefined
        ? `${inverterKw}kW Inverter Rooftop Solar${state ? ` — ${state}` : ''}`
        : `Rooftop Solar${state ? ` — ${state}` : ''}`
  const sizePhrase =
    solarKw !== undefined ? `${solarKw} kW of solar with `
    : inverterKw !== undefined ? `a ${inverterKw} kW inverter with `
    : ''
  const summary = batteryKwh !== undefined
    ? `Real Bluven installation in ${location}: ${sizePhrase}${batteryKwh} kWh of battery storage${ev ? ' and EV charging' : ''}.`
    : solarKw !== undefined
      ? `Real Bluven installation in ${location}: ${solarKw} kW rooftop solar system.`
      : inverterKw !== undefined
        ? `Real Bluven installation in ${location}: rooftop solar with a ${inverterKw} kW inverter.`
        : `Real Bluven installation in ${location}.`

  const base = file.replace(/\.(jpe?g|png|webp)$/i, '').trim()
  return {
    file,
    slug: base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    title, location, summary, solarKw, inverterKw, batteryKwh, battery, warnings,
    systemType: ev ? 'solar-ev' : batteryKwh !== undefined ? 'solar-battery' : 'solar',
  }
}

/** Payload rewrites some characters when storing an upload, and the earlier
 *  HEIC photos were converted to .jpg before upload — compare on a normalised
 *  form so neither difference looks like a missing file. */
function normaliseName(f: string): string {
  return f.toLowerCase().replace(/\.(heic|heif|jpeg)$/i, '.jpg')
}

async function api<T>(pathname: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${CMS_URL}${pathname}`, {
    ...init,
    headers: { ...(init.headers || {}), ...(TOKEN ? { Authorization: `JWT ${TOKEN}` } : {}) },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`${init.method || 'GET'} ${pathname} -> ${res.status} ${body.slice(0, 300)}`)
  }
  return res.json() as Promise<T>
}

async function run() {
  type Paged<T> = { docs: T[]; totalDocs: number }
  const [media, projects] = await Promise.all([
    api<Paged<{ id: string | number; filename?: string }>>('/api/media?limit=1000&depth=0'),
    api<Paged<{ slug: string; sortOrder?: number; coverImage?: string | number }>>('/api/projects?limit=1000&depth=0'),
  ])

  const uploaded = new Set(media.docs.map((m) => normaliseName(String(m.filename || ''))))
  const usedSlugs = new Set(projects.docs.map((p) => String(p.slug)))
  const maxSort = projects.docs.reduce((m, p) => Math.max(m, Number(p.sortOrder) || 0), 0)

  const all = fs.readdirSync(SRC)
  const local = all.filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()
  const heic = all.filter((f) => /\.(heic|heif)$/i.test(f))
  const fresh = local.filter((f) => !uploaded.has(normaliseName(f)))

  console.log(`CMS           : ${CMS_URL}`)
  console.log(`Source        : ${SRC}`)
  console.log(`Already in CMS: ${media.totalDocs} media / ${projects.totalDocs} projects`)
  console.log(`Local photos  : ${local.length} importable + ${heic.length} HEIC`)
  console.log(`NEW to import : ${fresh.length}\n`)

  const plan = fresh.map(parse)
  // Claim slugs against the ones production already uses so nothing collides.
  for (const p of plan) {
    let s = p.slug
    for (let n = 2; usedSlugs.has(s); n++) s = `${p.slug}-${n}`
    p.slug = s
    usedSlugs.add(s)
  }

  for (const p of plan) {
    console.log(`  ${p.file}`)
    console.log(`    -> ${p.title}  [${p.systemType}]  slug=${p.slug}`)
    console.log(`       solar=${p.solarKw ?? '—'}kW  inverter=${p.inverterKw ?? '—'}kW  battery=${p.batteryKwh ?? '—'}kWh${p.battery ? `  brand=${p.battery}` : ''}`)
    if (p.warnings.length) console.log(`       WARN ${p.warnings.join('; ')}`)
  }

  const heicMissing = heic.filter((f) => !uploaded.has(normaliseName(f)))
  if (heicMissing.length) {
    console.log(`\nWARN ${heicMissing.length} HEIC file(s) have no imported .jpg counterpart — convert them first:`)
    heicMissing.forEach((f) => console.log(`    ${f}`))
  }

  const referenced = new Set(projects.docs.map((p) => String(p.coverImage)))
  const orphans = media.docs.filter((m) => !referenced.has(String(m.id)))
  if (orphans.length) {
    console.log(`\nNOTE ${orphans.length} media file(s) are not any project's cover:`)
    orphans.forEach((m) => console.log(`    id=${m.id}  ${m.filename}`))
  }

  if (DRY) { console.log('\nDRY_RUN — nothing written.'); return }
  if (!TOKEN) throw new Error('CMS_TOKEN is required to write.')
  if (plan.length === 0) { console.log('\nNothing new to import.'); return }

  let i = 0
  for (const p of plan) {
    const form = new FormData()
    const bytes = fs.readFileSync(path.join(SRC, p.file))
    form.append('file', new Blob([bytes], { type: 'image/jpeg' }), p.file)
    form.append('_payload', JSON.stringify({ alt: p.title }))
    const uploadedDoc = await api<{ doc: { id: string | number } }>('/api/media', { method: 'POST', body: form })

    await api('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: p.title,
        slug: p.slug,
        coverImage: uploadedDoc.doc.id,
        location: p.location,
        systemType: p.systemType,
        summary: p.summary,
        specs: {
          solarKw: p.solarKw,
          batteryKwh: p.batteryKwh,
          battery: p.battery,
          inverter: p.inverterKw !== undefined ? `${p.inverterKw} kW` : undefined,
        },
        // Editorial choice — left to the admin, never set by an importer.
        featured: false,
        sortOrder: maxSort + 10 * (i + 1),
      }),
    })
    i++
    console.log(`  ${i}/${plan.length}  ${p.title}`)
  }
  console.log(`\nImported ${i} new project(s). The existing ${projects.totalDocs} were left untouched.`)
}

run().catch((e) => { console.error('Import failed:', e.message || e); process.exit(1) })
