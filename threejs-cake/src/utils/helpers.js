import { THREE } from '../core/setup.js';

const _tmpV = new THREE.Vector3();
const _ray = new THREE.Raycaster();

export function fitToHeight(obj3d, targetH) {
  const box = new THREE.Box3().setFromObject(obj3d);
  const h = box.getSize(_tmpV).y || 1;
  const s = targetH / h;
  obj3d.scale.multiplyScalar(s);
}

export function getLocalBaseOffset(obj3d) {
  const box = new THREE.Box3().setFromObject(obj3d);
  const h = box.getSize(_tmpV).y;
  const centerY = box.getCenter(_tmpV).y;
  const minY = centerY - h / 2;
  return -minY;
}

// returns a function bound to the current cake refs
export function makeDropToCake(cakeRootRef, cakeTopYRef) {
  return function dropToCake(obj3d) {
    if (!cakeRootRef.value) return;
    const from = new THREE.Vector3(obj3d.position.x, cakeTopYRef.value + 5, obj3d.position.z);
    _ray.set(from, new THREE.Vector3(0, -1, 0));
    const hits = _ray.intersectObject(cakeRootRef.value, true);
    const baseOffset = getLocalBaseOffset(obj3d);
    obj3d.position.y = (hits[0]?.point.y ?? cakeTopYRef.value) + baseOffset;
  };
}
