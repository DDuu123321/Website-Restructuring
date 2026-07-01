/**
 * One-off seed: turn the real installation photos in
 * frontend/public/examples/ into CMS Media + Project entries so the homepage
 * (featured) and /projects show REAL photos instead of placeholders.
 *
 * Metadata is honest-but-generic DRAFT text (no fabricated specs). Edit the real
 * title / location / specs / summary and choose which stay featured in the admin.
 *
 * Run (from cms/):  PAYLOAD_CONFIG_PATH=src/payload.config.ts npx ts-node --transpile-only src/scripts/seed-projects.ts
 */
import 'dotenv/config'
import path from 'path'
import fs from 'fs'
import payload from 'payload'

const EXAMPLES = path.resolve(__dirname, '../../../frontend/public/examples')

const TITLES = [
  'Residential Solar & Battery Installation',
  'Rooftop Solar Installation',
  'Home Solar + EV Charging',
  'Full Home Energy System',
  'Home Battery Storage Retrofit',
  'Commercial Rooftop Solar',
]
const LOCATIONS = ['Sydney, NSW', 'Brisbane, QLD', 'Perth, WA', 'Gold Coast, QLD', 'Newcastle, NSW']
const SYSTEMS = ['solar-battery', 'solar', 'solar-ev', 'full', 'battery-retrofit', 'commercial']

async function run() {
  await payload.init({ secret: process.env.PAYLOAD_SECRET as string, local: true })

  const existing = await payload.find({ collection: 'projects', limit: 1, depth: 0 })
  if (existing.totalDocs > 0) {
    console.log(`Projects already exist (${existing.totalDocs}). Skipping to avoid duplicates. Delete them in the admin first if you want to re-seed.`)
    process.exit(0)
  }

  const files = fs.readdirSync(EXAMPLES).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()
  console.log(`Seeding ${files.length} projects from ${EXAMPLES}`)

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const media = await payload.create({
      collection: 'media',
      filePath: path.join(EXAMPLES, file),
      data: { alt: `Bluven solar & battery installation — ${LOCATIONS[i % LOCATIONS.length]}` },
    })
    const featured = i < 6
    await payload.create({
      collection: 'projects',
      data: {
        title: `${TITLES[i % TITLES.length]} — ${LOCATIONS[i % LOCATIONS.length]}`,
        slug: `install-${String(i + 1).padStart(2, '0')}`,
        coverImage: (media as any).id,
        location: LOCATIONS[i % LOCATIONS.length],
        systemType: SYSTEMS[i % SYSTEMS.length],
        summary:
          "Rooftop solar installation completed by Bluven's accredited local team. (Draft — edit the title, location, specs and summary in the admin.)",
        featured,
        sortOrder: featured ? (i + 1) * 10 : 100 + i,
      } as any,
    })
    console.log(`  ${i + 1}/${files.length}  ${file}  ->  ${featured ? 'FEATURED' : 'listed'}`)
  }

  console.log('Seed complete.')
  process.exit(0)
}

run().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})
