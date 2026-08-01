/**
 * Bluven dictionary (English only).
 *
 * Kept as a Record so existing useI18n() / T consumers keep working.
 * Locale is locked to 'en'.
 */

export type Locale = 'en'
export type DictKey = string

export const dictionary: Record<Locale, Record<string, string>> = {
  en: {
    // ── Nav ──
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.company': 'Company',
    'nav.support': 'Support',
    'nav.projects': 'Projects',
    'nav.who': 'Who We Are',
    'nav.news': 'Insights',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.callLabel': 'CALL US',
    'nav.quote': 'Get a Quote',

    // ── Footer ──
    'footer.tagline': "Australia's trusted partner for residential & commercial solar, battery and EV charging — designed, installed and supported locally.",
    'footer.products': 'Products',
    'footer.starter': 'Solar Panels',
    'footer.essential': 'Battery Storage',
    'footer.premium': 'EV Charging',
    'footer.commercial': 'Commercial',
    'footer.company': 'Company',
    'footer.who': 'Who We Are',
    'footer.proj': 'Projects',
    'footer.insights': 'Insights',
    'footer.careers': 'Careers',
    'footer.support': 'Support',
    'footer.faq': 'FAQ',
    'footer.contact': 'Contact',
    'footer.quote': 'Get a Quote',
    'footer.admin': 'Admin Portal',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Notice',
    'footer.copy': '© 2026 Bluven Pty Ltd',

    // ── AI Chat ──
    'chat.title': 'Sunny · Bluven Assistant',
    'chat.status': 'Online · Replies in seconds',
    'chat.welcome': "G'day! 👋 I'm <b>Sunny</b>, Bluven's AI assistant. Ask me anything about solar, batteries, rebates or pricing — or pick a quick topic below.",
    'chat.q1': 'NSW rebates', 'chat.q1q': 'What rebates are available in NSW?',
    'chat.q2': 'Sizing help', 'chat.q2q': 'How big a system do I need?',
    'chat.q3': 'Compare packs', 'chat.q3q': 'Compare your Essential and Premium packs.',
    'chat.q4': 'Green finance', 'chat.q4q': 'Tell me about your zero-deposit green loan.',
    'chat.placeholder': 'Ask Sunny anything…',
    'chat.foot': 'Powered by Bluven AI',

    // ── Mega menu ──
    'mm.products.eye': 'BUILD YOUR SYSTEM',
    'mm.products.lede': 'Four engineered packages — from a 6.6 kW starter to a 250 kW commercial roof.',
    'mm.products.solar': 'Solar panels', 'mm.products.solar.s': 'Tier-1 modules · 25-yr warranty',
    'mm.products.battery': 'Battery storage', 'mm.products.battery.s': 'AlphaESS · Sigenergy · FoxESS · Tesla',
    'mm.products.ev': 'EV charging', 'mm.products.ev.s': 'Solar-aware · 22 kW',
    'mm.products.commercial': 'Commercial', 'mm.products.commercial.s': '30 – 250 kW · Engineered',
    'mm.about.eye': 'COMPANY',
    'mm.about.who': 'Who we are', 'mm.about.who.s': 'Engineering-led, Australian',
    'mm.about.proj': 'Projects', 'mm.about.proj.s': '600+ installs nationwide',
    'mm.about.news': 'Insights', 'mm.about.news.s': 'Plain-English advice',
    'mm.support.eye': 'SUPPORT',
    'mm.support.faq': 'FAQ', 'mm.support.faq.s': 'Rebates · sizing · install',
    'mm.support.contact': 'Contact', 'mm.support.contact.s': 'Sydney · Brisbane · Perth',
    'mm.support.admin': 'Admin portal', 'mm.support.admin.s': 'For partners & staff',
    'sticky.quote': 'Free quote',

    // ── Home: hero ──
    'h.title1': 'Your Home.',
    'h.title2': 'Your Power.',
    'h.title3': 'Your Savings.',
    'h.lede': 'Stop renting your electricity. Own it. We empower Australian homes with reliable battery systems designed for day and night energy independence.',
    'h.cta2': 'Watch how it works',
    'h.s1': 'Homes powered',
    'h.s2': 'kWh installed',
    'h.s4': 'Electrical partners',

    // ── Home: sections ──
    'sect.process.h': 'From Concept to Power:<br/>Your A-to-Z Energy Solution',
    'p.s1.t': 'Consult & System Design',
    'p.s1.d': 'In-depth consultation, site assessment, and a tailored system design led by engineers — built around your home, energy usage, and long-term goals.',
    'p.s2.t': 'Proposal, Delivery & Installation',
    'p.s2.d': 'Clear and detailed proposal, followed by coordinated delivery and professional installation by certified electricians.',
    'p.s3.t': 'Commissioning & Ongoing Support',
    'p.s3.d': 'System setup, performance testing, app monitoring, and ongoing technical support to ensure everything operates as expected.',
    'p.s4.t': 'Long-Term Service & Warranty',
    'p.s4.d': 'Reliable after-sales support, warranty assistance, and long-term service from a local team you can count on.',

    'sect.brands.h': "Our Trusted Partners",
  },
}
