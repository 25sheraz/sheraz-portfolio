// Custom cursor: a dot that tracks the pointer and a ring that lags behind.
// Desktop with a fine pointer only; touch devices and reduced-motion users keep the native cursor.
export function initCursor(device) {
  if (!device.hasFinePointer || device.reducedMotion) return;
  const root = document.getElementById('cursor');
  if (!root) return;
  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');
  document.documentElement.classList.add('has-cursor');

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let rx = x;
  let ry = y;
  let visible = false;

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        root.classList.add('is-visible');
      }
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    },
    { passive: true }
  );
  document.documentElement.addEventListener('mouseleave', () => {
    visible = false;
    root.classList.remove('is-visible');
  });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest?.('a, button, .card, [data-cursor="hover"]');
    root.classList.toggle('is-hover', !!t);
  });
  document.addEventListener('pointerdown', () => root.classList.add('is-down'));
  document.addEventListener('pointerup', () => root.classList.remove('is-down'));

  const loop = () => {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
