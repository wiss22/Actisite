/* Nous rejoindre — édition « Trajectoire ».
   Chargé après ax.js. Chaque bloc ne s'active que si ses éléments existent. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { gsap, ScrollTrigger } = window;

  // ── Escalier des grades : une marche choisie affiche son texte ──
  const stairs = Array.from(document.querySelectorAll('.nr-stair'));
  const pick = (target) => {
    stairs.forEach((s) => {
      const on = s === target;
      s.classList.toggle('is-on', on);
      s.querySelector('.nr-stair-btn').setAttribute('aria-expanded', String(on));
    });
  };
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  stairs.forEach((s) => {
    const btn = s.querySelector('.nr-stair-btn');
    btn.addEventListener('click', () => pick(s));
    btn.addEventListener('mouseenter', () => { if (fine.matches) pick(s); });
  });

  // ── Marqueurs et avantages : se surlignent à l'arrivée à l'écran ──
  const lit = Array.from(document.querySelectorAll('.nr-mk, .nr-perk'));
  if (reduced || !('IntersectionObserver' in window)) {
    lit.forEach((el) => el.classList.add('is-lit'));
  } else {
    document.body.classList.add('nr-js');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        // Les mots du hero s'allument juste après la montée du titre.
        const delay = e.target.closest('.nr-hero') ? 700 : 150;
        setTimeout(() => e.target.classList.add('is-lit'), delay);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -18% 0px' });
    lit.forEach((el) => io.observe(el));
  }

  const stops = Array.from(document.querySelectorAll('.nr-stop'));
  if (reduced || !gsap || !ScrollTrigger) {
    stops.forEach((s) => s.classList.add('is-on'));
    const path = document.querySelector('.nr-path');
    if (path) path.style.setProperty('--p', 1);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // ── Hero : les photos se séparent et le texte remonte en quittant l'écran ──
  const hero = document.querySelector('.nr-hero');
  if (hero) {
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } });
    [
      ['.nr-tri--1', { yPercent: -18, xPercent: -10, rotate: -8 }],
      ['.nr-tri--2', { yPercent: -50, xPercent: 16, rotate: 12 }],
      ['.nr-tri--3', { yPercent: 30, rotate: -14 }],
      ['.nr-hero-copy', { yPercent: -14, autoAlpha: 0.2 }]
    ].forEach(([sel, vars]) => {
      const el = hero.querySelector(sel);
      if (el) tl.to(el, vars, 0);
    });
  }

  // ── Cartes : distribuées sur la table, une à une ──
  const cards = gsap.utils.toArray('.nr-card');
  if (cards.length) {
    gsap.from(cards, {
      y: 90,
      rotate: (i) => (i % 2 ? 9 : -9),
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.1,
      clearProps: 'transform',
      scrollTrigger: { trigger: '.nr-deck', start: 'top 82%' }
    });
  }

  // ── Recrutement : le chemin se trace et allume chaque étape ──
  const path = document.querySelector('.nr-path');
  if (path && stops.length) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1001px)', () => {
      const st = ScrollTrigger.create({
        trigger: path,
        start: 'top 70%',
        end: 'bottom 55%',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          path.style.setProperty('--p', p.toFixed(4));
          stops.forEach((s, i) => s.classList.toggle('is-on', p >= i / stops.length + 0.02 || p > 0.98));
        }
      });
      return () => st.kill();
    });
    mm.add('(max-width: 1000px)', () => {
      const triggers = stops.map((s) => ScrollTrigger.create({
        trigger: s,
        start: 'top 72%',
        onEnter: () => s.classList.add('is-on'),
        onLeaveBack: () => s.classList.remove('is-on')
      }));
      return () => triggers.forEach((t) => t.kill());
    });
  }

  // ── Escalier : les marches montent l'une après l'autre ──
  const steps = gsap.utils.toArray('.nr-stair-btn');
  if (steps.length) {
    gsap.from(steps, {
      scaleY: 0,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.09,
      clearProps: 'transform',
      scrollTrigger: { trigger: '.nr-stairs', start: 'top 80%' }
    });
  }

  // ── Mur de photos : les deux rangées défilent en sens contraire ──
  const wall = document.querySelector('.nr-wall');
  if (wall) {
    const rows = Array.from(wall.querySelectorAll('.nr-wall-row'));
    // Double chaque rangée (copies muettes) pour qu'elle couvre l'écran pendant tout le défilement.
    rows.forEach((row) => {
      Array.from(row.children).forEach((fig) => {
        const copy = fig.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.querySelector('img').alt = '';
        row.append(copy);
      });
    });
    // Chaque rangée parcourt la largeur d'une série complète de photos pendant
    // le passage du mur à l'écran : toutes les photos défilent, même sur mobile.
    const span = (row) => row.scrollWidth / 2;
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: wall, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true } });
    if (rows[0]) tl.fromTo(rows[0], { x: 0 }, { x: () => -span(rows[0]) }, 0);
    if (rows[1]) tl.fromTo(rows[1], { x: () => -span(rows[1]) }, { x: 0 }, 0);
    gsap.from(wall.querySelectorAll('.nr-pola'), {
      y: 70,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.05,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: { trigger: wall, start: 'top 85%' }
    });
  }

  // ── Appel final : les triangles dérivent ──
  const cta = document.querySelector('.nr-cta');
  if (cta) {
    const tris = cta.querySelectorAll('.nr-cta-tris i');
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: cta, start: 'top bottom', end: 'bottom top', scrub: true } })
      .fromTo(tris[0], { yPercent: 60, rotate: -40 }, { yPercent: -80, rotate: 10 }, 0)
      .fromTo(tris[1], { yPercent: 30 }, { yPercent: -30, rotate: 30 }, 0);
  }
})();
