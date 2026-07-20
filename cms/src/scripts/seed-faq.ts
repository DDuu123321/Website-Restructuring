/**
 * Seed the `faq` collection with the FAQ content migrated from the live site
 * (bluven.com.au → SPA "View All FAQs" page), captured 2026-07.
 *
 * Per David: "How much government rebate can I get?" and "What if the system
 * breaks down?" are intentionally NOT migrated; one new question about
 * single-phase inverters on three-phase homes is added.
 *
 * Run from cms/:
 *   PAYLOAD_CONFIG_PATH=src/payload.config.ts npx ts-node --transpile-only src/scripts/seed-faq.ts
 */
import 'dotenv/config'
import payload from 'payload'

// ── Lexical helpers ──
const text = (t: string) => ({ type: 'text', text: t, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
const para = (t: string) => ({ type: 'paragraph', children: [text(t)], direction: 'ltr', format: '', indent: 0, version: 1 })
const bullets = (items: string[]) => ({
  type: 'list', listType: 'bullet', tag: 'ul', start: 1,
  children: items.map((t, i) => ({
    type: 'listitem', value: i + 1, children: [text(t)],
    direction: 'ltr', format: '', indent: 0, version: 1,
  })),
  direction: 'ltr', format: '', indent: 0, version: 1,
})
const answer = (...nodes: object[]) => ({
  root: { type: 'root', children: nodes, direction: 'ltr', format: '', indent: 0, version: 1 },
})

const FAQS = [
  // ── General & Installation ──
  {
    category: 'general',
    question: 'Why can you trust Bluven Energy?',
    answer: answer(bullets([
      'We work closely with manufacturers, giving us direct access to fast technical support and service channels.',
      'We are an engineering-led company, delivering high-quality system design and technical solutions.',
      'We focus on quality over price — not the cheapest, but the best.',
    ])),
  },
  {
    category: 'general',
    question: 'How long does installation take?',
    answer: answer(para('Typically 20–45 days, depending on system size, site conditions, logistics, and scheduling.')),
  },
  {
    category: 'general',
    question: 'Where do you operate?',
    answer: answer(para('We provide services across Australia, supported by a network of 100+ accredited installation partners nationwide.')),
  },
  // ── Solar Panels & Inverters ──
  {
    category: 'solar',
    question: 'What brands do you use?',
    answer: answer(para('We only use Tier 1 brands including AlphaESS, GoodWe, Jinko, JA Solar, Trina, and Risen.')),
  },
  {
    category: 'solar',
    question: 'Does the system generate power on cloudy or rainy days?',
    answer: answer(para('Systems still generate power on cloudy days at reduced efficiency. With a battery, you can use stored excess power.')),
  },
  {
    category: 'solar',
    question: 'Can a single-phase inverter be used in a three-phase home?',
    answer: answer(para(
      'Yes — a single-phase inverter can supply a three-phase home. Australia uses net metering, ' +
      'so the energy generated on the phase the inverter is connected to is measured at the meter ' +
      'and can offset the electricity used by appliances on the other two phases.'
    )),
  },
  // ── Battery Storage ──
  {
    category: 'battery',
    question: 'Is a battery worth it in Australia?',
    answer: answer(
      para('Yes — especially with rising electricity prices and declining feed-in tariffs.'),
      bullets(['Maximise self-consumption', 'Backup power', 'Smart app control', 'VPP participation']),
    ),
  },
  {
    category: 'battery',
    question: 'Do I need solar before installing a battery?',
    answer: answer(para('Yes, but we offer both AC-coupled and hybrid solutions, with or without existing solar.')),
  },
  {
    category: 'battery',
    question: 'Do you offer backup power?',
    answer: answer(para('Yes — selected systems provide blackout protection when required.')),
  },
  // ── Warranty & Support ──
  {
    category: 'support',
    question: 'What is the warranty period?',
    answer: answer(para(
      'Solar panels come with a 25-year performance warranty, while inverters and batteries typically include ' +
      'a 10-year manufacturer warranty. All installations are carried out by our in-house engineering team, ' +
      'ensuring consistent quality and long-term support you can rely on.'
    )),
  },
]

async function run() {
  await payload.init({ secret: process.env.PAYLOAD_SECRET as string, local: true })

  const existing = await payload.find({ collection: 'faq', limit: 1, depth: 0 })
  if (existing.totalDocs > 0) {
    console.log(`faq collection already has ${existing.totalDocs} docs — skipping seed.`)
    process.exit(0)
  }

  let n = 0
  for (const f of FAQS) {
    await payload.create({
      collection: 'faq',
      data: {
        question: f.question,
        answer: f.answer,
        category: f.category,
        published: true,
        sortOrder: (n + 1) * 10,
      },
    })
    n++
    console.log(`  created [${f.category}] ${f.question}`)
  }
  console.log(`\nDone: ${n} FAQs seeded.`)
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
