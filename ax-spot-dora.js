/* Édition « À la une » — DORA (.ax-spot--dora). Chargé après ax-spot.js.
   Bouclier collant du contexte, textes révélés par masque, phrase clé qui se remplit,
   axes en panneaux épinglés avec grand numéro, livrables cochés au fil de la méthode. */
(() => {
  const body = document.body;
  if (!body.classList.contains('ax-spot--dora')) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { gsap, ScrollTrigger } = window;

  const rings = Array.from(document.querySelectorAll('.dr-ring'));
  const enjeux = Array.from(document.querySelectorAll('.dr-enjeu'));
  const steps = Array.from(document.querySelectorAll('.sp-step'));
  const deliv = Array.from(document.querySelectorAll('.ax-deliv li'));

  if (reduced || !gsap || !ScrollTrigger) {
    rings.forEach((r) => r.classList.add('is-on'));
    deliv.forEach((li) => li.classList.add('is-done'));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // ── Hero : les ondes s'élargissent et s'effacent en quittant l'écran ──
  if (document.querySelector('.dr-waves')) {
    gsap.to('.dr-waves', {
      scale: 1.3,
      yPercent: -14,
      autoAlpha: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: '.sp-hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
    });
  }

  // ── Contexte : un anneau du bouclier s'allume par enjeu lu ──
  enjeux.forEach((enjeu, i) => {
    const ring = rings[i];
    if (ring) {
      ScrollTrigger.create({
        trigger: enjeu,
        start: 'top 62%',
        onEnter: () => ring.classList.add('is-on'),
        onLeaveBack: () => ring.classList.remove('is-on')
      });
    }
    // Le texte se dévoile de haut en bas, comme sous un masque qui descend.
    const text = enjeu.querySelector('.dr-enjeu-body');
    if (!text) return;
    text.classList.add('dr-masked');
    gsap.fromTo(text, { '--m': '0%' }, {
      '--m': '130%',
      ease: 'none',
      scrollTrigger: { trigger: enjeu, start: 'top 85%', end: 'top 35%', scrub: 0.4 }
    });
  });

  // ── Phrase clé : le niveau monte dans les lettres ──
  const quote = document.querySelector('.dr-quote p');
  if (quote) {
    gsap.fromTo(quote, { '--f': '0%' }, {
      '--f': '100%',
      ease: 'none',
      scrollTrigger: { trigger: '.dr-quote', start: 'top 70%', end: 'center 45%', scrub: 0.5 }
    });
  }

  // ── Lecture rapide : panneaux plein écran épinglés + grand numéro collant ──
  const axes = document.querySelector('.dr-axes');
  if (axes) {
    const stage = axes.querySelector('.dr-stage');
    const panels = Array.from(axes.querySelectorAll('.dr-axe'));
    const strip = axes.querySelector('.dr-num-strip');
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      axes.classList.add('is-pinned');
      // Le volet monte par le bas : --cp pilote clip-path (voir ax-spot-dora.css).
      gsap.set(panels.slice(1), { '--cp': '100%' });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${(panels.length - 1) * window.innerHeight * 1.1}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });
      panels.slice(1).forEach((panel, i) => {
        const at = 0.25 + i * 1.3;
        tl.fromTo(panel, { '--cp': '100%' }, { '--cp': '0%', duration: 1 }, at)
          .fromTo(panels[i].querySelector('.dr-axe-inner'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0.15, y: -40, duration: 1 }, at)
          .fromTo(panel.querySelector('.dr-axe-inner'), { y: 80 }, { y: 0, duration: 1 }, at);
        if (strip) {
          const n = panels.length;
          tl.fromTo(strip, { yPercent: (-100 * i) / n }, { yPercent: (-100 * (i + 1)) / n, duration: 0.5, ease: 'power2.inOut' }, at + 0.3);
        }
      });
      tl.to({}, { duration: 0.35 });
      return () => {
        axes.classList.remove('is-pinned');
        panels.forEach((p) => p.style.removeProperty('--cp'));
        gsap.set(panels.map((p) => p.querySelector('.dr-axe-inner')), { clearProps: 'all' });
        if (strip) gsap.set(strip, { clearProps: 'transform' });
      };
    });
    mm.add('(max-width: 899px)', () => {
      panels.forEach((panel) => {
        gsap.from(panel, { y: 60, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: panel, start: 'top 88%' } });
      });
    });
  }

  // ── Méthode : chaque étape franchie coche son livrable ──
  steps.forEach((step, i) => {
    const li = deliv[i];
    if (!li) return;
    ScrollTrigger.create({
      trigger: step,
      start: 'top 65%',
      onEnter: () => li.classList.add('is-done'),
      onLeaveBack: () => li.classList.remove('is-done')
    });
  });

  // Les déclencheurs posés avant l'épinglage (ax.js, ax-spot.js) sont recalculés dans l'ordre de la page.
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
})();
