/* ══════════════════════════════════════════════
   ACTINUANCE — script.js
   - Hero carousel with autoplay & progress
   - Scroll-triggered reveal animations
   - Animated counters
   - Navbar scroll behaviour
════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

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
  const navLinks = document.querySelector('.nav-links');
  const navCta   = document.querySelector('.nav-cta');

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
                font-size: 1.1rem;
                color: rgba(255,255,255,0.8);
                padding: 16px 0;
                border-bottom: 1px solid rgba(255,255,255,0.06);
                display: block;
                transition: color 0.2s;
              }
              #mobile-nav a:hover { color: #F18847; }
              #mobile-nav .m-cta {
                margin-top: 24px;
                background: #F18847;
                color: white !important;
                padding: 14px 24px !important;
                text-align: center;
                font-family: 'Poppins', sans-serif;
                font-weight: 500;
                font-size: 0.82rem;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                border: none;
              }
            </style>
            <a href="index.html#expertises" onclick="closeMobileNav()">Expertises</a>
            <a href="index.html#secteurs" onclick="closeMobileNav()">Secteurs</a>
            <a href="blog.html" onclick="closeMobileNav()">Articles</a>
            <a href="innovation.html" onclick="closeMobileNav()">Innovation</a>
            <a href="index.html#apropos" onclick="closeMobileNav()">À propos</a>
            <a href="nous-rejoindre.html" onclick="closeMobileNav()">Nous rejoindre</a>
            <a href="index.html#contact" class="m-cta" onclick="closeMobileNav()">Nous contacter</a>
          `;
          document.body.appendChild(mobileNav);
        } else {
          mobileNav.style.display = 'flex';
        }

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

  // ── 6b. CAREER PATH TOGGLE ────────────────────
  const careerSection = document.getElementById('parcours-consultant');
  const careerToggleBtn = document.getElementById('careerToggleBtn');
  const careerRevealBtn = document.getElementById('careerRevealBtn');
  const careerToggleLabel = careerToggleBtn ? careerToggleBtn.querySelector('.career-toggle-label') : null;

  function setCareerCollapsed(collapsed) {
    if (!careerSection || !careerToggleBtn || !careerToggleLabel) return;
    careerSection.classList.toggle('is-collapsed', collapsed);
    careerToggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    careerToggleLabel.textContent = collapsed ? 'Afficher' : 'Masquer';
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


});
