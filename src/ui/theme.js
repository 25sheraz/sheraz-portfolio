// Colour palettes shared by CSS (via data-theme) and the WebGL scene.

export const palettes = {
  dark: {
    bg: '#070b14',
    node: '#38e1ff',
    nodeWhite: '#dff6ff',
    nodeAlt: '#8b7bff',
    nodeHot: '#ff6ad5',
    highlight: '#ff6ad5',
    edge: '#1b6f8a',
    edgePulse: '#b8f4ff',
    additive: true,
  },
  light: {
    bg: '#f3f6fb',
    node: '#0a8fb5',
    nodeWhite: '#2b5a7a',
    nodeAlt: '#5b4bd6',
    nodeHot: '#d6338f',
    highlight: '#d6338f',
    edge: '#8cbfd2',
    edgePulse: '#0a8fb5',
    additive: false,
  },
};

export function initTheme(onChange) {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const meta = document.querySelector('meta[name="theme-color"]');

  const get = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

  const apply = (t, persist = true) => {
    root.dataset.theme = t;
    if (meta) meta.setAttribute('content', palettes[t].bg);
    if (btn) btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (persist) {
      try {
        localStorage.setItem('theme', t);
      } catch {
        /* storage unavailable */
      }
    }
    onChange?.(t);
  };

  apply(get(), false);
  btn?.addEventListener('click', () => apply(get() === 'dark' ? 'light' : 'dark'));

  return { get, palette: () => palettes[get()] };
}
