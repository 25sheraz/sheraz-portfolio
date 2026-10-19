// Capability detection used to scale the 3D scene and effects per device.

const mq = (q) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q).matches : false);

const coarse = mq('(hover: none) and (pointer: coarse)');
const hasFinePointer = mq('(hover: hover) and (pointer: fine)');
const isTouch = coarse || (navigator.maxTouchPoints > 0 && !hasFinePointer);
const smallScreen = window.innerWidth < 768;
const isMobile = isTouch || smallScreen;
const reducedMotion = mq('(prefers-reduced-motion: reduce)');
const cores = navigator.hardwareConcurrency || 4;
const memory = navigator.deviceMemory || 8;
const lowPower = isMobile || cores < 4 || memory <= 4;

export const device = {
  isMobile,
  isTouch,
  hasFinePointer,
  reducedMotion,
  lowPower,
  // Bloom post-processing is desktop-only; phones fake the glow with additive blending.
  bloom: !isMobile && !reducedMotion && cores >= 4,
  nodeCount: isMobile ? 650 : lowPower ? 1000 : 1500,
  pulseCount: isMobile ? 6 : 14,
};
