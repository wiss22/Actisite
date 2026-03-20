/* ══════════════════════════════════════════════
   ACTINUANCE — script.js
   - Hero carousel with autoplay & progress
   - Scroll-triggered reveal animations
   - Animated counters
   - Navbar scroll behaviour
════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-reveal');
  const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const articleBasePath = isLocalHost ? '/article.html' : '/article';
  const blogBasePath = isLocalHost ? '/blog.html' : '/blog';
  const rexArticleBasePath = isLocalHost ? '/rex-article.html' : '/rex-article';
  const LANG_STORAGE_KEY = 'actinuance_lang';
  const frTitle = document.title;
  const textNodeOriginals = new WeakMap();
  let currentLang = 'fr';

  const pageKey = (() => {
    const path = (window.location.pathname || '/').toLowerCase().replace(/\/+$/, '');
    if (!path || path === '/') return 'index';
    const clean = path.endsWith('.html') ? path.slice(0, -5) : path;
    return clean.split('/').filter(Boolean).pop() || 'index';
  })();

  const titleByPageEn = {
    index: 'Actinuance — Digital Risk, Compliance & Cybersecurity',
    'risques-digitaux': 'Digital Risk — Actinuance',
    'cyber-defense': 'Cyber Defense — Actinuance',
    'audit-conformite': 'Audit & Compliance — Actinuance',
    'transfo-cyber': 'Cyber Transformation — Actinuance',
    'nous-rejoindre': 'Join Us — Actinuance',
    'equipe-dirigeante': 'Leadership Team — Actinuance',
    blog: 'Actinuance — Blog',
    rex: 'Actinuance — Client Stories',
    'rex-article': 'Actinuance — Client Story',
    innovation: 'Actinuance — Innovation',
    'innovation-article': 'Actinuance — Innovation',
    article: 'Actinuance — Article',
    offres: 'Actinuance — Offers',
    'postes-ouverts': 'Open Roles — Actinuance',
    'audit-organisationnel': 'Organizational Audit — Actinuance',
    'resilience-reglemenaire': 'NIS2 & DORA Compliance Audit — Actinuance',
    dora: 'DORA — Actinuance',
    'conformite-sectorielle': 'Sectoral Compliance — Actinuance',
    swift: 'Swift CSP — Actinuance',
    'risques-gouvernance': 'Digital Risk Governance — Actinuance',
    'risques-resilience': 'Digital Risk Resilience — Actinuance',
    'risques-sensibilisation': 'Cyber Awareness — Actinuance',
    'transfo-program-strategy-delivery': 'Program Strategy and Delivery — Actinuance',
    'transfo-security-capability-implementation': 'Security Capability Implementation — Actinuance',
    'transfo-security-by-design': 'Security by Design — Actinuance',
    'secteur-banque': 'Banking Sector — Actinuance',
    'secteur-assurance': 'Insurance Sector — Actinuance',
    'secteur-industrie-transport': 'Industry & Transport Sector — Actinuance',
    'secteur-luxe': 'Luxury Sector — Actinuance',
    'secteur-technologie': 'Technology Sector — Actinuance'
  };

  const normalizeText = (value) => value.replace(/\s+/g, ' ').trim();

  const FR_EN_MAP = {
    'Expertises': 'Expertise',
    'Secteurs': 'Industries',
    'Publications': 'Publications',
    'Ressources': 'Resources',
    'À propos': 'About',
    'Nous rejoindre': 'Join us',
    'Nous contacter': 'Contact us',
    'Articles': 'Articles',
    'REX': 'Client Story',
    'Innovation': 'Innovation',
    'Postes ouverts': 'Open roles',
    'Toutes les offres': 'All offers',
    'Demander un échange': 'Request a meeting',
    'Voir toutes nos offres': 'See all our offerings',
    'Découvrir nos expertises': 'Discover our expertise',
    'Prendre contact →': 'Get in touch →',
    'En savoir plus →': 'Learn more →',
    'Voir les positions ouvertes': 'See open roles',
    'Parcours consultant': 'Consultant journey',
    'Une évolution progressive, lisible et ouverte': 'A clear and progressive growth path',
    'Afficher': 'Show',
    'Masquer': 'Hide',
    'Contexte & enjeux': 'Context & challenges',
    'Objectifs': 'Objectives',
    'Notre vision': 'Our vision',
    'Présentation': 'Overview',
    'Présentation de l\'expertise': 'Expertise overview',
    'Nos offres': 'Our offerings',
    'Expertise': 'Expertise',
    'Risques Digitaux': 'Digital Risk',
    'Cyber Défense': 'Cyber Defense',
    'Audit et Conformité': 'Audit & Compliance',
    'Transfo Cyber': 'Cyber Transformation',
    'Nos Expertises': 'Our Expertise',
    'Nos engagements': 'Our Commitments',
    'Secteurs d\'activité': 'Industries',
    'Equipe dirigeante': 'Leadership Team',
    'Banque': 'Banking',
    'Assurance': 'Insurance',
    'Luxe': 'Luxury',
    'Industrie & Transport': 'Industry & Transportation',
    'Tech': 'Technology',
    'Banque': 'Banking',
    'Swift': 'Swift',
    'SWIFT': 'Swift CSP',
    'Swift CSP': 'Swift CSP',
    'Vie du cabinet': 'Life at the firm',
    'Happy at Work 2025': 'Happy at Work 2025',
    'Certifié par nos collaborateurs': 'Certified by our team',
    'Cabinet': 'Firm',
    'Contact': 'Contact',
    'Mentions légales': 'Legal notice',
    'Politique des cookies': 'Cookie policy',
    'Protection des données': 'Data protection',
    'Lire →': 'Read →',
    'Retour aux articles': 'Back to articles',
    'Article introuvable': 'Article not found',
    'Ouvrir Sanity Studio →': 'Open Sanity Studio →',
    'Erreur de chargement': 'Loading error'
  };

  function buildTranslationMap() {
    const map = new Map();
    Object.entries(FR_EN_MAP).forEach(([fr, en]) => {
      map.set(normalizeText(fr), en);
    });
    return map;
  }

  function applyDocumentTranslation(lang) {
    document.documentElement.lang = lang === 'en' ? 'en' : 'fr';
    document.title = lang === 'en' ? (titleByPageEn[pageKey] || frTitle) : frTitle;

    const translationMap = buildTranslationMap();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.parentElement) return NodeFilter.FILTER_REJECT;
        const tag = node.parentElement.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        return normalizeText(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      if (!textNodeOriginals.has(node)) {
        textNodeOriginals.set(node, node.nodeValue);
      }
      const original = textNodeOriginals.get(node) || '';
      if (lang !== 'en') {
        node.nodeValue = original;
        return;
      }
      const key = normalizeText(original);
      const translated = translationMap.get(key);
      if (!translated) {
        node.nodeValue = original;
        return;
      }
      const leading = original.match(/^\s*/)?.[0] || '';
      const trailing = original.match(/\s*$/)?.[0] || '';
      node.nodeValue = `${leading}${translated}${trailing}`;
    });
  }

  function createLanguageSwitch() {
    const navActionsEl = document.querySelector('.nav-actions');
    if (!navActionsEl || navActionsEl.querySelector('.lang-switch')) return;
    const switchWrap = document.createElement('div');
    switchWrap.className = 'lang-switch';
    switchWrap.innerHTML = `
      <button type="button" data-lang="fr" aria-label="Français">FR</button>
      <button type="button" data-lang="en" aria-label="English">EN</button>
    `;
    navActionsEl.prepend(switchWrap);

    switchWrap.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextLang = btn.dataset.lang === 'en' ? 'en' : 'fr';
        localStorage.setItem(LANG_STORAGE_KEY, nextLang);
        currentLang = nextLang;
        applyLanguage(nextLang);
      });
    });
  }

  function renderLanguageSwitchState() {
    document.querySelectorAll('.lang-switch button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  function applyLanguage(lang) {
    currentLang = lang === 'en' ? 'en' : 'fr';
    applyDocumentTranslation(currentLang);
    renderLanguageSwitchState();
  }

  // ── 1. NAVBAR SCROLL ──────────────────────────
  const navbar = document.getElementById('navbar');
  const navLogo = document.querySelector('#navbar .nav-logo-img');
  const onScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
      if (navLogo) {
        const scrolledSrc = navLogo.dataset.logoScrolled;
        if (scrolledSrc) navLogo.src = scrolledSrc;
      }
    } else {
      navbar.classList.remove('scrolled');
      if (navLogo) {
        const defaultSrc = navLogo.dataset.logoDefault;
        if (defaultSrc) navLogo.src = defaultSrc;
      }
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── 1a. HERO AUTO-SCROLL (expertises/offres/secteurs) ─────────
  const enableHeroAutoScroll = (() => {
    if ((window.location.hash || '').length > 1) return false;
    const key = pageKey;
    if (key.startsWith('secteur-')) return true;
    return [
      'risques-digitaux',
      'cyber-defense',
      'audit-conformite',
      'transfo-cyber',
      'cyber-4-ai',
      'audit-organisationnel',
      'resilience-reglemenaire',
      'dora',
      'conformite-sectorielle',
      'swift',
      'risques-gouvernance',
      'risques-resilience',
      'risques-sensibilisation',
      'transfo-program-strategy-delivery',
      'transfo-security-capability-implementation',
      'transfo-security-by-design',
      'cyber-cloud-defense',
      'cyber-securite-developpement',
      'cyber-securite-industries',
      'cyber-resilience-operationnelle'
    ].includes(key);
  })();

  if (enableHeroAutoScroll) {
    const heroEl = document.querySelector('.page-hero');
    let nextSectionEl = null;
    if (heroEl) {
      let cursor = heroEl.nextElementSibling;
      while (cursor) {
        if (cursor.tagName === 'SECTION') {
          nextSectionEl = cursor;
          break;
        }
        cursor = cursor.nextElementSibling;
      }
    }

    if (heroEl && nextSectionEl) {
      let canceled = false;
      const cancelAutoScroll = () => { canceled = true; };
      window.addEventListener('wheel', cancelAutoScroll, { passive: true, once: true });
      window.addEventListener('touchstart', cancelAutoScroll, { passive: true, once: true });
      window.addEventListener('keydown', cancelAutoScroll, { passive: true, once: true });
      window.addEventListener('mousedown', cancelAutoScroll, { passive: true, once: true });

      window.setTimeout(() => {
        if (canceled) return;
        if (window.scrollY > 24) return;
        nextSectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 3000);
    }
  }

  // ── 1b. NAV DROPDOWNS ─────────────────────────
  // Ensure Publications dropdown always contains Client Stories entry across all pages.
  const ensureRexInDesktopMenu = () => {
    const publicationMenus = Array.from(document.querySelectorAll('#ressourcesDropdown.nav-dropdown-menu'));
    publicationMenus.forEach((menu) => {
      if (menu.querySelector('a[href=\"/rex\"]')) return;
      const li = document.createElement('li');
      li.innerHTML = '<a href=\"/rex\">Client Stories</a>';
      menu.appendChild(li);
    });
  };
  ensureRexInDesktopMenu();

  const navDropdownItems = Array.from(document.querySelectorAll('.nav-item-dropdown'));
  navDropdownItems.forEach((item) => {
    const trigger = item.querySelector('.nav-dropdown-trigger');
    const menu = item.querySelector('.nav-dropdown-menu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const shouldOpen = !item.classList.contains('open');

      navDropdownItems.forEach((otherItem) => {
        otherItem.classList.remove('open');
        const otherTrigger = otherItem.querySelector('.nav-dropdown-trigger');
        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
      });

      item.classList.toggle('open', shouldOpen);
      trigger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    });
  });

  document.addEventListener('click', () => {
    navDropdownItems.forEach((item) => {
      item.classList.remove('open');
      const trigger = item.querySelector('.nav-dropdown-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  });

  // Highlight current page inside dropdown menus
  const normalizePath = (value) => {
    if (!value) return '/';
    let path = value.toLowerCase();
    path = path.replace(/\/index(?:\.html)?$/, '/');
    path = path.replace(/\.html$/, '');
    path = path.replace(/\/+$/, '');
    return path || '/';
  };

  const currentPath = normalizePath(window.location.pathname || '/');
  const currentHash = (window.location.hash || '').toLowerCase();

  navDropdownItems.forEach((item) => {
    const links = Array.from(item.querySelectorAll('.nav-dropdown-menu a'));
    if (!links.length) return;

    const activeLink = links.find((link) => {
      const href = link.getAttribute('href') || '';
      if (!href) return false;

      if (href.startsWith('#')) return currentPath === '/' && href.toLowerCase() === currentHash;

      const url = new URL(href, window.location.origin);
      const linkPath = normalizePath(url.pathname);
      const linkHash = (url.hash || '').toLowerCase();

      if (linkHash && linkPath === '/' && currentPath === '/') {
        return currentHash === linkHash;
      }
      return linkPath === currentPath;
    });

    if (activeLink) {
      activeLink.classList.add('is-current');
      activeLink.setAttribute('aria-current', 'page');
      item.classList.add('has-current');
    }
  });

  // ── 2. HERO CAROUSEL ──────────────────────────
  const slides     = Array.from(document.querySelectorAll('.slide'));
  const dots       = Array.from(document.querySelectorAll('.dot'));
  const progressBar = document.getElementById('progressBar');
  const hasHeroCarousel = slides.length > 0 && dots.length > 0 && progressBar;
  const DURATION    = 6000; // ms per slide

  let current    = 0;
  let startTime  = null;
  let rafId      = null;
  let leavingCleanupId = null;

  function goTo(index) {
    if (!hasHeroCarousel) return;
    const previous = current;

    current = (index + slides.length) % slides.length;

    slides[current].classList.remove('leaving');
    slides[current].classList.add('active');
    dots[current].classList.add('active');

    // Keep one overlap frame to avoid visual gap/flash.
    requestAnimationFrame(() => {
      slides[previous].classList.remove('active');
      slides[previous].classList.add('leaving');
      dots[previous].classList.remove('active');
    });

    clearTimeout(leavingCleanupId);
    leavingCleanupId = setTimeout(() => {
      slides[previous].classList.remove('leaving');
    }, 900);

    resetProgress();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Progress bar via requestAnimationFrame
  function resetProgress() {
    if (!hasHeroCarousel) return;
    if (rafId) cancelAnimationFrame(rafId);
    progressBar.style.width = '0%';
    startTime = performance.now();
    animateProgress();
  }

  function animateProgress(ts) {
    if (!hasHeroCarousel) return;
    if (!ts) ts = performance.now();
    const elapsed = ts - startTime;
    const pct = Math.min((elapsed / DURATION) * 100, 100);
    progressBar.style.width = pct + '%';

    if (pct < 100) {
      rafId = requestAnimationFrame(animateProgress);
    } else {
      next();
    }
  }

  // Controls
  const heroNextBtn = document.getElementById('heroNext');
  const heroPrevBtn = document.getElementById('heroPrev');
  if (hasHeroCarousel && heroNextBtn && heroPrevBtn) {
    heroNextBtn.addEventListener('click', () => { next(); });
    heroPrevBtn.addEventListener('click', () => { prev(); });
  }

  if (hasHeroCarousel) {
    dots.forEach(dot => {
      dot.addEventListener('click', () => goTo(+dot.dataset.slide));
    });
  }

  // Hero interactions
  const heroEl = document.querySelector('.hero');

  // Touch swipe
  let touchStartX = 0;
  if (heroEl) {
    heroEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    heroEl.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    });
  }

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  // Start
  if (hasHeroCarousel) {
    resetProgress();
  }


  // ── 3. SCROLL REVEAL ──────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  const initHomeGsap = () => {
    const body = document.body;
    const expertisesSection = document.getElementById('expertises');
    if (!body || !expertisesSection || !window.gsap || !window.ScrollTrigger) return;
    const isHome = body.classList.length === 0 || window.location.pathname === '/' || /index\.html$/.test(window.location.pathname);
    if (!isHome || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap.core.globals().ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    const triangleScene = expertisesSection.querySelector('.expertise-triangle-scene');
    const triangles = triangleScene ? Array.from(triangleScene.querySelectorAll('.expertise-triangle')) : [];
    const cards = Array.from(expertisesSection.querySelectorAll('.expertise-card'));
    const intro = expertisesSection.querySelector('.section-intro');
    const heroSection = document.getElementById('hero');
    const heroTriangles = heroSection ? Array.from(heroSection.querySelectorAll('.s-triangle')) : [];
    const joinSection = document.getElementById('rejoindre');
    const joinArrowEls = joinSection ? Array.from(joinSection.querySelectorAll('.join-growth-line, .join-growth-head, .join-growth-triangle')) : [];
    const sectorsSection = document.getElementById('secteurs');
    const contactSection = document.getElementById('contact');
    const contactSceneEls = contactSection ? Array.from(contactSection.querySelectorAll('.contact-scene > span')) : [];

    if (heroSection && heroTriangles.length) {
      gsap.timeline({
        scrollTrigger: {
          trigger: expertisesSection,
          start: 'top bottom',
          end: 'top 72%',
          scrub: 0.8
        }
      }).to(heroTriangles, {
        y: (_, el) => (el.classList.contains('s-t1') ? 56 : 40),
        scale: 0.78,
        autoAlpha: 0.08,
        stagger: 0.02,
        ease: 'none'
      });
    }

    if (triangleScene && triangles.length) {
      gsap.set(triangles, {
        autoAlpha: 0,
        y: 56,
        scale: 0.76,
        rotation: (_, el) => (el.classList.contains('expertise-triangle-2') || el.classList.contains('expertise-triangle-4') ? 10 : -10)
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: expertisesSection,
          start: 'top 74%',
          end: 'top 42%',
          scrub: 0.9
        }
      }).to(triangles, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        stagger: 0.08,
        ease: 'power3.out'
      });

      triangles.forEach((triangle, index) => {
        gsap.to(triangle, {
          y: index % 2 === 0 ? -14 : 12,
          x: index % 2 === 0 ? 10 : -8,
          duration: 6.5 + index,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.2
        });
      });
    }

    if (intro) {
      gsap.fromTo(
        intro,
        { autoAlpha: 0, y: 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: expertisesSection,
            start: 'top 80%',
            once: true
          }
        }
      );
    }

    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { autoAlpha: 0, y: 34, rotateX: 6, transformOrigin: 'center top' },
        {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          delay: index * 0.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: expertisesSection,
            start: 'top 70%',
            once: true
          }
        }
      );
    });

    if (joinSection && joinArrowEls.length) {
      gsap.set(joinArrowEls, { autoAlpha: 0 });
      gsap.fromTo(
        joinSection.querySelector('.join-layout'),
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.82,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: joinSection,
            start: 'top 76%',
            once: true
          }
        }
      );

      gsap.timeline({
        scrollTrigger: {
          trigger: joinSection,
          start: 'top 74%',
          end: 'top 30%',
          scrub: 1
        }
      })
        .fromTo(joinSection.querySelector('.join-growth-line'), { scaleX: 0.4, scaleY: 0.9, transformOrigin: 'left bottom', autoAlpha: 0.12 }, { scaleX: 1, scaleY: 1, autoAlpha: 1, ease: 'none' }, 0)
        .fromTo(joinSection.querySelector('.join-growth-head'), { autoAlpha: 0, x: -30, y: 26, scale: 0.7 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, ease: 'none' }, 0.18)
        .fromTo(joinSection.querySelectorAll('.join-growth-triangle'), { autoAlpha: 0, y: 24, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, stagger: 0.08, ease: 'none' }, 0.1);
    }

    const animateSectorPanelIllustration = (panel) => {
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll('.panel-illustration > span'));
      if (!items.length) return;
      gsap.killTweensOf(items);
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 20, scale: 0.92 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.46, stagger: 0.025, ease: 'power2.out', overwrite: 'auto' }
      );
    };

    if (sectorsSection) {
      const activePanel = sectorsSection.querySelector('.secteur-panel.active');
      if (activePanel) {
        ScrollTrigger.create({
          trigger: sectorsSection,
          start: 'top 72%',
          once: true,
          onEnter: () => animateSectorPanelIllustration(activePanel)
        });
      }

      sectorsSection.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const panel = sectorsSection.querySelector(`#tab-${btn.dataset.tab}`);
          if (panel) animateSectorPanelIllustration(panel);
        });
      });
    }

    if (contactSection && contactSceneEls.length) {
      const contactInner = contactSection.querySelector('.contact-inner');
      const contactTitle = contactSection.querySelector('h2');
      const contactText = contactSection.querySelector('p');
      const contactMail = contactSection.querySelector('.contact-mail');
      const contactAddress = contactSection.querySelector('.contact-address');

      const contactTl = gsap.timeline({
        scrollTrigger: {
          trigger: contactSection,
          start: 'top 78%',
          once: true
        }
      });

      contactTl
        .fromTo(contactInner, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' })
        .fromTo(contactTitle, { autoAlpha: 0, y: 26, letterSpacing: '0.08em' }, { autoAlpha: 1, y: 0, letterSpacing: '-0.02em', duration: 0.72, ease: 'power3.out' }, 0.08)
        .fromTo(contactText, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.56, ease: 'power2.out' }, 0.2)
        .fromTo(contactMail, { autoAlpha: 0, y: 18, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.58, ease: 'power2.out' }, 0.28)
        .fromTo(contactAddress, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.48, ease: 'power2.out' }, 0.34);

      gsap.fromTo(
        contactSceneEls,
        { autoAlpha: 0, y: 18, scale: 0.9 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contactSection,
            start: 'top 82%',
            once: true
          }
        }
      );

      contactSceneEls.forEach((el, index) => {
        gsap.to(el, {
          y: index % 2 === 0 ? -10 : 8,
          x: index % 3 === 0 ? 8 : -6,
          duration: 5.5 + index * 0.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.12
        });
      });

      gsap.to(contactInner, {
        yPercent: -4,
        ease: 'none',
        scrollTrigger: {
          trigger: contactSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      });
    }
  };

  initHomeGsap();

  // ── 3b. PILLAR OFFERS SIDE NAV ACTIVE STATE ───────────────
  const pillarNavs = Array.from(document.querySelectorAll('.pillar-flynav, .pillar-offers-nav'));
  if (pillarNavs.length) {
    const navAutoScrollState = new WeakMap();
    const setupMobileOverviewNav = () => {
      const isMobile = window.innerWidth <= 768;
      pillarNavs.forEach((nav) => {
        const isOfferNav = nav.classList.contains('offer-flynav');
        const titleNode = nav.querySelector('.pillar-flynav-title-accent');
        const rawTitle = titleNode ? titleNode.textContent.trim() : '';
        const expertiseName = rawTitle.replace(/^Expertise\s+/i, '').trim() || 'l’expertise';
        const mobileHeading = `Les offres de l’expertise ${expertiseName}`;
        nav.dataset.mobileHeading = mobileHeading;
        let headingEl = nav.querySelector('.pillar-mobile-heading');
        if (!headingEl) {
          headingEl = document.createElement('span');
          headingEl.className = 'pillar-mobile-heading';
          nav.insertBefore(headingEl, nav.firstChild);
        }
        headingEl.textContent = mobileHeading;

        const links = Array.from(nav.querySelectorAll('a'));
        let mobileLinksWrap = nav.querySelector('.pillar-mobile-links');
        if (!mobileLinksWrap) {
          mobileLinksWrap = document.createElement('div');
          mobileLinksWrap.className = 'pillar-mobile-links';
          nav.appendChild(mobileLinksWrap);
        }
        links.forEach((link) => {
          if (link.parentElement !== mobileLinksWrap) mobileLinksWrap.appendChild(link);
        });

        const overviewLink = links.find((link) => (link.getAttribute('href') || '').includes('presentation-pilier'));
        links.forEach((link) => {
          link.classList.remove('pillar-mobile-overview-link', 'pillar-mobile-offer-link');
          if (overviewLink && link === overviewLink) link.classList.add('pillar-mobile-overview-link');
          else link.classList.add('pillar-mobile-offer-link');
        });

        nav.classList.toggle('mobile-overview-nav', isMobile && !isOfferNav);
        nav.classList.toggle('mobile-offer-nav', isMobile && isOfferNav);
        const existing = navAutoScrollState.get(nav);
        if (existing && existing.rafId) {
          cancelAnimationFrame(existing.rafId);
        }
        navAutoScrollState.delete(nav);
      });
    };

    const toggleFlynavVisibility = () => {
      const isMobile = window.innerWidth <= 768;
      pillarNavs.forEach((nav) => {
        const isOfferNav = nav.classList.contains('offer-flynav');
        const shouldShow = isMobile ? (!isOfferNav && window.scrollY > 140) : window.scrollY > 120;
        nav.classList.toggle('is-shown', shouldShow);
      });
    };
    setupMobileOverviewNav();
    window.addEventListener('resize', setupMobileOverviewNav);
    window.addEventListener('scroll', toggleFlynavVisibility, { passive: true });
    window.addEventListener('resize', toggleFlynavVisibility);
    toggleFlynavVisibility();
  }
  pillarNavs.forEach((pillarNav) => {
    const pillarLinks = Array.from(pillarNav.querySelectorAll('a[href^="#"]'));
    const linkMap = new Map();

    pillarLinks.forEach((link) => {
      const targetId = (link.getAttribute('href') || '').slice(1);
      if (!targetId) return;
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      linkMap.set(targetEl, link);
    });

    if (!linkMap.size) return;

    const setActiveLink = (activeEl) => {
      pillarLinks.forEach((link) => {
        const isActive = linkMap.get(activeEl) === link;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visibleEntries.length) return;
      setActiveLink(visibleEntries[0].target);
    }, { threshold: [0.3, 0.55, 0.75], rootMargin: '-20% 0px -45% 0px' });

    linkMap.forEach((_link, sectionEl) => sectionObserver.observe(sectionEl));

    const firstSection = Array.from(linkMap.keys())[0];
    if (firstSection) setActiveLink(firstSection);
  });

  // Highlight current offer page in pillar nav (non-hash links)
  if (pillarNavs.length) {
    const toPathKey = (inputPath) => {
      const clean = (inputPath || '/').toLowerCase().replace(/\/+$/, '');
      if (!clean || clean === '/') return 'index';
      return (clean.endsWith('.html') ? clean.slice(0, -5) : clean)
        .split('/')
        .filter(Boolean)
        .pop() || 'index';
    };
    const currentPathKey = toPathKey(window.location.pathname);
    pillarNavs.forEach((nav) => {
      nav.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href') || '';
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        let targetKey = '';
        try {
          const url = new URL(href, window.location.origin);
          targetKey = toPathKey(url.pathname);
        } catch (_) {
          return;
        }
        if (targetKey === currentPathKey) {
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'page');
        }
      });
    });
  }

  // Offer pages: add explicit backlink at bottom to the expertise page
  const offerFlynav = document.querySelector('.offer-flynav');
  if (offerFlynav) {
    const overviewLink = offerFlynav.querySelector('a[href*="presentation-pilier"]');
    const targetHref = overviewLink ? (overviewLink.getAttribute('href') || '') : '';
    const titleNode = offerFlynav.querySelector('.pillar-flynav-title-accent');
    const expertiseName = titleNode
      ? titleNode.textContent.replace(/^Expertise\s+/i, '').trim()
      : 'l’expertise';
    const basePath = targetHref ? targetHref.split('#')[0] || '/' : '/';
    const targetPath = `${basePath}#nos-offres`;
    const container = document.querySelector('.offer-shell-main.offer-shell-main-lite') || document.querySelector('.offer-shell-main');
    if (container && !container.querySelector('.offer-back-expertise')) {
      const wrap = document.createElement('div');
      wrap.className = 'offer-back-expertise reveal visible';
      wrap.innerHTML = `<a href="${targetPath}">← Retourner sur l’expertise ${expertiseName}</a>`;
      container.appendChild(wrap);
    }
  }


  // ── 4. ANIMATED COUNTERS ──────────────────────
  const counterEls = document.querySelectorAll('.number-val[data-target]');

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 1800;
    const start = performance.now();

    function step(ts) {
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObserver.observe(el));


  // ── 5. MOBILE BURGER MENU ─────────────────────
  const burger = document.getElementById('burger');

  if (burger) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');

      if (isOpen) {
        // Inject mobile nav if not exists
        let mobileNav = document.getElementById('mobile-nav');
        if (!mobileNav) {
          mobileNav = document.createElement('div');
          mobileNav.id = 'mobile-nav';
          mobileNav.innerHTML = `
            <style>
              #mobile-nav {
                position: fixed;
                top: 72px; left: 0; right: 0;
                background: rgba(7,15,30,0.97);
                backdrop-filter: blur(12px);
                z-index: 999;
                padding: 30px 24px 40px;
                display: flex;
                flex-direction: column;
                gap: 0;
                animation: slideDown 0.3s ease forwards;
              }
              @keyframes slideDown {
                from { opacity:0; transform: translateY(-10px); }
                to   { opacity:1; transform: translateY(0); }
              }
              #mobile-nav a {
                font-family: 'Raleway', sans-serif;
                font-weight: 600;
                font-size: 0.9rem;
                color: rgba(255,255,255,0.8);
                padding: 12px 0;
                border-bottom: 1px solid rgba(255,255,255,0.06);
                display: block;
                transition: color 0.2s;
              }
              #mobile-nav a:hover { color: #F18847; }
              #mobile-nav .m-accordion {
                border-bottom: 1px solid rgba(255,255,255,0.06);
              }
              #mobile-nav .m-accordion summary {
                list-style: none;
                font-family: 'Raleway', sans-serif;
                font-weight: 600;
                font-size: 0.9rem;
                color: rgba(255,255,255,0.86);
                padding: 12px 0;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
              }
              #mobile-nav .m-accordion summary::-webkit-details-marker {
                display: none;
              }
              #mobile-nav .m-accordion summary::after {
                content: '▾';
                font-size: 0.75rem;
                opacity: 0.8;
                transition: transform 0.2s ease;
              }
              #mobile-nav .m-accordion[open] summary::after {
                transform: rotate(180deg);
              }
              #mobile-nav .m-sub {
                padding: 0 0 8px 10px;
              }
              #mobile-nav .m-sub a {
                font-family: 'Poppins', sans-serif;
                font-weight: 400;
                font-size: 0.8rem;
                color: rgba(255,255,255,0.72);
                padding: 8px 0;
                border-bottom: none;
              }
              #mobile-nav .m-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-top: 18px;
              }
              #mobile-nav .m-actions a {
                border-bottom: none;
                padding: 12px 10px;
                text-align: center;
                font-family: 'Poppins', sans-serif;
                font-weight: 500;
                font-size: 0.72rem;
                letter-spacing: 0.06em;
                text-transform: uppercase;
              }
              #mobile-nav .m-cta-join {
                background: #5f2d78;
                color: #fff !important;
              }
              #mobile-nav .m-cta {
                background: #F18847;
                color: white !important;
                border: none;
              }
            </style>
            <details class="m-accordion">
              <summary>${currentLang === 'en' ? 'Expertise' : 'Expertises'}</summary>
              <div class="m-sub">
                <a href="/risques-digitaux" onclick="closeMobileNav()">${currentLang === 'en' ? 'Digital Risk' : 'Risques Digitaux'}</a>
                <a href="/cyber-defense" onclick="closeMobileNav()">${currentLang === 'en' ? 'Cyber Defense' : 'Cyber Défense'}</a>
                <a href="/audit-conformite" onclick="closeMobileNav()">${currentLang === 'en' ? 'Audit & Compliance' : 'Audit et Conformité'}</a>
                <a href="/transfo-cyber" onclick="closeMobileNav()">${currentLang === 'en' ? 'Cyber Transformation' : 'Transfo Cyber'}</a>
              </div>
            </details>
            <details class="m-accordion">
              <summary>${currentLang === 'en' ? 'Featured offers' : 'Offres à la une'}</summary>
              <div class="m-sub">
                <a href="/cyber-4-ai" class="nav-ai-link" onclick="closeMobileNav()">Cyber for AI</a>
                <a href="/dora" onclick="closeMobileNav()">DORA</a>
                <a href="/swift" onclick="closeMobileNav()">Swift CSP</a>
              </div>
            </details>
            <details class="m-accordion">
              <summary>${currentLang === 'en' ? 'Industries' : 'Secteurs'}</summary>
              <div class="m-sub">
                <a href="/secteur-banque" onclick="closeMobileNav()">${currentLang === 'en' ? 'Banking' : 'Banque'}</a>
                <a href="/secteur-assurance" onclick="closeMobileNav()">${currentLang === 'en' ? 'Insurance' : 'Assurance'}</a>
                <a href="/secteur-luxe" onclick="closeMobileNav()">${currentLang === 'en' ? 'Luxury' : 'Luxe'}</a>
                <a href="/secteur-industrie-transport" onclick="closeMobileNav()">${currentLang === 'en' ? 'Industry & Transportation' : 'Industrie & Transport'}</a>
                <a href="/secteur-technologie" onclick="closeMobileNav()">${currentLang === 'en' ? 'Technology' : 'Tech'}</a>
              </div>
            </details>
            <details class="m-accordion">
              <summary>${currentLang === 'en' ? 'Publications' : 'Publications'}</summary>
              <div class="m-sub">
                <a href="/blog" onclick="closeMobileNav()">Articles</a>
                <a href="/rex" onclick="closeMobileNav()">Client Stories</a>
              </div>
            </details>
            <a href="/#apropos" onclick="closeMobileNav()">${currentLang === 'en' ? 'About' : 'À propos'}</a>
            <div class="m-actions">
              <a href="/nous-rejoindre" class="m-cta-join" onclick="closeMobileNav()">${currentLang === 'en' ? 'Join us' : 'Nous rejoindre'}</a>
              <a href="/#contact" class="m-cta" onclick="closeMobileNav()">${currentLang === 'en' ? 'Contact us' : 'Nous contacter'}</a>
            </div>
          `;
          document.body.appendChild(mobileNav);
        } else {
          mobileNav.style.display = 'flex';
        }
        applyLanguage(currentLang);

        // Animate burger to X
        const spans = burger.querySelectorAll('span');
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        closeMobileNav();
      }
    });
  }

  window.closeMobileNav = function() {
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav) mobileNav.style.display = 'none';
    if (burger) {
      burger.classList.remove('open');
      const spans = burger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  };


  // ── TEAM MEMBER PHOTOS FROM SANITY ───────────────────
  (function loadTeamPhotos() {
    const imgs = document.querySelectorAll('img[data-team-slug]');
    if (!imgs.length) return;
    const slugs = Array.from(imgs).map(img => img.dataset.teamSlug);
    const unique = [...new Set(slugs)];
    const projectId = 'vnmxplwi';
    const dataset = 'production';
    const apiVersion = '2024-10-01';
    const slugList = unique.map(s => `"${s}"`).join(',');
    const query = `*[_type == "teamMember" && slug in [${slugList}]]{ slug, "photoUrl": photo.asset->url, linkedinUrl }`;
    const apiUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`;
    fetch(apiUrl)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        if (!data.result || !data.result.length) return;
        const map = {};
        data.result.forEach(m => { map[m.slug] = { photoUrl: m.photoUrl, linkedinUrl: m.linkedinUrl }; });
        imgs.forEach(img => {
          const member = map[img.dataset.teamSlug];
          if (!member) return;
          if (member.photoUrl) img.src = member.photoUrl;
          if (member.linkedinUrl) {
            // Si l'img est position:absolute (ex: leader-media), on injecte dans le parent
            // Sinon on wrappe l'img pour pouvoir positionner le badge dessus
            const isAbsolute = getComputedStyle(img).position === 'absolute';
            let container;
            if (isAbsolute) {
              container = img.parentNode;
            } else if (!img.parentNode.classList.contains('team-photo-wrap')) {
              const wrap = document.createElement('div');
              wrap.className = 'team-photo-wrap';
              img.parentNode.insertBefore(wrap, img);
              wrap.appendChild(img);
              container = wrap;
            } else {
              container = img.parentNode;
            }
            if (getComputedStyle(container).position === 'static') {
              container.style.position = 'relative';
            }
            if (!container.querySelector('.team-linkedin-badge')) {
              const badge = document.createElement('a');
              badge.href = member.linkedinUrl;
              badge.target = '_blank';
              badge.rel = 'noopener noreferrer';
              badge.className = 'team-linkedin-badge';
              badge.setAttribute('aria-label', 'Voir le profil LinkedIn');
              badge.textContent = 'in';
              container.appendChild(badge);
            }
          }
        });
      })
      .catch(() => {}); // fallback silencieux sur la photo statique
  })();

  // ── 6. SMOOTH ANCHOR SCROLL ───────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── "Voir les offres" scroll explicite (pages expertises) ───────────────────
  document.querySelectorAll('.offer-scroll-cta').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.getElementById('pilier-nos-offres') || document.getElementById('nos-offres');
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Deep-link hash scroll with navbar offset (e.g. /nous-rejoindre#processus-3-etapes)
  const scrollToHashTarget = () => {
    const rawHash = window.location.hash || '';
    if (!rawHash || rawHash.length < 2) return;
    const target = document.getElementById(rawHash.slice(1));
    if (!target) return;
    const offset = 88;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // Run once on load and again shortly after to handle late layout shifts
  scrollToHashTarget();
  window.setTimeout(scrollToHashTarget, 220);

  // ── 6b. CAREER PATH TOGGLE ────────────────────
  const careerSection = document.getElementById('parcours-consultant');
  const careerToggleBtn = document.getElementById('careerToggleBtn');
  const careerRevealBtn = document.getElementById('careerRevealBtn');
  const careerToggleLabel = careerToggleBtn ? careerToggleBtn.querySelector('.career-toggle-label') : null;

  function setCareerCollapsed(collapsed) {
    if (!careerSection || !careerToggleBtn || !careerToggleLabel) return;
    careerSection.classList.toggle('is-collapsed', collapsed);
    careerToggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    careerToggleLabel.textContent = collapsed
      ? (currentLang === 'en' ? 'Show' : 'Afficher')
      : (currentLang === 'en' ? 'Hide' : 'Masquer');
  }

  if (careerSection && careerToggleBtn) {
    careerToggleBtn.addEventListener('click', () => {
      const isCollapsed = careerSection.classList.contains('is-collapsed');
      setCareerCollapsed(!isCollapsed);
    });
  }

  if (careerSection && careerRevealBtn) {
    careerRevealBtn.addEventListener('click', () => {
      setCareerCollapsed(false);
    });
  }

  // Hover sync: card -> timeline dot
  if (careerSection) {
    const careerCards = Array.from(careerSection.querySelectorAll('.career-card'));
    const careerTrackSteps = Array.from(careerSection.querySelectorAll('.career-track span'));
    const careerMobileQuery = window.matchMedia('(max-width: 768px)');
    let careerScrollObserver = null;

    const setCareerHover = (index = -1) => {
      careerCards.forEach((card, i) => card.classList.toggle('is-hovered', i === index));
      careerTrackSteps.forEach((step, i) => step.classList.toggle('is-hovered', i === index));
    };

    const setCareerActive = (index = -1) => {
      careerCards.forEach((card, i) => card.classList.toggle('is-active', i === index));
      careerTrackSteps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    };

    careerCards.forEach((card, index) => {
      card.addEventListener('mouseenter', () => setCareerHover(index));
      card.addEventListener('mouseleave', () => setCareerHover(-1));
    });

    const getClosestCareerCardIndex = () => {
      if (!careerCards.length) return -1;
      const targetY = window.innerHeight * 0.32;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      careerCards.forEach((card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().top - targetY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      return bestIndex;
    };

    const setupCareerScrollSync = () => {
      if (careerScrollObserver) {
        careerScrollObserver.disconnect();
        careerScrollObserver = null;
      }

      if (!careerMobileQuery.matches || !careerCards.length) {
        setCareerActive(-1);
        return;
      }

      const visibleRatios = new Map();
      const thresholds = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9];

      careerScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          visibleRatios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let bestIndex = -1;
        let bestRatio = 0;
        careerCards.forEach((card, index) => {
          const ratio = visibleRatios.get(card) || 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = index;
          }
        });

        if (bestIndex === -1) {
          bestIndex = getClosestCareerCardIndex();
        }

        setCareerActive(bestIndex);
      }, {
        root: null,
        threshold: thresholds,
        rootMargin: '-20% 0px -45% 0px'
      });

      careerCards.forEach((card) => careerScrollObserver.observe(card));
      window.setTimeout(() => setCareerActive(getClosestCareerCardIndex()), 120);
    };

    setupCareerScrollSync();
    if (careerMobileQuery.addEventListener) {
      careerMobileQuery.addEventListener('change', setupCareerScrollSync);
    } else if (careerMobileQuery.addListener) {
      careerMobileQuery.addListener(setupCareerScrollSync);
    }
  }


  // ── 7. SECTEURS TABS ──────────────────────────
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.secteur-panel');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      const nextPanel = document.getElementById('tab-' + target);
      const currentPanel = document.querySelector('.secteur-panel.active');
      const canAnimate = Boolean(window.gsap && nextPanel && currentPanel && nextPanel !== currentPanel);
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (!nextPanel) return;

      if (!canAnimate) {
        tabPanels.forEach(p => p.classList.remove('active'));
        nextPanel.classList.add('active');
        return;
      }

      const gsap = window.gsap;
      const outgoing = currentPanel.querySelectorAll('.panel-left > *, .panel-right > *');
      const incoming = nextPanel.querySelectorAll('.panel-left > *, .panel-right > *');

      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .to(outgoing, { autoAlpha: 0, y: -14, duration: 0.14, stagger: 0.01 })
        .add(() => {
          currentPanel.classList.remove('active');
          nextPanel.classList.add('active');
          gsap.set(incoming, { autoAlpha: 0, y: 16 });
        })
        .to(nextPanel, { autoAlpha: 1, duration: 0.01 })
        .to(incoming, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.018, ease: 'power3.out' });
    });
  });

  // ── 8. EXPERTISES MOBILE DOTS + AUTOSCROLL ────
  const expertiseGrid = document.querySelector('.expertise-grid');
  const expertiseDots = document.getElementById('expertiseDots');
  if (expertiseGrid && expertiseDots) {
    const cards = Array.from(expertiseGrid.querySelectorAll('.expertise-card'));
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
    let activeIndex = 0;
    let autoTimer = null;

    function getStepWidth() {
      if (cards.length < 2) return cards[0]?.offsetWidth || 0;
      return Math.abs(cards[1].offsetLeft - cards[0].offsetLeft);
    }

    function updateActiveFromScroll() {
      const step = getStepWidth() || 1;
      const idx = Math.round(expertiseGrid.scrollLeft / step);
      activeIndex = Math.max(0, Math.min(cards.length - 1, idx));
      Array.from(expertiseDots.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
    }

    function goToCard(index) {
      const step = getStepWidth();
      if (!step) return;
      activeIndex = (index + cards.length) % cards.length;
      expertiseGrid.scrollTo({ left: activeIndex * step, behavior: 'smooth' });
      updateActiveFromScroll();
    }

    function stopAuto() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
    }

    function startAuto() {
      stopAuto();
      if (!isMobile()) return;
      if (expertiseGrid.scrollWidth <= expertiseGrid.clientWidth + 4) return;
      autoTimer = setInterval(() => goToCard(activeIndex + 1), 2000);
    }

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'expertise-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Aller à l'expertise ${i + 1}`);
      dot.addEventListener('click', () => {
        goToCard(i);
        startAuto();
      });
      expertiseDots.appendChild(dot);
    });

    expertiseGrid.addEventListener('scroll', updateActiveFromScroll, { passive: true });
    expertiseGrid.addEventListener('touchstart', stopAuto, { passive: true });
    expertiseGrid.addEventListener('touchend', startAuto, { passive: true });
    window.addEventListener('resize', () => {
      updateActiveFromScroll();
      startAuto();
    });

    updateActiveFromScroll();
    startAuto();
  }

  // ── 9. EXPERTISE PAGE TAB SWITCHER ────────────
  const expertiseTabBtns = Array.from(document.querySelectorAll('.expertise-tab-btn'));
  if (expertiseTabBtns.length) {
    const expertiseTabPanels = Array.from(document.querySelectorAll('.expertise-tab-panel'));

    const activatePanel = (targetId) => {
      expertiseTabBtns.forEach((btn) => {
        const isActive = btn.dataset.target === targetId;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      expertiseTabPanels.forEach((panel) => {
        panel.classList.toggle('active', panel.id === targetId);
      });
    };

    expertiseTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => activatePanel(btn.dataset.target));
    });
  }

  // ── 10. EXPERTISE MATRIX ACCORDION ────────────
  const matrixCards = Array.from(document.querySelectorAll('.expertise-matrix .expertise-matrix-card'));
  if (matrixCards.length) {
    const openCard = (cardToOpen) => {
      matrixCards.forEach((card) => {
        const trigger = card.querySelector('.expertise-accordion-trigger');
        const content = card.querySelector('.expertise-accordion-content');
        if (!trigger || !content || card.classList.contains('is-hidden-first')) return;
        const isOpen = card === cardToOpen;
        card.classList.toggle('is-open', isOpen);
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        content.style.maxHeight = isOpen ? `${content.scrollHeight}px` : '0px';
      });
    };

    matrixCards.forEach((card, index) => {
      if (card.querySelector('.expertise-accordion-trigger')) return;
      if (index === 0) {
        card.classList.add('is-hidden-first');
        return;
      }
      const kicker = card.querySelector('.expertise-kicker');
      const title = card.querySelector('h2');
      if (!title) return;

      const contentNodes = Array.from(card.children).filter((node) => node !== title && node !== kicker);
      if (kicker) kicker.remove();
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'expertise-accordion-trigger';
      trigger.setAttribute('aria-expanded', 'false');

      const head = document.createElement('div');
      head.className = 'expertise-accordion-head';
      head.appendChild(title);

      const icon = document.createElement('span');
      icon.className = 'expertise-accordion-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '+';

      const content = document.createElement('div');
      content.className = 'expertise-accordion-content';
      content.style.maxHeight = '0px';
      contentNodes.forEach((node) => content.appendChild(node));

      trigger.appendChild(head);
      trigger.appendChild(icon);
      trigger.addEventListener('click', () => {
        const isAlreadyOpen = card.classList.contains('is-open');
        openCard(isAlreadyOpen ? null : card);
      });

      card.appendChild(trigger);
      card.appendChild(content);

    });
  }

  // ── 11. OFFERS PAGE FILTER ───────────────────
  const offerFilterBtns = Array.from(document.querySelectorAll('[data-offer-filter]'));
  const offerCards = Array.from(document.querySelectorAll('.offers-catalog-card[data-offer-domain]'));
  const offerCount = document.querySelector('[data-offer-count]');

  if (offerFilterBtns.length && offerCards.length) {
    const applyOfferFilter = (filterValue) => {
      let visibleCount = 0;
      offerCards.forEach((card) => {
        const match = filterValue === 'all' || card.dataset.offerDomain === filterValue;
        card.classList.toggle('is-hidden', !match);
        if (match) visibleCount += 1;
      });
      if (offerCount) offerCount.textContent = String(visibleCount);
    };

    offerFilterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        offerFilterBtns.forEach((el) => el.classList.remove('active'));
        btn.classList.add('active');
        applyOfferFilter(btn.dataset.offerFilter || 'all');
      });
    });

    const activeBtn = offerFilterBtns.find((btn) => btn.classList.contains('active')) || offerFilterBtns[0];
    if (activeBtn) applyOfferFilter(activeBtn.dataset.offerFilter || 'all');
  }

  // ── 12. FAQ SMOOTH ANIMATION ─────────────────
  const smoothFaqAccordions = Array.from(document.querySelectorAll('.faq-accordion-smooth'));
  smoothFaqAccordions.forEach((accordion) => {
    const items = Array.from(accordion.querySelectorAll('details'));
    items.forEach((details) => {
      const summary = details.querySelector('summary');
      const answer = details.querySelector('.faq-answer');
      if (!summary || !answer) return;

      answer.style.overflow = 'hidden';
      answer.style.maxHeight = details.open ? `${answer.scrollHeight}px` : '0px';

      summary.addEventListener('click', (event) => {
        event.preventDefault();
        const isOpen = details.open;
        const durationMs = 350;

        if (isOpen) {
          answer.style.maxHeight = `${answer.scrollHeight}px`;
          requestAnimationFrame(() => {
            answer.style.maxHeight = '0px';
          });
          window.setTimeout(() => {
            details.open = false;
          }, durationMs);
          return;
        }

        details.open = true;
        answer.style.maxHeight = '0px';
        requestAnimationFrame(() => {
          answer.style.maxHeight = `${answer.scrollHeight}px`;
        });
      });
    });
  });

  // ── 13. OFFER RELATED POSTS (Sanity FIFO) ────
  const offerRelatedFeed = document.getElementById('offerRelatedFeed');
  if (offerRelatedFeed) {
    const offerTag = (offerRelatedFeed.dataset.offerTag || '').trim();
    const limit = Math.max(parseInt(offerRelatedFeed.dataset.offerLimit || '2', 10), 1);
    const offerRelatedSection = offerRelatedFeed.closest('.js-offer-related-wrapper, .offer-shell-section');

    const escapeHtml = (value) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const loadOfferRelatedPosts = async () => {
      const projectId = 'vnmxplwi';
      const dataset = 'production';
      const apiVersion = '2024-10-01';
      const query = `*[
        _type == "blogPost"
        && (!defined(status) || status == "published")
        && ($offerTag in relatedOffers || offerTag == $offerTag)
      ] | order(coalesce(publishedAt, _createdAt) desc){
        title,
        "slug": slug.current,
        externalUrl,
        publicationType,
        publishedAt
      }`;

      const endpoints = [
        `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}&$offerTag=${encodeURIComponent(JSON.stringify(offerTag))}`,
        `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}&$offerTag=${encodeURIComponent(JSON.stringify(offerTag))}&t=${Date.now()}`,
      ];

      let result = [];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {headers: {Accept: 'application/json'}, cache: 'no-store'});
          if (!response.ok) continue;
          const json = await response.json();
          result = Array.isArray(json.result) ? json.result : [];
          if (result.length) break;
        } catch (_) {
          // Continue on fallback endpoint
        }
      }

      const fifoItems = result.slice(0, limit);
      if (!fifoItems.length) {
        if (offerRelatedSection) offerRelatedSection.style.display = 'none';
        return;
      }

      offerRelatedFeed.innerHTML = fifoItems.map((item) => {
        const title = escapeHtml(item.title || 'Publication');
        const href = item.externalUrl || (item.slug ? `${articleBasePath}?slug=${encodeURIComponent(item.slug)}` : blogBasePath);
        const external = /^https?:\/\//i.test(href);
        return `
          <a class="offer-related-card" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
            <strong>${title}</strong>
            <span>Source: Blog</span>
          </a>
        `;
      }).join('');
    };

  if (offerTag) {
    offerRelatedFeed.innerHTML = '';
    loadOfferRelatedPosts();
  } else if (offerRelatedSection) {
    offerRelatedSection.style.display = 'none';
  }
  }

  // ── 14. OFFER REX FEEDS (Sanity) ─────────────
  const offerRexGrids = Array.from(document.querySelectorAll('.offer-retex-grid'));
  if (offerRexGrids.length) {
    const escapeHtml = (value) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const projectId = 'vnmxplwi';
    const dataset = 'production';
    const apiVersion = '2024-10-01';

    const loadOfferRexGrid = async (grid) => {
      const section = grid.closest('.offer-shell-section');
      const shell = grid.closest('.offer-shell-main') || document;
      const relatedFeed =
        shell.querySelector('.offer-related-feed[data-offer-tag]') ||
        shell.querySelector('#offerRelatedFeed[data-offer-tag]');
      const offerTag = (relatedFeed?.dataset?.offerTag || '').trim();

      if (!offerTag) {
        if (section) section.style.display = 'none';
        return;
      }

      const limit = 2;
      const query = `*[
        _type == "offerRex"
        && status == "published"
        && ($offerTag in relatedOffers || offerTag == $offerTag)
      ] | order(coalesce(publishedAt, _createdAt) desc){
        _type,
        title,
        summary,
        "url": linkUrl,
        "slug": slug.current,
        sector
      }[0...$limit]`;

      const endpoints = [
        `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}&$offerTag=${encodeURIComponent(JSON.stringify(offerTag))}&$limit=${encodeURIComponent(JSON.stringify(limit))}`,
        `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}&$offerTag=${encodeURIComponent(JSON.stringify(offerTag))}&$limit=${encodeURIComponent(JSON.stringify(limit))}&t=${Date.now()}`
      ];

      let rows = [];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {headers: {Accept: 'application/json'}, cache: 'no-store'});
          if (!response.ok) continue;
          const json = await response.json();
          rows = Array.isArray(json.result) ? json.result : [];
          if (rows.length) break;
        } catch (_) {
          // Try next endpoint
        }
      }

      if (!rows.length) {
        if (section) section.style.display = 'none';
        return;
      }

      grid.innerHTML = rows.map((item) => {
        const title = escapeHtml(item.title || 'Client Story');
        const sector = escapeHtml(item.sector || 'Retour d’expérience');
        const summary = escapeHtml(item.summary || 'Retour d’expérience mission.');
        const href = item.url || (item.slug ? `${rexArticleBasePath}?slug=${encodeURIComponent(item.slug)}` : '');
        const external = /^https?:\/\//i.test(href);
        if (!href) {
          return `
          <article class="offer-retex-link">
            <strong>${title}</strong>
            <span>Secteur: ${sector}</span>
            <span>${summary}</span>
          </article>
        `;
        }
        return `
          <a class="offer-retex-link" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
            <strong>${title}</strong>
            <span>Secteur: ${sector}</span>
            <span>${summary}</span>
          </a>
        `;
      }).join('');
    };

    offerRexGrids.forEach((grid) => {
      loadOfferRexGrid(grid);
    });
  }

  // ── 15. AI PAGE OBSERVED VECTORS (Sanity) ────
  const aiVectorsList = document.getElementById('aiVectorsList');
  if (aiVectorsList) {
    const aiVectorsTitle = document.getElementById('aiVectorsTitle');
    const aiVectorsPeriod = document.getElementById('aiVectorsPeriod');
    const aiVectorsSource = document.getElementById('aiVectorsSource');

    const severityUi = {
      critical: {label: 'Critique', sevClass: 'sev-c', tagClass: 'tl-c'},
      high: {label: 'Élevé', sevClass: 'sev-h', tagClass: 'tl-h'},
      moderate: {label: 'Modéré', sevClass: 'sev-m', tagClass: 'tl-m'}
    };

    const escapeHtml = (value) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const loadAiObservedVectors = async () => {
      const projectId = 'vnmxplwi';
      const dataset = 'production';
      const apiVersion = '2024-10-01';
      const query = `*[_type == "aiObservedVectors" && isPublished == true] | order(_updatedAt desc)[0]{
        title,
        periodLabel,
        sourceNote,
        vectors[]{
          label,
          severity,
          order
        }
      }`;

      const endpoints = [
        `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}`,
        `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}&t=${Date.now()}`
      ];

      let doc = null;
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {headers: {Accept: 'application/json'}, cache: 'no-store'});
          if (!response.ok) continue;
          const json = await response.json();
          if (json && json.result) {
            doc = json.result;
            break;
          }
        } catch (_) {
          // fallback on next endpoint
        }
      }

      if (!doc || !Array.isArray(doc.vectors) || !doc.vectors.length) return;

      if (aiVectorsTitle && doc.title) aiVectorsTitle.textContent = doc.title;
      if (aiVectorsPeriod && doc.periodLabel) aiVectorsPeriod.textContent = doc.periodLabel;
      if (aiVectorsSource && doc.sourceNote) aiVectorsSource.textContent = `* ${doc.sourceNote}`;

      const rows = [...doc.vectors]
        .sort((a, b) => {
          const left = Number.isFinite(Number(a?.order)) ? Number(a.order) : 999;
          const right = Number.isFinite(Number(b?.order)) ? Number(b.order) : 999;
          return left - right;
        })
        .map((item) => {
          const severity = severityUi[item?.severity] || severityUi.moderate;
          return `
            <div class="threat">
              <div class="threat-sev ${severity.sevClass}"></div>
              <div class="threat-name">${escapeHtml(item?.label || '')}</div>
              <div class="threat-label ${severity.tagClass}">${severity.label}</div>
            </div>
          `;
        });

      aiVectorsList.innerHTML = rows.join('');
    };

    loadAiObservedVectors();
  }

  // ── 16. AI PAGE REX FEED (Sanity) ─────────────
  const aiRexFeed = document.getElementById('aiRexFeed');
  if (aiRexFeed) {
    const offerTag = (aiRexFeed.dataset.offerTag || '').trim();
    const limit = Math.max(parseInt(aiRexFeed.dataset.limit || '3', 10), 1);

    const escapeHtml = (value) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const loadAiRexFeed = async () => {
      const projectId = 'vnmxplwi';
      const dataset = 'production';
      const apiVersion = '2024-10-01';
      const query = `*[
        _type == "offerRex"
        && status == "published"
        && ($offerTag in relatedOffers || offerTag == $offerTag)
      ] | order(coalesce(publishedAt, _createdAt) desc){
        _type,
        title,
        summary,
        "url": linkUrl,
        "slug": slug.current,
        sector
      }[0...$limit]`;

      const endpoints = [
        `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}&$offerTag=${encodeURIComponent(JSON.stringify(offerTag))}&$limit=${encodeURIComponent(JSON.stringify(limit))}`,
        `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}&$offerTag=${encodeURIComponent(JSON.stringify(offerTag))}&$limit=${encodeURIComponent(JSON.stringify(limit))}&t=${Date.now()}`
      ];

      let rows = [];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {headers: {Accept: 'application/json'}, cache: 'no-store'});
          if (!response.ok) continue;
          const json = await response.json();
          rows = Array.isArray(json.result) ? json.result : [];
          if (rows.length) break;
        } catch (_) {
          // try next endpoint
        }
      }

      if (!rows.length) {
        const aiRexSection = aiRexFeed.closest('.rex-section');
        if (aiRexSection) aiRexSection.style.display = 'none';
        return;
      }

      aiRexFeed.innerHTML = rows.map((item) => {
        const sector = item.sector || 'Secteur';
        const title = escapeHtml(item.title || 'Client Story');
        const summary = escapeHtml(item.summary || 'Retour d’expérience mission.');
        const href = item.url || (item.slug ? `${rexArticleBasePath}?slug=${encodeURIComponent(item.slug)}` : '');
        const external = /^https?:\/\//i.test(href);
        if (!href) {
          return `
          <article class="rex-card">
            <div class="rex-sector">${escapeHtml(sector)}</div>
            <h3>${title}</h3>
            <p>${summary}</p>
          </article>
        `;
        }
        return `
          <a class="rex-card" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
            <div class="rex-sector">${escapeHtml(sector)}</div>
            <h3>${title}</h3>
            <p>${summary}</p>
          </a>
        `;
      }).join('');
    };

    if (offerTag) {
      loadAiRexFeed();
    } else {
      const aiRexSection = aiRexFeed.closest('.rex-section');
      if (aiRexSection) aiRexSection.style.display = 'none';
    }
  }

  // ── 17. SECTOR REX FEED (Sanity) ─────────────
  const sectorRexFeeds = Array.from(document.querySelectorAll('[data-rex-sector]'));
  if (sectorRexFeeds.length) {
    const escapeHtml = (value) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const projectId = 'vnmxplwi';
    const dataset = 'production';
    const apiVersion = '2024-10-01';

    const loadSectorRex = async (feed) => {
      const sectorTag = (feed.dataset.rexSector || '').trim().toLowerCase();
      const limit = Math.max(parseInt(feed.dataset.limit || '3', 10), 1);
      const section = feed.closest('.luxe-rex, .rex-section, section');
      if (!sectorTag) {
        if (section) section.style.display = 'none';
        return;
      }

      const query = `*[
        _type == "offerRex"
        && status == "published"
        && defined(sector)
        && lower(sector) match $sectorPattern
      ] | order(coalesce(publishedAt, _createdAt) desc){
        title,
        summary,
        sector,
        "url": linkUrl,
        "slug": slug.current,
        "coverUrl": coverImage.asset->url,
        "coverAlt": coalesce(coverImage.alt, title)
      }[0...$limit]`;

      const sectorPattern = `*${sectorTag}*`;
      const endpoints = [
        `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}&$sectorPattern=${encodeURIComponent(JSON.stringify(sectorPattern))}&$limit=${encodeURIComponent(JSON.stringify(limit))}`,
        `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}&$sectorPattern=${encodeURIComponent(JSON.stringify(sectorPattern))}&$limit=${encodeURIComponent(JSON.stringify(limit))}&t=${Date.now()}`
      ];

      let rows = [];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {headers: {Accept: 'application/json'}, cache: 'no-store'});
          if (!response.ok) continue;
          const json = await response.json();
          rows = Array.isArray(json.result) ? json.result : [];
          if (rows.length) break;
        } catch (_) {
          // try fallback endpoint
        }
      }

      if (!rows.length) {
        if (section) section.classList.add('luxe-rex-hidden');
        return;
      }

      feed.innerHTML = rows.map((item) => {
        const title = escapeHtml(item.title || 'Client Story');
        const sector = escapeHtml(item.sector || 'Secteur');
        const summary = escapeHtml(item.summary || 'Retour d’expérience mission.');
        const href = item.url || (item.slug ? `${rexArticleBasePath}?slug=${encodeURIComponent(item.slug)}` : '');
        const external = /^https?:\/\//i.test(href);
        const image = item.coverUrl
          ? `<div class="luxe-rex-media"><img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.coverAlt || title)}" loading="lazy" decoding="async"></div>`
          : '<div class="luxe-rex-media" aria-hidden="true"></div>';

        if (!href) {
          return `
            <article class="luxe-rex-item reveal visible">
              ${image}
              <div class="luxe-rex-body">
                <p class="luxe-rex-kicker">${sector}</p>
                <h3>${title}</h3>
                <p>${summary}</p>
              </div>
            </article>
          `;
        }

        return `
          <a class="luxe-rex-item reveal visible" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
            ${image}
            <div class="luxe-rex-body">
              <p class="luxe-rex-kicker">${sector}</p>
              <h3>${title}</h3>
              <p>${summary}</p>
              <span class="card-link">Lire la Client Story →</span>
            </div>
          </a>
        `;
      }).join('');
    };

    sectorRexFeeds.forEach((feed) => loadSectorRex(feed));
  }

  // Vision logos fallback: avoid broken image icons when a provider URL is unavailable.
  const isOfferLikePage = document.body.matches('.offer-editorial-page, .offer-brief-page, .page-cyber4ai');
  if (isOfferLikePage) {
    const projectId = 'vnmxplwi';
    const dataset = 'production';
    const apiVersion = '2024-10-01';
    const articleFeedNode = document.querySelector('.offer-related-feed[data-offer-tag], #offerRelatedFeed[data-offer-tag]');
    const aiRexFeedNode = document.querySelector('#aiRexFeed[data-offer-tag]');
    const offerTag = (articleFeedNode?.dataset.offerTag || aiRexFeedNode?.dataset.offerTag || '').trim();
    const offerTagTitleMap = {
      'swift-csp': 'SWIFT CSP',
      'cyber-4-ai': 'Cyber for AI',
      'audit-organisationnel': 'Audit et Contrôles',
      'resilience-reglemenaire': 'Résilience réglementaire',
      dora: 'DORA',
      'conformite-sectorielle': 'Conformité sectorielle',
      'cyber-cloud': 'Sécurité du cloud',
      'cyber-development': 'Sécurité du développement',
      'cyber-industries': 'Sécurité des industries',
      'cyber-resilience-operationnelle': 'Résilience opérationnelle',
      'risques-gouvernance': 'Gouvernance (Risques Digitaux)',
      'risques-resilience': 'Résilience (Risques Digitaux)',
      'risques-sensibilisation': 'Sensibilisation (Risques Digitaux)',
      'transfo-program-strategy-delivery': 'Program strategy and delivery',
      'transfo-security-capability-implementation': 'Security capability implementation',
      'transfo-security-by-design': 'Security by design',
      'risques-digitaux': 'Risques Digitaux',
      'cyber-defense': 'Cyber Défense',
      'transfo-cyber': 'Transfo Cyber'
    };
    const normalizeOfferValue = (value) =>
      String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/&/g, 'et')
        .replace(/[^a-z0-9]+/g, '')
        .trim();
    const normalizedOfferTags = Array.from(new Set([
      offerTag,
      offerTag.toLowerCase(),
      offerTag.replace(/-/g, ' '),
      offerTag.replace(/-/g, ' ').toLowerCase(),
      offerTag.replace(/[-\s]/g, ''),
      offerTag.replace(/[-\s]/g, '').toLowerCase(),
      offerTagTitleMap[offerTag] || '',
      normalizeOfferValue(offerTag),
      normalizeOfferValue(offerTagTitleMap[offerTag] || '')
    ].filter(Boolean)));
    const isBriefOffer = document.body.matches('.offer-brief-page, .page-cyber4ai');
    const oldArticleSection = isBriefOffer
      ? (articleFeedNode?.closest('.rex-section') || null)
      : (articleFeedNode?.closest('.js-offer-related-wrapper, .offer-shell-section, .rex-section') || null);
    const oldRexSection = isBriefOffer
      ? (aiRexFeedNode?.closest('.rex-section') || null)
      : (document.querySelector('.offer-retex-grid')?.closest('.offer-shell-section') || null);
    const ownerSection = document.querySelector('.offer-shell-profile, .owner');
    const insertionAnchor = ownerSection || oldArticleSection || oldRexSection;

    const escapeHtml = (value) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const hideLegacyPublicationSections = () => {
      [...new Set([oldArticleSection, oldRexSection].filter(Boolean))].forEach((node) => {
        if (node) node.style.display = 'none';
      });
    };

    const fetchRows = async (query, params = {}) => {
      const serializedParams = Object.entries(params)
        .map(([key, value]) => `&$${key}=${encodeURIComponent(JSON.stringify(value))}`)
        .join('');
      const endpoints = [
        `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}${serializedParams}`,
        `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?perspective=published&query=${encodeURIComponent(query)}${serializedParams}&t=${Date.now()}`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {headers: {Accept: 'application/json'}, cache: 'no-store'});
          if (!response.ok) continue;
          const json = await response.json();
          const rows = Array.isArray(json.result) ? json.result : [];
          if (rows.length) return rows;
        } catch (_) {
          // fallback endpoint
        }
      }
      return [];
    };

    const matchesOfferTag = (value) => {
      const normalized = normalizeOfferValue(value);
      return Boolean(normalized && normalizedOfferTags.includes(normalized));
    };

    const renderArticles = (items) => items.map((item) => {
      const title = escapeHtml(item.title || 'Article');
      const href = item.externalUrl || (item.slug ? `${articleBasePath}?slug=${encodeURIComponent(item.slug)}` : blogBasePath);
      const external = /^https?:\/\//i.test(href);
      const media = item.coverUrl
        ? `<div class="offer-publication-media"><img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.coverAlt || title)}" loading="lazy" decoding="async"></div>`
        : '';
      return `
        <a class="offer-publication-card offer-publication-card-article" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
          ${media}
          <div class="offer-publication-body">
            <div class="offer-publication-type">Article</div>
            <strong>${title}</strong>
            <span>Publication liée à l’offre</span>
          </div>
        </a>
      `;
    }).join('');

    const renderStories = (items) => items.map((item) => {
      const title = escapeHtml(item.title || 'Client Story');
      const sector = escapeHtml(item.sector || 'Secteur');
      const summary = escapeHtml(item.summary || 'Retour d’expérience mission.');
      const href = item.url || (item.slug ? `${rexArticleBasePath}?slug=${encodeURIComponent(item.slug)}` : '');
      const external = /^https?:\/\//i.test(href);
      const badge = `<div class="offer-publication-type">Client Story • ${sector}</div>`;
      const media = item.coverUrl
        ? `<div class="offer-publication-media"><img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.coverAlt || title)}" loading="lazy" decoding="async"></div>`
        : '';
      if (!href) {
        return `
          <article class="offer-publication-card offer-publication-card-story">
            ${media}
            <div class="offer-publication-body">
              ${badge}
              <strong>${title}</strong>
              <span>${summary}</span>
            </div>
          </article>
        `;
      }
      return `
        <a class="offer-publication-card offer-publication-card-story" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
          ${media}
          <div class="offer-publication-body">
            ${badge}
            <strong>${title}</strong>
            <span>${summary}</span>
          </div>
        </a>
      `;
    }).join('');

    const mountUnifiedPublications = (articles, stories) => {
      if (!insertionAnchor) return;

      const existing = document.querySelector('.offer-publications-section');
      if (existing) existing.remove();

      if (!articles.length && !stories.length) {
        hideLegacyPublicationSections();
        return;
      }

      hideLegacyPublicationSections();

      const isEditorialOffer = document.body.matches('.offer-editorial-page') && !isBriefOffer;
      const articleGridClass = articles.length > 2 ? 'offer-publications-grid offer-publications-grid-scroll' : 'offer-publications-grid';
      const storyGridClass = stories.length > 2 ? 'offer-publications-grid offer-publications-grid-scroll' : 'offer-publications-grid';
      const section = document.createElement(isEditorialOffer ? 'article' : 'section');
      section.className = isEditorialOffer
        ? 'offer-shell-section reveal visible offer-publications-section'
        : 'rex-section offer-publications-section';

      if (isEditorialOffer) {
        section.innerHTML = `
          <div class="offer-shell-head">
            <div class="offer-shell-num">05</div>
            <h3>Publications</h3>
          </div>
          <div class="offer-publications-groups">
            ${articles.length ? `
              <div class="offer-publications-group">
                <h4>Articles</h4>
                <div class="${articleGridClass}">
                  ${renderArticles(articles)}
                </div>
              </div>
            ` : ''}
            ${stories.length ? `
              <div class="offer-publications-group">
                <h4>Client Stories</h4>
                <div class="${storyGridClass}">
                  ${renderStories(stories)}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      } else {
        section.innerHTML = `
          <div class="wrap">
            <span class="eyebrow rex-eyebrow">Publications</span>
            <h2 class="sh rex-title">Publications <span class="text-orange">liées à l’offre</span></h2>
            <div class="offer-publications-groups offer-publications-groups-brief">
              ${articles.length ? `
                <div class="offer-publications-group">
                  <h4>Articles</h4>
                  <div class="${articleGridClass}">
                    ${renderArticles(articles)}
                  </div>
                </div>
              ` : ''}
              ${stories.length ? `
                <div class="offer-publications-group">
                  <h4>Client Stories</h4>
                  <div class="${storyGridClass}">
                    ${renderStories(stories)}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }

      insertionAnchor.parentNode.insertBefore(section, insertionAnchor);
    };

    if (offerTag && insertionAnchor) {
      (async () => {
        const [articles, stories] = await Promise.all([
          fetchRows(
            `*[
              _type == "blogPost"
              && (!defined(status) || status == "published")
            ] | order(coalesce(publishedAt, _createdAt) desc){
              title,
              relatedOffers,
              offerTag,
              "slug": slug.current,
              externalUrl,
              "coverUrl": coverImage.asset->url,
              "coverAlt": coalesce(coverImage.alt, title)
            }[0...40]`
          ),
          fetchRows(
            `*[
              _type == "offerRex"
              && status == "published"
            ] | order(coalesce(publishedAt, _createdAt) desc){
              title,
              relatedOffers,
              offerTag,
              summary,
              sector,
              "url": linkUrl,
              "slug": slug.current,
              "coverUrl": coverImage.asset->url,
              "coverAlt": coalesce(coverImage.alt, title)
            }[0...40]`
          ),
        ]);

        const matchesItem = (item) => {
          const tags = Array.isArray(item.relatedOffers) ? item.relatedOffers : (item.offerTag ? [item.offerTag] : []);
          return tags.some(t => matchesOfferTag(t));
        };
        mountUnifiedPublications(
          articles.filter(matchesItem).slice(0, 8),
          stories.filter(matchesItem).slice(0, 8)
        );
      })();
    } else {
      hideLegacyPublicationSections();
    }
  }

  // Vision logos fallback: avoid broken image icons when a provider URL is unavailable.
  document.querySelectorAll('.vision-logo-item img').forEach((img) => {
    const applyFallback = () => {
      const slot = img.closest('.vision-logo-item');
      if (!slot) return;
      slot.classList.add('is-fallback');
      img.remove();
    };
    img.addEventListener('error', applyFallback, {once: true});
    if (img.complete && img.naturalWidth === 0) applyFallback();
  });

  try { localStorage.removeItem(LANG_STORAGE_KEY); } catch (_) {}

});
