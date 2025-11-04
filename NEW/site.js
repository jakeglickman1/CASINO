import { initScrollSpy } from './core/scrollspy.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}

function initYearStamp() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function initNavDrawer() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const tray = document.querySelector('[data-nav-tray]');
  const overlay = document.querySelector('[data-nav-overlay]');
  if (!toggle || !tray) return;

  const navLinks = tray.querySelectorAll('a[href]');
  const closeNav = (options = {}) => setOpen(false, options);
  let navIsOpen = false;

  function setOpen(nextState, { restoreFocus = true } = {}) {
    const isOpen = Boolean(nextState);
    if (isOpen === navIsOpen) return;
    navIsOpen = isOpen;

    document.body.classList.toggle('nav-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    tray.setAttribute('aria-hidden', String(!isOpen));

    if (overlay) {
      if (isOpen) {
        overlay.hidden = false;
        requestAnimationFrame(() => overlay.classList.add('is-active'));
      } else {
        overlay.classList.remove('is-active');
        overlay.addEventListener(
          'transitionend',
          () => {
            overlay.hidden = true;
          },
          { once: true }
        );
      }
    }

    if (!isOpen && restoreFocus) {
      toggle.focus();
    }
  }

  const handleToggle = () => {
    setOpen(!navIsOpen);
  };

  toggle.addEventListener('click', handleToggle);

  if (overlay) {
    overlay.addEventListener('click', () => closeNav());
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => closeNav({ restoreFocus: false }));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navIsOpen) {
      event.stopPropagation();
      setOpen(false);
    }
  });

  tray.setAttribute('aria-hidden', 'true');
  if (overlay) {
    overlay.hidden = true;
    overlay.classList.remove('is-active');
  }
}

function initHeroCta() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const ctas = hero.querySelectorAll('.hero__actions .btn');
  if (!ctas.length) return;

  const activate = () => {
    hero.classList.add('hero--engaged');
    ctas.forEach((btn, index) => {
      btn.style.setProperty('--cta-delay', `${index * 80}ms`);
    });
  };

  if (prefersReducedMotion.matches) {
    activate();
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activate();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.45 }
  );

  observer.observe(hero);
}

function initScrollSpyNav() {
  initScrollSpy({ navSelector: '.challenge-nav', rootMargin: '-45% 0px -45% 0px' });
}

function initHelpPanels() {
  const triggers = Array.from(document.querySelectorAll('[data-help-target]'));
  if (!triggers.length) return;

  triggers.forEach(trigger => {
    const targetId = trigger.getAttribute('data-help-target');
    if (!targetId) return;
    const panel = document.getElementById(targetId);
    if (!panel) return;
    const closeBtn = panel.querySelector('[data-help-close]');
    const focusable = panel.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const closePanel = () => {
      panel.classList.remove('is-visible');
      trigger.setAttribute('aria-expanded', 'false');
      const finalize = () => {
        panel.hidden = true;
        trigger.focus({ preventScroll: true });
      };
      panel.addEventListener('transitionend', finalize, { once: true });
      window.setTimeout(() => {
        if (!panel.hidden) {
          finalize();
        }
      }, 250);
      document.removeEventListener('keydown', handleEscape);
    };

    const openPanel = () => {
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-visible'));
      trigger.setAttribute('aria-expanded', 'true');
      (focusable || panel).focus({ preventScroll: true });
      document.addEventListener('keydown', handleEscape);
    };

    const handleEscape = event => {
      if (event.key === 'Escape' && panel.classList.contains('is-visible')) {
        event.stopPropagation();
        closePanel();
      }
    };

    trigger.addEventListener('click', event => {
      event.preventDefault();
      if (panel.classList.contains('is-visible')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => closePanel());
    }

    panel.addEventListener('click', event => {
      if (event.target === panel) {
        closePanel();
      }
    });
  });
}

function initStatusRegions() {
  document.querySelectorAll('[data-status]').forEach(node => {
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
  });
}

ready(() => {
  document.body.classList.add('is-enhanced');
  initYearStamp();
  initNavDrawer();
  initHeroCta();
  initScrollSpyNav();
  initHelpPanels();
  initStatusRegions();
});
