// Configurator catalog — extend with more product lines as needed.
// Image URLs are placeholders; swap with official product photography (AlphaESS, Tesla, etc.)
// when assets are available.

export interface ConfigOption {
  id: string
  title: string
  spec:  string
  bullets: string[]
  img: string
  hero?: string
  // Hints for backend submission
  systemKw?: number
  batteryKwh?: number
  componentTag?: 'Solar' | 'Battery' | 'EV'
}

export interface ConfigProduct {
  id: string
  brand: string
  brandLogo: string
  name: string
  tagline: string
  hero: string
  solarOptions: ConfigOption[]
  batteryOptions: ConfigOption[]
  evOptions: ConfigOption[]
}

export const CATALOG: Record<string, ConfigProduct> = {
  'alphaess-g3': {
    id: 'alphaess-g3',
    brand: 'AlphaESS',
    brandLogo: 'https://logo.clearbit.com/alphaess.com',
    name: 'AlphaESS SMILE G3',
    tagline: 'A hybrid solar + battery system engineered for Australian homes. AlphaESS SMILE G3 inverter, Tier-1 panels and modular S5 battery — backed by a 10-year warranty.',
    hero: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1800&q=85',

    solarOptions: [
      {
        id: 'trina-13',
        title: 'Trina Vertex S+ · 13 kW',
        spec:  '440 W mono-PERC · 25-yr performance',
        bullets: [
          '~19,000 kWh/yr generation',
          'Tier-1 quality, IEC certified',
          'Heat-resistant for AU summers',
        ],
        img:  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
        hero: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1800&q=85',
        systemKw: 13,
      },
      {
        id: 'jinko-10',
        title: 'Jinko Tiger Neo · 10 kW',
        spec:  '440 W N-type · 25-yr performance',
        bullets: [
          '~14,500 kWh/yr generation',
          'Lowest LID degradation',
          'Best value per watt',
        ],
        img:  'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80',
        hero: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1800&q=85',
        systemKw: 10,
      },
    ],

    batteryOptions: [
      {
        id: 's5-9-3',
        title: 'AlphaESS S5 · 9.3 kWh',
        spec:  '5 kW continuous · 10-yr warranty',
        bullets: [
          'Whole-home backup essentials',
          'Modular — expand later',
          'IP65 outdoor rated',
        ],
        img:  'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=600&q=80',
        hero: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=1800&q=85',
        batteryKwh: 9.3,
      },
      {
        id: 's5-10-1',
        title: 'AlphaESS S5 · 10.1 kWh',
        spec:  '5 kW continuous · 10-yr warranty',
        bullets: [
          'Sweet-spot capacity',
          'Federal rebate eligible',
          'Time-of-use shifting',
        ],
        img:  'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=600&q=80',
        hero: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=1800&q=85',
        batteryKwh: 10.1,
      },
      {
        id: 's5-13-3',
        title: 'AlphaESS S5 · 13.3 kWh',
        spec:  '6 kW continuous · 10-yr warranty',
        bullets: [
          'Cover most evening peak',
          'Best for 4–5 person homes',
          'Weather emergency backup',
        ],
        img:  'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=600&q=80&fit=crop&crop=top',
        hero: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=1800&q=85&fit=crop&crop=top',
        batteryKwh: 13.3,
      },
      {
        id: 's5-13-9',
        title: 'AlphaESS S5 · 13.9 kWh',
        spec:  '6 kW continuous · 10-yr warranty',
        bullets: [
          'Maximum capacity in S5 series',
          'Off-grid capable with solar',
          'EV-household ready',
        ],
        img:  'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=600&q=80&fit=crop&crop=bottom',
        hero: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=1800&q=85&fit=crop&crop=bottom',
        batteryKwh: 13.9,
      },
    ],

    evOptions: [
      {
        id: 'no-ev',
        title: 'Skip — no EV charger',
        spec:  'Add later anytime',
        bullets: [
          'No additional install required',
          'AlphaESS supports OCPP add-on',
        ],
        img:  'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600&q=80',
        hero: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1800&q=85',
      },
      {
        id: 'tesla-wall',
        title: 'Tesla Wall Connector · 22 kW',
        spec:  'Solar-aware · 7.5 m cable',
        bullets: [
          'Compatible with all EVs (J1772 adapter)',
          'Charge from solar surplus',
          'Tesla app integration',
        ],
        img:  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80',
        hero: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1800&q=85',
        componentTag: 'EV',
      },
    ],
  },
}
