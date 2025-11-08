import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
export { THREE };

// === SCENE SETUP ===
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x14161a);

// === CAMERA ===
export const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(3, 2, 4);

// === RENDERER ===
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

// === MOUNT FUNCTION ===
export function mount(containerId = 'app') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`❌ No element found with id "${containerId}"`);
    return;
  }
  container.appendChild(renderer.domElement);
}

// === LIGHTS ===
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
keyLight.position.set(5, 8, 5);
keyLight.castShadow = true;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
fillLight.position.set(-4, 3, -3);
scene.add(fillLight);

// === GROUND ===
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x1f2228, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// === ORBIT CONTROLS ===
export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 1.5;
controls.maxDistance = 8;
controls.maxPolarAngle = Math.PI * 0.49;

// === TRANSFORM CONTROLS ===
export const tcontrols = new TransformControls(camera, renderer.domElement);
tcontrols.setMode('translate');
tcontrols.showY = false; 
scene.add(tcontrols);

tcontrols.setSize(0.9);
tcontrols.addEventListener('dragging-changed', (event) => {
  controls.enabled = !event.value;
});

// === HANDLE WINDOW RESIZE ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === START LOOP ===
export function startLoop() {
  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
