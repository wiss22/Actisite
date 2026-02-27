/* ══════════════════════════════════════════════
   ACTINUANCE — script.js
   - Hero carousel with autoplay & progress
   - Scroll-triggered reveal animations
   - Animated counters
   - Navbar scroll behaviour
════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-reveal');
  const LANG_STORAGE_KEY = 'actinuance_lang';
  const frTitle = document.title;
  const textNodeOriginals = new WeakMap();
  let currentLang = localStorage.getItem(LANG_STORAGE_KEY) === 'en' ? 'en' : 'fr';

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
    innovation: 'Actinuance — Innovation',
    article: 'Actinuance — Article',
    offres: 'Actinuance — Offers',
    'postes-ouverts': 'Open Roles — Actinuance',
    'audit-organisationnel': 'Organizational Audit — Actinuance',
    'audit-conformite-nis-dora': 'NIS2 & DORA Compliance Audit — Actinuance',
    swift: 'SWIFT — Actinuance'
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
    'Retail': 'Retail',
    'Industrie & Transport': 'Industry & Transportation',
    'Techno': 'Technology',
    'Banque': 'Banking',
    'Swift': 'SWIFT',
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

  // ── 1b. NAV DROPDOWNS ─────────────────────────
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

  // ── 3b. PILLAR OFFERS SIDE NAV ACTIVE STATE ───────────────
  const pillarNavs = Array.from(document.querySelectorAll('.pillar-flynav, .pillar-offers-nav'));
  if (pillarNavs.length) {
    const toggleFlynavVisibility = () => {
      const shouldShow = window.innerWidth <= 1024 || window.scrollY > 120;
      pillarNavs.forEach((nav) => nav.classList.toggle('is-shown', shouldShow));
    };
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
                <a href="/cyber-4-ai" onclick="closeMobileNav()">AI for Cyber</a>
                <a href="/risques-digitaux" onclick="closeMobileNav()">${currentLang === 'en' ? 'Digital Risk' : 'Risques Digitaux'}</a>
                <a href="/cyber-defense" onclick="closeMobileNav()">${currentLang === 'en' ? 'Cyber Defense' : 'Cyber Défense'}</a>
                <a href="/audit-conformite" onclick="closeMobileNav()">${currentLang === 'en' ? 'Audit & Compliance' : 'Audit et Conformité'}</a>
                <a href="/transfo-cyber" onclick="closeMobileNav()">${currentLang === 'en' ? 'Cyber Transformation' : 'Transfo Cyber'}</a>
              </div>
            </details>
            <details class="m-accordion">
              <summary>${currentLang === 'en' ? 'Industries' : 'Secteurs'}</summary>
              <div class="m-sub">
                <a href="/#secteurs" onclick="closeMobileNav()">${currentLang === 'en' ? 'Banking' : 'Banque'}</a>
                <a href="/#secteurs" onclick="closeMobileNav()">${currentLang === 'en' ? 'Insurance' : 'Assurance'}</a>
                <a href="/#secteurs" onclick="closeMobileNav()">${currentLang === 'en' ? 'Luxury' : 'Luxe'}</a>
                <a href="/#secteurs" onclick="closeMobileNav()">Retail</a>
                <a href="/#secteurs" onclick="closeMobileNav()">${currentLang === 'en' ? 'Industry & Transportation' : 'Industrie & Transport'}</a>
                <a href="/#secteurs" onclick="closeMobileNav()">${currentLang === 'en' ? 'Technology' : 'Techno'}</a>
              </div>
            </details>
            <details class="m-accordion">
              <summary>${currentLang === 'en' ? 'Publications' : 'Publications'}</summary>
              <div class="m-sub">
                <a href="/blog" onclick="closeMobileNav()">Articles</a>
                <a href="/innovation" onclick="closeMobileNav()">Innovation</a>
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
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');
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

    const escapeHtml = (value) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const isLinkedInUrl = (url) => /linkedin\.com/i.test(String(url || ''));

    const loadOfferRelatedPosts = async () => {
      const projectId = 'vnmxplwi';
      const dataset = 'production';
      const apiVersion = '2024-10-01';
      const query = `*[_type in ["blogPost", "linkedinPost"] && (!defined(status) || status == "published") && $offerTag in coalesce(offerTags, [])] | order(coalesce(publishedAt, _createdAt) asc){
        _type,
        title,
        "slug": select(_type == "blogPost" => slug.current, null),
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
        offerRelatedFeed.innerHTML = `
          <a class="offer-related-card" href="https://www.linkedin.com/company/actinuance/" target="_blank" rel="noopener noreferrer">
            <strong>LinkedIn Actinuance</strong>
            <span>Aucun post tagué pour cette offre pour le moment. Voir le flux LinkedIn.</span>
          </a>
        `;
        return;
      }

      offerRelatedFeed.innerHTML = fifoItems.map((item) => {
        const title = escapeHtml(item.title || 'Publication');
        const href = item.externalUrl || (item.slug ? `article?slug=${encodeURIComponent(item.slug)}` : '/blog');
        const source = item._type === 'linkedinPost' || isLinkedInUrl(item.externalUrl) ? 'LinkedIn' : 'Blog';
        const external = /^https?:\/\//i.test(href);
        return `
          <a class="offer-related-card" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
            <strong>${title}</strong>
            <span>Source: ${source}</span>
          </a>
        `;
      }).join('');
    };

  if (offerTag) loadOfferRelatedPosts();
  }

  // ── 14. AI PAGE OBSERVED VECTORS (Sanity) ────
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

  createLanguageSwitch();
  applyLanguage(currentLang);

});
