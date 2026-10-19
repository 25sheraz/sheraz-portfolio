import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Binds scroll position to the 3D scene: whichever section holds the viewport
// centre becomes the active scene. Also drives the progress bar and nav state.
export function initScroll({ onSection }) {
  const sections = Array.from(document.querySelectorAll('section[data-scene]'));
  sections.forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) onSection(sec.dataset.scene, sec.id);
      },
    });
  });

  const bar = document.getElementById('progress-bar');
  const nav = document.getElementById('nav');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return { refresh: () => ScrollTrigger.refresh() };
}

export function refreshScroll() {
  ScrollTrigger.refresh();
}
