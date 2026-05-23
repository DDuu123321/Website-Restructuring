/* ============================================================
   Bluven i18n — EN / ZH bilingual layer
   Usage:
     - <span data-i18n="hero.title">English fallback</span>
     - <span data-i18n-html="hero.body">English fallback</span>  (allows tags)
     - <input data-i18n-attr="placeholder:form.email" />          (sets attribute)
     - window.bvSetLang('zh') | bvCurrentLang() | bvT('hero.title')
   ============================================================ */

(function () {
  const STORAGE_KEY = 'bv_lang';

  const dict = {
    en: {
      // ---------- Nav ----------
      'nav.home': 'Home',
      'nav.products': 'Products',
      'nav.projects': 'Projects',
      'nav.brands': 'Brands',
      'nav.who': 'Who We Are',
      'nav.news': 'Insights',
      'nav.faq': 'FAQ',
      'nav.contact': 'Contact',
      'nav.call': '1300 BLUVEN',
      'nav.quote': 'Get a Quote',

      // ---------- Footer ----------
      'footer.tagline': "Australia's trusted partner for residential & commercial solar, battery and EV charging — designed, installed and supported locally.",
      'footer.products': 'Products',
      'footer.starter': 'Starter Pack',
      'footer.essential': 'Essential',
      'footer.premium': 'Premium',
      'footer.commercial': 'Commercial',
      'footer.compare': 'Compare',
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

      // ---------- Chat ----------
      'chat.title': 'Sunny · Bluven Assistant',
      'chat.status': 'Online · Replies in seconds',
      'chat.welcome': "G'day! 👋 I'm <b>Sunny</b>, Bluven's AI assistant. Ask me anything about solar, batteries, rebates or pricing — or pick a quick topic below.",
      'chat.q1': 'NSW rebates',
      'chat.q1q': 'What rebates are available in NSW?',
      'chat.q2': 'Sizing help',
      'chat.q2q': 'How big a system do I need?',
      'chat.q3': 'Compare packs',
      'chat.q3q': 'Compare your Essential and Premium packs.',
      'chat.q4': 'Green finance',
      'chat.q4q': 'Tell me about your zero-deposit green loan.',
      'chat.placeholder': 'Ask Sunny anything…',
      'chat.foot': 'Powered by Bluven AI',

      // ---------- Home: hero ----------
      'h.eyebrow': 'AUSTRALIA · CLEAN ENERGY',
      'h.title1': 'Power your home',
      'h.title2': 'with the sun above',
      'h.title3': "and Australia's smartest grid.",
      'h.lede': 'Bluven designs, installs and looks after solar, battery and EV charging systems for Australian homes and businesses — backed by 25-year performance warranties and a real engineer on every job.',
      'h.cta1': 'Get a free quote',
      'h.cta2': 'Watch how it works',
      'h.s1': 'Homes powered',
      'h.s2': 'kWh generated',
      'h.s3': 'Avg. customer review',
      'h.s4': 'Performance warranty',

      // Home — value pills + sections
      'h.live': 'LIVE · GENERATING NOW',
      'h.now': 'Right now',
      'h.tonight': 'Tonight',
      'h.today': 'Today',
      'h.draw': 'Draw from battery',
      'h.saved': 'Saved this month',

      'sect.products.eye': 'WHAT WE BUILD',
      'sect.products.h': 'Four packages.<br/>One for every Australian roof.',
      'sect.products.lede': "Whether you're starting small with a 6.6 kW solar starter, or running a warehouse with 100 kW + battery — there's a Bluven pack engineered for it.",
      'sect.products.see': 'See all packages',

      'sect.process.eye': 'HOW IT WORKS',
      'sect.process.h': 'From quote to switched-on,<br/>in 14 days.',
      'sect.process.lede': "Most Australian installers take 6–8 weeks. We've engineered every step — from satellite design to grid connection — to deliver in two.",
      'p.s1.t': 'Free design',
      'p.s1.d': 'A senior engineer designs your system from satellite imagery and your last bill — usually within 24 hours.',
      'p.s2.t': 'Onsite verification',
      'p.s2.d': "Our installer visits to verify the roof, switchboard and meter setup. Nothing's locked-in until you're 100% comfortable.",
      'p.s3.t': 'Install day',
      'p.s3.d': 'Most installs are completed in a single day. CEC-accredited installers, our own crew — never subcontracted.',
      'p.s4.t': 'Switch on',
      'p.s4.d': 'We handle every rebate form and grid connection. You just open the Bluven app and watch it generate.',

      'sect.brands.eye': 'BUILT WITH THE BEST',
      'sect.brands.h': "We don't make panels. We pick the best ones.",
      'sect.brands.lede': "Tier-1 only. Engineering-led selection. Every brand on this wall has earned its place through 5+ years of field data on Australian roofs.",
      'sect.brands.btn': 'Explore our brand partners',

      'sect.proj.eye': 'PROJECTS WE&apos;VE BUILT',
      'sect.proj.h': '600+ Australian roofs.<br/>Every one engineered.',
      'sect.proj.lede': 'From 6.6 kW Northern-Beaches family homes to 240 kW commercial rooftops — browse our latest installs across NSW, VIC and QLD.',
      'sect.proj.see': 'See all projects',

      'sect.calc.eye': 'INSTANT ESTIMATE',
      'sect.calc.h': 'Punch in your bill.<br/>See your savings.',
      'sect.calc.lede': 'No phone number, no email — just drag the slider and we will calculate system size, generation, rebates and payback period in real time.',
      'sect.calc.bill': 'Average monthly bill',
      'sect.calc.size': 'System size we recommend',
      'sect.calc.gen': 'Annual generation',
      'sect.calc.year': 'Saving in year 1',
      'sect.calc.pay': 'Payback period',
      'sect.calc.cta': 'Get a fully-engineered quote',

      'sect.test.eye': 'WHAT CUSTOMERS SAY',
      'sect.test.h': '4.9 / 5 across 1,200+ reviews.',
      'sect.test.lede': 'Pulled live from Google, Product Review and SolarQuotes — the three sites that matter in Australia.',

      'sect.cred.eye': 'TRUST & ACCREDITATION',
      'sect.cred.h': 'Every certification that matters in Australia.',

      'sect.news.eye': 'INSIGHTS',
      'sect.news.h': 'Plain-English advice for<br/>Australian solar owners.',
      'sect.news.see': 'All articles',

      'sect.cta.eye': 'READY?',
      'sect.cta.h': "Let's design something brilliant.",
      'sect.cta.lede': 'A senior engineer will respond within 24 business hours, free of charge.',
      'sect.cta.cta1': 'Get my free quote',
      'sect.cta.cta2': 'Talk to a human',

      // Cards short text
      'card.starter.t': 'Starter Pack',
      'card.starter.s': '6.6 kW solar · No battery',
      'card.essential.t': 'Essential',
      'card.essential.s': '10 kW solar · 10 kWh battery',
      'card.premium.t': 'Premium',
      'card.premium.s': '13 kW solar · 16 kWh battery + EV',
      'card.commercial.t': 'Commercial',
      'card.commercial.s': '30–250 kW · Engineering-led',
      'card.from': 'From',
      'card.month': '/mo on green loan',
      'card.popular': 'MOST POPULAR',

      // Hero floating panel
      'hp.size': 'System size',
      'hp.gen': 'Generation today',
      'hp.batt': 'Battery',
      'hp.charging': 'Charging',
      'hp.export': 'Export to grid',
      'hp.bill': 'Last bill',

      // Nav mega-menu
      'mm.products.eye': 'BUILD YOUR SYSTEM',
      'mm.products.lede': 'Four engineered packages — from a 6.6 kW starter to a 250 kW commercial roof.',
      'mm.products.solar': 'Solar panels',
      'mm.products.solar.s': 'Tier-1 modules · 25-yr warranty',
      'mm.products.battery': 'Battery storage',
      'mm.products.battery.s': 'BYD · Tesla · Sungrow',
      'mm.products.ev': 'EV charging',
      'mm.products.ev.s': 'Solar-aware · 22 kW',
      'mm.products.commercial': 'Commercial',
      'mm.products.commercial.s': '30 – 250 kW · Engineered',
      'mm.about.eye': 'COMPANY',
      'mm.about.who': 'Who we are',
      'mm.about.who.s': 'Engineering-led, Australian',
      'mm.about.proj': 'Projects',
      'mm.about.proj.s': '600+ installs nationwide',
      'mm.about.brands': 'Brand partners',
      'mm.about.brands.s': 'Tier-1 only — our gear list',
      'mm.about.news': 'Insights',
      'mm.about.news.s': 'Plain-English advice',
      'mm.support.eye': 'SUPPORT',
      'mm.support.faq': 'FAQ',
      'mm.support.faq.s': 'Rebates · sizing · install',
      'mm.support.contact': 'Contact',
      'mm.support.contact.s': 'Sydney · Melbourne · Brisbane',
      'mm.support.admin': 'Admin portal',
      'mm.support.admin.s': 'For partners & staff',
      'sticky.quote': 'Free quote',

      // Horizontal showcase
      'fx.h1.num': '01 / 04 — SOLAR',
      'fx.h1.t': 'Tier-1 panels.<br/>Engineering-led layout.',
      'fx.h1.p': 'Premium monocrystalline modules from Trina, JinKO and LONGi — laid out by a senior engineer using satellite imagery and shading analysis. Every roof gets its own design.',
      'fx.h1.tag1': 'Bifacial',
      'fx.h1.tag2': 'Efficiency',
      'fx.h1.tag3': 'Performance',
      'fx.h1.cta': 'Explore Starter Pack',
      'fx.h1.label': '13.2 kW · Mosman, NSW',

      'fx.h2.num': '02 / 04 — BATTERY',
      'fx.h2.t': 'Store the sun.<br/>Use it after dark.',
      'fx.h2.p': 'BYD, Tesla and Sungrow batteries — sized to bridge your evening peak. Federal Battery Rebate handled by us. Smart-charging from cheap off-peak when needed.',
      'fx.h2.tag2': 'Warranty',
      'fx.h2.tag3': '/kWh rebate',
      'fx.h2.cta': 'Explore Essential',
      'fx.h2.label': 'Tesla Powerwall 3 · 13.5 kWh',

      'fx.h3.num': '03 / 04 — EV CHARGING',
      'fx.h3.t': 'Charge your car<br/>on free sunshine.',
      'fx.h3.p': 'Wallbox, Zappi and Tesla wall connectors. Solar-aware charging diverts surplus generation straight to your car — saving up to $2,400/year on petrol.',
      'fx.h3.tag1': '3-phase',
      'fx.h3.tag3': 'tracking',
      'fx.h3.cta': 'Explore Premium',
      'fx.h3.label': 'Wallbox Pulsar Plus · Solar mode',

      'fx.h4.num': '04 / 04 — COMMERCIAL',
      'fx.h4.t': 'Warehouses,<br/>factories, fleets.',
      'fx.h4.p': 'Engineering-led design for 30 kW – 250 kW commercial rooftops. Network protection studies, single-line diagrams, AS/NZS 5033 compliance, full DA support.',
      'fx.h4.tag2': 'Tax',
      'fx.h4.tag3': 'Payback',
      'fx.h4.cta': 'Explore Commercial',
      'fx.h4.label': '240 kW · Hunter Valley',
      'fx.hint': 'HORIZONTAL · KEEP SCROLLING',

      // Animated diagram (energy flow)
      'flow.eye': 'HOW IT WORKS',
      'flow.h': 'A single system.<br/>Five intelligent flows.',
      'flow.lede': 'Sun, battery, home, grid and car — Bluven\'s engineered controller decides where every kilowatt goes, every second of the day.',
      'flow.s1.t': 'Generate',
      'flow.s1.d': 'Tier-1 panels capture sunlight and feed DC power into a hybrid inverter.',
      'flow.s2.t': 'Power your home',
      'flow.s2.d': 'Solar covers your home directly — appliances, AC, hot water — before anything else.',
      'flow.s3.t': 'Charge battery',
      'flow.s3.d': 'Surplus generation tops up the battery for tonight, when the sun is down.',
      'flow.s4.t': 'Charge your EV',
      'flow.s4.d': 'Solar-aware charging diverts excess sun straight to your car — fuel for free.',
      'flow.s5.t': 'Export & earn',
      'flow.s5.d': 'Whatever\'s left flows back to the grid as feed-in credit on your bill.',
      'flow.label.sun': 'Sun',
      'flow.label.solar': 'Solar',
      'flow.label.inv': 'Inverter',
      'flow.label.home': 'Home',
      'flow.label.batt': 'Battery',
      'flow.label.ev': 'EV',
      'flow.label.grid': 'Grid',

      // Hero floating mini-tags
      'hp.gen2': 'Generation today',

      // Testimonials
      'test.t1': '"From quote to install in 11 days. The engineer who designed the system actually came on install day to oversee. We\'ve gone from $480/mo bills to $0."',
      'test.t1.n': 'Liam & Jess M.',
      'test.t1.l': '13.2 kW · Mosman, NSW',
      'test.t1.src': 'GOOGLE · 2 WK AGO',
      'test.t2': '"Got 4 quotes. Bluven was middle of the pack on price but the only one who sent an actual engineer to design. The CAD layout was 3 pages. Worth every dollar."',
      'test.t2.n': 'Priya S.',
      'test.t2.l': '10 kW + 13.5 kWh · Box Hill, VIC',
      'test.t2.src': 'PRODUCT REVIEW · 1 MO',
      'test.t3': '"Ran our café off the system since June. Tracking 4.2-year payback. Bluven\'s commercial team handled the network protection study with no fuss."',
      'test.t3.n': 'Marco D.',
      'test.t3.l': '42 kW · Newtown café, NSW',
      'test.t3.src': 'SOLARQUOTES · 3 MO',

      // News cards
      'news.c1.meta': 'REBATES · 6 MIN READ',
      'news.c1.t': 'The 2026 Federal Battery Rebate, decoded',
      'news.c1.p': '$372/kWh up to 13.5 kWh, stacked with state rebates. Here\'s how to actually claim it.',
      'news.c2.meta': 'SIZING · 4 MIN READ',
      'news.c2.t': 'How big a battery do you actually need?',
      'news.c2.p': 'Most installers oversell battery size. Here\'s the math from 8,000 real Australian homes.',
      'news.c3.meta': 'EV · 5 MIN READ',
      'news.c3.t': 'Solar-aware EV charging, explained',
      'news.c3.p': 'Why Zappi\'s "eco mode" is the difference between $0 and $1,800 in petrol equivalent every year.',

      // Project tiles
      'proj.feat': 'FEATURED',
    },

    zh: {
      // ---------- Nav ----------
      'nav.home': '首页',
      'nav.products': '产品方案',
      'nav.projects': '工程案例',
      'nav.brands': '品牌伙伴',
      'nav.who': '关于我们',
      'nav.news': '行业洞察',
      'nav.faq': '常见问题',
      'nav.contact': '联系我们',
      'nav.call': '1300 BLUVEN',
      'nav.quote': '免费报价',

      // ---------- Footer ----------
      'footer.tagline': '澳大利亚值得信赖的太阳能、储能与电动车充电方案合作伙伴 — 本地设计、本地安装、本地售后。',
      'footer.products': '产品方案',
      'footer.starter': '入门套餐',
      'footer.essential': '标准套餐',
      'footer.premium': '旗舰套餐',
      'footer.commercial': '商用方案',
      'footer.compare': '套餐对比',
      'footer.company': '公司',
      'footer.who': '关于我们',
      'footer.proj': '工程案例',
      'footer.brands': '品牌伙伴',
      'footer.insights': '行业洞察',
      'footer.careers': '加入我们',
      'footer.support': '支持',
      'footer.faq': '常见问题',
      'footer.contact': '联系我们',
      'footer.quote': '免费报价',
      'footer.admin': '后台门户',
      'footer.legal': '法律条款',
      'footer.privacy': '隐私政策',
      'footer.terms': '服务条款',
      'footer.cookies': 'Cookie 声明',
      'footer.copy': '© 2026 Bluven Energy Pty Ltd · ABN 00 000 000 000',
      'footer.cec': 'CEC 认证零售商 · 清洁能源理事会成员',

      // ---------- Chat ----------
      'chat.title': 'Sunny · Bluven 智能助手',
      'chat.status': '在线 · 秒级响应',
      'chat.welcome': '您好！👋 我是 Bluven 的智能助手 <b>Sunny</b>。您可以问我任何关于太阳能、储能、补贴或价格的问题，或者点击下方快捷话题。',
      'chat.q1': 'NSW 补贴',
      'chat.q1q': '新南威尔士州目前有哪些补贴政策？',
      'chat.q2': '系统选型',
      'chat.q2q': '我家应该装多大的系统？',
      'chat.q3': '套餐对比',
      'chat.q3q': '帮我对比一下标准套餐和旗舰套餐。',
      'chat.q4': '绿色贷款',
      'chat.q4q': '介绍一下零首付的绿色贷款方案。',
      'chat.placeholder': '向 Sunny 提问…',
      'chat.foot': '由 Bluven AI 驱动',

      // ---------- Home: hero ----------
      'h.eyebrow': '澳大利亚 · 清洁能源',
      'h.title1': '让阳光为家供电，',
      'h.title2': '让智能为电网赋能。',
      'h.title3': '',
      'h.lede': 'Bluven 为澳洲家庭与企业提供太阳能、储能和电动车充电的一体化方案 — 25 年发电质保，每个项目都由本地工程师亲自把关。',
      'h.cta1': '免费获取报价',
      'h.cta2': '观看运行原理',
      'h.s1': '已服务家庭',
      'h.s2': '累计发电量 (kWh)',
      'h.s3': '平均客户评分',
      'h.s4': '发电性能质保',

      'h.live': '实时 · 正在发电',
      'h.now': '当前',
      'h.tonight': '今晚',
      'h.today': '今日',
      'h.draw': '电池供电',
      'h.saved': '本月已节省',

      'sect.products.eye': '产品体系',
      'sect.products.h': '四款套餐，<br/>覆盖每一个澳洲屋顶。',
      'sect.products.lede': '从 6.6 kW 入门级太阳能，到 100 kW 商用屋顶 + 储能 — 总有一款 Bluven 方案为您而设计。',
      'sect.products.see': '查看全部套餐',

      'sect.process.eye': '工作流程',
      'sect.process.h': '从报价到通电，<br/>仅需 14 天。',
      'sect.process.lede': '澳洲多数安装商需要 6-8 周。我们重新设计了每一个环节 — 从卫星图设计到并网 — 把时间压缩到两周。',
      'p.s1.t': '免费方案设计',
      'p.s1.d': '资深工程师根据卫星图和您最近一期的电费单，通常在 24 小时内出方案。',
      'p.s2.t': '现场复核',
      'p.s2.d': '我们的工程师现场复核屋顶、配电箱和电表。在您完全确认之前，任何环节都可调整。',
      'p.s3.t': '当日安装',
      'p.s3.d': '绝大多数项目一天完工。CEC 认证安装人员，全自营队伍，绝不外包。',
      'p.s4.t': '一键启用',
      'p.s4.d': '所有补贴申请和并网流程由我们包办。您只需打开 Bluven App，看着发电数字往上走。',

      'sect.brands.eye': '甄选品牌',
      'sect.brands.h': '我们不造组件，但我们只选最好的。',
      'sect.brands.lede': '只选 Tier-1。工程导向的甄选标准。墙上的每一个品牌，都经过澳洲屋顶 5 年以上的实测数据验证。',
      'sect.brands.btn': '查看全部品牌伙伴',

      'sect.proj.eye': '工程案例',
      'sect.proj.h': '600+ 澳洲屋顶，<br/>每一个都是工程级设计。',
      'sect.proj.lede': '从 6.6 kW 北滩家庭住宅，到 240 kW 商业屋顶 — 浏览我们在 NSW / VIC / QLD 的最新案例。',
      'sect.proj.see': '查看全部案例',

      'sect.calc.eye': '在线测算',
      'sect.calc.h': '输入电费，<br/>立即看到节省。',
      'sect.calc.lede': '无需手机号，无需邮箱 — 拖动滑块即可实时计算系统容量、发电量、补贴和回本周期。',
      'sect.calc.bill': '月均电费',
      'sect.calc.size': '推荐系统容量',
      'sect.calc.gen': '年发电量',
      'sect.calc.year': '第一年节省',
      'sect.calc.pay': '回本周期',
      'sect.calc.cta': '获取工程级正式报价',

      'sect.test.eye': '客户口碑',
      'sect.test.h': '1,200+ 条评价，平均 4.9 / 5。',
      'sect.test.lede': '数据实时来自 Google、Product Review 和 SolarQuotes — 澳洲行业三大权威评价平台。',

      'sect.cred.eye': '资质与认证',
      'sect.cred.h': '澳洲最重要的资质，我们都有。',

      'sect.news.eye': '行业洞察',
      'sect.news.h': '为澳洲太阳能用户<br/>写的大白话指南。',
      'sect.news.see': '全部文章',

      'sect.cta.eye': '准备好了？',
      'sect.cta.h': '让我们一起，做点漂亮的事。',
      'sect.cta.lede': '资深工程师将在 24 小时内免费回复您。',
      'sect.cta.cta1': '免费获取报价',
      'sect.cta.cta2': '直接对话工程师',

      'card.starter.t': '入门套餐',
      'card.starter.s': '6.6 kW 太阳能 · 无储能',
      'card.essential.t': '标准套餐',
      'card.essential.s': '10 kW 太阳能 · 10 kWh 储能',
      'card.premium.t': '旗舰套餐',
      'card.premium.s': '13 kW 太阳能 · 16 kWh 储能 + 充电桩',
      'card.commercial.t': '商用方案',
      'card.commercial.s': '30 – 250 kW · 工程级定制',
      'card.from': '低至',
      'card.month': '/月（绿色贷款）',
      'card.popular': '最受欢迎',

      'hp.size': '系统容量',
      'hp.gen': '今日发电',
      'hp.batt': '电池',
      'hp.charging': '充电中',
      'hp.export': '上网电量',
      'hp.bill': '上期账单',

      'mm.products.eye': '搭建您的系统',
      'mm.products.lede': '四款工程级套餐 — 从 6.6 kW 入门到 250 kW 商用屋顶。',
      'mm.products.solar': '太阳能组件',
      'mm.products.solar.s': 'Tier-1 组件 · 25 年质保',
      'mm.products.battery': '储能电池',
      'mm.products.battery.s': 'BYD · Tesla · Sungrow',
      'mm.products.ev': '电动车充电',
      'mm.products.ev.s': '智能跟踪太阳能 · 22 kW',
      'mm.products.commercial': '商用方案',
      'mm.products.commercial.s': '30 – 250 kW · 工程定制',
      'mm.about.eye': '关于公司',
      'mm.about.who': '关于我们',
      'mm.about.who.s': '工程导向，扎根澳洲',
      'mm.about.proj': '工程案例',
      'mm.about.proj.s': '600+ 全国实景案例',
      'mm.about.brands': '品牌伙伴',
      'mm.about.brands.s': '只选 Tier-1 — 我们的器材清单',
      'mm.about.news': '行业洞察',
      'mm.about.news.s': '大白话技术解读',
      'mm.support.eye': '支持',
      'mm.support.faq': '常见问题',
      'mm.support.faq.s': '补贴 · 选型 · 安装',
      'mm.support.contact': '联系我们',
      'mm.support.contact.s': '悉尼 · 墨尔本 · 布里斯班',
      'mm.support.admin': '后台门户',
      'mm.support.admin.s': '面向合作方与员工',
      'sticky.quote': '免费报价',

      'fx.h1.num': '01 / 04 — 太阳能',
      'fx.h1.t': 'Tier-1 组件，<br/>工程级排布。',
      'fx.h1.p': '采用 Trina、JinKO、LONGi 等顶级单晶组件，由资深工程师结合卫星图与遮挡分析定制布局，每一块屋顶都有专属设计。',
      'fx.h1.tag1': '双玻',
      'fx.h1.tag2': '效率',
      'fx.h1.tag3': '发电质保',
      'fx.h1.cta': '查看入门套餐',
      'fx.h1.label': '13.2 kW · 悉尼 Mosman',
      'fx.h2.num': '02 / 04 — 储能',
      'fx.h2.t': '白天储电，<br/>夜晚自给。',
      'fx.h2.p': 'BYD、Tesla、Sungrow 储能 — 容量精准匹配晚高峰用电。联邦电池补贴由我们代办。需要时还可在低谷电价时智能补电。',
      'fx.h2.tag2': '质保',
      'fx.h2.tag3': '/kWh 补贴',
      'fx.h2.cta': '查看标准套餐',
      'fx.h2.label': 'Tesla Powerwall 3 · 13.5 kWh',
      'fx.h3.num': '03 / 04 — 充电桩',
      'fx.h3.t': '用免费阳光，<br/>给爱车充电。',
      'fx.h3.p': 'Wallbox、Zappi、Tesla 壁挂式充电桩。智能跟踪太阳能，将多余发电直接送给车辆 — 每年最高节省 2,400 澳元燃油费。',
      'fx.h3.tag1': '三相',
      'fx.h3.tag3': '太阳能跟踪',
      'fx.h3.cta': '查看旗舰套餐',
      'fx.h3.label': 'Wallbox Pulsar Plus · 太阳能模式',
      'fx.h4.num': '04 / 04 — 商用',
      'fx.h4.t': '仓库、<br/>厂房、车队。',
      'fx.h4.p': '面向 30 – 250 kW 商用屋顶的工程级方案。包含电网保护研究、单线图、AS/NZS 5033 合规、规划申请全程支持。',
      'fx.h4.tag2': '税务',
      'fx.h4.tag3': '回本',
      'fx.h4.cta': '查看商用方案',
      'fx.h4.label': '240 kW · Hunter Valley',
      'fx.hint': '横向展示 · 继续滚动',

      'flow.eye': '运行原理',
      'flow.h': '一套系统，<br/>五条智能能量流。',
      'flow.lede': '太阳、储能、家庭、电网、汽车 — Bluven 工程级控制器每一秒都在决定每一度电的去向。',
      'flow.s1.t': '发电',
      'flow.s1.d': 'Tier-1 组件吸收阳光，将直流电送入混合逆变器。',
      'flow.s2.t': '优先供家',
      'flow.s2.d': '太阳能首先满足家中用电 — 家电、空调、热水器，立刻使用。',
      'flow.s3.t': '储能充电',
      'flow.s3.d': '多余发电存入电池，留给夜晚没有阳光的时段。',
      'flow.s4.t': '充电桩供电',
      'flow.s4.d': '智能调度将剩余阳光直接送给电动车 — 燃油费归零。',
      'flow.s5.t': '上网售电',
      'flow.s5.d': '剩余电量回流电网，转化为电费账单上的上网补贴。',
      'flow.label.sun': '太阳',
      'flow.label.solar': '太阳能',
      'flow.label.inv': '逆变器',
      'flow.label.home': '家庭',
      'flow.label.batt': '电池',
      'flow.label.ev': '电动车',
      'flow.label.grid': '电网',

      'test.t1': '"从报价到安装只用了 11 天。当初设计系统的工程师还亲自到现场督装。每月 480 澳元的电费账单变成了 0。"',
      'test.t1.n': 'Liam & Jess M.',
      'test.t1.l': '13.2 kW · 悉尼 Mosman',
      'test.t1.src': 'GOOGLE · 2 周前',
      'test.t2': '"我们对比了 4 家报价。Bluven 价格不是最低，但是唯一一家派真正工程师来设计的，CAD 图纸有 3 页。每分钱都值。"',
      'test.t2.n': 'Priya S.',
      'test.t2.l': '10 kW + 13.5 kWh · 墨尔本 Box Hill',
      'test.t2.src': 'PRODUCT REVIEW · 1 个月前',
      'test.t3': '"咖啡店从 6 月就用上了。回本周期 4.2 年。Bluven 商用团队处理电网保护研究滴水不漏。"',
      'test.t3.n': 'Marco D.',
      'test.t3.l': '42 kW · 悉尼 Newtown 咖啡店',
      'test.t3.src': 'SOLARQUOTES · 3 个月前',

      'news.c1.meta': '补贴政策 · 阅读 6 分钟',
      'news.c1.t': '2026 联邦电池补贴政策详解',
      'news.c1.p': '每 kWh 补贴 372 澳元，最高 13.5 kWh，可与州补贴叠加。本文教您怎么真正拿到。',
      'news.c2.meta': '系统选型 · 阅读 4 分钟',
      'news.c2.t': '电池到底要装多大才合适？',
      'news.c2.p': '多数安装商把电池配大了。来自 8,000 户澳洲家庭的真实数据告诉您正解。',
      'news.c3.meta': '充电桩 · 阅读 5 分钟',
      'news.c3.t': '智能跟踪太阳能充电，到底是怎么回事？',
      'news.c3.p': '为什么 Zappi 的"生态模式"决定了您每年是花 0 澳元还是 1,800 澳元的等效油费。',

      'proj.feat': '精选案例',
    }
  };

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  }
  function t(key) {
    const lang = getLang();
    return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || key;
  }
  function applyAll(root) {
    root = root || document;
    // text content
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      const v = t(k);
      el.textContent = v;
    });
    // HTML content (allows tags)
    root.querySelectorAll('[data-i18n-html]').forEach(el => {
      const k = el.getAttribute('data-i18n-html');
      el.innerHTML = t(k);
    });
    // attributes
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr');
      // format: "attrName:key,attrName:key"
      spec.split(',').forEach(pair => {
        const [a, k] = pair.split(':').map(s => s.trim());
        if (a && k) el.setAttribute(a, t(k));
      });
    });
    // language toggle visual state
    document.querySelectorAll('.bv-lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === getLang());
    });
    document.documentElement.setAttribute('data-lang', getLang());
    document.documentElement.lang = getLang() === 'zh' ? 'zh-CN' : 'en-AU';
  }
  function setLang(lang) {
    if (!dict[lang]) return;
    localStorage.setItem(STORAGE_KEY, lang);
    applyAll();
  }

  window.bvCurrentLang = getLang;
  window.bvSetLang = setLang;
  window.bvT = t;
  window.bvApplyI18n = applyAll;

  // Auto-apply once DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyAll());
  } else {
    applyAll();
  }
})();
