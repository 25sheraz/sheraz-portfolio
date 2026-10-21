import './styles/main.css';
import { device } from './utils/device.js';
import { profile, projects } from './data/cv.js';
import { renderContent } from './sections/render.js';
import { initLoader } from './ui/loader.js';
import { initTheme, palettes } from './ui/theme.js';
import { initNav } from './ui/nav.js';
import { initCursor } from './ui/cursor.js';
import { initReveal, initCounters, initTypewriter, initTilt, initSpotlight, initProjectFilters } from './ui/effects.js';
import { initLightbox } from './ui/lightbox.js';
import { createScene } from './scene/scene.js';
import { initScroll, refreshScroll } from './scene/scroll.js';

document.documentElement.classList.add('js');
if (device.isTouch) document.documentElement.classList.add('touch');

const loader = initLoader();
renderContent();
const nav = initNav();

let sceneApi = null;
const theme = initTheme((t) => sceneApi?.setPalette(palettes[t]));

try {
  sceneApi = createScene({
    canvas: document.getElementById('scene'),
    device,
    palette: palettes[theme.get()],
  });
} catch (err) {
  console.warn('3D scene unavailable, falling back to a static background.', err);
  document.documentElement.classList.add('no-webgl');
}

initScroll({
  onSection: (scene, id) => {
    sceneApi?.setSection(scene);
    nav.setActive(id);
  },
});

initCounters(device);
initTypewriter(document.getElementById('typewriter'), profile.roles, device);
initTilt(device);
initSpotlight(device);
initProjectFilters(() => refreshScroll());
initLightbox(device);
initCursor(device);

// Hovering (or tapping) a project card lights up its cluster of nodes; same for skill rings.
function wireHighlights(gridId, attr, apply) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const pick = (t) => t.closest?.(`[${attr}]`);
  grid.addEventListener('pointerover', (e) => {
    const card = pick(e.target);
    if (card) apply(Number(card.getAttribute(attr)));
  });
  grid.addEventListener('pointerout', (e) => {
    const card = pick(e.target);
    if (card && !card.contains(e.relatedTarget)) sceneApi?.clearHighlight();
  });
  grid.addEventListener('focusin', (e) => {
    const card = pick(e.target);
    if (card) apply(Number(card.getAttribute(attr)));
  });
  grid.addEventListener('focusout', (e) => {
    const card = pick(e.target);
    if (card && !card.contains(e.relatedTarget)) sceneApi?.clearHighlight();
  });
  grid.addEventListener('click', (e) => {
    if (!device.isTouch || e.target.closest('a, button')) return;
    const card = pick(e.target);
    if (!card) return;
    const on = !card.classList.contains('is-lit');
    grid.querySelectorAll('.is-lit').forEach((c) => c.classList.remove('is-lit'));
    if (on) {
      card.classList.add('is-lit');
      apply(Number(card.getAttribute(attr)));
    } else {
      sceneApi?.clearHighlight();
    }
  });
}
wireHighlights('project-grid', 'data-project', (i) => sceneApi?.highlightProject(i, projects.length));
wireHighlights('skills-grid', 'data-ring', (r) => sceneApi?.highlightRing(r));

// Reveal the page once the scene has drawn and fonts are in.
const fontsReady = document.fonts?.ready ?? Promise.resolve();
const sceneReady = sceneApi ? sceneApi.ready : Promise.resolve();
const minShow = new Promise((r) => setTimeout(r, 1600));

Promise.all([sceneReady, fontsReady, minShow])
  .catch(() => {})
  .then(() => loader.done())
  .then(() => {
    initReveal(device);
    refreshScroll();
  });
