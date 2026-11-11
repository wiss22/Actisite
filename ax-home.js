/* Accueil — section « Quatre expertises » : cube 3D épinglé.
   Chargé après ax.js. Sans GSAP, en mobile ou en mouvement réduit,
   la section reste en liste empilée (aucun script nécessaire). */
(() => {
  const section = document.querySelector('.xp');
  const { gsap, ScrollTrigger } = window;
  if (!section || !gsap || !ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  const pin = section.querySelector('.xp-pin');
  const tilt = section.querySelector('.xp-tilt');
  const cube = section.querySelector('.xp-cube');
  const glow = section.querySelector('.xp-glow');
  const faces = Array.from(section.querySelectorAll('.xp-face'));
  const items = Array.from(section.querySelectorAll('.xp-item'));
  const dots = Array.from(section.querySelectorAll('.xp-dots i'));
  const glows = ['rgba(139, 76, 245, 0.5)', 'rgba(241, 136, 71, 0.45)', 'rgba(199, 160, 255, 0.45)', 'rgba(241, 136, 71, 0.4)'];

  // Au repos, le cube reste tourné de quelques degrés : on voit le bord
  // de la face suivante, donc le volume.
  const REST = -22;

  const mm = gsap.matchMedia();
  mm.add('(min-width: 1000px)', () => {
    section.classList.add('xp--3d');
    let current = -1;
    const setActive = (i) => {
      if (i === current) return;
      current = i;
      faces.forEach((f, k) => f.classList.toggle('is-on', k === i));
      items.forEach((it, k) => it.classList.toggle('is-on', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
      glow.style.setProperty('--glow', glows[i]);
    };

    // 1. Arrivée : les faces, écartées et le cube basculé, se referment.
    const intro = gsap.timeline({
      scrollTrigger: { trigger: pin, start: 'top 90%', end: 'top top', scrub: 0.8 }
    });
    intro.fromTo(faces, { '--gap': '220px' }, { '--gap': '0px', ease: 'power2.out' }, 0)
      .fromTo(tilt, { rotationX: 38, scale: 0.7 }, { rotationX: -12, scale: 1, ease: 'power2.out' }, 0)
      .fromTo(cube, { rotationY: -75 }, { rotationY: REST, ease: 'power2.out', immediateRender: false }, 0);

    // 2. Épinglage : le cube tourne d'un quart de tour par expertise.
    //    Chaque face reste un moment de face (paliers) avant de pivoter.
    const turn = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    turn.to({}, { duration: 0.6 }); // la première face reste un moment de face
    for (let k = 1; k < 4; k += 1) {
      turn.to(cube, { rotationY: -90 * k + REST, duration: 1 }).to({}, { duration: 0.6 });
    }
    const st = ScrollTrigger.create({
      trigger: pin,
      start: 'top top',
      end: () => `+=${window.innerHeight * 3}`,
      pin: true,
      scrub: 0.6,
      animation: turn,
      onUpdate: () => {
        // La face la plus tournée vers nous est l'expertise active.
        const y = gsap.getProperty(cube, 'rotationY');
        setActive(Math.max(0, Math.min(3, Math.round(-y / 90))));
      },
      invalidateOnRefresh: true
    });
    setActive(0);

    // Cliquer une face (ou tabuler vers une expertise) amène à son étape.
    const total = turn.duration();
    const stepAt = [0, 1, 2, 3].map((k) => (k * 1.6 + 0.3) / total); // milieu de chaque palier
    const goTo = (i) => {
      const y = st.start + stepAt[i] * (st.end - st.start);
      window.scrollTo({ top: y, behavior: 'smooth' });
    };
    const onFace = (e) => goTo(Number(e.currentTarget.dataset.i));
    faces.forEach((f) => f.addEventListener('click', onFace));
    const onFocus = (e) => {
      const it = e.target.closest('.xp-item');
      if (it && !it.classList.contains('is-on')) goTo(Number(it.dataset.i));
    };
    section.addEventListener('focusin', onFocus);

    return () => {
      section.classList.remove('xp--3d');
      faces.forEach((f) => f.removeEventListener('click', onFace));
      section.removeEventListener('focusin', onFocus);
      gsap.set([tilt, cube, ...faces], { clearProps: 'all' });
    };
  });
})();
