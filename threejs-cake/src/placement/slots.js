import { THREE } from '../core/setup.js';

let slots = [];
let cakeTopY = 0;
let cakeRadius = 0.8;

export function setCakeMetrics(topY, radius) {
  cakeTopY = topY;
  cakeRadius = radius;
}

export function createSlots(n) {
  slots = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * cakeRadius;
    const z = Math.sin(a) * cakeRadius;
    const pos = new THREE.Vector3(x, cakeTopY + 0.01, z);
    slots.push({ pos, occupiedBy: null });
  }
}

export function findFreeSlot() {
  return slots.find((s) => s.occupiedBy === null) || null;
}

export function occupySlot(slot, key, obj3d, dropToCake) {
  slot.occupiedBy = key;
  obj3d.position.set(slot.pos.x, cakeTopY + 0.2, slot.pos.z);
  obj3d.position.x += (Math.random() - 0.5) * 0.02;
  obj3d.position.z += (Math.random() - 0.5) * 0.02;
  dropToCake && dropToCake(obj3d);
}

export function freeSlotByKey(key) {
  const s = slots.find((s) => s.occupiedBy === key);
  if (s) s.occupiedBy = null;
}

export function occupiedCount() {
  return slots.filter((s) => s.occupiedBy !== null).length;
}
