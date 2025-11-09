import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { buildStrawberry, buildOrchid, buildChocolate } from './decorations/builders.js';
import { createAddRemoveUI, createEditPanel } from './ui/panels.js';
import { createSlots, findFreeSlot, occupySlot, freeSlotByKey, occupiedCount } from './placement/slots.js';

// === Scene & Renderer ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14161a);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 2, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('app').appendChild(renderer.domElement);

// === Lights ===
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
dirLight.position.set(5, 8, 5);
dirLight.castShadow = true;
scene.add(dirLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
fillLight.position.set(-4, 3, -3);
scene.add(fillLight);

// === Ground ===
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x1f2228, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const tcontrols = new TransformControls(camera, renderer.domElement);
tcontrols.setMode('translate');
tcontrols.showY = false;
scene.add(tcontrols);
tcontrols.addEventListener('mouseDown', () => (controls.enabled = false));
tcontrols.addEventListener('mouseUp', () => (controls.enabled = true));

// === Load Cake ===
const loader = new GLTFLoader();
let cakeRoot = null;
let cakeTopY = 0;
let cakeRadius = 0.8;
let slots = [];

loader.load(
  '/models/birthday_cake.glb',
  (gltf) => {
    cakeRoot = gltf.scene;
    cakeRoot.traverse((o) => {
      if (o.isMesh) o.castShadow = o.receiveShadow = true;
    });

    const bbox = new THREE.Box3().setFromObject(cakeRoot);
    const size = bbox.getSize(new THREE.Vector3());
    const center = bbox.getCenter(new THREE.Vector3());
    cakeRoot.position.set(-center.x, -bbox.min.y, -center.z);

    const scale = 2.0 / Math.max(size.x, size.y, size.z);
    cakeRoot.scale.setScalar(scale);
    scene.add(cakeRoot);

    const bbox2 = new THREE.Box3().setFromObject(cakeRoot);
    cakeTopY = bbox2.max.y;
    cakeRadius = Math.max(bbox2.getSize(new THREE.Vector3()).x, bbox2.getSize(new THREE.Vector3()).z) * 0.5 * 0.9;

    controls.target.set(0, bbox2.getCenter(new THREE.Vector3()).y, 0);
    controls.update();
    createSlots(6);
  },
  undefined,
  (err) => console.error('❌ Failed to load cake:', err)
);

// === Drop to Cake Helper ===
const _ray = new THREE.Raycaster();
const _tmp = new THREE.Vector3();
function dropToCake(obj3d) {
  if (!cakeRoot) return;
  const from = new THREE.Vector3(obj3d.position.x, cakeTopY + 5, obj3d.position.z);
  _ray.set(from, new THREE.Vector3(0, -1, 0));
  const hits = _ray.intersectObject(cakeRoot, true);
  const box = new THREE.Box3().setFromObject(obj3d);
  const h = box.getSize(_tmp).y;
  const centerY = box.getCenter(_tmp).y;
  const baseOffset = -(centerY - h / 2);
  obj3d.position.y = (hits[0]?.point.y ?? cakeTopY) + baseOffset;
}

// === Decorations ===
const decorations = {
  strawberry: { mesh: null, build: (topY) => buildStrawberry(topY) },
  orchid: { mesh: null, build: (topY) => buildOrchid(topY) },
  chocolate: { mesh: null, build: (topY) => buildChocolate(topY) },
};

// === UI ===
const ui = createAddRemoveUI({ decorations, toggleDecoration });
createEditPanel({ decorations, tcontrols, dropToCake });

const MAX_ITEMS = 6;

// === Add / Remove ===
async function toggleDecoration(key) {
  const item = decorations[key];
  if (!item) return;

  if (item.mesh) {
    if (tcontrols.object === item.mesh) tcontrols.detach();
    scene.remove(item.mesh);
    item.mesh = null;
    freeSlotByKey(key);
    ui.updateButton(key);
    toast(`${capitalize(key)} removed`);
    return;
  }

  if (occupiedCount() >= MAX_ITEMS) return toast('Limit reached. Remove one first.');
  const slot = findFreeSlot();
  if (!slot) return toast('No free slots.');

  try {
    const mesh = await item.build(cakeTopY);
    occupySlot(slot, key, mesh);
    scene.add(mesh);
    item.mesh = mesh;
    ui.updateButton(key);
    toast(`${capitalize(key)} added`);
  } catch (e) {
    console.error(e);
    toast(`Error loading ${key}`);
  }
}

// === Toast ===
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

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// === Resize + Loop ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
