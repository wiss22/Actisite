/* Accueil — section « Quatre expertises » : défilement horizontal épinglé.
   Chargé après ax.js. Sans GSAP, en mobile ou en mouvement réduit,
   les panneaux restent empilés (aucun script nécessaire). */
(() => {
  const section = document.querySelector('.xh');
  const { gsap, ScrollTrigger } = window;
  if (!section || !gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  const pin = section.querySelector('.xh-pin');
  const track = section.querySelector('.xh-track');
  const panels = Array.from(section.querySelectorAll('.xh-panel'));

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1000px)', () => {
    section.classList.add('xh--h');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const move = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true
      }
    });

    panels.forEach((panel, k) => {
      // Profondeur : le panneau arrive de loin (petit, pivoté), passe au premier
      // plan au centre, puis recule en partant vers la gauche.
      if (k > 0) {
        gsap.fromTo(panel, { scale: 0.82, rotationY: -14, filter: 'brightness(0.6)' }, {
          scale: 1, rotationY: 0, filter: 'brightness(1)', ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left right', end: 'left 12%', scrub: true }
        });
      }
      if (k < panels.length - 1) {
        gsap.to(panel, {
          scale: 0.86, rotationY: 12, filter: 'brightness(0.55)', ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: panel, containerAnimation: move, start: 'right 70%', end: 'right left', scrub: true }
        });
      }
      // Couches : le grand numéro et le halo glissent à une autre vitesse.
      const big = panel.querySelector('.xh-big');
      const orb = panel.querySelector('.xh-orb');
      gsap.fromTo(big, { xPercent: 35 }, {
        xPercent: -35, ease: 'none',
        scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left right', end: 'right left', scrub: true }
      });
      gsap.fromTo(orb, { xPercent: -30, yPercent: 10 }, {
        xPercent: 60, yPercent: -10, ease: 'none',
        scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left right', end: 'right left', scrub: true }
      });
      // Les offres arrivent l'une après l'autre quand le panneau entre.
      // On anime l'élément de liste, pas le lien : celui-ci a sa propre transition au survol.
      gsap.from(panel.querySelectorAll('.xh-offers li'), {
        x: 70, autoAlpha: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left 65%' }
      });
    });

    // Tabuler vers une offre d'un panneau hors écran amène ce panneau au centre.
    const st = move.scrollTrigger;
    const onFocus = (e) => {
      const panel = e.target.closest('.xh-panel');
      if (!panel) return;
      const k = panels.indexOf(panel);
      window.scrollTo({ top: st.start + (k / (panels.length - 1)) * (st.end - st.start) });
    };
    section.addEventListener('focusin', onFocus);

    return () => {
      section.classList.remove('xh--h');
      section.removeEventListener('focusin', onFocus);
      gsap.set([track, ...panels], { clearProps: 'all' });
    };
  });
})();
