import { fitToHeight } from '../utils/helpers.js';
import { loadDecoration } from './loader.js';

// each builder takes cakeTopY to choose a nice relative height
export async function buildStrawberry(cakeTopY) {
  const g = await loadDecoration('/models/strawberry.glb', {}, (m) => {
    if ('roughness' in m) m.roughness = 0.45;
    if ('metalness' in m) m.metalness = 0.0;
  });
  fitToHeight(g, Math.max(0.22, (cakeTopY || 1) * 0.22));
  return g;
}

export async function buildCandle(cakeTopY, THREERef) {
  const g = await loadDecoration('/models/birthday_candle.glb', {}, (m) => {
    if ('roughness' in m) m.roughness = 0.6;
    if ('metalness' in m) m.metalness = 0.0;
  });
  fitToHeight(g, Math.max(0.6, (cakeTopY || 1) * 0.6));
  const THREE = THREERef;
  const box = new THREE.Box3().setFromObject(g);
  const top = box.max.y;
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfff4a8 }));
  const light = new THREE.PointLight(0xfff2a0, 0.7, 0.7);
  flame.position.set(0, top + 0.03, 0);
  light.position.copy(flame.position);
  g.add(flame, light);
  return g;
}

export async function buildChocolate(cakeTopY) {
  const g = await loadDecoration('/models/chocolate_easter_bunny.glb', {}, (m) => {
    if ('roughness' in m) m.roughness = 0.28;
    if ('metalness' in m) m.metalness = 0.0;
    if ('clearcoat' in m) m.clearcoat = 0.4;
    if ('clearcoatRoughness' in m) m.clearcoatRoughness = 0.25;
  });
  fitToHeight(g, Math.max(0.45, (cakeTopY || 1) * 0.45));
  g.rotation.y = Math.PI / 10;
  return g;
}
