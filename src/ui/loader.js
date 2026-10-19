import { gsap } from 'gsap';

export function initLoader() {
  const el = document.getElementById('loader');
  const bar = document.getElementById('loader-bar');
  const count = document.getElementById('loader-count');
  const o = { v: 0 };

  const render = () => {
    const v = Math.round(o.v);
    if (count) count.textContent = String(v);
    if (bar) bar.style.width = `${v}%`;
  };

  const warm = gsap.to(o, { v: 88, duration: 1.6, ease: 'power2.out', onUpdate: render });

  let finishing = null;
  function done() {
    if (finishing) return finishing;
    warm.kill();
    finishing = new Promise((resolve) => {
      gsap.to(o, {
        v: 100,
        duration: 0.35,
        ease: 'power1.in',
        onUpdate: render,
        onComplete: () => {
          el?.classList.add('is-done');
          el?.setAttribute('aria-hidden', 'true');
          document.body.classList.add('is-ready');
          setTimeout(resolve, 120);
        },
      });
    });
    return finishing;
  }

  // Never trap a visitor behind the loader if something upstream stalls.
  setTimeout(done, 5000);

  return { done };
}
