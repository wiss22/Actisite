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
        scrub: 0.4,
        invalidateOnRefresh: true,
        // Défilement natif (fluide dans les deux sens) ; dès qu'on s'arrête, la
        // page se cale sur le panneau suivant ou précédent dans le sens du
        // défilement : on ne reste jamais entre deux panneaux.
        snap: { snapTo: 1 / (panels.length - 1), directional: true, inertia: false, duration: { min: 0.3, max: 0.7 }, delay: 0.06, ease: 'power2.inOut' }
      }
    });

    panels.forEach((panel, k) => {
      // Assombrissement par un voile (opacité) plutôt qu'un filtre : un filtre sur
      // un élément en 3D fait clignoter le panneau en noir pendant le défilement.
      const shade = panel.querySelector('.xh-shade');
      // Profondeur : le panneau arrive de loin (petit, pivoté), passe au premier
      // plan au centre, puis recule en partant vers la gauche.
      if (k > 0) {
        const enter = { trigger: panel, containerAnimation: move, start: 'left right', end: 'left 12%', scrub: true };
        gsap.fromTo(panel, { scale: 0.82, rotationY: -14 }, { scale: 1, rotationY: 0, ease: 'none', scrollTrigger: enter });
        gsap.fromTo(shade, { opacity: 0.45 }, { opacity: 0, ease: 'none', scrollTrigger: { ...enter } });
      }
      if (k < panels.length - 1) {
        const leave = { trigger: panel, containerAnimation: move, start: 'right 50%', end: 'right left', scrub: true }; // recule seulement une fois sorti du centre
        gsap.to(panel, { scale: 0.86, rotationY: 12, ease: 'none', immediateRender: false, scrollTrigger: leave });
        gsap.to(shade, { opacity: 0.5, ease: 'none', immediateRender: false, scrollTrigger: { ...leave } });
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
      // Le premier panneau est déjà en place au départ : pas d'entrée pour lui.
      if (k > 0) gsap.from(panel.querySelectorAll('.xh-offers li'), {
        x: 70, autoAlpha: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left 65%' }
      });
    });

    // Tabuler vers une offre d'un panneau hors écran amène ce panneau au centre.
    const st = move.scrollTrigger;
    const last = panels.length - 1;
    const stepY = (k) => st.start + (k / last) * (st.end - st.start);
    const onFocus = (e) => {
      const panel = e.target.closest('.xh-panel');
      if (!panel) return;
      window.scrollTo({ top: stepY(panels.indexOf(panel)) });
    };
    section.addEventListener('focusin', onFocus);

    // Clavier : flèches, Page suivante/précédente et espace passent d'un panneau
    // à l'autre pendant que la section est épinglée. La molette et le pavé
    // tactile gardent le défilement natif (calé par le snap ci-dessus).
    let busy = false;
    const current = () => Math.round(((window.scrollY - st.start) / (st.end - st.start)) * last);
    const inside = () => window.scrollY >= st.start - 2 && window.scrollY <= st.end + 2;
    const go = (k) => {
      busy = true;
      const pos = { y: window.scrollY };
      gsap.to(pos, { y: stepY(k), duration: 0.7, ease: 'power2.inOut', onUpdate: () => window.scrollTo(0, pos.y), onComplete: () => { busy = false; } });
    };
    const keys = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ' ': 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 };
    const onKey = (e) => {
      if (!(e.key in keys) || e.target.closest('input, textarea, select') || !inside()) return;
      const dir = e.key === ' ' && e.shiftKey ? -1 : keys[e.key];
      const next = current() + dir;
      if (next < 0 || next > last) return;
      e.preventDefault();
      if (!busy) go(next);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      section.classList.remove('xh--h');
      section.removeEventListener('focusin', onFocus);
      window.removeEventListener('keydown', onKey);
      gsap.set([track, ...panels], { clearProps: 'all' });
    };
  });
})();
