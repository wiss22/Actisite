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
  // Repère d'avancement dans l'en-tête : l'expertise affichée est mise en avant.
  const marks = Array.from(section.querySelectorAll('.xh-index li'));
  const setMark = (index) => marks.forEach((mark, k) => mark.classList.toggle('is-active', k === index));

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
        onUpdate: (self) => setMark(Math.round(self.progress * (panels.length - 1))),
        // Défilement natif (fluide dans les deux sens) ; dès qu'on s'arrête, la
        // page se cale sur le panneau suivant ou précédent dans le sens du
        // défilement : on ne reste jamais entre deux panneaux.
        snap: { snapTo: 1 / (panels.length - 1), directional: true, inertia: false, duration: { min: 0.3, max: 0.7 }, delay: 0.06, ease: 'power2.inOut' }
      }
    });

    // Clic sur un repère : la page défile jusqu'au panneau correspondant.
    const goTo = (index) => {
      const st = move.scrollTrigger;
      const top = st.start + (index / (panels.length - 1)) * (st.end - st.start);
      // Défilement animé par GSAP (et non behavior: 'smooth') : il reste synchronisé
      // avec l'épinglage et s'arrête exactement sur le panneau.
      const pos = { y: window.scrollY };
      gsap.killTweensOf(pos);
      gsap.to(pos, {
        y: top,
        duration: 0.9,
        ease: 'power2.inOut',
        overwrite: true,
        onUpdate: () => window.scrollTo(0, pos.y)
      });
    };
    const onMark = marks.map((mark, k) => {
      const handler = () => goTo(k);
      mark.addEventListener('click', handler);
      return handler;
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
      setMark(0);
      marks.forEach((mark, k) => mark.removeEventListener('click', onMark[k]));
      section.removeEventListener('focusin', onFocus);
      window.removeEventListener('keydown', onKey);
      gsap.set([track, ...panels], { clearProps: 'all' });
    };
  });
})();

/* Accueil — encart « À la une » : carrousel des actus saisies dans Sanity (document
   homeFeatured, quatre au plus, avec leur photo). Rien n'est ajouté par défaut : sans
   document, sans entrée valide, interrupteur désactivé ou requête en échec, l'encart
   reste masqué. */
