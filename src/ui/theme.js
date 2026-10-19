// Colour palettes shared by CSS (via data-theme) and the WebGL scene.
// Light is the default: bone paper with an ultramarine "blueprint" network and vermilion pulses.

export const palettes = {
  light: {
    bg: '#f5f0e8',
    node: '#1d3bd6',
    nodeWhite: '#171a2e',
    nodeAlt: '#e0491f',
    nodeHot: '#e8a21b',
    highlight: '#e0491f',
    edge: '#8d97c9',
    edgePulse: '#e0491f',
    additive: false,
  },
  dark: {
    bg: '#121420',
    node: '#8fa0ff',
    nodeWhite: '#f1ece2',
    nodeAlt: '#ff6a3d',
    nodeHot: '#ffb547',
    highlight: '#ff6a3d',
    edge: '#2f3a7a',
    edgePulse: '#ffd9a3',
    additive: true,
  },
};

export function initTheme(onChange) {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const meta = document.querySelector('meta[name="theme-color"]');

  const get = () => (root.dataset.theme === 'dark' ? 'dark' : 'light');

  const apply = (t, persist = true) => {
    root.dataset.theme = t;
    if (meta) meta.setAttribute('content', palettes[t].bg);
    if (btn) btn.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    if (persist) {
      try {
        // Session-only: a fresh visit always starts in light mode.
        sessionStorage.setItem('theme', t);
      } catch {
        /* storage unavailable */
      }
    }
    onChange?.(t);
  };

  apply(get(), false);
  btn?.addEventListener('click', () => apply(get() === 'light' ? 'dark' : 'light'));

  return { get, palette: () => palettes[get()] };
}
