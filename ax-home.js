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
        invalidateOnRefresh: true,
        // Si le défilement s'arrête entre deux panneaux (barre de défilement,
        // glissé), la page se cale sur le panneau le plus proche.
        snap: { snapTo: 1 / (panels.length - 1), directional: false, inertia: false, duration: { min: 0.25, max: 0.6 }, delay: 0.08, ease: 'power2.inOut' }
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

    // Défilement panneau par panneau : pendant que la section est épinglée,
    // un geste (molette, pavé tactile, touche) amène au panneau suivant ou
    // précédent. Avant le premier et après le dernier, la page défile normalement.
    let busy = false;
    let lastInput = 0;
    const current = () => Math.round(((window.scrollY - st.start) / (st.end - st.start)) * last);
    const go = (k) => {
      busy = true;
      const pos = { y: window.scrollY };
      gsap.to(pos, {
        y: stepY(k),
        duration: 0.85,
        ease: 'power2.inOut',
        onUpdate: () => window.scrollTo(0, pos.y),
        onComplete: () => { busy = false; }
      });
    };
    // Renvoie true si le geste a été pris en charge (et la page ne doit pas défiler).
    // Bornes propres : st.isActive est faux pile sur le premier ou le dernier panneau.
    const inside = () => window.scrollY >= st.start - 2 && window.scrollY <= st.end + 2;
    const step = (dir) => {
      if (!inside()) return false;
      const next = current() + dir;
      if (next < 0 || next > last) return false;
      const now = performance.now();
      const fresh = now - lastInput > 260; // un nouveau geste, pas l'inertie du précédent
      lastInput = now;
      if (!busy && fresh) go(next);
      return true;
    };
    const onWheel = (e) => {
      const dir = Math.sign(Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX);
      if (dir && step(dir)) e.preventDefault();
      else if (busy) e.preventDefault();
    };
    const keys = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ' ': 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 };
    const onKey = (e) => {
      if (!(e.key in keys) || e.target.closest('input, textarea, select')) return;
      const dir = e.key === ' ' && e.shiftKey ? -1 : keys[e.key];
      lastInput = 0; // une touche est toujours un geste distinct
      if (step(dir)) e.preventDefault();
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);

    return () => {
      section.classList.remove('xh--h');
      section.removeEventListener('focusin', onFocus);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      gsap.set([track, ...panels], { clearProps: 'all' });
    };
  });
})();