(() => {
  const list = document.getElementById('axUneList');
  if (!list) return;
  const box = list.closest('.ax-une');
  // L'encart est masqué dans le HTML ; il n'apparaît qu'avec au moins une actu.
  const reveal = (show) => { if (box) box.hidden = !show; };

  const MAX = 4;
  const DELAY = 6000;
  const projectId = 'vnmxplwi';
  const dataset = 'production';
  const apiVersion = '2024-10-01';
  const query = `*[_type == "homeFeatured"] | order(_updatedAt desc)[0]{ isPublished, items[]{ tag, label, description, url, "image": image.asset->url } }`;
  const endpoints = ['api', 'apicdn'].map((host) =>
    `https://${projectId}.${host}.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}`
  );
  // Lien interne (/page) ou externe en https uniquement.
  const safeUrl = (value) => (typeof value === 'string' && /^(\/(?!\/)|https:\/\/)/.test(value) ? value : null);
  // Photo : uniquement une image hébergée par Sanity, recadrée au format de l'encart.
  const photo = (value) => (typeof value === 'string' && value.startsWith('https://cdn.sanity.io/images/')
    ? `${value}?w=800&h=500&fit=crop&auto=format`
    : null);
  const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const part = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const slide = (item) => {
    const link = part('a', 'ax-une-item');
    link.href = item.url;
    const media = part('span', item.image ? 'ax-une-media' : 'ax-une-media ax-une-media--empty');
    media.setAttribute('aria-hidden', 'true');
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = '';
      img.decoding = 'async';
      media.append(img);
    }
    const body = part('span', 'ax-une-body');
    if (item.tag) body.append(part('span', 'ax-une-tag', item.tag));
    body.append(part('strong', '', item.title));
    if (item.desc) body.append(part('span', 'ax-une-desc', item.desc));
    link.append(media, body);
    const li = part('li', 'ax-une-slide');
    li.append(link);
    return li;
  };

  const ARROW = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  // Carrousel : une diapositive visible, défilement automatique. Le survol ou le focus de
  // l'actu suspend le minuteur, qui reprend ensuite là où il s'était arrêté.
  const start = () => {
    const slides = Array.from(list.children);
    if (!box || slides.length < 2) {
      slides.forEach((item) => item.classList.add('is-active'));
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    box.style.setProperty('--une-delay', `${DELAY}ms`);

    const nav = part('div', 'ax-une-nav');
    const dots = part('div', 'ax-une-dots');
    const arrows = part('div', 'ax-une-arrows');
    const arrow = (label, className, step) => {
      const button = part('button', `ax-une-arrow ${className}`);
      button.type = 'button';
      button.setAttribute('aria-label', label);
      button.innerHTML = ARROW;
      button.addEventListener('click', () => go(current + step));
      return button;
    };
    const marks = slides.map((item, k) => {
      const dot = part('button', 'ax-une-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Actu ${k + 1} sur ${slides.length}`);
      dot.append(document.createElement('i'));
      dot.addEventListener('click', () => { if (k !== current) go(k); });
      dots.append(dot);
      return dot;
    });
    arrows.append(arrow('Actu précédente', 'ax-une-arrow--prev', -1), arrow('Actu suivante', 'ax-une-arrow--next', 1));
    nav.append(dots, arrows);
    box.append(nav);

    let current = 0;
    let timer = null;
    let remaining = DELAY;
    let startedAt = 0;
    const holds = new Set();
    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((item, k) => {
        item.classList.toggle('is-active', k === current);
        item.inert = k !== current;
      });
      marks.forEach((dot, k) => {
        dot.classList.toggle('is-active', k === current);
        dot.classList.toggle('is-done', k < current);
        dot.setAttribute('aria-current', k === current ? 'true' : 'false');
      });
    };
    const pause = () => {
      if (timer === null) return;
      clearTimeout(timer);
      timer = null;
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
      box.classList.add('is-paused');
    };
    const resume = () => {
      if (reduced || holds.size || timer !== null) return;
      startedAt = Date.now();
      box.classList.remove('is-paused');
      timer = setTimeout(() => { timer = null; go(current + 1); }, remaining);
    };
    // Nouvelle diapositive : la barre de progression repart de zéro pour celle-ci.
    const go = (index) => {
      clearTimeout(timer);
      timer = null;
      remaining = DELAY;
      show(index);
      if (reduced) return;
      box.classList.remove('is-playing');
      void box.offsetWidth;
      box.classList.add('is-playing');
      box.classList.toggle('is-paused', holds.size > 0);
      resume();
    };
    const hold = (key, value) => {
      if (value) { holds.add(key); pause(); } else { holds.delete(key); resume(); }
    };
    // Seule l'actu elle-même suspend le défilement, pas les flèches ni les barres.
    list.addEventListener('mouseenter', () => hold('hover', true));
    list.addEventListener('mouseleave', () => hold('hover', false));
    list.addEventListener('focusin', () => hold('focus', true));
    list.addEventListener('focusout', (event) => { if (!list.contains(event.relatedTarget)) hold('focus', false); });
    document.addEventListener('visibilitychange', () => hold('tab', document.hidden));

    go(0);
  };

  // Exemple hors Sanity, pour juger du rendu : ajouter ?une=exemple à l'adresse.
  // Ignoré sur le site public (www.actinuance.com).
  const isPublicSite = /(^|\.)actinuance\.com$/.test(window.location.hostname);
  if (!isPublicSite && new URLSearchParams(window.location.search).get('une') === 'exemple') {
    list.replaceChildren(...[
      { tag: 'Actualité', title: 'Actinuance ouvre son offre Cyber 4 AI', desc: 'Sécuriser les usages et les systèmes d’IA, du cadrage aux contrôles.', url: '/cyber-4-ai', image: 'Photos/optimized/Workshop-900.jpg' },
      { tag: 'Événement', title: 'Retrouvez-nous aux Assises de la cybersécurité', desc: 'Trois jours d’échanges avec nos experts sur DORA, NIS 2 et la résilience.', url: '/blog', image: 'Photos/optimized/photogroupe-900.jpg' },
      { tag: 'Publication', title: 'DORA, un an après : ce qui a vraiment changé', desc: 'Retour sur les premiers contrôles et les chantiers encore ouverts.', url: '/dora', image: 'Photos/optimized/situation1-900.jpg' },
    ].map(slide));
    reveal(true);
    start();
    return;
  }

  (async () => {
    let data = null;
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { headers: { Accept: 'application/json' }, cache: 'no-store' });
        if (!response.ok) continue;
        const json = await response.json();
        if (json && 'result' in json) { data = json.result; break; }
      } catch (_) {
        // essai sur le point d'accès suivant
      }
    }
    if (!data || data.isPublished === false) { reveal(false); return; }

    const rows = (data.items || [])
      .map((item) => ({
        tag: clean(item && item.tag),
        title: clean(item && item.label),
        desc: clean(item && item.description),
        url: safeUrl(item && item.url),
        image: photo(item && item.image),
      }))
      .filter((item) => item.title && item.url)
      .slice(0, MAX)
      .map(slide);
    if (!rows.length) { reveal(false); return; }
    list.replaceChildren(...rows);
    reveal(true);
    start();
  })();
})();

/* Accueil — « Notre différence » : sur écran tactile (pas de survol), un toucher
   retourne la carte ; Entrée ou Espace font de même au clavier. */
(() => {
  const cards = document.querySelectorAll('.df-card');
  if (!cards.length) return;
  const touchOnly = window.matchMedia('(hover: none)');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (touchOnly.matches) card.classList.toggle('is-flipped');
    });
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      card.classList.toggle('is-flipped');
    });
  });
})();
