/**
 * One-off import: real installation photos → projects.
 *
 * Source photos: pre-converted JPGs (HEIC → JPG via sips) in the scratchpad dir
 * passed as PHOTOS_DIR. Filenames encode the install:
 *   STATE_[solarKW_]inverterKW_batteryKWH[_model][_seq]
 *   - two kW values → first is the solar array, second the inverter
 *   - one kW value → inverter only (solar size unknown / not stated)
 *   - trailing _2/_3/_4 or (2) → a DIFFERENT install with the same config
 *   - G3T10 / G3S5 / 9.3S etc. are model codes → recorded in specs, not prose
 *
 * Each photo = one project (per David, these are all separate installs).
 * Also deletes the old install-01…15 placeholder projects (and their media).
 *
 * Run from cms/:
 *   PHOTOS_DIR=<dir> PAYLOAD_CONFIG_PATH=src/payload.config.ts \
 *     npx ts-node --transpile-only src/scripts/import-marketing-projects.ts
 */
import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import payload from 'payload'

const STATE_NAMES: Record<string, string> = {
  NSW: 'New South Wales',
  QLD: 'Queensland',
  VIC: 'Victoria',
  SA: 'South Australia',
  WA: 'Western Australia',
  TAS: 'Tasmania',
  NT: 'Northern Territory',
  ACT: 'Australian Capital Territory',
}

interface Parsed {
  file: string
  state: string
  solarKw: number | null
  inverterKw: number
  batteryKwh: number
  model: string | null
  seq: number // 1 for the base name; 2/3/4 for _2/_3/(2) variants
}

function parseFilename(file: string): Parsed | null {
  const base = file.replace(/\.jpg$/i, '')
  // Peel off "(2)" style dedup suffix first
  let seq = 1
  let name = base.replace(/\((\d+)\)$/, (_, n) => { seq = parseInt(n, 10); return '' })

  const parts = name.split('_').filter(Boolean)
  const state = parts.shift() || ''
  if (!STATE_NAMES[state]) return null

  const kws: number[] = []
  let batteryKwh: number | null = null
  const modelBits: string[] = []

  for (const p of parts) {
    const kw = p.match(/^([\d.]+)KW$/i)
    const kwh = p.match(/^([\d.]+)KWH$/i)
    const seqM = p.match(/^(\d)$/) // bare _2 / _3 / _4
    if (kwh) batteryKwh = parseFloat(kwh[1])
    else if (kw) kws.push(parseFloat(kw[1]))
    else if (seqM) seq = parseInt(seqM[1], 10)
    else modelBits.push(p) // model codes like G3T10, 9.3S, G3S5
  }

  if (batteryKwh === null || kws.length === 0) return null
  // Two kW values → solar + inverter; one → inverter only (solar not stated)
  const [solarKw, inverterKw] = kws.length >= 2 ? [kws[0], kws[1]] : [null, kws[0]]
  return { file, state, solarKw, inverterKw, batteryKwh, model: modelBits.join(' ') || null, seq }
}

function projectData(p: Parsed, slugTaken: (s: string) => boolean) {
  const stateName = STATE_NAMES[p.state]
  const sizeLabel = p.solarKw
    ? `${p.solarKw} kW Solar + ${p.batteryKwh} kWh Battery`
    : `${p.inverterKw} kW Hybrid System + ${p.batteryKwh} kWh Battery`

  const title = `${sizeLabel} — ${p.state}`

  // Unique slug: state-solar-inverter-battery, with -2/-3 when the same config repeats
  let slugBase = [
    p.state.toLowerCase(),
    p.solarKw ? `${p.solarKw}kw` : null,
    `${p.inverterKw}kw`,
    `${p.batteryKwh}kwh`,
  ].filter(Boolean).join('-').replace(/\./g, '-')
  let slug = slugBase
  for (let n = 2; slugTaken(slug); n++) slug = `${slugBase}-${n}`

  const solarBit = p.solarKw ? `a ${p.solarKw} kW solar array and ` : ''
  const summary =
    `Residential ${p.solarKw ? 'solar and battery' : 'battery storage'} installation in ${stateName}, ` +
    `featuring ${solarBit}a ${p.inverterKw} kW hybrid inverter with ${p.batteryKwh} kWh of battery storage ` +
    `for day and night energy independence.`

  return {
    title,
    slug,
    location: stateName,
    systemType: p.solarKw ? 'solar-battery' : 'battery-retrofit',
    summary,
    specs: {
      ...(p.solarKw ? { solarKw: p.solarKw } : {}),
      batteryKwh: p.batteryKwh,
      inverter: p.model ? `${p.inverterKw} kW hybrid (${p.model})` : `${p.inverterKw} kW hybrid`,
    },
    alt: `${sizeLabel} installation — ${stateName}`,
  }
}

async function run() {
  const PHOTOS_DIR = process.env.PHOTOS_DIR
  if (!PHOTOS_DIR || !fs.existsSync(PHOTOS_DIR)) {
    console.error('PHOTOS_DIR env var missing or not a directory')
    process.exit(1)
  }

  await payload.init({ secret: process.env.PAYLOAD_SECRET as string, local: true })

  // ── 1. Delete the install-01…15 placeholder projects (+ their media) ──
  const placeholders = await payload.find({
    collection: 'projects',
    where: { slug: { like: 'install-' } },
    limit: 100,
    depth: 0,
  })
  console.log(`Found ${placeholders.docs.length} placeholder projects to delete`)
  for (const doc of placeholders.docs) {
    const coverId = typeof doc.coverImage === 'object' ? (doc.coverImage as any)?.id : doc.coverImage
    await payload.delete({ collection: 'projects', id: doc.id })
    if (coverId) {
      try { await payload.delete({ collection: 'media', id: coverId }) }
      catch { console.warn(`  (media ${coverId} not deleted — may be shared)`) }
    }
    console.log(`  deleted project ${doc.slug}`)
  }

  // ── 2. Create one project per photo ──
  const files = fs.readdirSync(PHOTOS_DIR).filter(f => /\.jpg$/i.test(f)).sort()
  const parsed = files.map(parseFilename)
  const failed = files.filter((_, i) => !parsed[i])
  if (failed.length) console.warn('UNPARSEABLE (skipped):', failed)

  const usedSlugs = new Set<string>()
  let created = 0
  for (const p of parsed) {
    if (!p) continue
    const data = projectData(p, s => usedSlugs.has(s))
    usedSlugs.add(data.slug)

    const media = await payload.create({
      collection: 'media',
      filePath: path.join(PHOTOS_DIR, p.file),
      data: { alt: data.alt },
    })

    await payload.create({
      collection: 'projects',
      data: {
        title: data.title,
        slug: data.slug,
        coverImage: media.id,
        location: data.location,
        systemType: data.systemType,
        summary: data.summary,
        specs: data.specs,
        featured: false,
        sortOrder: 100 + created,
      },
    })
    created++
    console.log(`  created ${data.slug}  ←  ${p.file}`)
  }

  console.log(`\nDone: ${created} projects created from ${files.length} photos.`)
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
