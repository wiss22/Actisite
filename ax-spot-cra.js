/* Édition « À la une » — CRA (.ax-spot--cra).
   Chargé après ax-spot.js. Tout le contenu reste lisible sans ce script. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { gsap, ScrollTrigger } = window;

  const checks = Array.from(document.querySelectorAll('.cra-check'));
  const checkList = document.querySelector('.cra-checks');
  const tally = document.querySelector('.cra-tally b');
  const pad = (n) => String(n).padStart(2, '0');

  if (reduced || !gsap || !ScrollTrigger) {
    checks.forEach((c) => c.classList.add('is-done'));
    if (tally) tally.textContent = pad(checks.length);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // ── Hero : le produit s'éclate en vue éclatée et remonte ──
  const hero = document.querySelector('.cra-hero');
  if (hero) {
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 } });
    tl.to('.cra-product', { yPercent: -30, rotate: -12 }, 0);
    hero.querySelectorAll('.cra-face-g').forEach((g) => {
      const dx = parseFloat(g.dataset.dx) || 0;
      const dy = parseFloat(g.dataset.dy) || 0;
      tl.to(g, { x: dx * 90, y: dy * 90 }, 0);
    });
    tl.to('.cra-shard--a', { y: -160 }, 0).to('.cra-shard--b', { y: -60 }, 0).to('.cra-shard--c', { y: -220 }, 0);
  }

  // ── Contexte : chaque panneau recouvre le précédent, qui s'assombrit ──
  const panels = gsap.utils.toArray('.cra-panel');
  mm.add('(min-width: 900px)', () => {
    panels.forEach((panel, i) => {
      const next = panels[i + 1];
      if (!next) return;
      gsap.fromTo(panel, { '--dim': 0 }, {
        '--dim': 0.6,
        ease: 'none',
        scrollTrigger: { trigger: next, start: 'top 85%', end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}px`, scrub: true, invalidateOnRefresh: true }
      });
    });
  });

  // ── Sanctions : les montants montent jusqu'à leur valeur ──
  document.querySelectorAll('.cra-fine b[data-to]').forEach((b) => {
    const to = parseFloat(b.dataset.to);
    const decimals = String(b.dataset.to).includes('.') ? 1 : 0;
    const state = { v: 0 };
    const render = () => { b.textContent = state.v.toFixed(decimals).replace('.', ','); };
    render();
    gsap.to(state, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: render, scrollTrigger: { trigger: b.closest('.cra-fine'), start: 'top 85%', once: true } });
  });

  // ── Phrase clé : les lignes sortent de leur masque ──
  const lines = gsap.utils.toArray('.cra-line > span');
  if (lines.length) {
    gsap.fromTo(lines, { yPercent: 110 }, {
      yPercent: 0,
      ease: 'none',
      stagger: 0.25,
      scrollTrigger: { trigger: '.cra-quote', start: 'top 80%', end: 'center 55%', scrub: 0.4 }
    });
  }

  // ── Calendrier : frise horizontale épinglée, la date courante avance ──
  const cal = document.querySelector('.cra-cal');
  if (cal) {
    const move = cal.querySelector('.cra-cal-move');
    const fill = cal.querySelector('.cra-cal-rail i');
    const big = cal.querySelector('.cra-cal-big');
    const bigSpan = big && big.querySelector('span');
    const items = Array.from(cal.querySelectorAll('.cra-tl'));
    const dates = items.map((li) => li.querySelector('.cra-tl-date').textContent.trim());
    let current = -1;
    const setCurrent = (idx) => {
      if (idx === current) return;
      const forward = idx > current;
      current = idx;
      items.forEach((li, i) => li.classList.toggle('is-past', i <= idx));
      if (!bigSpan) return;
      bigSpan.textContent = dates[idx];
      big.classList.toggle('is-final', idx === items.length - 1);
      gsap.fromTo(bigSpan, { yPercent: forward ? 90 : -90, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out', overwrite: true });
    };

    mm.add('(min-width: 900px)', () => {
      cal.classList.add('is-pinned');
      const distance = () => Math.max(0, move.scrollWidth - window.innerWidth);
      const rail = cal.querySelector('.cra-cal-rail');
      // La « date courante » est une ligne verticale qui glisse de 62 % à 100 % de l'écran.
      const pick = (progress = 0) => {
        const line = window.innerWidth * (0.62 + 0.38 * progress);
        let idx = 0;
        items.forEach((li, i) => { if (li.getBoundingClientRect().left <= line) idx = i; });
        setCurrent(idx);
        if (fill && rail) {
          const r = rail.getBoundingClientRect();
          fill.style.transform = `scaleX(${gsap.utils.clamp(0, 1, (line - r.left) / r.width)})`;
        }
      };
      gsap.to(move, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: cal,
          start: 'top top',
          end: () => `+=${distance() * 1.8}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => pick(self.progress),
          onRefresh: (self) => pick(self.progress)
        }
      });
      current = -1;
      pick();
      return () => {
        cal.classList.remove('is-pinned');
        gsap.set(move, { clearProps: 'transform' });
        if (fill) fill.style.transform = '';
        items.forEach((li) => li.classList.add('is-past'));
      };
    });
    mm.add('(max-width: 899px)', () => {
      items.forEach((li) => li.classList.add('is-past'));
      items.forEach((li) => {
        gsap.from(li, { x: -30, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 88%' } });
      });
    });
  }

  // ── Méthode : les étapes se cochent, le compteur suit ──
  if (checks.length) {
    if (checkList) checkList.classList.add('is-live');
    const update = () => {
      const done = checks.filter((c) => c.classList.contains('is-done')).length;
      if (tally) tally.textContent = pad(done);
    };
    checks.forEach((c) => {
      ScrollTrigger.create({
        trigger: c,
        start: 'top 62%',
        onEnter: () => { c.classList.add('is-done'); update(); },
        onLeaveBack: () => { c.classList.remove('is-done'); update(); }
      });
    });
  }

  // ── Atouts : les aplats se lèvent l'un après l'autre ──
  const assets = gsap.utils.toArray('.cra-asset');
  if (assets.length) {
    gsap.fromTo(assets, { clipPath: 'inset(100% 0 0 0)' }, {
      clipPath: 'inset(0% 0 0 0)',
      duration: 1,
      ease: 'power3.inOut',
      stagger: 0.14,
      scrollTrigger: { trigger: '.cra-assets', start: 'top 80%', once: true }
    });
  }
})();
