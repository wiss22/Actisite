/* Pages « ax » (accueil, pilier, offre) — carrousel du hero, onglets, barre de sections,
   titres mot à mot, effets de défilement. Chaque bloc ne s'active que si ses éléments existent. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Flèches clavier communes aux deux groupes d'onglets.
  const arrowNav = (tabs, i, e, go) => {
    const last = tabs.length - 1;
    const to = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    go(to);
    tabs[to].focus();
  };

  // ── Hero : carrousel des offres ────────────────
  const hero = document.getElementById('hero');
  const slides = hero ? Array.from(hero.querySelectorAll('.ax-slide')) : [];
  const heroTabs = hero ? Array.from(hero.querySelectorAll('.ax-hero-tab')) : [];

  if (slides.length && slides.length === heroTabs.length) {
    const DURATION = 7000;
    let current = 0;
    let elapsed = 0;
    let last = performance.now();
    let focused = false;
    let onScreen = true;

    const fill = (i, ratio) => {
      heroTabs[i].querySelector('i').style.transform = `scaleX(${ratio})`;
    };

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      elapsed = 0;
      hero.dataset.slide = current;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === current);
        slide.inert = i !== current;
      });
      heroTabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === current));
        tab.tabIndex = i === current ? 0 : -1;
        fill(i, reduced && i === current ? 1 : 0);
      });
    };

    heroTabs.forEach((tab, i) => {
      tab.addEventListener('click', () => show(i));
      tab.addEventListener('keydown', (e) => arrowNav(heroTabs, i, e, show));
    });

    hero.addEventListener('focusin', () => { focused = true; });
    hero.addEventListener('focusout', () => { focused = false; });
    new IntersectionObserver(([entry]) => { onScreen = entry.intersectionRatio > 0.4; }, { threshold: [0, 0.4, 1] }).observe(hero);

    let startX = null;
    hero.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    });

    show(0);

    if (!reduced) {
      const tick = (now) => {
        const dt = Math.min(now - last, 100);
        last = now;
        if (!focused && onScreen && !document.hidden) {
          elapsed += dt;
          if (elapsed >= DURATION) show(current + 1);
          else fill(current, elapsed / DURATION);
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  // Les triangles du hero suivent légèrement le curseur.
  const heroArt = hero ? hero.querySelector('.ax-hero-art') : null;
  if (heroArt && !reduced && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      heroArt.style.setProperty('--mx', (((e.clientX - r.left) / r.width - 0.5) * -34).toFixed(1));
      heroArt.style.setProperty('--my', (((e.clientY - r.top) / r.height - 0.5) * -34).toFixed(1));
    });
  }

  // ── Barre de sections : surligne la section en cours ──
  const subLinks = Array.from(document.querySelectorAll('.ax-subnav a[href^="#"]'));
  if (subLinks.length) {
    const targets = subLinks
      .map((link) => ({ link, el: document.getElementById(link.getAttribute('href').slice(1)) }))
      .filter((t) => t.el);
    const spy = () => {
      const line = window.innerHeight * 0.35;
      let active = null;
      targets.forEach((t) => {
        if (t.el.getBoundingClientRect().top <= line) active = t;
      });
      targets.forEach((t) => t.link.classList.toggle('is-on', t === active));
    };
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }

  // La barre de sections part en bas de l'écran dès qu'on défile, et s'efface devant le pied de page.
  const subnav = document.querySelector('.ax-subnav');
  if (subnav) {
    const anchor = subnav.parentElement;
    const footer = document.querySelector('footer');
    const dock = () => {
      subnav.classList.toggle('is-docked', anchor.getBoundingClientRect().top < window.innerHeight * 0.45);
      subnav.classList.toggle('is-away', Boolean(footer) && footer.getBoundingClientRect().top < window.innerHeight - 40);
    };
    window.addEventListener('scroll', dock, { passive: true });
    window.addEventListener('resize', dock);
    dock();
  }

  // ── Secteurs : onglets ─────────────────────────
  const tabs = Array.from(document.querySelectorAll('.ax-seg [role="tab"]'));
  const selectSector = (index) => {
    tabs.forEach((t, i) => {
      const on = i === index;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectSector(i));
    tab.addEventListener('keydown', (e) => arrowNav(tabs, i, e, selectSector));
  });

  if (reduced) return;

  // ── Titres de section : apparition mot à mot ───
  const headings = Array.from(document.querySelectorAll('.ax-h2, .ax-contact h2, .ax-quote-text'));
  headings.forEach((h) => {
    let k = 0;
    const wrap = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrap);
        return;
      }
      if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.append(' ');
          return;
        }
        const outer = document.createElement('span');
        outer.className = 'ax-w';
        const inner = document.createElement('span');
        inner.style.setProperty('--k', k++);
        inner.textContent = part;
        outer.append(inner);
        frag.append(outer);
      });
      node.replaceWith(frag);
    };
    Array.from(h.childNodes).forEach(wrap);
  });
  const headingObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      headingObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  headings.forEach((h) => headingObserver.observe(h));

  // ── Effets liés au défilement (GSAP) ───────────
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero : le texte s'efface, les triangles se dispersent pendant que la suite le recouvre.
  if (hero) {
    const out = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 }
    });
    out
      .to('.ax-hero-inner', { yPercent: -14, autoAlpha: 0, duration: 0.7 }, 0)
      .to('.ax-tri-s--a', { yPercent: -8, rotate: -10, scale: 1.25, duration: 1 }, 0)
      .to('.ax-tri-s--b', { yPercent: -30, xPercent: 8, rotate: 16, duration: 1 }, 0)
      .to('.ax-tri-s--c', { yPercent: -70, xPercent: -10, rotate: -40, duration: 1 }, 0)
      .to('.ax-tri-s--d', { yPercent: -110, rotate: 60, duration: 1 }, 0);
  }

  // Expertises : les cartes s'empilent, la précédente recule sous la suivante.
  const cards = gsap.utils.toArray('.ax-xcard');
  cards.forEach((card, i) => {
    const art = card.querySelector('.ax-xcard-art');
    if (art) {
      gsap.from(art, {
        scale: 0.55,
        rotate: -24,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 45%', scrub: 0.4 }
      });
    }
    const next = cards[i + 1];
    if (!next || getComputedStyle(card).position !== 'sticky') return;
    gsap.to(card, {
      scale: 0.94,
      ease: 'none',
      scrollTrigger: {
        trigger: next,
        start: 'top bottom',
        end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}px`,
        scrub: true,
        invalidateOnRefresh: true
      }
    });
  });

  // Photo d'équipe : léger zoom arrière en parallaxe.
  const photo = document.querySelector('.ax-photo img');
  if (photo) {
    gsap.fromTo(photo, { scale: 1.22, yPercent: -5 }, {
      scale: 1,
      yPercent: 5,
      ease: 'none',
      scrollTrigger: { trigger: '.ax-photo', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  // Rejoindre, À propos, Contact : les triangles remontent à des vitesses différentes.
  gsap.utils.toArray('.ax-join-art, .ax-about-art, .ax-contact-art').forEach((art) => {
    gsap.utils.toArray(art.querySelectorAll('.ax-tri-s')).forEach((el, i) => {
      gsap.fromTo(el, { yPercent: 18 + i * 14, rotate: -6 - i * 8 }, {
        yPercent: -(6 + i * 8),
        rotate: 6 + i * 10,
        ease: 'none',
        scrollTrigger: { trigger: art.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  });

  // À propos : le texte s'allume mot à mot au fil du défilement.
  gsap.utils.toArray('.ax-about-body, [data-lit]').forEach((aboutBody) => {
    const words = [];
    const light = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(light);
        return;
      }
      if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.append(part.includes('\u00a0') ? '\u00a0' : ' ');
          return;
        }
        const span = document.createElement('span');
        span.textContent = part;
        words.push(span);
        frag.append(span);
      });
      node.replaceWith(frag);
    };
    aboutBody.querySelectorAll('p').forEach((p) => Array.from(p.childNodes).forEach(light));
    gsap.fromTo(words, { opacity: 0.22 }, {
      opacity: 1,
      ease: 'none',
      stagger: 0.05,
      scrollTrigger: { trigger: aboutBody, start: 'top 82%', end: 'bottom 55%', scrub: 0.3 }
    });
  });

  // Nos engagements : les cartes arrivent en éventail.
  gsap.utils.toArray('.ax-commits, .ax-trio').forEach((group) => {
    const commits = gsap.utils.toArray(group.querySelectorAll('.ax-commit'));
    if (!commits.length) return;
    gsap.from(commits, {
      y: 90,
      rotate: (i) => (i - 1) * 7,
      autoAlpha: 0,
      duration: 1,
      ease: 'back.out(1.5)',
      stagger: 0.14,
      scrollTrigger: { trigger: group, start: 'top 85%' }
    });
  });

  // Mots-clés et tuiles de liens : entrée en cascade.
  gsap.utils.toArray('.ax-words, .ax-links').forEach((group) => {
    gsap.from(group.children, {
      y: 50,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: group, start: 'top 88%' }
    });
  });
})();
