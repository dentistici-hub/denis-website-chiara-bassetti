/**
 * Munsell color tree -- dense but with visible chip separation
 *
 * VISUAL EFFECT: As the tree slowly rotates, each value-level ring
 * gently oscillates inward/outward with a phase offset per row,
 * creating a "breathing" spiral that reveals the full spectrum.
 *
 * Interaction: OrbitControls (drag rotate, scroll zoom), hover tooltip
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PANTONE_DATA } from './pantone-data';

THREE.ColorManagement.enabled = false;

// ============================================
// PANTONE LOOKUP -- perceptual LAB match against real Pantone data
// Each chip's hex gets snapped to its nearest Pantone's real hex, so the
// wheel you see is actual Pantone colors, not procedurally-computed HSL.
// ============================================

function hexToLab(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const srgb = [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
  // sRGB -> linear
  const lin = srgb.map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  // linear RGB -> XYZ (D65)
  const [r, g, b] = lin;
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
  // XYZ -> Lab (D65 reference white)
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x / 0.95047);
  const fy = f(y / 1.0);
  const fz = f(z / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

interface PantoneEntry {
  L: number; a: number; b: number;
  hex: string; label: string;
  hslHue: number;     // 0-1, HSL hue of this Pantone. -1 if achromatic.
  chroma: number;     // Lab chroma = sqrt(a^2 + b^2). Low values = gray.
}

const _tmpColor = new THREE.Color();
const _tmpHsl = { h: 0, s: 0, l: 0 };

const PANTONE_LAB: PantoneEntry[] = PANTONE_DATA.map(([hex, label]) => {
  const [L, a, b] = hexToLab('#' + hex);
  _tmpColor.set('#' + hex);
  _tmpColor.getHSL(_tmpHsl);
  const chroma = Math.sqrt(a * a + b * b);
  // Near-gray Pantones have unstable HSL hue; mark them -1 so we don't
  // pull them into a hue-constrained search for a colored chip.
  const hslHue = chroma < 5 ? -1 : _tmpHsl.h;
  return { L, a, b, hex, label, hslHue, chroma };
});

// hue-constrained match: only consider Pantones within HUE_WINDOW of the
// target's HSL hue. This stops blue chips from snapping to violet Pantones
// and vice versa across the whole wheel. Pass targetHue=-1 for neutrals.
const HUE_WINDOW = 0.06;

function findClosestPantone(hex: string, targetHue: number = -1): { hex: string; label: string } {
  const [L1, a1, b1] = hexToLab(hex);
  const useHueConstraint = targetHue >= 0;

  let bestDist = Infinity;
  let best = PANTONE_LAB[0];
  for (const p of PANTONE_LAB) {
    if (useHueConstraint) {
      if (p.hslHue < 0) continue; // skip near-grays for colored targets
      let dHue = Math.abs(targetHue - p.hslHue);
      if (dHue > 0.5) dHue = 1 - dHue; // wrap the circle
      if (dHue > HUE_WINDOW) continue;
    }
    const dL = L1 - p.L, da = a1 - p.a, db = b1 - p.b;
    const d = dL * dL + da * da + db * db;
    if (d < bestDist) { bestDist = d; best = p; }
  }

  // Fallback: if the hue window yielded no candidate (can happen for very
  // desaturated targets near the neutral axis), drop the constraint.
  if (bestDist === Infinity) {
    for (const p of PANTONE_LAB) {
      const dL = L1 - p.L, da = a1 - p.a, db = b1 - p.b;
      const d = dL * dL + da * da + db * db;
      if (d < bestDist) { bestDist = d; best = p; }
    }
  }

  return { hex: '#' + best.hex, label: best.label };
}

// ============================================
// MUNSELL CHROMA LOOKUP
// Max chroma in Munsell varies by BOTH hue and value. The real Munsell tree
// is asymmetric: Yellow peaks at high value, Purple-Blue peaks at low value.
// ============================================

// HSL-hue position -> approximate Munsell max chroma at that hue's peak value.
const HUE_MAX_CHROMA: [number, number][] = [
  [0.00, 14], [0.05, 12], [0.10, 14], [0.17, 16],
  [0.25, 14], [0.33, 12], [0.42, 8],  [0.50, 7],
  [0.58, 9],  [0.67, 18], [0.75, 14], [0.83, 14],
  [0.92, 14], [1.00, 14],
];

// HSL-hue position -> value level where that hue peaks in chroma (0-1).
// This is what gives the Munsell tree its lopsided, not-a-sphere silhouette.
const HUE_PEAK_VALUE: [number, number][] = [
  [0.00, 0.40], [0.10, 0.60], [0.17, 0.80], [0.25, 0.65],
  [0.33, 0.50], [0.42, 0.50], [0.50, 0.50], [0.58, 0.40],
  [0.67, 0.30], [0.75, 0.40], [0.83, 0.45], [1.00, 0.40],
];

function interpAtHue(table: [number, number][], hue: number): number {
  for (let i = 0; i < table.length - 1; i++) {
    if (hue >= table[i][0] && hue <= table[i + 1][0]) {
      const t = (hue - table[i][0]) / (table[i + 1][0] - table[i][0]);
      return table[i][1] + (table[i + 1][1] - table[i][1]) * t;
    }
  }
  return table[0][1];
}

function maxChromaForHue(hue: number, value: number): number {
  const baseChroma = interpAtHue(HUE_MAX_CHROMA, hue);
  const peakValue = interpAtHue(HUE_PEAK_VALUE, hue);
  const valueFactor = 1 - Math.pow((value - peakValue) * 1.5, 2);
  return Math.max(1, baseChroma * Math.max(0.2, valueFactor));
}

// ============================================
// BUILD
// ============================================

interface ChipInfo {
  baseX: number; baseY: number; baseZ: number;
  angle: number;       // hue angle in radians
  radius: number;      // distance from center
  valueLevel: number;  // which horizontal row (0-based)
  hueStep: number;     // which vertical page (0-based)
  hex: string;         // authentic Pantone hex (snapped from target HSL)
  label: string;       // Pantone name matching the hex
}

function buildMunsellTree(): ChipInfo[] {
  const chips: ChipInfo[] = [];
  const c = new THREE.Color();

  const VALUE_STEPS = 10;
  const HUE_STEPS = 24;
  const CHIP_GAP = 0.17;
  const Y_GAP = 0.18;

  for (let vi = 0; vi < VALUE_STEPS; vi++) {
    const value = (vi + 0.5) / VALUE_STEPS; // 0.05 to 0.95
    const yPos = (vi - (VALUE_STEPS - 1) / 2) * Y_GAP;

    // Single achromatic chip per value level -- the Munsell neutral axis.
    // hueStep=-1 so the hue-family click panel won't include it.
    {
      c.setHSL(0, 0, value * 0.72 + 0.14);
      const match = findClosestPantone('#' + c.getHexString());
      chips.push({
        baseX: 0, baseY: yPos, baseZ: 0,
        angle: 0, radius: 0, valueLevel: vi, hueStep: -1,
        hex: match.hex,
        label: match.label,
      });
    }

    for (let hi = 0; hi < HUE_STEPS; hi++) {
      const hue = hi / HUE_STEPS;
      const angle = hue * Math.PI * 2;

      const maxC = maxChromaForHue(hue, value);
      const chromaSteps = Math.max(1, Math.round(maxC * 0.6));

      // ci starts at 1 -- chroma=0 is the shared neutral axis written above
      for (let ci = 1; ci <= chromaSteps; ci++) {
        const radius = (ci + 0.3) * CHIP_GAP;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Saturation ramps from 0.2 (innermost colored ring) to 0.9 (max chroma)
        // regardless of how many chroma steps this hue has. Without the floor,
        // high-chroma hues' inner ring sits at sat ~0.08 and LAB-matches to
        // random near-white Pantones, producing the speckled-chaos look.
        const t = chromaSteps > 1 ? (ci - 1) / (chromaSteps - 1) : 0;
        const saturation = 0.2 + t * 0.7;
        const lightness = value * 0.72 + 0.14;

        c.setHSL(hue, saturation, lightness);
        // Snap to nearest real Pantone WITHIN the same hue family -- prevents
        // adjacent chips from landing on different hue-family Pantones.
        const match = findClosestPantone('#' + c.getHexString(), hue);

        chips.push({
          baseX: x, baseY: yPos, baseZ: z,
          angle, radius, valueLevel: vi, hueStep: hi,
          hex: match.hex,
          label: match.label,
        });
      }
    }
  }

  return chips;
}

// ============================================
// STATE
// ============================================

const CHIP_SIZE = 0.095;

export interface SphereState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  mesh: THREE.InstancedMesh;
  group: THREE.Group;
  chips: ChipInfo[];
  warmColors: Float32Array;
  darkColors: Float32Array;
  instanceHexColors: string[];
  originalMatrices: Float32Array;
  instanceCount: number;
  maxRadius: number;
  animationId: number;
  disposed: boolean;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  hoveredInstance: number;
  tooltip: HTMLElement | null;
  time: number;
  burstProgress: number; // 0 = normal tree, 1 = fully scattered (reality transition)
  chipSpreadSeeds: Float32Array; // per-chip random outward/upward offsets for the burst
  colorTween: any; // active gsap tween for instanceColor (killed on re-transition)
  fogTween: any;   // active gsap tween for scene.fog.color
}

export function createMunsellSphere(canvas: HTMLCanvasElement): SphereState {
  const isMobile = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  const scene = new THREE.Scene();
  // Linear fog fades only the back half of the sphere to the page bg so far
  // chips don't bleed through the front shell. Front + middle stay crisp.
  scene.fog = new THREE.Fog(0xFAF8F5, 6.2, 9);

  // Adjust camera distance per screen size
  const camZ = window.innerWidth < 480 ? 5.8 : window.innerWidth < 768 ? 5.5 : 5.5;
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(1, 1.2, camZ);
  camera.lookAt(0, 0, 0);

  // Warm, bright lighting for natural Munsell look with 3D depth
  scene.add(new THREE.AmbientLight(0xffffff, 1.8));
  const key = new THREE.DirectionalLight(0xfffaf0, 0.6); // warm key
  key.position.set(4, 6, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xf0f5ff, 0.3); // cool fill
  fill.position.set(-3, -1, 4);
  scene.add(fill);

  // OrbitControls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = false; // we handle rotation manually on the group
  controls.minPolarAngle = Math.PI * 0.25;  // ~45deg from top
  controls.maxPolarAngle = Math.PI * 0.65;  // ~117deg -- can't go below equator

  // Build data
  const chips = buildMunsellTree();
  const INSTANCE_COUNT = chips.length;

  const geometry = new THREE.BoxGeometry(CHIP_SIZE, CHIP_SIZE, CHIP_SIZE * 0.45);
  // transparent so we can fade the whole mesh during the reality burst
  const material = new THREE.MeshLambertMaterial({ transparent: true, opacity: 1 });
  const mesh = new THREE.InstancedMesh(geometry, material, INSTANCE_COUNT);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const warmColors = new Float32Array(INSTANCE_COUNT * 3);
  const darkColors = new Float32Array(INSTANCE_COUNT * 3);
  const instanceHexColors: string[] = [];

  // Find max radius for scale normalization
  let maxRadius = 0;
  for (const chip of chips) {
    if (chip.radius > maxRadius) maxRadius = chip.radius;
  }

  for (let i = 0; i < INSTANCE_COUNT; i++) {
    const chip = chips[i];

    dummy.position.set(chip.baseX, chip.baseY, chip.baseZ);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    color.set(chip.hex);
    mesh.setColorAt(i, color);
    warmColors[i * 3] = color.r;
    warmColors[i * 3 + 1] = color.g;
    warmColors[i * 3 + 2] = color.b;
    instanceHexColors.push(chip.label);

    // Desaturated dark variant
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    color.setHSL(hsl.h, hsl.s * 0.15, hsl.l * 0.4 + 0.15);
    darkColors[i * 3] = color.r;
    darkColors[i * 3 + 1] = color.g;
    darkColors[i * 3 + 2] = color.b;
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();

  const originalMatrices = new Float32Array(mesh.instanceMatrix.array);

  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9998;
    display: none; transform: translate(-50%, -140%);
  `;
  tooltip.innerHTML = `
    <div style="
      background: #fff; border: 1px solid rgba(0,0,0,0.1);
      padding: 8px 12px; font-family: 'DM Sans', sans-serif;
      font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
      color: #1A1A1A; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      display: flex; align-items: center; gap: 8px; white-space: nowrap;
    ">
      <span class="tt-swatch" style="width:16px;height:16px;border-radius:2px;border:1px solid rgba(0,0,0,0.08);flex-shrink:0;"></span>
      <span class="tt-hex"></span>
    </div>
  `;
  document.body.appendChild(tooltip);

  return {
    renderer, scene, camera, controls, mesh, group,
    chips, warmColors, darkColors,
    instanceHexColors, originalMatrices,
    instanceCount: INSTANCE_COUNT,
    maxRadius,
    animationId: 0, disposed: false,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    hoveredInstance: -1, tooltip,
    time: 0,
    burstProgress: 0,
    chipSpreadSeeds: (() => {
      // 3 seeds per chip: outward-multiplier, y-direction, angular-jitter
      const seeds = new Float32Array(INSTANCE_COUNT * 3);
      for (let i = 0; i < INSTANCE_COUNT; i++) {
        seeds[i * 3] = 1.5 + Math.random() * 3;        // outward push amount
        seeds[i * 3 + 1] = (Math.random() - 0.5) * 3;  // y drift (up or down)
        seeds[i * 3 + 2] = (Math.random() - 0.5) * 0.8; // angular jitter
      }
      return seeds;
    })(),
    colorTween: null,
    fogTween: null,
  };
}

// ============================================
// ANIMATION -- uniform rotation + breathing rows
// ============================================

export function startSphereAnimation(
  state: SphereState,
  getScrollVelocity: () => number,
): void {
  const { renderer, scene, camera, controls, mesh, group, chips } = state;
  const dummy = new THREE.Object3D();

  const ROTATE_SPEED = 0.0012;         // uniform rotation for the whole group
  const BREATH_AMP = 0.06;              // how much rows expand/contract (radius multiplier)
  const BASE_BREATH_SPEED = 0.4;        // cycles per second at rest (slow, organic)
  const SCROLL_BREATH_GAIN = 0.007;     // how fast scroll velocity accelerates the pulse
  const SCROLL_BREATH_MAX = 0.2;        // cap added breath speed -- a subtle nudge only
  const SCROLL_SMOOTHING = 0.05;        // low-pass factor on raw lenis velocity (smaller = smoother)
  const BREATH_PHASE_OFFSET = 0.6;      // phase offset per row -- creates wave
  const HOVER_LIFT = 1.12;              // outward push multiplier on hovered chip
  const HOVER_SCALE = 1.28;             // scale-up on hovered chip
  const PAUSE_DURATION = 2000;          // ms to pause auto-rotation after user interaction

  let elapsed = 0;
  let breathPhase = 0;               // accumulated breath phase -- stays continuous as speed shifts
  let smoothedV = 0;                 // low-passed scroll velocity
  let lastTime = performance.now();
  let pausedUntil = 0;               // timestamp when auto-rotation resumes

  // Pause auto-rotation when user interacts (drag/rotate)
  const canvas = renderer.domElement;
  const pauseRotation = () => { pausedUntil = performance.now() + PAUSE_DURATION; };
  canvas.addEventListener('pointerdown', pauseRotation);
  canvas.addEventListener('touchstart', pauseRotation, { passive: true });

  function resize() {
    const parent = renderer.domElement.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;

    // Adjust camera Z per screen width
    const vw = window.innerWidth;
    camera.position.z = vw < 480 ? 5.8 : vw < 768 ? 5.5 : 5.5;

    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener('resize', resize);

  function animate() {
    if (state.disposed) return;

    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    elapsed += dt;

    controls.update();

    // Uniform rotation on the whole group (paused after user interaction)
    if (now > pausedUntil) {
      group.rotation.y += ROTATE_SPEED;
    }

    // Scroll velocity accelerates the breath; low-pass filter kills frame-to-frame noise
    const rawV = Math.abs(getScrollVelocity());
    smoothedV += (rawV - smoothedV) * SCROLL_SMOOTHING;
    const breathSpeed = BASE_BREATH_SPEED + Math.min(smoothedV * SCROLL_BREATH_GAIN, SCROLL_BREATH_MAX);
    // Integrate the phase so speed changes only affect the rate, never the phase itself
    breathPhase += breathSpeed * Math.PI * 2 * dt;

    // Breathing + hover transform + reality burst
    const bp = state.burstProgress;
    const seeds = state.chipSpreadSeeds;

    for (let i = 0; i < state.instanceCount; i++) {
      const chip = chips[i];
      const isHovered = i === state.hoveredInstance;

      let x: number, z: number, y: number, scale: number;

      if (isHovered) {
        x = chip.baseX * HOVER_LIFT;
        z = chip.baseZ * HOVER_LIFT;
        y = chip.baseY;
        scale = HOVER_SCALE;
      } else {
        const phase = chip.valueLevel * BREATH_PHASE_OFFSET;
        const breathScale = 1 + Math.sin(breathPhase + phase) * BREATH_AMP;
        const r = chip.radius * breathScale;
        x = Math.cos(chip.angle) * r;
        z = Math.sin(chip.angle) * r;
        y = chip.baseY;
        scale = 1;
      }

      if (bp > 0) {
        // Each chip pushes radially outward (by its seed), drifts vertically,
        // and scales up a touch as it flies off-screen.
        const outward = 1 + bp * seeds[i * 3];
        x *= outward;
        z *= outward;
        y += bp * seeds[i * 3 + 1];
        scale *= 1 + bp * 0.6;
      }

      dummy.position.set(x, y, z);
      dummy.scale.set(scale, scale, scale);

      // Face the wide side toward the camera
      const cosG = Math.cos(group.rotation.y);
      const sinG = Math.sin(group.rotation.y);
      const wx = x * cosG + z * sinG;
      const wz = -x * sinG + z * cosG;
      const dx = camera.position.x - wx;
      const dz = camera.position.z - wz;
      dummy.rotation.set(0, Math.atan2(dx, dz) - group.rotation.y, 0);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
    state.animationId = requestAnimationFrame(animate);
  }

  animate();
}

// ============================================
// HOVER
// ============================================

export function initSphereHover(state: SphereState): void {
  const { renderer, camera, mesh, raycaster, mouse, tooltip, instanceHexColors, chips } = state;
  const canvas = renderer.domElement;

  function updateTooltip(id: number, clientX: number, clientY: number) {
    const pantoneName = instanceHexColors[id] || 'Unknown';
    const chipHex = chips[id]?.hex || '#000000';
    const swatchEl = tooltip.querySelector('.tt-swatch') as HTMLElement;
    const hexEl = tooltip.querySelector('.tt-hex') as HTMLElement;
    if (swatchEl) swatchEl.style.backgroundColor = chipHex;
    if (hexEl) hexEl.textContent = pantoneName;
    tooltip.style.display = 'block';
    tooltip.style.left = clientX + 'px';
    tooltip.style.top = clientY + 'px';
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(mesh);
    const newId = intersects.length > 0 ? (intersects[0].instanceId ?? -1) : -1;

    state.hoveredInstance = newId;

    if (newId >= 0) {
      updateTooltip(newId, e.clientX, e.clientY);
      canvas.style.cursor = 'crosshair';
    } else {
      tooltip.style.display = 'none';
      canvas.style.cursor = 'grab';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    state.hoveredInstance = -1;
    tooltip.style.display = 'none';
    canvas.style.cursor = 'grab';
  });

  // Touch support -- tap to show Pantone tooltip
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(mesh);
    const newId = intersects.length > 0 ? (intersects[0].instanceId ?? -1) : -1;

    state.hoveredInstance = newId;

    if (newId >= 0) {
      updateTooltip(newId, touch.clientX, touch.clientY - 60);
    } else {
      tooltip.style.display = 'none';
    }
  }, { passive: true });

  canvas.style.cursor = 'grab';
  canvas.addEventListener('mousedown', () => { canvas.style.cursor = 'grabbing'; });
  canvas.addEventListener('mouseup', () => { canvas.style.cursor = 'grab'; });
}

// ============================================
// SPECTRUM PANEL -- click a chip to show its hue family
// ============================================

export interface HueChip {
  hex: string;
  pantone: string;
  valueLevel: number;
  chromaStep: number;
}

export function getHueFamily(state: SphereState, hueStep: number): HueChip[] {
  const family: HueChip[] = [];
  for (let i = 0; i < state.chips.length; i++) {
    if (state.chips[i].hueStep === hueStep) {
      const chromaStep = Math.round(state.chips[i].radius / 0.17);
      family.push({
        hex: state.chips[i].hex,
        pantone: state.instanceHexColors[i],
        valueLevel: state.chips[i].valueLevel,
        chromaStep,
      });
    }
  }
  // Sort by value (light to dark), then chroma (grey to vivid)
  family.sort((a, b) => b.valueLevel - a.valueLevel || a.chromaStep - b.chromaStep);
  return family;
}

export function initSphereClick(
  state: SphereState,
  onHueSelect: (hueStep: number, clickedHex: string) => void,
): void {
  const { renderer, camera, mesh, raycaster, mouse, chips } = state;
  const canvas = renderer.domElement;
  let downX = 0, downY = 0;

  canvas.addEventListener('mousedown', (e) => {
    downX = e.clientX; downY = e.clientY;
  });

  canvas.addEventListener('mouseup', (e) => {
    // Only fire if it was a click, not a drag
    if (Math.abs(e.clientX - downX) > 5 || Math.abs(e.clientY - downY) > 5) return;

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(mesh);
    if (intersects.length > 0) {
      const id = intersects[0].instanceId ?? -1;
      if (id >= 0) {
        onHueSelect(chips[id].hueStep, chips[id].hex);
      }
    }
  });
}

// ============================================
// REALITY TRANSITION
// ============================================

export function transitionColors(state: SphereState, toDesaturated: boolean, gsap: any): void {
  const { mesh, warmColors, darkColors, instanceCount, scene } = state;
  if (!mesh.instanceColor) return;

  const dst = toDesaturated ? darkColors : warmColors;
  const arr = mesh.instanceColor.array as Float32Array;

  // Snapshot the current instanceColor state and tween from THERE to dst.
  // The old code used a fixed `src` regardless of what arr actually held,
  // which on initial load / SPA re-init forced a visible flash (arr was
  // already at dst, so tween jumped to src at p=0 before animating back).
  // On mobile this flash could land on an oversaturated intermediate if
  // the tween was interrupted -- causing the "extremely saturated" glitch.
  const srcSnap = new Float32Array(arr);

  // If we're already within epsilon of the target, there's nothing to animate.
  let atTarget = true;
  for (let i = 0; i < arr.length && atTarget; i++) {
    if (Math.abs(arr[i] - dst[i]) > 0.005) atTarget = false;
  }

  if (!atTarget) {
    // Kill any still-running colour tween from a previous reality change
    // so we can't get two onUpdate callbacks fighting over the same array.
    if (state.colorTween) state.colorTween.kill();

    state.colorTween = gsap.to({ progress: 0 }, {
      progress: 1,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: function (this: any) {
        const p = this.targets()[0].progress;
        for (let i = 0; i < instanceCount * 3; i++) {
          arr[i] = srcSnap[i] + (dst[i] - srcSnap[i]) * p;
        }
        mesh.instanceColor!.needsUpdate = true;
      },
      onComplete: () => { state.colorTween = null; },
    });
  }

  // Fog color follows the page bg so far chips always fade to the right tone.
  if (scene.fog && (scene.fog as THREE.Fog).color) {
    const fogColor = (scene.fog as THREE.Fog).color;
    const target = toDesaturated
      ? { r: 0.7373, g: 0.5686, b: 0.5059 }    // sartoria #BC9181 terracotta plaster
      : { r: 0.9804, g: 0.9725, b: 0.9608 };   // immagine #FAF8F5
    if (state.fogTween) state.fogTween.kill();
    state.fogTween = gsap.to(fogColor, {
      ...target,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => { state.fogTween = null; },
    });
  }
}

// ============================================
// REALITY BURST
// Scatters all instances outward and fades the material; called from the
// transition layer when the user toggles reality.
// ============================================

// Reverses a previous burst: starts at the fully-scattered state (invisible,
// chips offset outward) and animates back to rest with the material fading
// in. Used on entrance when the user comes back from sartoria.
export function reverseBurstSphere(
  state: SphereState,
  gsap: any,
  duration = 1.4,
): Promise<void> {
  const material = state.mesh.material as THREE.MeshLambertMaterial;
  material.transparent = true;
  // Snap to scattered + invisible immediately
  state.burstProgress = 1;
  material.opacity = 0;
  const canvas = state.renderer.domElement;
  canvas.style.pointerEvents = 'none';
  return new Promise((resolve) => {
    gsap.to(state, {
      burstProgress: 0,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        // Fade material in as chips return (inverse of the burst formula)
        material.opacity = Math.min(1, (1 - state.burstProgress) * 1.3);
      },
      onComplete: () => {
        material.opacity = 1;
        canvas.style.pointerEvents = 'auto';
        resolve();
      },
    });
  });
}

export function burstSphere(
  state: SphereState,
  gsap: any,
  duration = 0.75,
): Promise<void> {
  const material = state.mesh.material as THREE.MeshLambertMaterial;
  material.transparent = true;
  // Once the sphere starts disintegrating the chips are no longer a real
  // interactive surface -- kill hover/click and hide the tooltip so the
  // invisible geometry can't trap cursor events.
  const canvas = state.renderer.domElement;
  canvas.style.pointerEvents = 'none';
  if (state.tooltip) state.tooltip.style.display = 'none';
  state.hoveredInstance = -1;
  return new Promise((resolve) => {
    gsap.to(state, {
      burstProgress: 1,
      duration,
      ease: 'power2.in',
      onUpdate: () => {
        material.opacity = Math.max(0, 1 - state.burstProgress * 1.2);
      },
      onComplete: () => resolve(),
    });
  });
}

export function disposeSphere(state: SphereState): void {
  state.disposed = true;
  cancelAnimationFrame(state.animationId);
  // Kill any live reality-transition tweens so they can't keep mutating the
  // disposed state's instanceColor / fog.color after this returns.
  state.colorTween?.kill();
  state.fogTween?.kill();
  state.controls.dispose();
  state.mesh.geometry.dispose();
  (state.mesh.material as THREE.Material).dispose();
  state.renderer.dispose();
  state.tooltip?.remove();
}
