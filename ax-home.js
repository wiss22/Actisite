/* Accueil — section « Quatre expertises » : pyramide en relief épinglée.
   Chargé après ax.js. Sans GSAP, en mobile ou en mouvement réduit,
   la section reste en liste empilée (aucun script nécessaire). */
(() => {
  const section = document.querySelector('.xp');
  const { gsap, ScrollTrigger } = window;
  if (!section || !gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  const pin = section.querySelector('.xp-pin');
  const rot = section.querySelector('.xp-rot');
  const glow = section.querySelector('.xp-glow');
  const pieces = Array.from(section.querySelectorAll('.xp-piece'));
  const items = Array.from(section.querySelectorAll('.xp-item'));
  const dots = Array.from(section.querySelectorAll('.xp-dots i'));
  const glows = ['rgba(139, 76, 245, 0.55)', 'rgba(241, 136, 71, 0.5)', 'rgba(199, 160, 255, 0.5)', 'rgba(106, 53, 146, 0.6)'];
  // Position « éclatée » de chaque pièce avant l'assemblage.
  const burst = [
    { x: 0, y: -140, z: 120, rotationZ: -18 },
    { x: -170, y: 90, z: 60, rotationZ: 14 },
    { x: 170, y: 90, z: 60, rotationZ: -14 },
    { x: 0, y: 40, z: 220, rotationX: 40 }
  ];

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1000px)', () => {
    section.classList.add('xp--3d');
    let current = -1;
    const setActive = (i) => {
      if (i === current) return;
      current = i;
      pieces.forEach((p, k) => {
        p.classList.toggle('is-on', k === i);
        gsap.to(p, { z: k === i ? 120 : 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
      });
      items.forEach((it, k) => it.classList.toggle('is-on', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
      glow.style.setProperty('--glow', glows[i]);
    };

    // 1. Assemblage pendant que la section arrive à l'écran.
    gsap.set(pieces, { scale: 0.93 });
    const intro = gsap.timeline({
      scrollTrigger: { trigger: pin, start: 'top 90%', end: 'top top', scrub: 0.8 }
    });
    intro.fromTo(rot, { rotationX: 64, rotationY: 0, rotationZ: -24 }, { rotationX: 22, rotationY: -16, rotationZ: 0, ease: 'power2.out' }, 0);
    pieces.forEach((p, k) => {
      intro.fromTo(p, { ...burst[k] }, { x: 0, y: 0, z: 0, rotationX: 0, rotationZ: 0, ease: 'power2.out' }, 0);
    });

    // 2. Épinglage : une expertise par quart du défilement, la pyramide tourne.
    const st = ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: () => `+=${window.innerHeight * 3}`,
      pin: true,
      scrub: 0.6,
      animation: gsap.fromTo(rot, { rotationY: -16, rotationX: 22 }, { rotationY: 20, rotationX: 14, ease: 'none', immediateRender: false }),
      onUpdate: (self) => setActive(Math.min(3, Math.floor(self.progress * 4))),
      invalidateOnRefresh: true
    });
    setActive(0);

    // Cliquer une pièce (ou tabuler vers une expertise) amène à son étape.
    const goTo = (i) => {
      const y = st.start + ((i + 0.5) / 4) * (st.end - st.start);
      window.scrollTo({ top: y, behavior: 'smooth' });
    };
    const onPiece = (e) => goTo(Number(e.currentTarget.dataset.i));
    pieces.forEach((p) => p.addEventListener('click', onPiece));
    const onFocus = (e) => {
      const it = e.target.closest('.xp-item');
      if (it && !it.classList.contains('is-on')) goTo(Number(it.dataset.i));
    };
    section.addEventListener('focusin', onFocus);

    return () => {
      section.classList.remove('xp--3d');
      pieces.forEach((p) => p.removeEventListener('click', onPiece));
      section.removeEventListener('focusin', onFocus);
      gsap.set([rot, ...pieces], { clearProps: 'all' });
      items.forEach((it) => it.classList.remove('is-on'));
    };
  });
})();
