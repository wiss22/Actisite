/* Édition « À la une » : Swift CSP — mouvements propres à la page.
   Chargé après ax-spot.js. Sans GSAP ou en mouvement réduit, tout reste
   affiché dans son état final (cases cochées, textes pleins). */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // ── Évolutions : écran partagé, le grand numéro collant suit l'évolution lue ──
  // En mouvement réduit, le numéro change sans transition ni atténuation.
  const evo = document.querySelector('.sw-evo');
  if (evo) {
    const items = Array.from(evo.querySelectorAll('.sw-evo-item'));
    const list = evo.querySelector('.sw-evo-list');
    mm.add('(min-width: 900px)', () => {
      const setIndex = (i) => {
        evo.dataset.i = String(i);
        evo.style.setProperty('--sw-i', i);
        items.forEach((it, k) => it.classList.toggle('is-on', k === i));
      };
      if (!reduced) evo.classList.add('is-live');
      setIndex(0);
      items.forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => { if (self.isActive) setIndex(i); }
        });
      });
      ScrollTrigger.create({
        trigger: list,
        start: 'top 55%',
        end: 'bottom 55%',
        onUpdate: (self) => evo.style.setProperty('--sw-p', self.progress.toFixed(3))
      });
      return () => {
        evo.classList.remove('is-live');
        delete evo.dataset.i;
        evo.style.removeProperty('--sw-i');
        evo.style.removeProperty('--sw-p');
        items.forEach((it) => it.classList.remove('is-on'));
      };
    });
  }

  if (reduced) return;

  // ── Hero : le réseau s'ouvre, ses faces s'écartent du centre ──
  const net = document.querySelector('.sw-net svg');
  if (net) {
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.sw-hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });
    tl.to(net, { rotate: -14, scale: 1.18, yPercent: -22, autoAlpha: 0.25 }, 0);
    net.querySelectorAll('.sw-face').forEach((face) => {
      const b = face.getBBox();
      const dx = b.x + b.width / 2 - 320;
      const dy = b.y + b.height / 2 - 330;
      tl.to(face, { x: dx * 0.5, y: dy * 0.5 }, 0);
    });
  }

  // ── Contexte : chaque entrée du registre trace sa ligne et remplit son numéro ──
  const ledger = document.querySelector('.sw-ledger');
  if (ledger) {
    ledger.classList.add('is-live');
    ledger.querySelectorAll('.sw-entry').forEach((entry) => {
      gsap.to(entry.querySelector('.sw-entry-rule'), {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: entry, start: 'top 88%', end: 'top 50%', scrub: 0.4 }
      });
      ScrollTrigger.create({
        trigger: entry,
        start: 'top 62%',
        onEnter: () => entry.classList.add('is-on'),
        onLeaveBack: () => entry.classList.remove('is-on')
      });
    });
  }

  // ── Phrase clé : une ligne de lecture balaie le texte et le révèle ──
  const qbox = document.querySelector('.sw-quote-box');
  if (qbox) {
    gsap.fromTo(qbox, { '--sw-hide': '100%' }, {
      '--sw-hide': '0%',
      ease: 'none',
      scrollTrigger: {
        trigger: qbox,
        start: 'top 78%',
        end: 'bottom 42%',
        scrub: 0.4,
        onUpdate: (self) => qbox.style.setProperty('--sw-scan', self.progress > 0.01 && self.progress < 0.99 ? 1 : 0)
      }
    });
  }

  // ── Méthode : le dossier de preuves se coche au fil des étapes ──
  const proof = document.querySelector('.sw-proof');
  if (proof) {
    const proofs = Array.from(proof.querySelectorAll('li'));
    const steps = Array.from(document.querySelectorAll('#methode .sp-step'));
    const refresh = () => proof.style.setProperty('--sw-done', (proofs.filter((p) => p.classList.contains('is-done')).length / proofs.length).toFixed(2));
    const bind = (trigger, li, start) => ScrollTrigger.create({
      trigger,
      start,
      onEnter: () => { li.classList.add('is-done'); refresh(); },
      onLeaveBack: () => { li.classList.remove('is-done'); refresh(); }
    });
    const live = (fn) => () => {
      proof.classList.add('is-live');
      fn();
      refresh();
      return () => {
        proof.classList.remove('is-live');
        proofs.forEach((p) => p.classList.remove('is-done'));
        proof.style.removeProperty('--sw-done');
      };
    };
    // Grand écran : le panneau collant se coche quand chaque étape s'allume.
    mm.add('(min-width: 1001px)', live(() => proofs.forEach((li, i) => { if (steps[i]) bind(steps[i], li, 'top 65%'); })));
    // Écran étroit : le panneau est sous les étapes, chaque ligne se coche en entrant.
    mm.add('(max-width: 1000px)', live(() => proofs.forEach((li) => bind(li, li, 'top 80%'))));
  }
})();
