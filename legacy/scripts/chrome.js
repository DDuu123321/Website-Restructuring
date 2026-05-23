/* ============================================================
   Bluven shared chrome — Nav, Footer, AI Chat, Reveal observer
   (i18n-aware)
   ============================================================ */

(function () {
  // ---------- Reveal-on-scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observeReveals() {
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
  }
  window.addEventListener('DOMContentLoaded', observeReveals);
  window.bvObserveReveals = observeReveals;

  // ---------- Nav (with mega-menu) ----------
  function navHTML(active) {
    // Top-level structure:
    // - Home (simple link)
    // - Products (mega-menu)
    // - Company (mega-menu) [Who, Projects, Brands, News]
    // - Support (mega-menu) [FAQ, Contact, Admin]
    const isHome = active === 'home';
    const productsActive = ['products', 'quote'].includes(active);
    const companyActive = ['who', 'projects', 'brands', 'news'].includes(active);
    const supportActive = ['faq', 'contact', 'admin'].includes(active);

    return `
      <nav class="bv-nav${isHome ? ' dark' : ''}" id="bvNav">
        <div class="bv-nav-inner">
          <a class="bv-logo" href="index.html" aria-label="Bluven Energy home">
            <span class="bv-logo-mark">
              <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
                <path d="M16 2 L29 9 V23 L16 30 L3 23 V9 Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M9 12 L16 8 L23 12 V20 L16 24 L9 20 Z" fill="currentColor" opacity=".15"/>
                <path d="M12 14 L20 14 M12 17 L20 17 M14 20 L18 20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            </span>
            <span class="bv-logo-text">Bluven<span>·Energy</span></span>
          </a>

          <ul class="bv-nav-links" id="bvNavLinks">
            <li><a class="${isHome ? 'is-active' : ''}" href="index.html" data-i18n="nav.home">Home</a></li>

            <li class="bv-mm-item" data-mm="products">
              <button class="bv-mm-trigger ${productsActive ? 'is-active' : ''}" aria-haspopup="true" aria-expanded="false">
                <span data-i18n="nav.products">Products</span>
                <svg class="bv-mm-caret" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4l4 4 4-4"/></svg>
              </button>
            </li>

            <li class="bv-mm-item" data-mm="company">
              <button class="bv-mm-trigger ${companyActive ? 'is-active' : ''}" aria-haspopup="true" aria-expanded="false">
                <span data-i18n="mm.about.eye">Company</span>
                <svg class="bv-mm-caret" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4l4 4 4-4"/></svg>
              </button>
            </li>

            <li class="bv-mm-item" data-mm="support">
              <button class="bv-mm-trigger ${supportActive ? 'is-active' : ''}" aria-haspopup="true" aria-expanded="false">
                <span data-i18n="mm.support.eye">Support</span>
                <svg class="bv-mm-caret" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4l4 4 4-4"/></svg>
              </button>
            </li>
          </ul>

          <div class="bv-nav-actions">
            <div class="bv-lang">
              <button class="bv-lang-btn" data-lang="en" aria-label="English">EN</button>
              <button class="bv-lang-btn" data-lang="zh" aria-label="中文">中</button>
            </div>
            <a class="bv-call" href="tel:+61400000000" aria-label="Call us">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
              <span data-i18n="nav.call">1300 BLUVEN</span>
            </a>
            <a class="btn btn-primary bv-quote-btn" href="quote.html"><span data-i18n="nav.quote">Get a Quote</span> <span class="arrow">→</span></a>
            <button class="bv-burger" id="bvBurger" aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>

        <!-- Mega-menu panels (one shared dropdown that morphs) -->
        <div class="bv-mm-panel" id="bvMmPanel" aria-hidden="true">
          <!-- Products panel -->
          <div class="bv-mm-pane" data-pane="products">
            <div class="bv-mm-pane-l">
              <span class="bv-mm-eye" data-i18n="mm.products.eye">Build your system</span>
              <p class="bv-mm-lede" data-i18n="mm.products.lede">Four engineered packs — from a 6.6 kW starter to 250 kW commercial roofs.</p>
              <a class="bv-mm-cta" href="quote.html"><span data-i18n="nav.quote">Get a Quote</span> →</a>
            </div>
            <div class="bv-mm-grid">
              <a class="bv-mm-card" href="products.html#starter">
                <div class="bv-mm-ico" style="background:linear-gradient(135deg,#FFE9A8,#F5B742)">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1f3a" stroke-width="1.7"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
                </div>
                <div>
                  <h6 data-i18n="mm.products.solar">Solar Panels</h6>
                  <p data-i18n="mm.products.solar.s">Tier-1 modules · 25-year warranty</p>
                </div>
              </a>
              <a class="bv-mm-card" href="products.html#essential">
                <div class="bv-mm-ico" style="background:linear-gradient(135deg,#BFE6F8,#5DA9F5)">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1f3a" stroke-width="1.7"><rect x="5" y="6" width="14" height="14" rx="2"/><path d="M9 3h6v3M9 14l2 2 4-4"/></svg>
                </div>
                <div>
                  <h6 data-i18n="mm.products.battery">Battery Storage</h6>
                  <p data-i18n="mm.products.battery.s">BYD · Tesla · Sungrow</p>
                </div>
              </a>
              <a class="bv-mm-card" href="products.html#premium">
                <div class="bv-mm-ico" style="background:linear-gradient(135deg,#C7F0D2,#4FB678)">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1f3a" stroke-width="1.7"><path d="M3 17V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9"/><path d="M3 17h14M17 11h2l2 3v3h-4"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>
                </div>
                <div>
                  <h6 data-i18n="mm.products.ev">EV Charging</h6>
                  <p data-i18n="mm.products.ev.s">Solar-tracking · 22 kW</p>
                </div>
              </a>
              <a class="bv-mm-card" href="products.html#commercial">
                <div class="bv-mm-ico" style="background:linear-gradient(135deg,#E5DBFA,#9F87E8)">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1f3a" stroke-width="1.7"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-7h6v7M3 21h18"/></svg>
                </div>
                <div>
                  <h6 data-i18n="mm.products.commercial">Commercial</h6>
                  <p data-i18n="mm.products.commercial.s">30 – 250 kW · custom-engineered</p>
                </div>
              </a>
            </div>
          </div>

          <!-- Company panel -->
          <div class="bv-mm-pane" data-pane="company">
            <div class="bv-mm-pane-l">
              <span class="bv-mm-eye" data-i18n="mm.about.eye">About</span>
              <p class="bv-mm-lede" data-i18n="hp.who.h">Engineers first. <br/>Salespeople, never.</p>
              <a class="bv-mm-cta" href="who-we-are.html"><span data-i18n="mm.about.who">Who We Are</span> →</a>
            </div>
            <div class="bv-mm-grid">
              <a class="bv-mm-card" href="who-we-are.html">
                <div class="bv-mm-ico bv-mm-ico-line"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg></div>
                <div>
                  <h6 data-i18n="mm.about.who">Who We Are</h6>
                  <p data-i18n="mm.about.who.s">Engineering-led, Australian-owned</p>
                </div>
              </a>
              <a class="bv-mm-card" href="projects.html">
                <div class="bv-mm-ico bv-mm-ico-line"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10l6 4 4-3 8 5"/></svg></div>
                <div>
                  <h6 data-i18n="mm.about.proj">Projects</h6>
                  <p data-i18n="mm.about.proj.s">600+ real installs across the country</p>
                </div>
              </a>
              <a class="bv-mm-card" href="brands.html">
                <div class="bv-mm-ico bv-mm-ico-line"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7l8-4 8 4v10l-8 4-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/></svg></div>
                <div>
                  <h6 data-i18n="mm.about.brands">Brand Partners</h6>
                  <p data-i18n="mm.about.brands.s">Why we only spec Tier-1 — our shortlist</p>
                </div>
              </a>
              <a class="bv-mm-card" href="news.html">
                <div class="bv-mm-ico bv-mm-ico-line"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg></div>
                <div>
                  <h6 data-i18n="mm.about.news">Insights</h6>
                  <p data-i18n="mm.about.news.s">Plain-English deep dives on the tech</p>
                </div>
              </a>
            </div>
          </div>

          <!-- Support panel -->
          <div class="bv-mm-pane" data-pane="support">
            <div class="bv-mm-pane-l">
              <span class="bv-mm-eye" data-i18n="mm.support.eye">Support</span>
              <p class="bv-mm-lede" data-i18n="hp.contact.h">Talk to a real engineer, <br/>not a call centre.</p>
              <a class="bv-mm-cta" href="contact.html"><span data-i18n="nav.contact">Contact</span> →</a>
            </div>
            <div class="bv-mm-grid">
              <a class="bv-mm-card" href="faq.html">
                <div class="bv-mm-ico bv-mm-ico-line"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2.5-2.5 4M12 17h.01"/></svg></div>
                <div>
                  <h6 data-i18n="mm.support.faq">FAQ</h6>
                  <p data-i18n="mm.support.faq.s">Rebates · sizing · install timelines</p>
                </div>
              </a>
              <a class="bv-mm-card" href="contact.html">
                <div class="bv-mm-ico bv-mm-ico-line"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                <div>
                  <h6 data-i18n="mm.support.contact">Contact</h6>
                  <p data-i18n="mm.support.contact.s">Sydney · Melbourne · Brisbane</p>
                </div>
              </a>
              <a class="bv-mm-card" href="quote.html">
                <div class="bv-mm-ico bv-mm-ico-line"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 12l2 2 4-4M5 5h14v14H5z"/></svg></div>
                <div>
                  <h6 data-i18n="nav.quote">Get a Quote</h6>
                  <p data-i18n="hp.calc.eye">Live estimate in 30 seconds</p>
                </div>
              </a>
              <a class="bv-mm-card" href="admin.html">
                <div class="bv-mm-ico bv-mm-ico-line"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                <div>
                  <h6 data-i18n="mm.support.admin">Admin Portal</h6>
                  <p data-i18n="mm.support.admin.s">Partners & staff sign-in</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Mobile drawer -->
        <div class="bv-mobile-menu" id="bvMobileMenu">
          <a class="${isHome ? 'is-active' : ''}" href="index.html" data-i18n="nav.home">Home</a>
          <a class="${active === 'products' ? 'is-active' : ''}" href="products.html" data-i18n="nav.products">Products</a>
          <a class="${active === 'projects' ? 'is-active' : ''}" href="projects.html" data-i18n="nav.projects">Projects</a>
          <a class="${active === 'brands' ? 'is-active' : ''}" href="brands.html" data-i18n="nav.brands">Brands</a>
          <a class="${active === 'who' ? 'is-active' : ''}" href="who-we-are.html" data-i18n="nav.who">Who We Are</a>
          <a class="${active === 'news' ? 'is-active' : ''}" href="news.html" data-i18n="nav.news">Insights</a>
          <a class="${active === 'faq' ? 'is-active' : ''}" href="faq.html" data-i18n="nav.faq">FAQ</a>
          <a class="${active === 'contact' ? 'is-active' : ''}" href="contact.html" data-i18n="nav.contact">Contact</a>
          <div class="bv-lang" style="margin:14px 0 8px">
            <button class="bv-lang-btn" data-lang="en">EN</button>
            <button class="bv-lang-btn" data-lang="zh">中</button>
          </div>
          <a class="btn btn-primary" href="quote.html" style="margin-top:8px"><span data-i18n="nav.quote">Get a Quote</span> →</a>
        </div>
      </nav>

      <!-- Floating sticky 'Get a Quote' pill (morphs in past hero) -->
      <a class="bv-sticky-quote" id="bvStickyQuote" href="quote.html" aria-label="Get a quote">
        <span class="bv-sq-pulse"></span>
        <span class="bv-sq-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/><circle cx="12" cy="12" r="4"/></svg>
        </span>
        <span class="bv-sq-label" data-i18n="sticky.quote">Free Quote</span>
        <span class="bv-sq-arrow">→</span>
      </a>
    `;
  }

  function footerHTML() {
    return `
      <footer class="bv-footer">
        <div class="container">
          <div class="bv-footer-top">
            <div class="bv-footer-brand">
              <a class="bv-logo" href="index.html">
                <span class="bv-logo-mark">
                  <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
                    <path d="M16 2 L29 9 V23 L16 30 L3 23 V9 Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M9 12 L16 8 L23 12 V20 L16 24 L9 20 Z" fill="currentColor" opacity=".15"/>
                    <path d="M12 14 L20 14 M12 17 L20 17 M14 20 L18 20" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                </span>
                <span class="bv-logo-text">Bluven<span>·Energy</span></span>
              </a>
              <p data-i18n="footer.tagline">Australia's trusted partner for residential & commercial solar, battery and EV charging — designed, installed and supported locally.</p>
              <div class="bv-footer-cta">
                <a class="btn btn-primary" href="quote.html"><span data-i18n="nav.quote">Get a Quote</span> →</a>
                <a class="btn btn-ghost" href="tel:+61400000000"><span data-i18n="nav.call">1300 BLUVEN</span></a>
              </div>
            </div>
            <div class="bv-footer-cols">
              <div>
                <h5 data-i18n="footer.products">Products</h5>
                <a href="products.html#starter" data-i18n="footer.starter">Starter Pack</a>
                <a href="products.html#essential" data-i18n="footer.essential">Essential</a>
                <a href="products.html#premium" data-i18n="footer.premium">Premium</a>
                <a href="products.html#commercial" data-i18n="footer.commercial">Commercial</a>
                <a href="products.html#compare" data-i18n="footer.compare">Compare</a>
              </div>
              <div>
                <h5 data-i18n="footer.company">Company</h5>
                <a href="who-we-are.html" data-i18n="footer.who">Who We Are</a>
                <a href="projects.html" data-i18n="footer.proj">Projects</a>
                <a href="brands.html" data-i18n="footer.brands">Brands</a>
                <a href="news.html" data-i18n="footer.insights">Insights</a>
                <a href="contact.html#careers" data-i18n="footer.careers">Careers</a>
              </div>
              <div>
                <h5 data-i18n="footer.support">Support</h5>
                <a href="faq.html" data-i18n="footer.faq">FAQ</a>
                <a href="contact.html" data-i18n="footer.contact">Contact</a>
                <a href="quote.html" data-i18n="footer.quote">Get a Quote</a>
                <a href="admin.html" data-i18n="footer.admin">Admin Portal</a>
              </div>
              <div>
                <h5 data-i18n="footer.legal">Legal</h5>
                <a href="privacy.html" data-i18n="footer.privacy">Privacy Policy</a>
                <a href="terms.html" data-i18n="footer.terms">Terms of Service</a>
                <a href="cookies.html" data-i18n="footer.cookies">Cookie Notice</a>
              </div>
            </div>
          </div>
          <div class="bv-footer-bottom">
            <div class="bv-footer-meta">
              <span data-i18n="footer.copy">© 2026 Bluven Energy Pty Ltd · ABN 00 000 000 000</span>
              <span data-i18n="footer.cec">CEC Approved Retailer · Clean Energy Council Member</span>
            </div>
            <div class="bv-footer-social">
              <a aria-label="LinkedIn" href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0 1.38-1.12 2.5-2.5 2.5S0 4.88 0 3.5 1.12 1 2.48 1s2.5 1.12 2.5 2.5zM.22 8h4.52v14H.22V8zm7.5 0h4.34v1.91h.06c.6-1.14 2.08-2.34 4.28-2.34 4.58 0 5.42 3.02 5.42 6.94V22h-4.5v-6.62c0-1.58-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.5V22H7.72V8z"/></svg></a>
              <a aria-label="Facebook" href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.13 22 17 22 12z"/></svg></a>
              <a aria-label="Instagram" href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58 0 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16zm0 5.4a4.44 4.44 0 1 0 0 8.88 4.44 4.44 0 0 0 0-8.88zM12 14.4a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8zm4.67-7.16a1.04 1.04 0 1 0 0 2.08 1.04 1.04 0 0 0 0-2.08z"/></svg></a>
              <a aria-label="YouTube" href="#"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.13C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.4.57A3 3 0 0 0 .5 6.2C0 8.06 0 12 0 12s0 3.94.5 5.8a3 3 0 0 0 2.1 2.13C4.45 20.5 12 20.5 12 20.5s7.55 0 9.4-.57a3 3 0 0 0 2.1-2.13C24 15.94 24 12 24 12s0-3.94-.5-5.8zM9.6 15.6V8.4l6.27 3.6-6.27 3.6z"/></svg></a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function aiChatHTML() {
    return `
      <div class="bv-chat" id="bvChat">
        <button class="bv-chat-fab" id="bvChatFab" aria-label="Chat with us">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span class="bv-chat-badge">AI</span>
        </button>
        <div class="bv-chat-panel" id="bvChatPanel" aria-hidden="true">
          <div class="bv-chat-head">
            <div class="bv-chat-head-l">
              <div class="bv-chat-avatar">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/></svg>
              </div>
              <div>
                <div class="bv-chat-title" data-i18n="chat.title">Sunny · Bluven Assistant</div>
                <div class="bv-chat-status"><span class="bv-pulse"></span> <span data-i18n="chat.status">Online · Replies in seconds</span></div>
              </div>
            </div>
            <button class="bv-chat-close" id="bvChatClose" aria-label="Close">×</button>
          </div>
          <div class="bv-chat-body" id="bvChatBody">
            <div class="bv-chat-msg ai">
              <div class="bv-chat-bubble" data-i18n-html="chat.welcome">G'day! 👋 I'm <b>Sunny</b>, Bluven's AI assistant.</div>
            </div>
            <div class="bv-chat-quick">
              <button data-qkey="chat.q1q" data-i18n="chat.q1">NSW rebates</button>
              <button data-qkey="chat.q2q" data-i18n="chat.q2">Sizing help</button>
              <button data-qkey="chat.q3q" data-i18n="chat.q3">Compare packs</button>
              <button data-qkey="chat.q4q" data-i18n="chat.q4">Green finance</button>
            </div>
          </div>
          <form class="bv-chat-form" id="bvChatForm">
            <input id="bvChatInput" data-i18n-attr="placeholder:chat.placeholder" placeholder="Ask Sunny anything…" autocomplete="off" />
            <button type="submit" aria-label="Send">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </form>
          <div class="bv-chat-foot">
            <span data-i18n="chat.foot">Powered by Bluven AI</span> · <a href="privacy.html" data-i18n="footer.privacy">Privacy</a>
          </div>
        </div>
      </div>
    `;
  }

  function mountChrome(active) {
    document.body.insertAdjacentHTML('afterbegin', navHTML(active));
    document.body.insertAdjacentHTML('beforeend', footerHTML() + aiChatHTML());

    // Burger toggle
    const burger = document.getElementById('bvBurger');
    const menu = document.getElementById('bvMobileMenu');
    if (burger) burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      menu.classList.toggle('open');
    });

    // Sticky nav background + sticky CTA visibility
    const nav = document.getElementById('bvNav');
    const stickyQuote = document.getElementById('bvStickyQuote');
    const heroEl = document.querySelector('.hero, [data-screen-label="Home Hero"]');
    const updateNav = () => {
      const y = window.scrollY;
      if (y > 24) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
      if (stickyQuote) {
        const threshold = heroEl ? Math.max(280, heroEl.offsetHeight * 0.55) : 480;
        if (y > threshold) stickyQuote.classList.add('show');
        else stickyQuote.classList.remove('show');
        // morph to compact past 1200
        if (y > 1200) stickyQuote.classList.add('compact');
        else stickyQuote.classList.remove('compact');
      }
    };
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });

    // ---------- Mega-menu ----------
    const mmPanel = document.getElementById('bvMmPanel');
    const mmTriggers = document.querySelectorAll('.bv-mm-item');
    let mmHideTimer = null;
    let mmCurrent = null;

    function showPane(name) {
      if (!mmPanel) return;
      clearTimeout(mmHideTimer);
      mmCurrent = name;
      mmPanel.classList.add('open');
      mmPanel.setAttribute('aria-hidden', 'false');
      mmPanel.querySelectorAll('.bv-mm-pane').forEach(p => {
        p.classList.toggle('active', p.dataset.pane === name);
      });
      mmTriggers.forEach(t => {
        const isMatch = t.dataset.mm === name;
        t.classList.toggle('mm-open', isMatch);
        const btn = t.querySelector('.bv-mm-trigger');
        if (btn) btn.setAttribute('aria-expanded', isMatch ? 'true' : 'false');
      });
    }
    function hidePane(immediate) {
      clearTimeout(mmHideTimer);
      const fn = () => {
        if (!mmPanel) return;
        mmPanel.classList.remove('open');
        mmPanel.setAttribute('aria-hidden', 'true');
        mmCurrent = null;
        mmTriggers.forEach(t => {
          t.classList.remove('mm-open');
          const btn = t.querySelector('.bv-mm-trigger');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      };
      if (immediate) fn();
      else mmHideTimer = setTimeout(fn, 180);
    }

    mmTriggers.forEach(item => {
      const name = item.dataset.mm;
      const btn = item.querySelector('.bv-mm-trigger');
      item.addEventListener('mouseenter', () => showPane(name));
      item.addEventListener('mouseleave', () => hidePane(false));
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (mmCurrent === name) hidePane(true);
          else showPane(name);
        });
        btn.addEventListener('focus', () => showPane(name));
      }
    });
    if (mmPanel) {
      mmPanel.addEventListener('mouseenter', () => clearTimeout(mmHideTimer));
      mmPanel.addEventListener('mouseleave', () => hidePane(false));
    }
    // Close on Escape / outside click
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hidePane(true); });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.bv-mm-item') && !e.target.closest('.bv-mm-panel')) hidePane(true);
    });

    // Language toggle
    document.querySelectorAll('.bv-lang-btn').forEach(b => {
      b.addEventListener('click', () => {
        if (window.bvSetLang) window.bvSetLang(b.dataset.lang);
      });
    });

    // Chat
    const fab = document.getElementById('bvChatFab');
    const panel = document.getElementById('bvChatPanel');
    const closeBtn = document.getElementById('bvChatClose');
    fab.addEventListener('click', () => panel.classList.toggle('open'));
    closeBtn.addEventListener('click', () => panel.classList.remove('open'));
    window.bvOpenChat = () => panel.classList.add('open');

    const body = document.getElementById('bvChatBody');
    const form = document.getElementById('bvChatForm');
    const input = document.getElementById('bvChatInput');

    function addMsg(role, content) {
      const wrap = document.createElement('div');
      wrap.className = `bv-chat-msg ${role}`;
      wrap.innerHTML = `<div class="bv-chat-bubble">${content}</div>`;
      body.appendChild(wrap);
      body.scrollTop = body.scrollHeight;
      return wrap;
    }
    function addTyping() {
      const wrap = document.createElement('div');
      wrap.className = 'bv-chat-msg ai typing';
      wrap.innerHTML = `<div class="bv-chat-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
      body.appendChild(wrap);
      body.scrollTop = body.scrollHeight;
      return wrap;
    }

    async function ask(q) {
      if (!q.trim()) return;
      const quick = body.querySelector('.bv-chat-quick');
      if (quick) quick.remove();
      addMsg('user', q.replace(/</g,'&lt;'));
      const typing = addTyping();
      const lang = (window.bvCurrentLang && window.bvCurrentLang()) || 'en';
      const langInstruction = lang === 'zh'
        ? '请用简体中文回答，2-4 句话，专业但友好。如涉及价格/系统选型，给一个大致区间并建议获取报价。提及澳洲本地相关信息（NSW/VIC/QLD 补贴、STC、联邦电池补贴）时使用准确名称。'
        : 'Reply in 2-4 short sentences, warm but professional. If asked about pricing or sizing, give a rough range and recommend they Get a Quote. Mention Australian context (NSW/VIC/QLD rebates, STCs, Federal Battery Rebate) where relevant.';
      try {
        const reply = await window.claude.complete({
          messages: [{
            role: 'user',
            content: `You are Sunny, the friendly AI assistant for Bluven Energy — an Australian solar, battery & EV charging installer. ${langInstruction} Question: ${q}`
          }]
        });
        typing.remove();
        addMsg('ai', reply.replace(/</g,'&lt;'));
      } catch (e) {
        typing.remove();
        const err = lang === 'zh'
          ? '抱歉，连接出了点问题。请稍后再试，或者 <a href="quote.html">提交报价请求</a>，我们会尽快联系您。'
          : "Sorry, I'm having trouble connecting right now. Please try again, or <a href='quote.html'>request a quote</a> and our team will get back to you.";
        addMsg('ai', err);
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value;
      input.value = '';
      ask(q);
    });

    body.addEventListener('click', (e) => {
      const b = e.target.closest('.bv-chat-quick button');
      if (b) {
        // resolve qkey to current language string
        const k = b.dataset.qkey;
        const q = (window.bvT && window.bvT(k)) || b.textContent;
        ask(q);
      }
    });

    // Re-trigger i18n now that chrome is mounted
    if (window.bvSetLang) window.bvSetLang(window.bvCurrentLang ? window.bvCurrentLang() : 'en');

    observeReveals();
  }

  window.bvMountChrome = mountChrome;
})();
