import { projects } from '../data/cv.js';
import { ICONS, catLabel } from '../sections/render.js';

const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const SIZES = '(min-width: 1220px) 1120px, 92vw'; // how wide the viewer shows a cover
const pad2 = (n) => String(n).padStart(2, '0');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Full-size viewer for the project covers. A clicked cover grows out of its card into an overlay;
// the arrows, arrow keys or a swipe step through the projects the current filter shows.
export function initLightbox(device) {
  const grid = document.getElementById('project-grid');
  if (!grid) return;

  const root = document.createElement('div');
  root.className = 'lightbox';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'lightbox-title');
  root.innerHTML = `
    <div class="lightbox__backdrop" data-close></div>
    <button class="lightbox__btn lightbox__close" type="button" aria-label="Close" data-close>${ICONS.close}</button>
    <button class="lightbox__btn lightbox__step lightbox__step--prev" type="button" aria-label="Previous project" data-step="-1">${ICONS.prev}</button>
    <button class="lightbox__btn lightbox__step lightbox__step--next" type="button" aria-label="Next project" data-step="1">${ICONS.next}</button>
    <figure class="lightbox__figure">
      <div class="lightbox__frame"><img class="lightbox__img" alt="" width="1448" height="1086" decoding="async"></div>
      <figcaption class="lightbox__caption">
        <div class="lightbox__meta"><span class="tag"></span><span class="lightbox__count"></span></div>
        <h3 class="lightbox__title" id="lightbox-title"></h3>
        <p class="lightbox__subtitle"></p>
        <div class="project__links lightbox__links"></div>
      </figcaption>
    </figure>`;
  document.body.append(root);

  const $ = (sel) => root.querySelector(sel);
  const frame = $('.lightbox__frame');
  const img = $('.lightbox__img');
  const caption = $('.lightbox__caption');
  const closeBtn = $('.lightbox__close');
  const steps = root.querySelectorAll('[data-step]');
  const motion = !device.reducedMotion;

  let list = []; // cover buttons of the projects the grid currently shows
  let pos = 0;
  let busy = false;
  const queue = [];

  // One animation at a time. A click or key pressed mid-animation runs as soon as it ends,
  // so quick clicks are never lost (holding an arrow key queues at most two steps).
  async function run(action) {
    if (busy) {
      if (queue.length < 2) queue.push(action);
      return;
    }
    busy = true;
    await action();
    busy = false;
    if (queue.length) run(queue.shift());
  }

  const current = () => list[pos];
  const projectAt = (btn) => projects[Number(btn.dataset.zoom)];

  // Download (once) the copy of a cover that is sharp at the viewer's size on this screen.
  const fetched = new WeakMap();
  const warm = (btn) => {
    if (!fetched.has(btn)) {
      const im = new Image();
      im.sizes = SIZES;
      im.srcset = btn.querySelector('img').srcset;
      fetched.set(btn, im.decode().then(() => true, () => false));
    }
    return fetched.get(btn);
  };
  const showFull = (btn) => {
    img.sizes = SIZES;
    img.srcset = btn.querySelector('img').srcset;
  };

  // Show the sharp copy if it is ready (or arrives within a moment). Otherwise the card's copy,
  // already downloaded, stands in and the sharp one swaps in as soon as it lands.
  async function load(btn) {
    const card = btn.querySelector('img');
    const full = warm(btn);
    const ready = await Promise.race([full, wait(150).then(() => false)]);
    if (ready || !card.currentSrc) {
      showFull(btn);
    } else {
      img.removeAttribute('srcset');
      img.src = card.currentSrc;
      full.then((ok) => ok && current() === btn && showFull(btn));
    }
    await img.decode().catch(() => {});
  }

  function fill() {
    const p = projectAt(current());
    root.dataset.category = p.category;
    $('.tag').textContent = catLabel(p.category);
    $('.lightbox__count').textContent = `${pad2(pos + 1)} / ${pad2(list.length)}`;
    $('.lightbox__title').textContent = p.title;
    $('.lightbox__subtitle').textContent = p.subtitle;
    img.alt = p.coverAlt || p.title;
    $('.lightbox__links').replaceChildren(
      ...p.links.map((l) => {
        const a = document.createElement('a');
        a.className = 'link-arrow';
        a.href = l.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = `${l.label} `;
        a.insertAdjacentHTML('beforeend', ICONS.arrow);
        return a;
      })
    );
    $('.lightbox__links').hidden = !p.links.length;
    steps.forEach((b) => (b.hidden = list.length < 2));
  }

  // Fetch the neighbours too so stepping shows them sharp straight away.
  function preload() {
    [-1, 1].forEach((d) => {
      const btn = list[(pos + d + list.length) % list.length];
      if (btn) warm(btn);
    });
  }

  // Moves the frame between the card's cover and its place in the viewer.
  function flip(cardRect, back) {
    const to = frame.getBoundingClientRect();
    const card = {
      transform: `translate(${cardRect.left - to.left}px, ${cardRect.top - to.top}px) scale(${cardRect.width / to.width}, ${cardRect.height / to.height})`,
    };
    const full = { transform: 'none' };
    return frame.animate(back ? [full, card] : [card, full], { duration: back ? 420 : 560, easing: EASE, fill: 'forwards' }).finished;
  }

  async function open(btn) {
    if (!root.hidden) return;
    list = Array.from(grid.querySelectorAll('.project:not(.is-hidden) .project__zoom'));
    pos = Math.max(0, list.indexOf(btn));
    fill();
    await load(btn);
    const from = btn.getBoundingClientRect();
    document.documentElement.classList.add('lightbox-open');
    root.hidden = false;
    btn.classList.add('is-lifted');
    root.getBoundingClientRect(); // commit the closed state so the fade-in transitions run
    root.classList.add('is-open');
    closeBtn.focus({ preventScroll: true });
    if (motion) await flip(from, false);
    frame.getAnimations().forEach((a) => a.cancel());
    preload();
  }

  async function close() {
    if (root.hidden) return;
    const btn = current();
    root.classList.remove('is-open');
    if (motion) {
      // Land on the card you were last looking at, scrolling it into view if you stepped away from it.
      let r = btn.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) {
        btn.scrollIntoView({ block: 'center', behavior: 'instant' });
        r = btn.getBoundingClientRect();
      }
      await flip(r, true);
    }
    root.hidden = true;
    frame.getAnimations().forEach((a) => a.cancel());
    btn.classList.remove('is-lifted');
    document.documentElement.classList.remove('lightbox-open');
    btn.focus({ preventScroll: true });
  }

  async function step(dir) {
    if (root.hidden || list.length < 2) return;
    const parts = [frame, caption];
    const out = { opacity: 0, transform: `translateX(${-dir * 40}px)` };
    const enter = { opacity: 0, transform: `translateX(${dir * 40}px)` };
    const rest = { opacity: 1, transform: 'none' };
    if (motion) await Promise.all(parts.map((el) => el.animate([rest, out], { duration: 160, easing: 'ease-in', fill: 'forwards' }).finished));
    current().classList.remove('is-lifted');
    pos = (pos + dir + list.length) % list.length;
    current().classList.add('is-lifted');
    fill();
    await load(current());
    if (motion) await Promise.all(parts.map((el) => el.animate([enter, rest], { duration: 320, easing: EASE, fill: 'forwards' }).finished));
    parts.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    preload();
  }

  // Keep Tab inside the viewer while it is open.
  function trapFocus(e) {
    const items = Array.from(root.querySelectorAll('button, a[href]')).filter((el) => el.offsetParent !== null);
    const first = items[0];
    const last = items[items.length - 1];
    if (!root.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.project__zoom');
    if (btn) run(() => open(btn));
  });
  // Pointing at a cover usually comes a moment before clicking it: start the download then.
  grid.addEventListener('pointerover', (e) => {
    const btn = e.target.closest?.('.project__zoom');
    if (btn) warm(btn);
  });
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) run(close);
    const s = e.target.closest('[data-step]');
    if (s) run(() => step(Number(s.dataset.step)));
  });
  document.addEventListener('keydown', (e) => {
    if (root.hidden) return;
    if (e.key === 'Escape') run(close);
    else if (e.key === 'ArrowLeft') run(() => step(-1));
    else if (e.key === 'ArrowRight') run(() => step(1));
    else if (e.key === 'Tab') trapFocus(e);
  });

  // Swipe left/right on phones. Ignored while pinch-zoomed so panning the picture doesn't change it.
  let touch = null;
  root.addEventListener(
    'touchstart',
    (e) => {
      touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    },
    { passive: true }
  );
  root.addEventListener(
    'touchend',
    (e) => {
      if (!touch || (window.visualViewport?.scale ?? 1) > 1.01) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touch.x;
      const dy = t.clientY - touch.y;
      touch = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) run(() => step(dx < 0 ? 1 : -1));
    },
    { passive: true }
  );
}
