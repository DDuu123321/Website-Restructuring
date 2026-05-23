/* ============================================================
   Bluven · Scroll FX driver
   Wires up: pinned horizontal, sticky story, scrub, parallax,
   reveal-clip, reveal-wipe, count-up.
   ============================================================ */
(function () {

  // --------- Reveal: clip + wipe ----------
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  function bindReveals(root) {
    (root || document).querySelectorAll('.fx-wipe, .fx-clip').forEach(el => revealIO.observe(el));
  }

  // --------- Count-up ----------
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0');
    const dur = parseInt(el.dataset.duration || '1800');
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const v = target * easeOut(t);
      el.textContent = decimals
        ? v.toFixed(decimals)
        : Math.floor(v).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString();
    }
    requestAnimationFrame(step);
  }
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        countIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  function bindCounters(root) {
    (root || document).querySelectorAll('[data-count]').forEach(el => countIO.observe(el));
  }

  // --------- Parallax ----------
  function bindParallax() {
    const items = [...document.querySelectorAll('[data-parallax]')];
    function update() {
      const vh = window.innerHeight;
      items.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const factor = parseFloat(el.dataset.parallax) || 0.2;
        const center = rect.top + rect.height / 2;
        const distance = center - vh / 2;
        el.style.transform = `translate3d(0, ${(-distance * factor).toFixed(1)}px, 0)`;
      });
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // --------- Pinned horizontal ----------
  function bindHorizontal(root) {
    const containers = (root || document).querySelectorAll('.fx-horiz');
    containers.forEach((wrap) => {
      const pin = wrap.querySelector('.fx-horiz-pin');
      const track = wrap.querySelector('.fx-horiz-track');
      const panels = wrap.querySelectorAll('.fx-horiz-panel');
      const progress = wrap.querySelectorAll('.fx-horiz-progress span');
      const spacer = wrap.querySelector('.fx-horiz-spacer');
      const n = panels.length;
      // 100vh of scroll per panel
      spacer.style.height = `${(n) * 100}vh`;

      function update() {
        const rect = wrap.getBoundingClientRect();
        const total = wrap.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const t = Math.max(0, Math.min(1, scrolled / total));
        const maxX = (n - 1) * window.innerWidth;
        track.style.transform = `translate3d(${-t * maxX}px, 0, 0)`;

        // active panel
        const idx = Math.min(n - 1, Math.round(t * (n - 1)));
        panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
        progress.forEach((d, i) => d.classList.toggle('active', i === idx));
      }
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  // --------- Sticky storytelling ----------
  function bindStory(root) {
    const stories = (root || document).querySelectorAll('.fx-story');
    stories.forEach((story) => {
      const stage = story.querySelector('.fx-story-stage');
      const backgrounds = story.querySelectorAll('.fx-story-bg');
      const chapters = story.querySelectorAll('.fx-story-chapter');
      const progressDots = story.querySelectorAll('.fx-story-progress .dot');
      const titleEls = story.querySelectorAll('[data-story-title]');
      const numEls = story.querySelectorAll('[data-story-num]');
      const bodyEls = story.querySelectorAll('[data-story-body]');

      const liveTitle = story.querySelector('.fx-story-text h3');
      const liveNum = story.querySelector('.fx-story-text .fx-num');
      const liveBody = story.querySelector('.fx-story-text p');

      function update() {
        const rect = story.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        story.classList.toggle('is-active', inView && rect.top < 100);

        let active = 0;
        chapters.forEach((c, i) => {
          const r = c.getBoundingClientRect();
          if (r.top <= window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5) active = i;
        });
        backgrounds.forEach((b, i) => b.classList.toggle('active', i === active));
        progressDots.forEach((d, i) => d.classList.toggle('active', i === active));

        if (liveTitle && titleEls[active]) liveTitle.innerHTML = titleEls[active].textContent;
        if (liveNum && numEls[active]) liveNum.textContent = numEls[active].textContent;
        if (liveBody && bodyEls[active]) liveBody.textContent = bodyEls[active].textContent;
      }
      window.addEventListener('scroll', update, { passive: true });
      update();
    });
  }

  // --------- Scrub sequence ----------
  function bindScrub(root) {
    const scrubs = (root || document).querySelectorAll('.fx-scrub');
    scrubs.forEach((scrub) => {
      const steps = scrub.querySelectorAll('.fx-scrub-step');
      const stages = scrub.querySelectorAll('[data-stage]');
      const spacer = scrub.querySelector('.fx-scrub-spacer');
      const n = steps.length;
      if (spacer) spacer.style.height = `${n * 100}vh`;

      function update() {
        const rect = scrub.getBoundingClientRect();
        const total = scrub.offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        const t = Math.max(0, Math.min(0.999, scrolled / total));
        const idx = Math.floor(t * n);
        steps.forEach((s, i) => s.classList.toggle('active', i === idx));
        stages.forEach((s, i) => s.classList.toggle('active', i === idx));
      }
      window.addEventListener('scroll', update, { passive: true });
      update();
    });
  }

  function init() {
    bindReveals();
    bindCounters();
    bindParallax();
    bindHorizontal();
    bindStory();
    bindScrub();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for re-binding after dynamic injection
  window.bvScrollFX = { bindReveals, bindCounters, bindHorizontal, bindStory, bindScrub };
})();
