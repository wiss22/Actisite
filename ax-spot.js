/* Édition « À la une » (.ax-spot) — mouvements propres aux offres à la une.
   Chargé après ax.js. Chaque bloc ne s'active que si ses éléments existent. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { gsap, ScrollTrigger } = window;

  // ── Offres : le sommaire suit le panneau lu (sans GSAP, toujours actif) ──
  const offers = Array.from(document.querySelectorAll('.sp-offer'));
  const tocLinks = Array.from(document.querySelectorAll('.sp-toc a'));
  if (offers.length) {
    const setOffer = () => {
      const line = window.innerHeight * 0.45;
      let active = offers[0];
      offers.forEach((o) => { if (o.getBoundingClientRect().top <= line) active = o; });
      offers.forEach((o) => o.classList.toggle('is-on', o === active));
      tocLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === `#${active.id}`));
    };
    window.addEventListener('scroll', setOffer, { passive: true });
    setOffer();
  }

  // ── Atouts : halo qui suit le curseur ──
  document.querySelectorAll('.sp-tile').forEach((tile) => {
    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty('--x', `${e.clientX - r.left}px`);
      tile.style.setProperty('--y', `${e.clientY - r.top}px`);
    });
  });

  const risks = document.querySelector('.sp-risks');
  const steps = Array.from(document.querySelectorAll('.sp-step'));

  if (reduced || !gsap || !ScrollTrigger) {
    if (risks) risks.classList.add('is-static');
    steps.forEach((s) => s.classList.add('is-on'));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // ── Hero : le prisme tourne et s'éloigne, le texte remonte ──
  const hero = document.querySelector('.sp-hero');
  if (hero) {
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 } });
    [
      ['.sp-prism', { rotate: 40, scale: 1.35, yPercent: -62, autoAlpha: 0.2 }],
      ['.sp-hero-copy', { yPercent: -18, autoAlpha: 0 }],
      ['.sp-aurora', { yPercent: 18, scale: 1.2 }]
    ].forEach(([sel, vars]) => {
      const el = hero.querySelector(sel);
      if (el) tl.to(el, vars, 0);
    });
  }

  // ── Bandeau : défile en continu, accélère et s'inverse avec le scroll ──
  const rows = gsap.utils.toArray('.sp-marquee-row');
  if (rows.length) {
    const loops = rows.map((row, i) => {
      row.innerHTML += row.innerHTML; // double le contenu pour une boucle sans couture
      const dir = i % 2 ? 1 : -1;
      return gsap.fromTo(row, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: 38, ease: 'none', repeat: -1 });
    });
    let speed = 1;
    ScrollTrigger.create({
      trigger: '.sp-marquee',
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        speed = gsap.utils.clamp(-6, 6, self.getVelocity() / 220) || speed;
      }
    });
    gsap.ticker.add(() => {
      speed += ((speed < 0 ? -1 : 1) - speed) * 0.05; // revient doucement à la vitesse de base
      loops.forEach((l) => l.timeScale(speed));
    });
  }

  // ── Contexte : la phrase s'éclaire mot à mot ──
  const statement = document.querySelector('.sp-statement .sp-h2');
  if (statement) {
    const words = [];
    const split = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) { Array.from(node.childNodes).forEach(split); return; }
      if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(' '); return; }
        const span = document.createElement('span');
        span.className = 'sp-w';
        span.textContent = part;
        words.push(span);
        frag.append(span);
      });
      node.replaceWith(frag);
    };
    Array.from(statement.childNodes).forEach(split);
    gsap.fromTo(words, { opacity: 0.16 }, {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 40%', scrub: 0.3 }
    });
  }

  // ── Risques : défilement horizontal épinglé (grand écran seulement) ──
  if (risks) {
    const track = risks.querySelector('.sp-track');
    const bar = risks.querySelector('.sp-progress i');
    const count = risks.querySelector('.sp-risks-count b');
    const cards = Array.from(track.children);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
        risks.classList.remove('is-static');
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: risks,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar) bar.style.transform = `scaleX(${self.progress})`;
              if (count) count.textContent = String(Math.min(cards.length, Math.round(self.progress * (cards.length - 1)) + 1)).padStart(2, '0');
            }
          }
        });
        cards.forEach((card) => {
          gsap.fromTo(card, { rotate: 4, scale: 0.9 }, {
            rotate: 0,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'left 45%', scrub: true }
          });
        });
        return () => gsap.set(track, { clearProps: 'transform' });
    });
    mm.add('(max-width: 899px)', () => {
        risks.classList.add('is-static');
        cards.forEach((card) => {
          gsap.from(card, { y: 60, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
        });
    });
  }

  // ── Phrase clé : le halo grandit, le texte se resserre ──
  const quote = document.querySelector('.sp-quote');
  if (quote) {
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: quote, start: 'top bottom', end: 'bottom top', scrub: true } })
      .fromTo(quote, { '--sp-glow': 0.35 }, { '--sp-glow': 1.25 }, 0)
      .fromTo(quote.querySelector('p'), { scale: 0.86, letterSpacing: '0.02em' }, { scale: 1.04, letterSpacing: '-0.05em' }, 0);
  }

  // ── Méthode : la ligne se trace et allume les étapes ──
  const fill = document.querySelector('.sp-steps-fill');
  if (fill) {
    gsap.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.sp-steps', start: 'top 65%', end: 'bottom 65%', scrub: 0.4 } });
  }
  steps.forEach((step) => {
    ScrollTrigger.create({ trigger: step, start: 'top 65%', onEnter: () => step.classList.add('is-on'), onLeaveBack: () => step.classList.remove('is-on') });
  });

  // ── Atouts : la grille s'assemble ──
  const tiles = gsap.utils.toArray('.sp-tile');
  if (tiles.length) {
    gsap.from(tiles, { y: 70, scale: 0.94, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.sp-bento', start: 'top 82%' } });
  }
})();
