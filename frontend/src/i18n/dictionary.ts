/**
 * Bluven dictionary (English only).
 *
 * Kept as a Record so existing useI18n() / T / L() consumers keep working.
 * Locale is locked to 'en'.
 */

export type Locale = 'en'
export type DictKey = string

export const dictionary: Record<Locale, Record<string, string>> = {
  en: {
    // ── Nav ──
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.projects': 'Projects',
    'nav.brands': 'Brands',
    'nav.who': 'Who We Are',
    'nav.news': 'Insights',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.call': '1300 BLUVEN',
    'nav.callLabel': 'CALL US',
    'nav.quote': 'Get a Quote',
    // ── Reviews / Testimonials ──
    'review.share': 'Share Your Experience',
    'review.lede': "Tell us how we did. Your review helps other Aussie families switch to solar with confidence — no account required.",
    'review.name': 'Your name',
    'review.suburb': 'Suburb / state (e.g. Mosman, NSW)',
    'review.system': 'System installed (optional)',
    'review.rating': 'Rating',
    'review.text': 'Your review',
    'review.submit': 'Submit review',
    'review.submitting': 'Submitting…',
    'review.success': "Thank you! Your review has been received and will appear after a quick check by our team.",
    'review.error': 'Sorry — we could not submit your review. Please try again.',
    'review.toggleOpen': 'Write a review',
    'review.toggleClose': 'Close',
    'review.viewAll': 'View all reviews',

    // ── Footer ──
    'footer.tagline': "Australia's trusted partner for residential & commercial solar, battery and EV charging — designed, installed and supported locally.",
    'footer.products': 'Products',
    'footer.starter': 'Starter Pack',
    'footer.essential': 'Essential',
    'footer.premium': 'Premium',
    'footer.commercial': 'Commercial',
    'footer.company': 'Company',
    'footer.who': 'Who We Are',
    'footer.proj': 'Projects',
    'footer.brands': 'Brands',
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
    'footer.copy': '© 2026 Bluven Energy Pty Ltd · ABN 00 000 000 000',
    'footer.cec': 'CEC Approved Retailer · Clean Energy Council Member',

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
    'mm.products.battery': 'Battery storage', 'mm.products.battery.s': 'BYD · Tesla · Sungrow',
    'mm.products.ev': 'EV charging', 'mm.products.ev.s': 'Solar-aware · 22 kW',
    'mm.products.commercial': 'Commercial', 'mm.products.commercial.s': '30 – 250 kW · Engineered',
    'mm.about.eye': 'COMPANY',
    'mm.about.who': 'Who we are', 'mm.about.who.s': 'Engineering-led, Australian',
    'mm.about.proj': 'Projects', 'mm.about.proj.s': '600+ installs nationwide',
    'mm.about.brands': 'Brand partners', 'mm.about.brands.s': 'Tier-1 only — our gear list',
    'mm.about.news': 'Insights', 'mm.about.news.s': 'Plain-English advice',
    'mm.support.eye': 'SUPPORT',
    'mm.support.faq': 'FAQ', 'mm.support.faq.s': 'Rebates · sizing · install',
    'mm.support.contact': 'Contact', 'mm.support.contact.s': 'Sydney · Melbourne · Brisbane',
    'mm.support.admin': 'Admin portal', 'mm.support.admin.s': 'For partners & staff',
    'sticky.quote': 'Free quote',

    // ── Home: hero ──
    'h.eyebrow': 'AUSTRALIA · CLEAN ENERGY',
    'h.title1': 'Your Home.',
    'h.title2': 'Your Power.',
    'h.title3': 'Your Savings.',
    'h.lede': 'Stop renting your electricity. Own it. We empower Australian homes with reliable battery systems designed for day and night energy independence.',
    'h.cta1': 'Get a free quote',
    'h.cta2': 'Watch how it works',
    'h.s1': 'Homes powered',
    'h.s2': 'kWh generated',
    'h.s3': 'Avg. customer review',
    'h.s4': 'Service partners',

    // ── Home: sections ──
    'sect.products.eye': 'WHAT WE BUILD',
    'sect.products.h': 'Four packages.<br/>One for every Australian roof.',
    'sect.products.lede': "Whether you're starting small with a 6.6 kW solar starter, or running a warehouse with 100 kW + battery — there's a Bluven pack engineered for it.",
    'sect.products.see': 'See all packages',

    'sect.process.eye': 'OUR PROCESS',
    'sect.process.h': 'From Concept to Power:<br/>Your A-to-Z Energy Solution',
    'sect.process.lede': 'Designed by engineers, installed by certified electricians, supported by a local team — every step, end to end.',
    'p.s1.t': 'Consult & System Design',
    'p.s1.d': 'In-depth consultation, site assessment, and a tailored system design led by engineers — built around your home, energy usage, and long-term goals.',
    'p.s2.t': 'Proposal, Delivery & Installation',
    'p.s2.d': 'Clear and detailed proposal, followed by coordinated delivery and professional installation by certified electricians.',
    'p.s3.t': 'Commissioning & Ongoing Support',
    'p.s3.d': 'System setup, performance testing, app monitoring, and ongoing technical support to ensure everything operates reliably.',
    'p.s4.t': 'Long-Term Service & Warranty',
    'p.s4.d': 'Reliable after-sales support, warranty assistance, and long-term service from a local team you can count on.',

    'sect.brands.eye': 'BUILT WITH THE BEST',
    'sect.brands.h': "We don't make panels. We pick the best ones.",
    'sect.brands.btn': 'Explore our brand partners',

    'sect.proj.eye': "PROJECTS WE'VE BUILT",
    'sect.proj.h': '600+ Australian roofs.<br/>Every one engineered.',
    'sect.proj.see': 'See all projects',

    'sect.test.eye': 'WHAT CUSTOMERS SAY',
    'sect.test.h': '4.9 / 5 across 1,200+ reviews.',

    'sect.news.eye': 'INSIGHTS',
    'sect.news.h': 'Plain-English advice for<br/>Australian solar owners.',
    'sect.news.see': 'All articles',

    'sect.cta.eye': 'READY?',
    'sect.cta.h': "Let's design something brilliant.",
    'sect.cta.lede': 'A senior engineer will respond within 24 business hours, free of charge.',
    'sect.cta.cta1': 'Get my free quote',
    'sect.cta.cta2': 'Talk to a human',

    // ── Cards ──
    'card.starter.t': 'Starter Pack', 'card.starter.s': '6.6 kW solar · No battery',
    'card.essential.t': 'Essential', 'card.essential.s': '10 kW solar · 10 kWh battery',
    'card.premium.t': 'Premium', 'card.premium.s': '13 kW solar · 16 kWh battery + EV',
    'card.commercial.t': 'Commercial', 'card.commercial.s': '30–250 kW · Engineering-led',
    'card.from': 'From', 'card.month': '/mo on green loan',
    'card.popular': 'MOST POPULAR',

    // ── Generic ──
    'common.loading': 'Loading…',
    'common.error': 'Something went wrong.',
    'common.retry': 'Try again',
    'common.readMore': 'Read more',
    'common.viewAll': 'View all',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.required': 'Required',
  },
}
