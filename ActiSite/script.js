(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      document.body.classList.toggle('menu-open', !open);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  const revealElements = document.querySelectorAll('.reveal:not(.is-visible)');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -40px' });

    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
      observer.observe(element);
    });
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  const expertiseItems = [...document.querySelectorAll('[data-expertise-item]')];
  const progress = document.querySelector('[data-progress]');

  expertiseItems.forEach((item, index) => {
    const button = item.querySelector('button');
    const panel = item.querySelector('.expertise-panel');
    const icon = item.querySelector('.expertise-icon');

    button?.addEventListener('click', () => {
      expertiseItems.forEach((other) => {
        const otherButton = other.querySelector('button');
        const otherPanel = other.querySelector('.expertise-panel');
        const otherIcon = other.querySelector('.expertise-icon');
        const isCurrent = other === item;

        other.classList.toggle('is-active', isCurrent);
        otherButton?.setAttribute('aria-expanded', String(isCurrent));
        if (otherPanel) otherPanel.hidden = !isCurrent;
        if (otherIcon) otherIcon.textContent = isCurrent ? '−' : '+';
      });

      if (progress) progress.style.width = `${(index + 1) * 25}%`;
    });
  });

  const sectors = {
    bank: {
      number: '01',
      art: 'BANKING\nRESILIENCE',
      label: 'Banque & services financiers',
      title: 'Protéger la confiance, la continuité et les services critiques.',
      description: 'Nous accompagnons les banques, établissements financiers et acteurs du paiement dans la maîtrise des risques numériques et la résilience opérationnelle.',
      priorities: ['Résilience des services financiers critiques', 'Protection contre la fraude et les compromissions', 'DORA, NIS2 et exigences de supervision']
    },
    luxury: {
      number: '02',
      art: 'BRAND\nPROTECTION',
      label: 'Luxe',
      title: 'Préserver la marque, les créations et la confiance client.',
      description: 'Nous sécurisons les maisons et groupes du luxe face aux risques qui touchent leur réputation, leurs données sensibles et leur chaîne de valeur mondiale.',
      priorities: ['Protection des créations et de la propriété intellectuelle', 'Confidentialité des clients à haute valeur', 'Sécurisation du retail, de l’e-commerce et des partenaires']
    },
    industry: {
      number: '03',
      art: 'OPERATIONS\nCONTINUITY',
      label: 'Industrie & transport',
      title: 'Sécuriser l’outil opérationnel sans interrompre la production.',
      description: 'Nous aidons les opérateurs industriels et de transport à protéger leurs environnements IT/OT, leurs flux critiques et la continuité de leurs opérations.',
      priorities: ['Continuité des opérations et services critiques', 'Sécurisation des environnements IT/OT', 'Risques fournisseurs et chaîne logistique']
    },
    insurance: {
      number: '04',
      art: 'TRUST\nBY DESIGN',
      label: 'Assurance',
      title: 'Rendre la résilience conforme, pragmatique et pilotable.',
      description: 'Nous accompagnons assureurs, mutuelles, courtiers et réassureurs sur la protection des données, la continuité des activités et les dépendances tierces.',
      priorities: ['Résilience opérationnelle et DORA', 'Sécurité des données assurés', 'Risques liés aux délégataires et partenaires']
    },
    tech: {
      number: '05',
      art: 'SECURE\nPRODUCTS',
      label: 'Tech & plateformes numériques',
      title: 'Faire de la sécurité une propriété du produit, pas une étape finale.',
      description: 'Nous intégrons la sécurité dans les produits, architectures cloud, plateformes et opérations des entreprises technologiques en croissance.',
      priorities: ['Sécurité des produits et plateformes numériques', 'Exposition des systèmes et intégrations partenaires', 'Disponibilité des services et résilience cloud']
    }
  };

  const sectorBrowser = document.querySelector('[data-sector-browser]');
  if (sectorBrowser) {
    const buttons = [...sectorBrowser.querySelectorAll('[data-sector]')];
    const number = sectorBrowser.querySelector('[data-sector-number]');
    const art = sectorBrowser.querySelector('[data-sector-art-word]');
    const label = sectorBrowser.querySelector('[data-sector-label]');
    const title = sectorBrowser.querySelector('[data-sector-title]');
    const description = sectorBrowser.querySelector('[data-sector-description]');
    const priorityList = sectorBrowser.querySelector('[data-sector-priorities]');
    const content = sectorBrowser.querySelector('.sector-content');

    const renderSector = (key) => {
      const sector = sectors[key];
      if (!sector) return;

      content?.animate([
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });

      if (number) number.textContent = sector.number;
      if (art) art.innerHTML = sector.art.replace('\n', '<br>');
      if (label) label.textContent = sector.label;
      if (title) title.textContent = sector.title;
      if (description) description.textContent = sector.description;
      if (priorityList) {
        priorityList.innerHTML = sector.priorities.map((item) => `<li>${item}</li>`).join('');
      }
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((other) => {
          const active = other === button;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-selected', String(active));
        });
        renderSector(button.dataset.sector);
      });
    });
  }
})();
