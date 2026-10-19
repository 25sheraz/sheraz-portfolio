import { gsap } from 'gsap';

// Fade/slide elements in as they enter the viewport.
export function initReveal(device) {
  const els = Array.from(document.querySelectorAll('[data-reveal]'));
  if (device.reducedMotion || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible', 'is-settled'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      let i = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = Math.min(i++, 8) * 70;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-visible');
        setTimeout(() => {
          el.classList.add('is-settled');
          el.style.transitionDelay = '';
        }, 900 + delay);
        io.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  els.forEach((el) => io.observe(el));
}

// Count numbers up when their stat tile scrolls into view.
export function initCounters(device) {
  const els = Array.from(document.querySelectorAll('[data-count]'));
  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    if (device.reducedMotion) {
      el.textContent = String(target);
      return;
    }
    const o = { v: 0 };
    gsap.to(o, {
      v: target,
      duration: 1.8,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = String(Math.round(o.v));
      },
    });
  };
  if (!('IntersectionObserver' in window)) {
    els.forEach(run);
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.5 }
  );
  els.forEach((el) => io.observe(el));
}

// Types and deletes a list of phrases in a loop.
export function initTypewriter(el, words, device) {
  if (!el || !words?.length) return;
  if (device.reducedMotion) {
    let i = 0;
    el.textContent = words[0];
    setInterval(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
    }, 2800);
    return;
  }
  let wi = 0;
  let ci = 0;
  let deleting = false;
  const tick = () => {
    const w = words[wi];
    if (!deleting) {
      ci++;
      el.textContent = w.slice(0, ci);
      if (ci === w.length) {
        deleting = true;
        setTimeout(tick, 1700);
        return;
      }
      setTimeout(tick, 45 + Math.random() * 40);
      return;
    }
    ci--;
    el.textContent = w.slice(0, ci);
    if (ci === 0) {
      deleting = false;
      wi = (wi + 1) % words.length;
      setTimeout(tick, 350);
      return;
    }
    setTimeout(tick, 28);
  };
  setTimeout(tick, 600);
}

// 3D tilt for elements with .tilt (desktop pointer only).
export function initTilt(device) {
  if (!device.hasFinePointer || device.reducedMotion) return;
  document.querySelectorAll('.tilt').forEach((el) => {
    let raf = 0;
    const max = 8;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
        el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
      });
    });
    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

// Spotlight glow that follows the pointer across cards.
export function initSpotlight(device) {
  if (!device.hasFinePointer) return;
  document.addEventListener(
    'pointermove',
    (e) => {
      const card = e.target.closest?.('.card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    },
    { passive: true }
  );
}

// Category filter buttons for the project grid.
export function initProjectFilters(onChange) {
  const wrap = document.getElementById('project-filters');
  const grid = document.getElementById('project-grid');
  if (!wrap || !grid) return;
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter');
    if (!btn) return;
    const f = btn.dataset.filter;
    wrap.querySelectorAll('.filter').forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    grid.querySelectorAll('.project').forEach((card) => {
      const show = f === 'all' || card.dataset.category === f;
      card.classList.toggle('is-hidden', !show);
      if (show) card.classList.add('is-visible', 'is-settled');
    });
    onChange?.();
  });
}
