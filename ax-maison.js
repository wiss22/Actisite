/* Secteurs (édition « Maison ») — mouvements lents et discrets (édition « Maison »). */
(() => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  const ease = 'power2.out';

  // Hero : le picto et son monogramme s'éloignent lentement, le texte s'efface en douceur.
  const hero = document.querySelector('.lx-hero');
  if (hero) {
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 } });
    [
      ['.lx-mono', { scale: 1.3, rotate: 8, autoAlpha: 0.15 }],
      ['.lx-picto', { yPercent: 18, autoAlpha: 0.3 }],
      ['.lx-hero-copy', { yPercent: -10, autoAlpha: 0 }]
    ].forEach(([sel, vars]) => {
      const el = hero.querySelector(sel);
      if (el) tl.to(el, vars, 0);
    });
  }

  // Priorités : chaque filet se trace, puis le texte apparaît.
  gsap.utils.toArray('.lx-item').forEach((item) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 85%' } });
    tl.fromTo(item, { '--lx-x': 0 }, { '--lx-x': 1, duration: 1.2, ease }, 0)
      .from(item.children, { y: 18, autoAlpha: 0, duration: 1.1, ease, stagger: 0.12 }, 0.2);
  });

  // Notre réponse : les filets verticaux descendent, les colonnes arrivent l'une après l'autre.
  const cols = gsap.utils.toArray('.lx-col');
  if (cols.length) {
    gsap.timeline({ scrollTrigger: { trigger: '.lx-cols', start: 'top 80%' } })
      .from(cols, { y: 30, autoAlpha: 0, duration: 1.3, ease, stagger: 0.22 })
      .fromTo('.lx-cols', { '--lx-col': 0 }, { '--lx-col': 1, duration: 1.4, ease }, 0);
  }

  // Titres : apparition par masque, ligne après ligne.
  gsap.utils.toArray('.lx-title, .lx-contact h2').forEach((title) => {
    gsap.from(title, { clipPath: 'inset(0 0 100% 0)', y: 24, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: title, start: 'top 85%' } });
  });

  // Index des autres secteurs : les lignes glissent depuis la gauche.
  const rows = gsap.utils.toArray('.lx-index li');
  if (rows.length) {
    gsap.from(rows, { x: -30, autoAlpha: 0, duration: 1.1, ease, stagger: 0.1, scrollTrigger: { trigger: '.lx-index', start: 'top 85%' } });
  }
})();
