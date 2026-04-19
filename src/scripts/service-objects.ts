/**
 * service-objects.ts
 * Factory for small Three.js 3D scenes -- one per service in the scatter grid.
 * Each object is designed to read well at 80-140px canvas size.
 */

import * as THREE from 'three';

export interface ObjectResult {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  animate: () => void;
  dispose: () => void;
}

// ---------------------------------------------------------------------------
// BASE SETUP
// ---------------------------------------------------------------------------

function createBaseSetup(canvas: HTMLCanvasElement): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
} {
  const w = canvas.clientWidth || 120;
  const h = canvas.clientHeight || 120;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
  camera.position.set(0, 0, 4);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(2, 3, 4);
  scene.add(directional);

  return { scene, camera, renderer };
}

function disposeScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
  scene.traverse((obj: THREE.Object3D) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      if (mesh.geometry) mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        (mesh.material as THREE.Material[]).forEach((m: THREE.Material) => m.dispose());
      } else if (mesh.material) {
        (mesh.material as THREE.Material).dispose();
      }
    }
  });
  renderer.dispose();
}

// ---------------------------------------------------------------------------
// IMMAGINE OBJECTS
// ---------------------------------------------------------------------------

// 1. prism -- ConeGeometry hex prism, slow Y rotation + gentle X oscillation
function createPrism(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);

  const geo = new THREE.ConeGeometry(0.8, 1.6, 6);
  const mat = new THREE.MeshLambertMaterial({ color: 0xB8364B });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  let t = 0;
  function animate() {
    t += 0.006;
    mesh.rotation.y = t;
    mesh.rotation.x = Math.sin(t * 0.7) * 0.18;
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// 2. fan-deck -- 5 thin cards fanning open/closed, slow Y rotation
function createFanDeck(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);

  const colors = [0x7A2040, 0xB8364B, 0xD4878F, 0xC45A5A, 0x6B2D5A];
  const cards: THREE.Mesh[] = [];
  const group = new THREE.Group();

  colors.forEach((color, i) => {
    const geo = new THREE.BoxGeometry(0.6, 1.0, 0.04);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    // Stack cards slightly offset so they're visible individually
    mesh.position.x = (i - 2) * 0.04;
    mesh.position.z = i * 0.02;
    cards.push(mesh);
    group.add(mesh);
  });

  scene.add(group);

  let t = 0;
  function animate() {
    t += 0.005;
    // Fan spread: sin-based angle spread from center
    const spread = (Math.sin(t * 0.8) * 0.5 + 0.5) * 0.35; // 0 to 0.35 radians
    cards.forEach((card, i) => {
      const offset = i - 2; // -2 to +2
      card.rotation.z = offset * spread;
      card.position.x = Math.sin(offset * spread) * 0.4;
    });
    group.rotation.y = t * 0.4;
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// 3. capsule -- tilting + floating + Y rotation
function createCapsule(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);

  const geo = new THREE.CapsuleGeometry(0.5, 0.8, 8, 16);
  const mat = new THREE.MeshLambertMaterial({ color: 0x6B2D5A });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  let t = 0;
  function animate() {
    t += 0.006;
    mesh.rotation.y = t;
    mesh.rotation.z = Math.sin(t * 0.6) * 0.25;
    mesh.position.y = Math.sin(t * 0.9) * 0.15;
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// 4. face -- hemisphere (sphere phi 0 to PI), gentle Y oscillation
function createFace(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);

  // Half sphere: phiStart=0, phiLength=Math.PI*2, thetaStart=0, thetaLength=Math.PI/2
  // For a face-like dome: full sphere, phi 0 to PI gives a hemisphere
  const geo = new THREE.SphereGeometry(0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI);
  const mat = new THREE.MeshLambertMaterial({
    color: 0x1B6B6B,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  // Tilt the flat side slightly toward the viewer
  mesh.rotation.x = -0.3;
  scene.add(mesh);

  let t = 0;
  function animate() {
    t += 0.005;
    mesh.rotation.y = Math.sin(t * 0.7) * 0.4;
    mesh.position.y = Math.sin(t * 0.5) * 0.08;
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// 5. hanger -- torus hook + cylinder bar + shoulder cylinders, slow Y swing + float
function createHanger(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);
  camera.position.set(0, 0.2, 4);

  const color = 0xB8A060;
  const group = new THREE.Group();

  // Hook: small torus at top
  const hookGeo = new THREE.TorusGeometry(0.22, 0.05, 8, 24, Math.PI * 1.5);
  const hookMat = new THREE.MeshLambertMaterial({ color });
  const hook = new THREE.Mesh(hookGeo, hookMat);
  hook.position.y = 0.85;
  hook.rotation.z = -Math.PI * 0.25; // angle the opening forward
  group.add(hook);

  // Horizontal bar
  const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8);
  const barMat = new THREE.MeshLambertMaterial({ color });
  const bar = new THREE.Mesh(barGeo, barMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = 0.2;
  group.add(bar);

  // Left shoulder -- angled down-left
  const shoulderGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.75, 8);
  const leftMat = new THREE.MeshLambertMaterial({ color });
  const left = new THREE.Mesh(shoulderGeo, leftMat);
  left.rotation.z = Math.PI / 2 + 0.55;
  left.position.set(-0.55, -0.08, 0);
  group.add(left);

  const rightMat = new THREE.MeshLambertMaterial({ color });
  const right = new THREE.Mesh(shoulderGeo.clone(), rightMat);
  right.rotation.z = Math.PI / 2 - 0.55;
  right.position.set(0.55, -0.08, 0);
  group.add(right);

  scene.add(group);

  let t = 0;
  function animate() {
    t += 0.005;
    group.rotation.y = Math.sin(t * 0.6) * 0.35;
    group.position.y = Math.sin(t * 0.8) * 0.1;
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// 6. vials -- 3 cylinders, individual bobbing, group Y rotation
function createVials(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);

  const configs = [
    { color: 0xC45A5A, x: -0.48, phase: 0 },
    { color: 0xB8364B, x: 0,      phase: 1.2 },
    { color: 0xD4878F, x: 0.48,   phase: 2.4 },
  ];

  const group = new THREE.Group();
  const vials: { mesh: THREE.Mesh; phase: number }[] = [];

  configs.forEach(({ color, x, phase }) => {
    const geo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = x;
    group.add(mesh);
    vials.push({ mesh, phase });
  });

  scene.add(group);

  let t = 0;
  function animate() {
    t += 0.006;
    vials.forEach(({ mesh, phase }) => {
      mesh.position.y = Math.sin(t * 1.1 + phase) * 0.14;
    });
    group.rotation.y = t * 0.5;
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// ---------------------------------------------------------------------------
// SARTORIA OBJECTS
// ---------------------------------------------------------------------------

// 7. dress-form -- tapered body + neck + stand, slow Y rotation
function createDressForm(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);

  const color = 0xC9A96E;
  const group = new THREE.Group();

  // Body: tapered cylinder (wider at hips)
  const bodyGeo = new THREE.CylinderGeometry(0.4, 0.55, 1.4, 16);
  const bodyMat = new THREE.MeshLambertMaterial({ color });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.1;
  group.add(body);

  // Neck: thin cylinder
  const neckGeo = new THREE.CylinderGeometry(0.1, 0.13, 0.28, 10);
  const neckMat = new THREE.MeshLambertMaterial({ color });
  const neck = new THREE.Mesh(neckGeo, neckMat);
  neck.position.y = 0.94;
  group.add(neck);

  // Stand post
  const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
  const postMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
  const post = new THREE.Mesh(postGeo, postMat);
  post.position.y = -0.62;
  group.add(post);

  // Stand base disk
  const baseGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.06, 16);
  const baseMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = -0.9;
  group.add(base);

  scene.add(group);

  let t = 0;
  function animate() {
    t += 0.005;
    group.rotation.y = t;
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// 8. scissors -- two blades + two ring handles, opening/closing animation
function createScissors(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);
  camera.position.set(0, 0, 4.5);

  const color = 0x8B7355;
  const group = new THREE.Group();

  // Blade pair -- pivot at center
  const bladeGeo = new THREE.BoxGeometry(0.12, 1.0, 0.06);

  const blade1Mat = new THREE.MeshLambertMaterial({ color });
  const blade1 = new THREE.Mesh(bladeGeo, blade1Mat);
  blade1.position.set(0.06, 0.3, 0.03);
  group.add(blade1);

  const blade2Mat = new THREE.MeshLambertMaterial({ color });
  const blade2 = new THREE.Mesh(bladeGeo.clone(), blade2Mat);
  blade2.position.set(-0.06, 0.3, -0.03);
  group.add(blade2);

  // Handles -- torus rings
  const ringGeo = new THREE.TorusGeometry(0.22, 0.06, 8, 20);

  const ring1Mat = new THREE.MeshLambertMaterial({ color });
  const ring1 = new THREE.Mesh(ringGeo, ring1Mat);
  ring1.position.set(0.3, -0.5, 0);
  group.add(ring1);

  const ring2Mat = new THREE.MeshLambertMaterial({ color });
  const ring2 = new THREE.Mesh(ringGeo.clone(), ring2Mat);
  ring2.position.set(-0.3, -0.5, 0);
  group.add(ring2);

  scene.add(group);

  let t = 0;
  function animate() {
    t += 0.006;
    // Opening/closing: blades rotate on Z around pivot
    const openAngle = Math.sin(t * 0.8) * 0.3;
    blade1.rotation.z = openAngle;
    blade2.rotation.z = -openAngle;
    // Handles follow blades
    ring1.rotation.z = openAngle;
    ring2.rotation.z = -openAngle;
    group.rotation.y = Math.sin(t * 0.4) * 0.3;
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// 9. fabric -- PlaneGeometry with vertex displacement wave, gentle Y oscillation
function createFabric(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);

  const geo = new THREE.PlaneGeometry(1.4, 1.0, 12, 8);
  const mat = new THREE.MeshLambertMaterial({
    color: 0xD4B87A,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Keep a copy of original positions for displacement
  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const origPositions = new Float32Array(posAttr.array.length);
  origPositions.set(posAttr.array);

  let t = 0;
  function animate() {
    t += 0.006;
    // Wave displacement on Z based on X position + time
    for (let i = 0; i < posAttr.count; i++) {
      const x = origPositions[i * 3];
      const y = origPositions[i * 3 + 1];
      posAttr.setZ(i, Math.sin(x * 3.5 + t * 2.0) * 0.12 + Math.sin(y * 2.5 + t * 1.5) * 0.06);
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();

    mesh.rotation.y = Math.sin(t * 0.5) * 0.3;
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// 10. thimble -- cylinder body + dome cap, Y rotation + float bobbing
function createThimble(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);

  const color = 0x6B5D4F;
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.CylinderGeometry(0.3, 0.5, 0.8, 14);
  const bodyMat = new THREE.MeshLambertMaterial({ color });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // Dome cap on top
  const domeGeo = new THREE.SphereGeometry(0.3, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMat = new THREE.MeshLambertMaterial({ color });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 0.4;
  group.add(dome);

  scene.add(group);

  let t = 0;
  function animate() {
    t += 0.006;
    group.rotation.y = t;
    group.position.y = Math.sin(t * 0.9) * 0.14;
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// 11. ceremony-hanger -- thin bar + draped fabric plane with wave, gentle swing
function createCeremonyHanger(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);
  camera.position.set(0, 0.3, 4);

  const group = new THREE.Group();

  // Hook
  const hookGeo = new THREE.TorusGeometry(0.18, 0.04, 8, 20, Math.PI * 1.5);
  const hookMat = new THREE.MeshLambertMaterial({ color: 0xA08050 });
  const hook = new THREE.Mesh(hookGeo, hookMat);
  hook.position.y = 0.92;
  hook.rotation.z = -Math.PI * 0.25;
  group.add(hook);

  // Bar
  const barGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.5, 8);
  const barMat = new THREE.MeshLambertMaterial({ color: 0xA08050 });
  const bar = new THREE.Mesh(barGeo, barMat);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = 0.55;
  group.add(bar);

  // Draped fabric plane
  const fabricGeo = new THREE.PlaneGeometry(1.3, 1.0, 10, 8);
  const fabricMat = new THREE.MeshLambertMaterial({
    color: 0xC9A96E,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });
  const fabric = new THREE.Mesh(fabricGeo, fabricMat);
  fabric.position.y = -0.18;
  group.add(fabric);

  scene.add(group);

  const posAttr = fabricGeo.attributes.position as THREE.BufferAttribute;
  const origPositions = new Float32Array(posAttr.array.length);
  origPositions.set(posAttr.array);

  let t = 0;
  function animate() {
    t += 0.005;
    // Fabric wave
    for (let i = 0; i < posAttr.count; i++) {
      const x = origPositions[i * 3];
      const y = origPositions[i * 3 + 1];
      posAttr.setZ(i, Math.sin(x * 2.5 + t * 1.5) * 0.09 + Math.sin(y * 2.0 + t) * 0.05);
    }
    posAttr.needsUpdate = true;
    fabricGeo.computeVertexNormals();

    group.rotation.y = Math.sin(t * 0.5) * 0.28;
    group.position.y = Math.sin(t * 0.7) * 0.08;
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// 12. morph-garment -- TorusKnotGeometry, X+Y rotation + pulsing scale
function createMorphGarment(canvas: HTMLCanvasElement): ObjectResult {
  const { scene, camera, renderer } = createBaseSetup(canvas);

  const geo = new THREE.TorusKnotGeometry(0.5, 0.15, 64, 8, 2, 3);
  const mat = new THREE.MeshLambertMaterial({ color: 0xC9A96E });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  let t = 0;
  function animate() {
    t += 0.007;
    mesh.rotation.x = t * 0.6;
    mesh.rotation.y = t;
    // Pulsing scale
    const pulse = 1 + Math.sin(t * 1.4) * 0.08;
    mesh.scale.setScalar(pulse);
    renderer.render(scene, camera);
  }

  return {
    scene, camera, renderer, animate,
    dispose: () => disposeScene(scene, renderer),
  };
}

// ---------------------------------------------------------------------------
// FACTORY REGISTRY
// ---------------------------------------------------------------------------

const FACTORIES: Record<string, (canvas: HTMLCanvasElement) => ObjectResult> = {
  'prism':            createPrism,
  'fan-deck':         createFanDeck,
  'capsule':          createCapsule,
  'face':             createFace,
  'hanger':           createHanger,
  'vials':            createVials,
  'dress-form':       createDressForm,
  'scissors':         createScissors,
  'fabric':           createFabric,
  'thimble':          createThimble,
  'ceremony-hanger':  createCeremonyHanger,
  'morph-garment':    createMorphGarment,
};

export function createServiceObject(
  canvas: HTMLCanvasElement,
  objectKey: string,
): ObjectResult | null {
  const factory = FACTORIES[objectKey];
  if (!factory) return null;
  return factory(canvas);
}

export type { ObjectResult as ServiceObject };
