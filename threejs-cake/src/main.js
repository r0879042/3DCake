import { THREE, scene, camera, mount, startLoop, tcontrols } from './core/setup.js';
import { makeDropToCake, fitToHeight } from './utils/helpers.js';
import { setCakeMetrics, createSlots, findFreeSlot, occupySlot, freeSlotByKey, occupiedCount } from './placement/slots.js';
import { buildStrawberry, buildCandle, buildChocolate } from './decorations/builders.js';
import { loadDecoration } from './decorations/loader.js';
import { createAddRemoveUI, createEditPanel } from './ui/panels.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

mount('app');

const loader = new GLTFLoader();
const cakeRef = { value: null };
const cakeTopYRef = { value: 0 };
const dropToCake = makeDropToCake(cakeRef, cakeTopYRef);

// ---- Load cake ----
loader.load('/models/birthday_cake.glb', (gltf) => {
  const cake = gltf.scene;
  cake.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });

  // center + normalize
  const bbox = new THREE.Box3().setFromObject(cake);
  const size = bbox.getSize(new THREE.Vector3());
  const center = bbox.getCenter(new THREE.Vector3());
  cake.position.set(-center.x, -bbox.min.y, -center.z);
  const targetSize = 2.0; // normalize
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) cake.scale.setScalar(targetSize / maxDim);
  scene.add(cake);

  // compute metrics
  const b2 = new THREE.Box3().setFromObject(cake);
  const s2 = b2.getSize(new THREE.Vector3());
  const topY = b2.max.y;
  const radius = Math.max(s2.x, s2.z) * 0.5 * 0.9;

  cakeRef.value = cake;
  cakeTopYRef.value = topY;
  setCakeMetrics(topY, radius);
  createSlots(6);
}, undefined, (e) => console.error('❌ Failed to load cake', e));

// ---- Decorations registry ----
const decorations = {
  strawberry: { mesh: null, build: (topY) => buildStrawberry(topY) },
  candle:     { mesh: null, build: (topY) => buildCandle(topY, THREE) },
  chocolate:  { mesh: null, build: (topY) => buildChocolate(topY) },
};
const MAX_ITEMS = 3;

async function toggleDecoration(key) {
  const item = decorations[key];
  if (!item) return;

  if (item.mesh) {
    if (tcontrols.object === item.mesh) tcontrols.detach();
    scene.remove(item.mesh);
    item.mesh = null;
    freeSlotByKey(key);
    ui.updateButton(key);
    toast(`${cap(key)} removed`);
    return;
  }
  if (occupiedCount() >= MAX_ITEMS) { toast(`Limit reached (${MAX_ITEMS}). Remove one first.`); return; }

  const slot = findFreeSlot();
  if (!slot) { toast('No free slots.'); return; }

  try {
    const mesh = await item.build(cakeTopYRef.value);
    occupySlot(slot, key, mesh, dropToCake);
    scene.add(mesh);
    item.mesh = mesh;
    ui.updateButton(key);
    toast(`${cap(key)} added`);
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    toast(`Error loading ${key}`);
  }
}

// ---- UI ----
const ui = createAddRemoveUI({
  decorations,
  toggleDecoration,
  updateButtonText: () => {}
});
createEditPanel({ decorations, tcontrols, dropToCake, controls: null });

// ---- Toast ----
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
  toastTimer = setTimeout(() => (toastEl.style.opacity = '0'), 1200);
}
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

// ---- Render loop ----
startLoop();
