import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { KNEE_MODEL_PACK, STRUCTURE_COLORS } from './modelRegistry';

Object.values(KNEE_MODEL_PACK.structures).forEach((url) => useGLTF.preload(url));

function makeBoneMaps(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const n = 200 + Math.floor(Math.random() * 40);
    const j = i * 4;
    img.data[j] = n;
    img.data[j + 1] = n - 8;
    img.data[j + 2] = n - 18;
    img.data[j + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // Soft blotches for cortical variation
  for (let k = 0; k < 40; k++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 8 + Math.random() * 28;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,248,235,0.22)');
    g.addColorStop(1, 'rgba(255,248,235,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.colorSpace = THREE.SRGBColorSpace;

  // Roughness map
  const rc = document.createElement('canvas');
  rc.width = rc.height = size;
  const rctx = rc.getContext('2d');
  const rimg = rctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = 150 + Math.floor(Math.random() * 70);
    const j = i * 4;
    rimg.data[j] = rimg.data[j + 1] = rimg.data[j + 2] = v;
    rimg.data[j + 3] = 255;
  }
  rctx.putImageData(rimg, 0, 0);
  const roughnessMap = new THREE.CanvasTexture(rc);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(3, 3);
  return { map, roughnessMap };
}

function makeBoneMaterial(color) {
  const maps =
    typeof document !== 'undefined'
      ? makeBoneMaps()
      : { map: null, roughnessMap: null };
  return new THREE.MeshStandardMaterial({
    color,
    map: maps.map,
    roughnessMap: maps.roughnessMap,
    roughness: 0.78,
    metalness: 0.0,
    flatShading: false,
  });
}

function makeSoftMaterial(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.82,
    metalness: 0.0,
    flatShading: false,
    ...opts,
  });
}

export function createRealisticMaterials() {
  return {
    femur: makeBoneMaterial(STRUCTURE_COLORS.femur),
    tibia: makeBoneMaterial(STRUCTURE_COLORS.tibia),
    patella: makeBoneMaterial(STRUCTURE_COLORS.patella),
    acl: makeSoftMaterial(STRUCTURE_COLORS.acl),
    pcl: makeSoftMaterial(STRUCTURE_COLORS.pcl),
    mcl: makeSoftMaterial(STRUCTURE_COLORS.mcl),
    lcl: makeSoftMaterial(STRUCTURE_COLORS.lcl),
    meniscusMedial: makeSoftMaterial(STRUCTURE_COLORS.meniscusMedial),
    meniscusLateral: makeSoftMaterial(STRUCTURE_COLORS.meniscusLateral),
    cartilage: makeSoftMaterial(STRUCTURE_COLORS.cartilage, {
      transparent: true,
      opacity: 0.5,
      roughness: 0.3,
      depthWrite: false,
    }),
    muscles: makeSoftMaterial(STRUCTURE_COLORS.muscles, {
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    }),
    neurovascular: new THREE.MeshStandardMaterial({
      color: STRUCTURE_COLORS.neurovascular,
      roughness: 0.45,
    }),
    graft: makeSoftMaterial(STRUCTURE_COLORS.graft),
  };
}

export function highlightedMaterial(base) {
  const m = base.clone();
  m.emissive = new THREE.Color('#b8923a');
  m.emissiveIntensity = 0.32;
  return m;
}

function ensureUVs(geometry) {
  if (geometry.attributes.uv) return;
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const pos = geometry.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    uvs[i * 2] = (x - bbox.min.x) / (size.x || 1);
    uvs[i * 2 + 1] = (y - bbox.min.y) / (size.y || 1) * 0.5 + (z - bbox.min.z) / (size.z || 1) * 0.5;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

export function GlbStructure({ url, material, castShadow = true }) {
  const { scene } = useGLTF(url);
  const root = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry = obj.geometry.clone();
        ensureUVs(obj.geometry);
        obj.geometry.computeVertexNormals();
        obj.castShadow = castShadow;
        obj.receiveShadow = true;
        obj.material = material;
      }
    });
    return cloned;
  }, [scene, material, castShadow]);

  return <primitive object={root} />;
}

export function CartilageGroup({ material }) {
  return (
    <group>
      <GlbStructure
        url={KNEE_MODEL_PACK.structures.cartilageFemoral}
        material={material}
        castShadow={false}
      />
      <GlbStructure
        url={KNEE_MODEL_PACK.structures.cartilageMedial}
        material={material}
        castShadow={false}
      />
      <GlbStructure
        url={KNEE_MODEL_PACK.structures.cartilageLateral}
        material={material}
        castShadow={false}
      />
    </group>
  );
}

export { KNEE_MODEL_PACK };
