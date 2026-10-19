export function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('nav-links');
  const navLinks = links ? Array.from(links.querySelectorAll('a[data-nav]')) : [];

  const close = () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('no-scroll');
  };
  const open = () => {
    nav.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('no-scroll');
  };

  burger?.addEventListener('click', () => (nav.classList.contains('is-open') ? close() : open()));
  links?.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  const wide = window.matchMedia('(min-width: 861px)');
  const onWide = (e) => e.matches && close();
  if (wide.addEventListener) wide.addEventListener('change', onWide);
  else wide.addListener(onWide);

  return {
    close,
    setActive(id) {
      navLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.nav === id));
    },
  };
}
