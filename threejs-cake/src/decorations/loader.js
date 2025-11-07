import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

export function loadDecoration(url, { scale = 1, rotateY = 0 } = {}, tune) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        const g = gltf.scene;
        if (scale !== 1) g.scale.setScalar(scale);
        if (rotateY) g.rotation.y = rotateY;
        g.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = o.receiveShadow = true;
            const m = o.material;
            if (m && 'envMapIntensity' in m) m.envMapIntensity = 1.0;
            if (m && tune) tune(m, o);
          }
        });
        resolve(g);
      },
      undefined,
      reject
    );
  });
}
