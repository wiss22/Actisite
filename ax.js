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
    const DURATION = 4000; // durée d'affichage de chaque offre (ms)
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

    // Pause seulement quand on navigue au clavier : un clic donne aussi le focus
    // à l'onglet, et ne doit pas figer le défilement.
    hero.addEventListener('focusin', (e) => { focused = e.target.matches(':focus-visible'); });
    hero.addEventListener('focusout', () => { focused = false; });
    hero.addEventListener('pointerdown', () => { focused = false; });
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
        // Section masquée (ex. flux Sanity vide) : on cache aussi son lien.
        const shown = t.el.getClientRects().length > 0;
        t.link.hidden = !shown;
        if (shown && t.el.getBoundingClientRect().top <= line) active = t;
      });
      targets.forEach((t) => t.link.classList.toggle('is-on', t === active));
    };
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }

  // Rail latéral (body.ax-sidenav) : un picto par lien, le libellé se déploie au survol.
  // Le picto est choisi d'après la cible du lien ; à défaut, un point.
  const sideRail = document.body.classList.contains('ax-sidenav') && document.querySelector('.ax-subnav-bar');
  if (sideRail) {
    const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    const icons = [
      [/contact|discuter|echange/, P('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>')],
      [/autres|secteurs$|^\/#/, P('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M17.5 14v7M14 17.5h7"/>')],
      [/publication|rex|article|exemple|aller-plus-loin/, P('<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h4"/>')],
      [/vision|quote/, P('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')],
      [/offre|methode|approche/, P('<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>')],
      [/enjeu|priorit|risque|contexte/, P('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>')],
      [/reponse|atout|engagement/, P('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>')],
      [/presentation|intro|pilier/, P('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>')]
    ];
    const back = P('<path d="M15 18 9 12l6-6"/>');
    const dot = P('<circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/>');
    sideRail.querySelectorAll('a').forEach((a) => {
      const key = (a.getAttribute('href') || '').toLowerCase();
      const label = a.textContent.replace(/^‹\s*/, '').trim();
      const svg = a.classList.contains('ax-subnav-back') ? back : ((icons.find(([re]) => re.test(key)) || [])[1] || dot);
      a.innerHTML = `<span class="sn-ico">${svg}</span><span class="sn-label">${label}</span>`;
      a.setAttribute('title', label);
    });
    // Déployé un instant à son apparition, il se replie au premier défilement,
    // mouvement de souris ou clic.
    let shown = false;
    const obs = new MutationObserver(() => {
      const nav = sideRail.parentElement;
      if (!shown && nav.classList.contains('is-docked')) {
        shown = true;
        nav.classList.add('is-open');
        const close = () => {
          nav.classList.remove('is-open');
          ['scroll', 'mousemove', 'pointerdown', 'keydown'].forEach((t) => window.removeEventListener(t, close));
        };
        setTimeout(() => ['scroll', 'mousemove', 'pointerdown', 'keydown'].forEach((t) => window.addEventListener(t, close, { passive: true })), 500);
      }
    });
    obs.observe(sideRail.parentElement, { attributes: true, attributeFilter: ['class'] });
    // Un clic sur un lien replie aussitôt le rail (même si la souris reste dessus),
    // pour libérer la vue ; il se redéploie quand on revient dessus.
    sideRail.addEventListener('click', (e) => {
      if (!e.target.closest('a')) return;
      sideRail.parentElement.classList.add('is-shut');
      if (document.activeElement) document.activeElement.blur();
    });
    sideRail.addEventListener('mouseleave', () => sideRail.parentElement.classList.remove('is-shut'));
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

  // ── Titre d'article / Client Story : les derniers mots passent au marqueur ──
  // Le titre arrive de Sanity (textContent) : on attend le vrai titre, puis on
  // enveloppe les 1 à 2 derniers mots dans un <mark> qui se colorie de gauche à droite.
  const articleTitle = document.querySelector('.ax-article-head h1');
  if (articleTitle) {
    const highlight = () => {
      if (articleTitle.querySelector('mark')) return;
      const text = articleTitle.textContent.trim();
      if (!text || /^Chargement/i.test(text)) return;
      const words = text.split(/\s+/);
      let n = words.length >= 5 ? 2 : 1;
      // Une ponctuation isolée (« ? », « ! ») ne compte pas comme un mot.
      const isPunct = (w) => /^[?!:;.…»]+$/.test(w);
      if (words.length > n && isPunct(words[words.length - 1])) n += 1;
      if (words.length > n && n === 2 && isPunct(words[words.length - 2])) n += 1;
      const head = words.slice(0, -n).join(' ');
      const tail = words.slice(-n).join(' ');
      articleTitle.textContent = head ? `${head} ` : '';
      const mk = document.createElement('mark');
      mk.className = 'ax-mk';
      mk.textContent = tail;
      articleTitle.append(mk);
      requestAnimationFrame(() => requestAnimationFrame(() => mk.classList.add('is-lit')));
    };
    new MutationObserver(highlight).observe(articleTitle, { childList: true, characterData: true, subtree: true });
    highlight();
  }

  // ── Offres : articles et Client Stories liés, uniquement depuis Sanity ──
  // Chaque bloc [data-feed] est caché par défaut ; il ne s'affiche que si Sanity
  // renvoie au moins un contenu publié rattaché à l'offre (relatedOffers ou offerTag).
  const feeds = document.querySelector('.ax-feeds[data-offer-tag]');
  if (feeds) {
    const tag = feeds.dataset.offerTag.trim();
    const norm = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/&/g, 'et').replace(/[^a-z0-9]+/g, '');
    const esc = (v) => String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const linked = (item) => {
      const tags = Array.isArray(item.relatedOffers) ? item.relatedOffers : (item.offerTag ? [item.offerTag] : []);
      return tags.some((t) => norm(t) === norm(tag));
    };
    const query = `{
      "articles": *[_type == "blogPost" && (!defined(status) || status == "published")]
        | order(coalesce(publishedAt, _createdAt) desc){ title, relatedOffers, offerTag, excerpt, publishedAt,
          "slug": slug.current, externalUrl },
      "stories": *[_type == "offerRex" && status == "published"]
        | order(coalesce(publishedAt, _createdAt) desc){ title, relatedOffers, offerTag, summary, sector,
          "url": linkUrl, "slug": slug.current }
    }`;
    const base = 'https://vnmxplwi.api.sanity.io/v2024-10-01/data/query/production?perspective=published&query=';
    const card = (href, kicker, title, text, cta) => {
      const ext = /^https?:\/\//i.test(href);
      return `<a href="${esc(href)}" class="ax-pubcard"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>`
        + `<div class="rex-sector">${esc(kicker)}</div><h4>${esc(title)}</h4>`
        + (text ? `<p>${esc(text)}</p>` : '') + `<span class="ax-link">${cta}</span></a>`;
    };
    const fill = (kind, html) => {
      const block = feeds.querySelector(`[data-feed="${kind}"]`);
      if (!block || !html) return;
      block.querySelector('[data-feed-list]').innerHTML = html;
      block.hidden = false;
      // Sur les piliers, la section entière n'apparaît qu'avec au moins un contenu.
      const section = feeds.closest('[data-feeds-section]');
      if (section) section.hidden = false;
    };
    fetch(base + encodeURIComponent(query), { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const res = json && json.result;
        if (!res) return;
        fill('articles', (res.articles || []).filter(linked).slice(0, 3).map((a) => card(
          a.externalUrl || (a.slug ? `/article?slug=${encodeURIComponent(a.slug)}` : '/blog'),
          'Article', a.title, a.excerpt, 'Lire l’article')).join(''));
        fill('stories', (res.stories || []).filter(linked).slice(0, 3).map((r) => card(
          r.url || (r.slug ? `/rex-article?slug=${encodeURIComponent(r.slug)}` : '/rex'),
          r.sector || 'Client Story', r.title, r.summary, 'Lire la Client Story')).join(''));
      })
      .catch(() => {});
  }

  // ── Effets liés au défilement (GSAP) ───────────
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Les contenus Sanity (Client Stories, articles…) arrivent après coup et changent
  // la hauteur de la page : on recalcule alors les déclencheurs, sinon les sections
  // situées en dessous s'animent trop tard, voire jamais.
  if ('ResizeObserver' in window) {
    let lastH = document.body.scrollHeight;
    let timer = 0;
    new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 120);
    }).observe(document.body);
  }

  // Hero : le texte s'efface, les triangles se dispersent pendant que la suite le recouvre.
  if (hero) {
    const out = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 }
    });
    const heroMoves = [
      ['.ax-hero-inner', { yPercent: -14, autoAlpha: 0, duration: 0.7 }],
      ['.ax-tri-s--a', { yPercent: -8, rotate: -10, scale: 1.25, duration: 1 }],
      ['.ax-tri-s--b', { yPercent: -30, xPercent: 8, rotate: 16, duration: 1 }],
      ['.ax-tri-s--c', { yPercent: -70, xPercent: -10, rotate: -40, duration: 1 }],
      ['.ax-tri-s--d', { yPercent: -110, rotate: 60, duration: 1 }]
    ];
    heroMoves.forEach(([sel, vars]) => {
      const el = hero.querySelector(sel);
      if (el) out.to(el, vars, 0);
    });
  }

  // Expertises : les cartes s'empilent, la précédente recule sous la suivante.
  const cards = gsap.utils.toArray('.ax-xcard');
  cards.forEach((card, i) => {
    if (card.closest('.ax-stack--grid')) return; // cartes fixes : pas d'animation au défilement
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
    // Léger zoom conservé tout du long : le décalage ne découvre jamais de bord.
    gsap.fromTo(photo, { scale: 1.12, yPercent: -2.5 }, {
      scale: 1.06,
      yPercent: 2.5,
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
