// Node layouts for each section, plus edge building.
// Every layout returns a Float32Array of count * 3 positions in graph-local space.

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

// Small seeded PRNG so layouts are identical on every visit.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fib(i, n) {
  const y = 1 - (i / Math.max(1, n - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const t = GOLDEN * i;
  return [Math.cos(t) * r, y, Math.sin(t) * r];
}

export const LAYOUTS = {
  // Hero: a hollow, slightly fuzzy sphere, like a brain or a galaxy of agents.
  hero(n, rand) {
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const [x, y, z] = fib(i, n);
      const r = 7 * (0.8 + 0.4 * rand());
      out[i * 3] = x * r;
      out[i * 3 + 1] = y * r;
      out[i * 3 + 2] = z * r;
    }
    return out;
  },

  // About: a torus knot ribbon.
  about(n, rand) {
    const out = new Float32Array(n * 3);
    const p = 2;
    const q = 3;
    const scale = 2.3;
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU;
      const r = 2 + Math.cos(q * t);
      const x = r * Math.cos(p * t);
      const y = r * Math.sin(p * t);
      const z = -Math.sin(q * t);
      out[i * 3] = x * scale + (rand() - 0.5) * 0.9;
      out[i * 3 + 1] = y * scale + (rand() - 0.5) * 0.9;
      out[i * 3 + 2] = z * scale + (rand() - 0.5) * 0.9;
    }
    return out;
  },

  // Experience: a vertical helix you travel along, like a timeline.
  experience(n, rand) {
    const out = new Float32Array(n * 3);
    const turns = 3.5;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const a = t * turns * TAU;
      const y = (0.5 - t) * 15;
      let rr = 4 + (rand() - 0.5) * 1.3;
      if (i % 9 === 0) rr *= 0.15; // a thin spine down the middle
      out[i * 3] = Math.cos(a) * rr;
      out[i * 3 + 1] = y + (rand() - 0.5) * 0.4;
      out[i * 3 + 2] = Math.sin(a) * rr;
    }
    return out;
  },

  // Projects: a wavy grid plane that sits behind the cards.
  projects(n, rand) {
    const out = new Float32Array(n * 3);
    const cols = Math.ceil(Math.sqrt(n * 1.7));
    const rows = Math.ceil(n / cols);
    const s = 22 / cols;
    for (let i = 0; i < n; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = (c - (cols - 1) / 2) * s;
      const y = ((rows - 1) / 2 - r) * s;
      out[i * 3] = x + (rand() - 0.5) * 0.15;
      out[i * 3 + 1] = y + (rand() - 0.5) * 0.15;
      out[i * 3 + 2] = Math.sin(x * 0.45) * 0.9 + Math.cos(y * 0.5) * 0.9 + (rand() - 0.5) * 0.5;
    }
    return out;
  },

  // Skills: five concentric rings. Node i belongs to ring i % 5.
  skills(n, rand) {
    const out = new Float32Array(n * 3);
    const rings = 5;
    const per = Math.ceil(n / rings);
    for (let i = 0; i < n; i++) {
      const ring = i % rings;
      const k = Math.floor(i / rings);
      const a = (k / per) * TAU + ring * 0.4;
      const r = 2.2 + ring * 1.45 + (rand() - 0.5) * 0.35;
      out[i * 3] = Math.cos(a) * r;
      out[i * 3 + 1] = Math.sin(a * 2 + ring) * 0.35 + (rand() - 0.5) * 0.3;
      out[i * 3 + 2] = Math.sin(a) * r;
    }
    return out;
  },

  // Contact: everything collapses into a dense core with a few stragglers.
  contact(n, rand) {
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const [x, y, z] = fib(i, n);
      const outlier = rand() < 0.07;
      const r = outlier ? 3.5 + rand() * 3.5 : 3.0 * Math.cbrt(rand());
      out[i * 3] = x * r;
      out[i * 3 + 1] = y * r;
      out[i * 3 + 2] = z * r;
    }
    return out;
  },
};

export const LAYOUT_NAMES = Object.keys(LAYOUTS);

// Connect each node to its k nearest neighbours within maxDist, using a uniform
// grid hash so this stays fast even for a few thousand nodes.
export function buildEdges(pos, n, k, maxDist) {
  const cell = maxDist;
  const grid = new Map();
  const ci = (v) => Math.floor(v / cell);
  const key = (x, y, z) => ((x + 512) * 1024 + (y + 512)) * 1024 + (z + 512);

  for (let i = 0; i < n; i++) {
    const kk = key(ci(pos[i * 3]), ci(pos[i * 3 + 1]), ci(pos[i * 3 + 2]));
    let arr = grid.get(kk);
    if (!arr) grid.set(kk, (arr = []));
    arr.push(i);
  }

  const seen = new Set();
  const a = [];
  const b = [];
  const max2 = maxDist * maxDist;
  const cand = [];

  for (let i = 0; i < n; i++) {
    const x = pos[i * 3];
    const y = pos[i * 3 + 1];
    const z = pos[i * 3 + 2];
    const cx = ci(x);
    const cy = ci(y);
    const cz = ci(z);
    cand.length = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const arr = grid.get(key(cx + dx, cy + dy, cz + dz));
          if (!arr) continue;
          for (let m = 0; m < arr.length; m++) {
            const j = arr[m];
            if (j === i) continue;
            const ex = pos[j * 3] - x;
            const ey = pos[j * 3 + 1] - y;
            const ez = pos[j * 3 + 2] - z;
            const d2 = ex * ex + ey * ey + ez * ez;
            if (d2 <= max2) cand.push([j, d2]);
          }
        }
      }
    }
    cand.sort((p, q) => p[1] - q[1]);
    const take = Math.min(k, cand.length);
    for (let m = 0; m < take; m++) {
      const j = cand[m][0];
      const lo = Math.min(i, j);
      const hi = Math.max(i, j);
      const id = lo * n + hi;
      if (seen.has(id)) continue;
      seen.add(id);
      a.push(lo);
      b.push(hi);
    }
  }

  return { a: Uint32Array.from(a), b: Uint32Array.from(b), count: a.length };
}
