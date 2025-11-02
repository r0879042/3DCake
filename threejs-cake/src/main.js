import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14161a);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2.5, 2.0, 3.5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
document.getElementById('app').appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 8, 5);
dirLight.castShadow = true;
scene.add(dirLight);

const fill = new THREE.DirectionalLight(0xffffff, 0.4);
fill.position.set(-4, 3, -2);
scene.add(fill);

// Ground
const groundGeo = new THREE.PlaneGeometry(20, 20);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 1.5;
controls.maxDistance = 8;
controls.maxPolarAngle = Math.PI * 0.49;

// Load the cake
const loader = new GLTFLoader();
let cakeRoot = null;
let cakeTopY = 0;
let cakeRadius = 0.8;
let slots = [];

loader.load(
  '/models/cake.glb',
  (gltf) => {
    cakeRoot = gltf.scene;
    cakeRoot.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = o.receiveShadow = true;
        if (o.material) o.material.side = THREE.FrontSide;
      }
    });

    const bbox = new THREE.Box3().setFromObject(cakeRoot);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());

    cakeRoot.position.x += -center.x;
    cakeRoot.position.z += -center.z;
    cakeRoot.position.y += -bbox.min.y;

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 5) cakeRoot.scale.setScalar(2.0 / maxDim);

    scene.add(cakeRoot);

    const b2 = new THREE.Box3().setFromObject(cakeRoot);
    const s2 = b2.getSize(new THREE.Vector3());
    const c2 = b2.getCenter(new THREE.Vector3());

    cakeTopY = b2.max.y;
    cakeRadius = Math.max(s2.x, s2.z) * 0.5 * 0.9;

    controls.target.copy(new THREE.Vector3(0, c2.y, 0));
    controls.update();

    createSlots(6);
  },
  undefined,
  (err) => console.error('Error loading cake.glb', err)
);

function createSlots(n) {
  slots = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * cakeRadius;
    const z = Math.sin(a) * cakeRadius;
    const pos = new THREE.Vector3(x, cakeTopY + 0.01, z);
    slots.push({ pos, occupiedBy: null });
  }
}

// Decorations (primitive placeholders)
const decorations = {
  strawberry: { mesh: null, build: buildStrawberry },
  candle: { mesh: null, build: buildCandle },
  chocolate: { mesh: null, build: buildChocolate }
};

function buildStrawberry() {
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.6 })
  );
  body.position.y = 0.07;

  const leaf = new THREE.Mesh(
    new THREE.ConeGeometry(0.04, 0.02, 8),
    new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 })
  );
  leaf.rotation.x = Math.PI;
  leaf.position.y = 0.15;

  const group = new THREE.Group();
  group.add(body, leaf);
  group.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  return group;
}

function buildCandle() {
  const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.25, 16),
    new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.7 })
  );
  candle.position.y = 0.125;

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffd54f })
  );
  flame.position.y = 0.27;

  const group = new THREE.Group();
  group.add(candle, flame);
  group.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  return group;
}

function buildChocolate() {
  const piece = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.04, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 })
  );
  piece.position.y = 0.02;
  piece.rotation.y = Math.PI / 8;

  const group = new THREE.Group();
  group.add(piece);
  group.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  return group;
}

function findFreeSlot() {
  return slots.find(s => s.occupiedBy === null) || null;
}

function occupySlot(slot, key, obj3d) {
  slot.occupiedBy = key;
  obj3d.position.copy(slot.pos);
  obj3d.position.x += (Math.random() - 0.5) * 0.02;
  obj3d.position.z += (Math.random() - 0.5) * 0.02;
}

function freeSlotByKey(key) {
  const s = slots.find(s => s.occupiedBy === key);
  if (s) s.occupiedBy = null;
}

function toggleDecoration(key) {
  const item = decorations[key];
  if (!item) return;

  if (item.mesh) {
    scene.remove(item.mesh);
    item.mesh = null;
    freeSlotByKey(key);
    updateButtonText(key);
    toast(`${capitalize(key)} removed`);
    return;
  }

  const slot = findFreeSlot();
  if (!slot) {
    toast('All slots are occupied (max 3 items). Remove one first.');
    return;
  }

  const mesh = item.build();
  occupySlot(slot, key, mesh);
  scene.add(mesh);
  item.mesh = mesh;
  updateButtonText(key);
  toast(`${capitalize(key)} added`);
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ===== UI =====
const ui = document.createElement('div');
ui.style.position = 'absolute';
ui.style.top = '12px';
ui.style.left = '12px';
ui.style.display = 'grid';
ui.style.gap = '8px';
ui.style.padding = '8px';
ui.style.background = 'rgba(0,0,0,0.35)';
ui.style.borderRadius = '10px';
ui.style.color = '#e8e8e8';
ui.style.fontFamily = 'system-ui, Arial, sans-serif';

function makeButton(key, label) {
  const btn = document.createElement('button');
  btn.dataset.key = key;
  btn.textContent = label;
  btn.style.padding = '10px 12px';
  btn.style.background = '#2d2f36';
  btn.style.border = '1px solid #3a3d45';
  btn.style.color = '#e8e8e8';
  btn.style.borderRadius = '8px';
  btn.style.cursor = 'pointer';
  btn.onmouseenter = () => btn.style.background = '#3a3d45';
  btn.onmouseleave = () => btn.style.background = '#2d2f36';
  btn.onclick = () => toggleDecoration(key);
  return btn;
}

const btns = {
  strawberry: makeButton('strawberry', 'Add Strawberry'),
  candle: makeButton('candle', 'Add Candle'),
  chocolate: makeButton('chocolate', 'Add Chocolate')
};
ui.appendChild(btns.strawberry);
ui.appendChild(btns.candle);
ui.appendChild(btns.chocolate);
document.getElementById('app').appendChild(ui);

function updateButtonText(key) {
  const item = decorations[key];
  const btn = btns[key];
  if (!btn) return;
  btn.textContent = item.mesh ? `Remove ${capitalize(key)}` : `Add ${capitalize(key)}`;
}

// Toast message
const toastEl = document.createElement('div');
toastEl.style.position = 'absolute';
toastEl.style.left = '50%';
toastEl.style.bottom = '16px';
toastEl.style.transform = 'translateX(-50%)';
toastEl.style.padding = '8px 12px';
toastEl.style.background = 'rgba(0,0,0,0.6)';
toastEl.style.color = '#fff';
toastEl.style.borderRadius = '8px';
toastEl.style.fontSize = '12px';
toastEl.style.opacity = '0';
toastEl.style.transition = 'opacity 0.2s ease';
document.getElementById('app').appendChild(toastEl);
let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.style.opacity = '0'; }, 1200);
}

// Help overlay
const help = document.createElement('div');
help.style.position = 'absolute';
help.style.right = '12px';
help.style.bottom = '12px';
help.style.padding = '8px 10px';
help.style.background = 'rgba(0,0,0,0.5)';
help.style.borderRadius = '8px';
help.style.fontSize = '12px';
help.style.color = '#e8e8e8';
help.textContent = 'Step 3: Use buttons to add/remove decorations';
document.getElementById('app').appendChild(help);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Loop
function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
