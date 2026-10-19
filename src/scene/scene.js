import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { gsap } from 'gsap';
import { Graph } from './graph.js';
import { getPose } from './poses.js';

export function createScene({ canvas, device, palette }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !device.isMobile,
    powerPreference: 'high-performance',
  });
  // Software renderers (no GPU acceleration) cannot afford bloom or a high pixel ratio.
  let gpuName = '';
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    gpuName = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
  } catch {
    /* ignore */
  }
  const software = /swiftshader|llvmpipe|software|mesa offscreen/i.test(gpuName);
  const quality = {
    bloom: device.bloom && !software,
    nodeCount: software ? Math.min(device.nodeCount, 600) : device.nodeCount,
    pixelRatio: software ? 1 : Math.min(window.devicePixelRatio || 1, device.isMobile ? 1.5 : 2),
  };
  renderer.setPixelRatio(quality.pixelRatio);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.bg);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 0, 22);

  const graph = new Graph({ count: quality.nodeCount, palette, pulseCount: device.pulseCount });
  scene.add(graph.group);

  let composer = null;
  let bloomPass = null;
  let bloomAllowed = quality.bloom;
  if (quality.bloom) {
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, target);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.55, 0.15);
    bloomPass.enabled = palette.additive;
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
  }

  const state = {
    section: null,
    cam: new THREE.Vector3(0, 0, 22),
    look: new THREE.Vector3(0, 0, 0),
    par: { x: 0, y: 0 },
    pointer: { x: 0, y: 0, active: false },
    spin: 0.08,
    aspect: 1,
  };

  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const ndc = new THREE.Vector2();
  let width = 0;
  let height = 0;

  function applyPose(name, duration) {
    const pose = getPose(name, { isMobile: device.isMobile, aspect: state.aspect, width, height });
    const ease = 'power2.inOut';
    gsap.to(state.cam, { ...pose.cam, duration, ease, overwrite: 'auto' });
    gsap.to(state.look, { ...pose.look, duration, ease, overwrite: 'auto' });
    gsap.to(graph.group.position, { ...pose.pos, duration, ease, overwrite: 'auto' });
    const rot = { x: pose.rot.x, z: pose.rot.z };
    if (pose.spin === 0) {
      const y = graph.group.rotation.y;
      rot.y = Math.round(y / (Math.PI * 2)) * Math.PI * 2;
    }
    gsap.to(graph.group.rotation, { ...rot, duration, ease, overwrite: 'auto' });
    state.spin = pose.spin;
    gsap.to(graph, { opacity: pose.opacity, duration, ease, overwrite: 'auto' });
  }

  function setSection(name, immediate = false) {
    if (name === state.section && !immediate) return;
    state.section = name;
    graph.setLayout(name, immediate);
    applyPose(name, immediate ? 0 : 1.6);
  }

  function resize(force = false) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Ignore the small height jitter from mobile browser chrome showing/hiding.
    if (!force && device.isTouch && w === width && Math.abs(h - height) < 140) return;
    width = w;
    height = h;
    state.aspect = w / h;
    camera.aspect = state.aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    const pr = renderer.getPixelRatio();
    if (composer) composer.setSize(w, h);
    graph.resize(h, pr);
    if (state.section) applyPose(state.section, 0.5);
  }

  function onPointerMove(e) {
    if (e.pointerType === 'touch') return;
    state.pointer.x = (e.clientX / width) * 2 - 1;
    state.pointer.y = -(e.clientY / height) * 2 + 1;
    state.pointer.active = true;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => {
    state.pointer.active = false;
  });
  window.addEventListener('blur', () => {
    state.pointer.active = false;
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => resize(false), 120);
  });
  window.addEventListener('orientationchange', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => resize(true), 250);
  });

  let visible = !document.hidden;
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
  });

  const timer = new THREE.Timer();
  timer.connect(document);
  let frames = 0;
  let resolveReady;
  const ready = new Promise((res) => {
    resolveReady = res;
  });

  // Runtime quality guard: if frames are slow, drop bloom first, then resolution.
  let perfFrames = 0;
  let perfTime = 0;
  let degraded = 0;
  function watchPerformance(rawDt) {
    if (degraded >= 2 || frames < 30) return;
    perfFrames++;
    perfTime += rawDt;
    if (perfFrames < 90) return;
    const fps = perfFrames / perfTime;
    perfFrames = 0;
    perfTime = 0;
    if (fps < 24 && degraded === 0) {
      degraded = 1;
      bloomAllowed = false;
      if (bloomPass) bloomPass.enabled = false;
    } else if (fps < 15 && degraded === 1 && renderer.getPixelRatio() > 1) {
      degraded = 2;
      renderer.setPixelRatio(1);
      resize(true);
    }
  }

  function tick(now) {
    timer.update(now);
    const rawDt = timer.getDelta();
    const dt = Math.min(rawDt, 0.1);
    const t = timer.getElapsed();
    if (!visible) return;
    watchPerformance(rawDt);

    // Soft parallax towards the pointer
    const px = state.pointer.active ? state.pointer.x : 0;
    const py = state.pointer.active ? state.pointer.y : 0;
    const pk = 1 - Math.exp(-dt * 4);
    state.par.x += (px - state.par.x) * pk;
    state.par.y += (py - state.par.y) * pk;
    camera.position.set(state.cam.x + state.par.x * 0.9, state.cam.y + state.par.y * 0.5, state.cam.z);
    camera.lookAt(state.look);

    // Pointer in graph-local space for the ripple effect
    let local = null;
    if (state.pointer.active && !device.reducedMotion) {
      ndc.set(state.pointer.x, state.pointer.y);
      raycaster.setFromCamera(ndc, camera);
      plane.constant = -graph.group.position.z;
      if (raycaster.ray.intersectPlane(plane, hit)) {
        graph.group.updateMatrixWorld();
        local = graph.group.worldToLocal(hit);
      }
    }

    if (state.spin && !device.reducedMotion) graph.group.rotation.y += state.spin * dt;
    graph.update(dt, t, local, { reducedMotion: device.reducedMotion });

    if (composer) composer.render();
    else renderer.render(scene, camera);

    if (++frames === 2) resolveReady();
  }

  function setPalette(p) {
    scene.background.set(p.bg);
    graph.setPalette(p);
    if (bloomPass) bloomPass.enabled = p.additive && bloomAllowed;
  }

  resize(true);
  setSection('hero', true);
  renderer.setAnimationLoop(tick);

  return {
    ready,
    setSection,
    setPalette,
    resize,
    highlightProject: (i, total) => graph.highlightBlock(i, total),
    highlightRing: (r) => graph.highlightRing(r),
    clearHighlight: () => graph.setHighlight(null),
    dispose() {
      renderer.setAnimationLoop(null);
      timer.disconnect();
      graph.dispose();
      renderer.dispose();
    },
  };
}
