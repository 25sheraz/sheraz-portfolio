import { gsap } from 'gsap';

// Boot-sequence messages shown as the bar fills.
const STATUS = [
  [0, 'Booting agent graph'],
  [22, 'Loading knowledge base'],
  [45, 'Connecting webhooks'],
  [68, 'Calibrating vision models'],
  [88, 'Compiling portfolio'],
  [100, 'Ready'],
];

export function initLoader() {
  const el = document.getElementById('loader');
  const bar = document.getElementById('loader-bar');
  const count = document.getElementById('loader-count');
  const status = document.getElementById('loader-status');
  const o = { v: 0 };
  let lastStatus = '';

  const render = () => {
    const v = Math.round(o.v);
    if (count) count.textContent = String(v);
    if (bar) bar.style.width = `${v}%`;
    if (status) {
      let msg = STATUS[0][1];
      for (const [at, text] of STATUS) if (v >= at) msg = text;
      if (msg !== lastStatus) {
        lastStatus = msg;
        status.textContent = msg;
      }
    }
  };

  const warm = gsap.to(o, { v: 86, duration: 2.2, ease: 'power2.out', onUpdate: render });

  let finishing = null;
  function done() {
    if (finishing) return finishing;
    warm.kill();
    finishing = new Promise((resolve) => {
      gsap.to(o, {
        v: 100,
        duration: 0.4,
        ease: 'power1.in',
        onUpdate: render,
        onComplete: () => {
          // Brief beat on "Ready", then iris-close into the page.
          setTimeout(() => {
            el?.classList.add('is-done');
            el?.setAttribute('aria-hidden', 'true');
            document.body.classList.add('is-ready');
            setTimeout(resolve, 350);
          }, 220);
        },
      });
    });
    return finishing;
  }

  // Never trap a visitor behind the loader if something upstream stalls.
  setTimeout(done, 6000);

  return { done };
}
