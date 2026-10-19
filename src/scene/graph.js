import * as THREE from 'three';
import { LAYOUTS, buildEdges, mulberry32 } from './layouts.js';

const TAU = Math.PI * 2;
export const RINGS = 5;

const POINT_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScale;
  uniform float uPixelRatio;
  uniform float uTwinkle;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 1.0 - uTwinkle * 0.45 * (0.5 + 0.5 * sin(uTime * 1.6 + aPhase));
    float size = aSize * uScale / max(1.0, -mv.z);
    gl_PointSize = max(size, 1.6) * uPixelRatio;
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    vAlpha = tw;
  }
`;

const POINT_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float a = pow(1.0 - d, 2.4);
    gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class Graph {
  constructor({ count, palette, pulseCount = 12, edgeK = 3, maxEdgeLength = 1.6 }) {
    this.count = count;
    this.edgeK = edgeK;
    this.maxEdgeLength = maxEdgeLength;
    this.pulseCount = pulseCount;
    this.opacity = 1; // tweened from outside per section
    this.edgeOpacity = 1; // internal crossfade while layouts swap
    this.group = new THREE.Group();

    const n = count;
    this.current = new Float32Array(n * 3);
    this.target = new Float32Array(n * 3);
    this.offset = new Float32Array(n * 3);
    this.positions = new Float32Array(n * 3);
    this.baseSizes = new Float32Array(n);
    this.sizes = new Float32Array(n);
    this.phases = new Float32Array(n);
    this.colors = new Float32Array(n * 3);
    this.baseColors = new Float32Array(n * 3);
    this.kind = new Uint8Array(n);
    this.highlight = null;
    this.layouts = {};
    this.edgeCache = {};
    this.layoutName = null;
    this.edgeFade = null;
    this.rand = mulberry32(1337);

    for (let i = 0; i < n; i++) {
      const r = this.rand();
      this.baseSizes[i] = this.rand() < 0.05 ? 0.42 + this.rand() * 0.2 : 0.12 + this.rand() * 0.18;
      this.sizes[i] = this.baseSizes[i];
      this.phases[i] = this.rand() * TAU;
      this.kind[i] = r < 0.6 ? 0 : r < 0.8 ? 1 : r < 0.94 ? 2 : 3;
    }

    // Points
    this.pointsGeo = new THREE.BufferGeometry();
    this.pointsGeo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage));
    this.pointsGeo.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.pointsGeo.setAttribute('aPhase', new THREE.BufferAttribute(this.phases, 1));
    this.pointsGeo.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3));
    this.pointsMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: 400 },
        uPixelRatio: { value: 1 },
        uOpacity: { value: 1 },
        uTwinkle: { value: 1 },
      },
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(this.pointsGeo, this.pointsMat);
    this.points.frustumCulled = false;

    // Edges
    const maxEdges = n * edgeK;
    this.edgePos = new Float32Array(maxEdges * 6);
    this.edgeCol = new Float32Array(maxEdges * 6);
    this.edgeGeo = new THREE.BufferGeometry();
    this.edgeGeo.setAttribute('position', new THREE.BufferAttribute(this.edgePos, 3).setUsage(THREE.DynamicDrawUsage));
    this.edgeGeo.setAttribute('color', new THREE.BufferAttribute(this.edgeCol, 3).setUsage(THREE.DynamicDrawUsage));
    this.edgeGeo.setDrawRange(0, 0);
    this.edgeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    this.lines = new THREE.LineSegments(this.edgeGeo, this.edgeMat);
    this.lines.frustumCulled = false;

    this.group.add(this.lines, this.points);

    this.edges = { a: new Uint32Array(0), b: new Uint32Array(0), count: 0 };
    this.adj = [];
    this.pulses = [];
    this.activeEdges = new Set();

    this.setPalette(palette);
    this.setLayout('hero', true);
  }

  // ---------- palette ----------
  setPalette(palette) {
    this.palette = palette;
    const cols = [palette.node, palette.nodeWhite, palette.nodeAlt, palette.nodeHot].map((c) => new THREE.Color(c));
    for (let i = 0; i < this.count; i++) {
      const c = cols[this.kind[i]];
      this.baseColors[i * 3] = c.r;
      this.baseColors[i * 3 + 1] = c.g;
      this.baseColors[i * 3 + 2] = c.b;
    }
    this.hot = new THREE.Color(palette.highlight);
    this.edgeBase = new THREE.Color(palette.edge);
    this.edgePulse = new THREE.Color(palette.edgePulse);
    this.baseEdgeOpacity = palette.additive ? 0.55 : 0.4;
    const blending = palette.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    this.pointsMat.blending = blending;
    this.edgeMat.blending = blending;
    this.pointsMat.needsUpdate = true;
    this.edgeMat.needsUpdate = true;
    this.refreshColors();
    this.paintAllEdges();
  }

  refreshColors() {
    const hl = this.highlight;
    for (let i = 0; i < this.count; i++) {
      const on = hl && hl.has(i);
      const j = i * 3;
      if (on) {
        this.colors[j] = this.hot.r;
        this.colors[j + 1] = this.hot.g;
        this.colors[j + 2] = this.hot.b;
      } else {
        this.colors[j] = this.baseColors[j];
        this.colors[j + 1] = this.baseColors[j + 1];
        this.colors[j + 2] = this.baseColors[j + 2];
      }
      this.sizes[i] = this.baseSizes[i] * (on ? 1.9 : 1);
    }
    this.pointsGeo.attributes.aColor.needsUpdate = true;
    this.pointsGeo.attributes.aSize.needsUpdate = true;
  }

  // ---------- highlight ----------
  setHighlight(indices) {
    this.highlight = indices && indices.length ? new Set(indices) : null;
    this.refreshColors();
  }

  highlightBlock(idx, total) {
    const from = Math.floor((idx * this.count) / total);
    const to = Math.floor(((idx + 1) * this.count) / total);
    const list = [];
    for (let i = from; i < to; i++) list.push(i);
    this.setHighlight(list);
  }

  highlightRing(ring) {
    const list = [];
    for (let i = ring; i < this.count; i += RINGS) list.push(i);
    this.setHighlight(list);
  }

  // ---------- layouts ----------
  getLayout(name) {
    if (!this.layouts[name]) {
      const gen = LAYOUTS[name] || LAYOUTS.hero;
      this.layouts[name] = gen(this.count, mulberry32(hashSeed(name)));
    }
    return this.layouts[name];
  }

  getEdges(name) {
    if (!this.edgeCache[name]) {
      this.edgeCache[name] = buildEdges(this.getLayout(name), this.count, this.edgeK, this.maxEdgeLength);
    }
    return this.edgeCache[name];
  }

  setLayout(name, immediate = false) {
    if (name === this.layoutName) return;
    this.layoutName = name;
    const layout = this.getLayout(name);
    this.target.set(layout);
    const edges = this.getEdges(name);
    if (immediate) {
      this.current.set(layout);
      this.offset.fill(0);
      this.applyEdges(edges);
      this.edgeOpacity = 1;
      this.edgeFade = null;
    } else {
      // Fade the old wiring out, swap, then fade the new wiring in once nodes have settled.
      this.edgeFade = { phase: 'out', t: (1 - this.edgeOpacity) * 0.35, edges };
    }
  }

  applyEdges(edges) {
    this.edges = edges;
    const adj = new Array(this.count);
    for (let i = 0; i < this.count; i++) adj[i] = [];
    for (let e = 0; e < edges.count; e++) {
      adj[edges.a[e]].push(e);
      adj[edges.b[e]].push(e);
    }
    this.adj = adj;
    this.edgeGeo.setDrawRange(0, edges.count * 2);
    this.paintAllEdges();
    this.activeEdges.clear();
    this.pulses = [];
    for (let i = 0; i < this.pulseCount; i++) this.pulses.push(this.spawnPulse());
  }

  paintAllEdges() {
    const c = this.edgeBase;
    const n = this.edges.count * 6;
    for (let i = 0; i < n; i += 3) {
      this.edgeCol[i] = c.r;
      this.edgeCol[i + 1] = c.g;
      this.edgeCol[i + 2] = c.b;
    }
    this.edgeGeo.attributes.color.needsUpdate = true;
  }

  paintEdge(e, from, cFrom, cTo) {
    const o = e * 6;
    const aIsFrom = this.edges.a[e] === from;
    const c0 = aIsFrom ? cFrom : cTo;
    const c1 = aIsFrom ? cTo : cFrom;
    this.edgeCol[o] = c0.r;
    this.edgeCol[o + 1] = c0.g;
    this.edgeCol[o + 2] = c0.b;
    this.edgeCol[o + 3] = c1.r;
    this.edgeCol[o + 4] = c1.g;
    this.edgeCol[o + 5] = c1.b;
  }

  spawnPulse() {
    const count = this.edges.count;
    if (!count) return { edge: 0, from: 0, t: 0, speed: 1, hops: 0, maxHops: 1 };
    const edge = Math.floor(this.rand() * count);
    return {
      edge,
      from: this.rand() < 0.5 ? this.edges.a[edge] : this.edges.b[edge],
      t: this.rand(),
      speed: 1.2 + this.rand() * 1.4,
      hops: 0,
      maxHops: 5 + Math.floor(this.rand() * 8),
    };
  }

  // ---------- per-frame ----------
  resize(height, pixelRatio) {
    this.pointsMat.uniforms.uScale.value = height * 0.5;
    this.pointsMat.uniforms.uPixelRatio.value = pixelRatio;
  }

  update(dt, time, pointer, opts = {}) {
    const n = this.count;
    const cur = this.current;
    const tgt = this.target;
    const off = this.offset;
    const pos = this.positions;
    const ph = this.phases;
    const reduced = !!opts.reducedMotion;

    const k = 1 - Math.exp(-dt * 2.8);
    const decay = Math.exp(-dt * 2.2);
    const R = 3.0;
    const R2 = R * R;
    const strength = 9;
    const drift = reduced ? 0 : 0.07;

    for (let i = 0; i < n; i++) {
      const j = i * 3;
      cur[j] += (tgt[j] - cur[j]) * k;
      cur[j + 1] += (tgt[j + 1] - cur[j + 1]) * k;
      cur[j + 2] += (tgt[j + 2] - cur[j + 2]) * k;

      if (pointer) {
        const dx = cur[j] - pointer.x;
        const dy = cur[j + 1] - pointer.y;
        const dz = cur[j + 2] - pointer.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < R2 && d2 > 1e-4) {
          const d = Math.sqrt(d2);
          const f = ((1 - d / R) * strength * dt) / d;
          off[j] += dx * f;
          off[j + 1] += dy * f;
          off[j + 2] += dz * f;
        }
      }
      off[j] *= decay;
      off[j + 1] *= decay;
      off[j + 2] *= decay;

      const p = ph[i];
      pos[j] = cur[j] + off[j] + Math.sin(time * 0.7 + p) * drift;
      pos[j + 1] = cur[j + 1] + off[j + 1] + Math.cos(time * 0.6 + p * 1.3) * drift;
      pos[j + 2] = cur[j + 2] + off[j + 2] + Math.sin(time * 0.5 + p * 0.7) * drift;
    }
    this.pointsGeo.attributes.position.needsUpdate = true;

    // Edge crossfade state machine
    if (this.edgeFade) {
      const f = this.edgeFade;
      f.t += dt;
      if (f.phase === 'out') {
        this.edgeOpacity = Math.max(0, 1 - f.t / 0.35);
        if (f.t >= 0.35) {
          this.applyEdges(f.edges);
          f.phase = 'hold';
          f.t = 0;
        }
      } else if (f.phase === 'hold') {
        this.edgeOpacity = 0;
        if (f.t >= 0.55) {
          f.phase = 'in';
          f.t = 0;
        }
      } else {
        this.edgeOpacity = Math.min(1, f.t / 0.9);
        if (f.t >= 0.9) this.edgeFade = null;
      }
    }

    // Edge positions follow their nodes
    const ea = this.edges.a;
    const eb = this.edges.b;
    const ep = this.edgePos;
    for (let e = 0; e < this.edges.count; e++) {
      const a = ea[e] * 3;
      const b = eb[e] * 3;
      const o = e * 6;
      ep[o] = pos[a];
      ep[o + 1] = pos[a + 1];
      ep[o + 2] = pos[a + 2];
      ep[o + 3] = pos[b];
      ep[o + 4] = pos[b + 1];
      ep[o + 5] = pos[b + 2];
    }
    this.edgeGeo.attributes.position.needsUpdate = true;

    // Signal pulses hopping across the network
    if (!reduced && this.edges.count) {
      const base = this.edgeBase;
      for (const e of this.activeEdges) this.paintEdge(e, this.edges.a[e], base, base);
      this.activeEdges.clear();
      const tmpFrom = this._cFrom || (this._cFrom = new THREE.Color());
      const tmpTo = this._cTo || (this._cTo = new THREE.Color());
      for (let i = 0; i < this.pulses.length; i++) {
        let p = this.pulses[i];
        p.t += dt * p.speed;
        while (p.t >= 1) {
          p.t -= 1;
          p.hops++;
          const e = p.edge;
          const to = this.edges.a[e] === p.from ? this.edges.b[e] : this.edges.a[e];
          const options = this.adj[to];
          let next = -1;
          if (options.length > 1 && p.hops < p.maxHops) {
            for (let tries = 0; tries < 4; tries++) {
              const c = options[Math.floor(this.rand() * options.length)];
              if (c !== e) {
                next = c;
                break;
              }
            }
          }
          if (next < 0) {
            p = this.pulses[i] = this.spawnPulse();
            break;
          }
          p.edge = next;
          p.from = to;
        }
        const head = p.t;
        tmpFrom.copy(base).lerp(this.edgePulse, 1 - head);
        tmpTo.copy(base).lerp(this.edgePulse, head);
        this.paintEdge(p.edge, p.from, tmpFrom, tmpTo);
        this.activeEdges.add(p.edge);
      }
      this.edgeGeo.attributes.color.needsUpdate = true;
    }

    this.pointsMat.uniforms.uTime.value = time;
    this.pointsMat.uniforms.uOpacity.value = this.opacity;
    this.pointsMat.uniforms.uTwinkle.value = reduced ? 0 : 1;
    this.edgeMat.opacity = this.baseEdgeOpacity * this.edgeOpacity * this.opacity;
  }

  dispose() {
    this.pointsGeo.dispose();
    this.pointsMat.dispose();
    this.edgeGeo.dispose();
    this.edgeMat.dispose();
  }
}
