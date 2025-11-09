import { fitToHeight } from '../utils/helpers.js';
import { loadDecoration } from './loader.js';

// === STRAWBERRY ===
export async function buildStrawberry(cakeTopY) {
  const g = await loadDecoration('/models/strawberry.glb', {}, (m) => {
    if ('roughness' in m) m.roughness = 0.45;
    if ('metalness' in m) m.metalness = 0.0;
  });
  // about 22% of cake height
  fitToHeight(g, Math.max(0.22, (cakeTopY || 1) * 0.22));
  return g;
}

// === CHOCOLATE ===
export async function buildChocolate(cakeTopY) {
  const g = await loadDecoration('/models/chocolate_easter_bunny.glb', {}, (m) => {
    if ('roughness' in m) m.roughness = 0.28;
    if ('metalness' in m) m.metalness = 0.0;
    if ('clearcoat' in m) m.clearcoat = 0.4;
    if ('clearcoatRoughness' in m) m.clearcoatRoughness = 0.25;
  });
  // ~45% of cake height
  fitToHeight(g, Math.max(0.45, (cakeTopY || 1) * 0.45));
  g.rotation.y = Math.PI / 10;
  return g;
}

// === ORCHID (replaces Candle) ===
export async function buildOrchid(cakeTopY) {
  const g = await loadDecoration('/models/orchid_flower.glb', {}, (m) => {
    if ('roughness' in m) m.roughness = 0.5;
    if ('metalness' in m) m.metalness = 0.0;
  });
  // ~35% of cake height
  fitToHeight(g, Math.max(0.35, (cakeTopY || 1) * 0.35));
  g.rotation.y = Math.PI / 8;
  return g;
}
