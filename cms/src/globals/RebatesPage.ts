import { GlobalConfig } from 'payload/types'

/**
 * Content for the public /rebates landing page.
 *
 * BUSINESS RULE: no prices / dollar amounts anywhere on this page. Describe the
 * schemes, eligibility and *timing* (step-down dates) only — the exact figure
 * always goes in each customer's written quote. Keep copy current: the federal
 * support steps down each 1 Jan / 1 Jul, and state schemes open/close often.
 */
const RebatesPage: GlobalConfig = {
  slug: 'rebates-page',
  label: '💰 Rebates Page',
  admin: {
    group: '📰 Content',
    description:
      'Content for the public /rebates page. Do NOT enter dollar amounts — describe schemes, eligibility and timing only (the exact figure goes in each written quote). Update the step-down dates and scheme statuses as programs change.',
  },
  access: {
    read: () => true,
    update: ({ req }) => !!req.user,
  },
  fields: [
    // ── Hero ──
    {
      name: 'hero',
      type: 'group',
      label: 'Hero',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'Government Rebates & Incentives' },
        { name: 'heading', type: 'text', defaultValue: 'Let government rebates do the heavy lifting' },
        {
          name: 'lede',
          type: 'textarea',
          defaultValue:
            "Federal and state programs can take a serious chunk off the cost of going solar and adding a battery. Here's what's on offer in 2026 — and how we handle every form, so the support simply lands on your invoice.",
        },
      ],
    },

    // ── Intro ──
    {
      name: 'intro',
      type: 'group',
      label: 'Intro',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'How the support actually reaches you' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            "Most solar and battery incentives in Australia aren't a cheque you chase afterwards — they're an upfront discount. Eligible systems generate government certificates, and as a registered agent we turn those into a reduction on your invoice, so the price you're quoted is already net of the benefit. Where you qualify, state incentives then stack on top.",
        },
      ],
    },

    // ── Schemes ──
    {
      name: 'schemes',
      type: 'array',
      label: 'Rebate schemes',
      labels: { singular: 'Scheme', plural: 'Schemes' },
      admin: { description: 'Each scheme is one card. No dollar amounts — eligibility & timing only.' },
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'tag',
          type: 'select',
          label: 'Region / Type badge',
          defaultValue: 'Federal',
          options: ['Federal', 'NSW', 'VIC', 'QLD', 'SA', 'WA', 'ACT', 'TAS', 'NT', 'Finance'].map(v => ({ label: v, value: v })),
        },
        {
          name: 'appliesTo',
          type: 'select',
          defaultValue: 'battery',
          options: [
            { label: 'Solar', value: 'solar' },
            { label: 'Battery', value: 'battery' },
            { label: 'Solar + Battery', value: 'both' },
            { label: 'Finance', value: 'finance' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'open',
          options: [
            { label: 'Open now', value: 'open' },
            { label: 'Open — rules changing', value: 'changing' },
            { label: 'Phasing out by 2030', value: 'closing' },
            { label: 'Available year-round', value: 'ongoing' },
            { label: 'State scheme closed', value: 'closed' },
          ],
        },
        { name: 'summary', type: 'textarea' },
        {
          name: 'eligibility',
          type: 'array',
          labels: { singular: 'Point', plural: 'Points' },
          fields: [{ name: 'point', type: 'text' }],
        },
        { name: 'timing', type: 'textarea', label: 'Timing / urgency (dates, not dollars)' },
      ],
      defaultValue: [
        {
          name: 'Federal battery discount — Cheaper Home Batteries Program',
          tag: 'Federal',
          appliesTo: 'battery',
          status: 'changing',
          summary:
            "A federal discount on an eligible home battery, taken straight off your invoice up front rather than claimed back later. Install a CEC-approved battery paired with solar through an accredited installer and we apply the certificate value at the point of sale — so you simply pay less from day one. Bigger batteries earn more, up to the program's cap.",
          eligibility: [
            { point: "Battery paired with new or existing rooftop solar (grid-only batteries don't qualify)" },
            { point: 'Battery on the Clean Energy Council approved list, within the eligible capacity range' },
            { point: 'Installed by an accredited battery installer' },
            { point: "System able to join a Virtual Power Plant — you don't have to actually join one" },
            { point: 'One supported battery per property; no income test' },
            { point: 'Battery installed on or after 1 July 2025' },
          ],
          timing:
            "Support steps down on fixed dates — it reduced on 1 May 2026 and keeps tapering every 1 January and 1 July through to the scheme's close at the end of 2030. Installing before the next step locks in a larger discount.",
        },
        {
          name: 'Federal solar discount — Small-scale Technology Certificates (STCs)',
          tag: 'Federal',
          appliesTo: 'solar',
          status: 'closing',
          summary:
            'The long-running federal solar incentive. A new system earns certificates based on its size and your location, and as your registered agent we turn them into an upfront discount on your invoice — you never have to handle the certificates yourself. Every quote we give is already net of this benefit.',
          eligibility: [
            { point: 'Eligible rooftop solar with CEC-approved panels and inverter' },
            { point: 'Installed and signed off by an accredited installer' },
            { point: 'Meets Australian standards and local network rules' },
            { point: 'Available to homes and small businesses Australia-wide (value varies by location)' },
          ],
          timing:
            'This benefit shrinks a little each year and is being phased out entirely by the end of 2030, stepping down every 1 January. A comparable system earns less the longer you wait.',
        },
        {
          name: 'NSW battery incentive — connect to a Virtual Power Plant',
          tag: 'NSW',
          appliesTo: 'battery',
          status: 'open',
          summary:
            "New South Wales' current battery incentive rewards connecting your battery to an approved Virtual Power Plant. A certificate provider creates the incentive when your eligible battery is installed and signed up, and the value is passed through to you. Best of all, it stacks on top of the federal battery discount.",
          eligibility: [
            { point: 'NSW household or small business installing an eligible battery' },
            { point: 'Battery on the Clean Energy Council approved list with enough warranty remaining' },
            { point: 'Battery can be controlled by a demand-response provider' },
            { point: 'Connected to an approved Virtual Power Plant' },
          ],
          timing:
            "Open now. Because the value comes from a market certificate, the amount passed through can move over time — it's worth acting while VPP incentives remain strong.",
        },
        {
          name: 'Victoria — Solar Homes solar panel (PV) rebate',
          tag: 'VIC',
          appliesTo: 'solar',
          status: 'changing',
          summary:
            'An upfront Victorian rebate toward a rooftop solar system for eligible owner-occupiers, deducted from your installed price — we handle the Solar Victoria application and approval. An optional interest-free solar loan is available alongside it, and the rebate is calculated after the federal solar discount, so the two stack.',
          eligibility: [
            { point: 'Victorian owner-occupier, or owner of a home under construction' },
            { point: 'Property valued under the program limit' },
            { point: 'Household income under the current Solar Victoria threshold' },
            { point: 'No Solar Homes rebate previously at the property, and no solar installed there in the past 10 years' },
            { point: 'Uses a Solar Victoria authorised retailer and approved products' },
          ],
          timing:
            "Open, but the income-eligibility rules tighten from 1 July 2026 — the household income cap drops, so some households who qualify today won't afterward. Applications need to be in before the change.",
        },
        {
          name: 'Queensland — covered by the federal battery discount',
          tag: 'QLD',
          appliesTo: 'battery',
          status: 'closed',
          summary:
            "Queensland's own Battery Booster rebate has closed, so there's no separate state form to lodge. Queensland households get their battery support through the federal Cheaper Home Batteries Program, applied up front by your installer at the point of sale.",
          eligibility: [
            { point: 'Open to all Queensland postcodes, with new or existing solar' },
            { point: 'Federal battery discount applied at point of sale — no state application' },
          ],
          timing: 'No state scheme to act on; what matters is the federal step-down — from 1 May 2026, then every 1 January and 1 July to 2030.',
        },
        {
          name: 'Interest-free & green finance',
          tag: 'Finance',
          appliesTo: 'finance',
          status: 'ongoing',
          summary:
            'Separate from the rebates, finance lets you go solar and battery with little or nothing up front and spread the cost over time — interest-free and low-rate green-loan options for homes, plus Power Purchase Agreements for commercial sites. Finance pairs with the rebates: the rebates lower the price, finance spreads the rest.',
          eligibility: [
            { point: 'Homes and small businesses installing eligible solar and/or battery' },
            { point: "Subject to the lender's approval and terms" },
            { point: 'Power Purchase Agreements available for commercial sites' },
          ],
          timing:
            'Available year-round with no government deadline — the only clock is the rebate step-downs, so financing sooner still captures the larger discounts.',
        },
      ],
    },

    // ── Process ──
    {
      name: 'process',
      type: 'group',
      label: 'Process ("we handle the paperwork")',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'We handle every form. You sign once.' },
        {
          name: 'lede',
          type: 'textarea',
          defaultValue:
            'Government support only helps if the paperwork is done right. We manage the whole administrative chain, so the discount simply shows up on your invoice.',
        },
        {
          name: 'steps',
          type: 'array',
          labels: { singular: 'Step', plural: 'Steps' },
          fields: [
            { name: 'title', type: 'text' },
            { name: 'desc', type: 'textarea' },
          ],
          defaultValue: [
            { title: 'Check what you qualify for', desc: 'We confirm your exact federal and state eligibility from your address, system and situation.' },
            { title: 'Create & assign the certificates', desc: 'We create and assign the small-scale certificates for both solar and battery, and lodge the federal documentation.' },
            { title: 'Handle the install paperwork', desc: 'Accredited-installer compliance, grid connection and the meter reconfiguration are all arranged with your network and retailer.' },
            { title: 'You see the discount up front', desc: 'The support comes off your price from day one — no claiming back, no chasing forms.' },
          ],
        },
      ],
    },

    // ── Urgency callout ──
    {
      name: 'urgency',
      type: 'group',
      label: 'Urgency callout',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'The discounts step down on fixed dates' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            "Both the federal solar and battery support shrink on a schedule — the battery discount reduced on 1 May 2026 and tapers again every 1 January and 1 July through to 2030, while the solar benefit drops each 1 January until the scheme ends in 2030. Victoria's solar rebate income rules also tighten from 1 July 2026. The earlier you install, the more support you lock in.",
        },
      ],
    },

    // ── CTA ──
    {
      name: 'cta',
      type: 'group',
      label: 'Call to action',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'Find out exactly what you qualify for' },
        {
          name: 'body',
          type: 'textarea',
          defaultValue:
            'Every home is different. Tell us your address and what you\'re after, and a Bluven engineer will confirm the precise rebates you\'re eligible for — with the exact figures set out in your written quote.',
        },
        { name: 'buttonLabel', type: 'text', defaultValue: 'Get my free rebate check' },
      ],
    },

    {
      name: 'lastUpdated',
      type: 'text',
      defaultValue: 'June 2026',
      admin: { description: 'Shown as "Last reviewed …" so visitors know the rebate info is current.' },
    },

    // ── SEO ──
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text', defaultValue: 'Solar & Battery Rebates in Australia (2026)' },
        {
          name: 'metaDescription',
          type: 'textarea',
          defaultValue:
            "Federal and state solar and battery rebates for 2026 — the Cheaper Home Batteries Program, solar STCs, the NSW Virtual Power Plant incentive and Victoria's Solar Homes rebate. We handle all the paperwork.",
        },
      ],
    },
  ],
}

export default RebatesPage
