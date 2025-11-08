import { THREE } from '../core/setup.js';

let slots = [];
let cakeTopY = 0;
let cakeRadius = 0.8;

/**
 * Update cake metrics (It is called after loading cake model)
 */
export function setCakeMetrics(topY, radius) {
  cakeTopY = topY;
  cakeRadius = radius;
}

/**
 * Function to create placement slots around the cake top
 */
export function createSlots(n) {
  slots = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const x = Math.cos(angle) * cakeRadius;
    const z = Math.sin(angle) * cakeRadius;
    const pos = new THREE.Vector3(x, cakeTopY + 0.01, z);
    slots.push({ pos, occupiedBy: null });
  }
}

/**
 * Function to find the next available free slot
 */
export function findFreeSlot() {
  return slots.find((s) => s.occupiedBy === null) || null;
}

/**
 * Function to add a object into a slot and
 * drop it to the cake surface
 */
export function occupySlot(slot, key, obj3d, dropToCake) {
  slot.occupiedBy = key;

  // initial placement slightly above the cake top
  obj3d.position.set(slot.pos.x, slot.pos.y + 0.2, slot.pos.z);

  // add a small random offset for natural variation
  obj3d.position.x += (Math.random() - 0.5) * 0.02;
  obj3d.position.z += (Math.random() - 0.5) * 0.02;

  // snap precisely to the cake surface
  if (dropToCake) dropToCake(obj3d);
}

/**
 * Function to free the slot occupied by a given decoration key
 */
export function freeSlotByKey(key) {
  const s = slots.find((s) => s.occupiedBy === key);
  if (s) s.occupiedBy = null;
}

/**
 * Function to count how many slots are currently used
 */
export function occupiedCount() {
  return slots.filter((s) => s.occupiedBy !== null).length;
}
