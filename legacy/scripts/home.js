/* ============================================================
   Home page interactive bits — counters, testimonial carousel, process rail
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Counters ----------
  const counterEls = document.querySelectorAll('[data-counter]');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.counter;
      const dur = 1600;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  counterEls.forEach((el) => counterIO.observe(el));

  // ---------- Process rail fill ----------
  const rail = document.querySelector('.proc-rail');
  if (rail) {
    const procIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          rail.classList.add('in');
          procIO.unobserve(rail);
        }
      });
    }, { threshold: 0.3 });
    procIO.observe(rail);
  }

  // ---------- Testimonials carousel ----------
  const carousel = document.getElementById('tCarousel');
  if (carousel) {
    const track = carousel.querySelector('.t-track');
    const cards = carousel.querySelectorAll('.t-card');
    const prev = carousel.querySelector('.t-prev');
    const next = carousel.querySelector('.t-next');
    const dotsHost = carousel.querySelector('#tDots');
    const total = cards.length;

    function visible() {
      const w = window.innerWidth;
      if (w <= 700) return 1;
      if (w <= 1000) return 2;
      return 3;
    }

    let idx = 0;
    let pages = Math.max(1, total - visible() + 1);

    function buildDots() {
      pages = Math.max(1, total - visible() + 1);
      dotsHost.innerHTML = '';
      for (let i = 0; i < pages; i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Slide ${i + 1}`);
        if (i === idx) b.classList.add('active');
        b.addEventListener('click', () => { idx = i; render(); });
        dotsHost.appendChild(b);
      }
    }

    function render() {
      idx = Math.max(0, Math.min(idx, pages - 1));
      const card = cards[0].getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      track.style.transform = `translateX(${-(card.width + gap) * idx}px)`;
      [...dotsHost.children].forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    prev.addEventListener('click', () => { idx -= 1; render(); });
    next.addEventListener('click', () => { idx += 1; render(); });

    buildDots();
    render();
    window.addEventListener('resize', () => { buildDots(); render(); });

    // Auto-advance
    let timer = setInterval(() => {
      idx = (idx + 1) % pages;
      render();
    }, 6500);
    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', () => {
      timer = setInterval(() => {
        idx = (idx + 1) % pages;
        render();
      }, 6500);
    });
  }

  // Make nav dark on hero (transparent until scrolled)
  const nav = document.getElementById('bvNav');
  if (nav) {
    const hero = document.querySelector('.hero');
    if (hero) {
      nav.classList.add('dark');
      const heroIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.intersectionRatio < 0.2) nav.classList.remove('dark');
          else nav.classList.add('dark');
        });
      }, { threshold: [0, 0.2, 1] });
      heroIO.observe(hero);
    }
  }
});
