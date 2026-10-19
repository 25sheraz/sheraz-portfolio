// Camera and graph placement for each section.
// cam/look are world space; pos/rot apply to the graph group; spin is the idle
// rotation speed around Y (0 = face the camera); opacity dims the graph behind text.

const BASE = {
  hero: { cam: [0, 0, 22], look: [0, 0, 0], pos: [4.5, 0, 0], rot: [0.25, 0.1], spin: 0.08, opacity: 1 },
  about: { cam: [0, 0, 21], look: [0, 0, 0], pos: [-5.5, 0, -3], rot: [0.5, 0], spin: 0.12, opacity: 0.9 },
  experience: { cam: [0, 0, 24], look: [0, 0, 0], pos: [6.5, 0, -2], rot: [0.15, 0.25], spin: 0.1, opacity: 0.9 },
  projects: { cam: [0, 0, 26], look: [0, 0, 0], pos: [0, 0, -8], rot: [0, 0], spin: 0, opacity: 0.45 },
  skills: { cam: [0, 7, 21], look: [0, 0, 0], pos: [5, -1, -2], rot: [0.1, 0], spin: 0.1, opacity: 0.8 },
  contact: { cam: [0, 0, 18], look: [0, 0, 0], pos: [0, 0, -4], rot: [0.2, 0.2], spin: 0.15, opacity: 0.9 },
};

const FOV_TAN = Math.tan((50 / 2) * (Math.PI / 180));

export function getPose(name, { isMobile = false, aspect = 1.6, width = 1440, height = 900 } = {}) {
  const p = BASE[name] || BASE.hero;
  const portrait = aspect < 1;
  // Pull the camera back on narrow screens so the whole shape still fits.
  const dist = portrait ? 1 + (1 - aspect) * 1.1 : aspect < 1.3 ? 1.12 : 1;

  const cam = { x: p.cam[0], y: p.cam[1], z: p.cam[2] * dist };
  const look = { x: p.look[0], y: p.look[1], z: p.look[2] };
  const pos = { x: p.pos[0], y: p.pos[1], z: p.pos[2] };
  let opacity = p.opacity;

  const stacked = isMobile || portrait || width < 900;
  if (stacked) {
    // Centre the graph behind the text and dim it so copy stays legible.
    pos.x = 0;
    pos.z -= 3;
    opacity *= 0.6;
    if (name === 'hero') pos.y = 1.5;
  } else if (name === 'about') {
    // Park the knot behind the avatar card: the card sits at the left edge of the
    // content container, so convert that pixel offset into world units.
    const gutter = Math.min(48, Math.max(16, width * 0.04));
    const container = Math.min(1180, width - gutter * 2);
    const cardCentre = -container / 2 + 190; // px from viewport centre
    const pxPerUnit = height / (2 * (cam.z - pos.z) * FOV_TAN);
    pos.x = cardCentre / pxPerUnit;
  }

  return { cam, look, pos, rot: { x: p.rot[0], z: p.rot[1] }, spin: p.spin, opacity };
}
