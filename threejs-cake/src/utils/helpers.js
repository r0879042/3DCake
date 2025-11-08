import { THREE } from '../core/setup.js';

const _ray = new THREE.Raycaster();
const _tmpV = new THREE.Vector3();

/**
 * Function to ensure a model’s height matches a given target height.
 */
export function fitToHeight(obj3d, targetH) {
  const box = new THREE.Box3().setFromObject(obj3d);
  const size = box.getSize(_tmpV);
  const h = size.y || 1;
  const scale = targetH / h;
  obj3d.scale.multiplyScalar(scale);
}

/**
 * Returns how far we must lift from the hit point so the object’s base sits on it.
 */
function baseLift(obj3d) {
  const box = new THREE.Box3().setFromObject(obj3d);
  const minY = box.min.y;
  const originY = obj3d.position.y;
  return originY - minY;
}

/**
 * Creates a function that drops an object onto the cake surface.
 */
export function makeDropToCake(cakeRootRef, cakeTopYRef) {
  return function dropToCake(obj3d) {
    if (!cakeRootRef.value) return;

    const from = new THREE.Vector3(obj3d.position.x, cakeTopYRef.value + 5, obj3d.position.z);
    _ray.set(from, new THREE.Vector3(0, -1, 0));

    const hits = _ray.intersectObject(cakeRootRef.value, true);
    const lift = baseLift(obj3d);
    const targetY = hits.length ? hits[0].point.y : cakeTopYRef.value;

    obj3d.position.y = targetY + lift;
  };
}
