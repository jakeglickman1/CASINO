export function initScrollSpy({
  navSelector = '.challenge-nav',
  activeClass = 'is-active',
  threshold = 0.45,
  rootMargin = '0px',
} = {}) {
  const nav =
    typeof navSelector === 'string' ? document.querySelector(navSelector) : navSelector instanceof Element ? navSelector : null;
  if (!nav) return () => {};

  const targets = new Map();
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));

  links.forEach(link => {
    const id = link.getAttribute('href');
    if (!id) return;
    const section = document.querySelector(id);
    if (section) {
      targets.set(section, link);
    }
  });

  if (targets.size === 0) return () => {};

  let current;

  const activate = link => {
    if (!link || link === current) return;
    links.forEach(item => item.classList.remove(activeClass));
    link.classList.add(activeClass);
    current = link;
  };

  const observer = new IntersectionObserver(
    entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length === 0) return;
      const topEntry = visible[0];
      const link = targets.get(topEntry.target);
      if (link) {
        activate(link);
      }
    },
    { root: null, threshold, rootMargin }
  );

  targets.forEach((_, section) => observer.observe(section));

  nav.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    activate(anchor);
  });

  return () => observer.disconnect();
}
