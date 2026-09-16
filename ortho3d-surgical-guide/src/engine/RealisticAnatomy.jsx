import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { KNEE_MODEL_PACK, STRUCTURE_COLORS } from './modelRegistry';

Object.values(KNEE_MODEL_PACK.structures).forEach((url) => useGLTF.preload(url));

/** Porous cortical bone albedo — closer to cinematic medical references */
function makeBoneMaps(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base ivory
  ctx.fillStyle = '#e6d7be';
  ctx.fillRect(0, 0, size, size);

  // Fine pore noise
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < size * size; i++) {
    const n = (Math.random() - 0.5) * 28;
    const j = i * 4;
    img.data[j] = Math.min(255, Math.max(0, img.data[j] + n));
    img.data[j + 1] = Math.min(255, Math.max(0, img.data[j + 1] + n * 0.85));
    img.data[j + 2] = Math.min(255, Math.max(0, img.data[j + 2] + n * 0.65));
  }
  ctx.putImageData(img, 0, 0);

  // Pits / foramina
  for (let k = 0; k < 180; k++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 0.6 + Math.random() * 2.2;
    ctx.fillStyle = `rgba(120,100,80,${0.12 + Math.random() * 0.25})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soft marrow warmth blotches
  for (let k = 0; k < 18; k++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 20 + Math.random() * 50;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(214,180,140,0.18)');
    g.addColorStop(1, 'rgba(214,180,140,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2.5, 2.5);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  // Roughness: cortical denser = less rough patches mixed with porous
  const rc = document.createElement('canvas');
  rc.width = rc.height = size;
  const rctx = rc.getContext('2d');
  const rimg = rctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = 140 + Math.floor(Math.random() * 90);
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

function makeLigamentMaps(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c9a882';
  ctx.fillRect(0, 0, size, size);
  // Fiber streaks
  for (let i = 0; i < 70; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(255,230,200,${0.08 + Math.random() * 0.18})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + 4, size * 0.7, y - 4, size, y);
    ctx.stroke();
  }
  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(1, 4);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
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
    roughness: 0.82,
    metalness: 0.0,
    flatShading: false,
  });
}

function makeSoftMaterial(color, opts = {}) {
  const map = typeof document !== 'undefined' ? makeLigamentMaps() : null;
  return new THREE.MeshStandardMaterial({
    color,
    map,
    roughness: 0.7,
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
      opacity: 0.48,
      roughness: 0.28,
      depthWrite: false,
      map: null,
    }),
    muscles: new THREE.MeshStandardMaterial({
      color: '#7a3a3a',
      roughness: 0.75,
      transparent: true,
      opacity: 0.42,
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
  m.emissive = new THREE.Color('#c4a050');
  m.emissiveIntensity = 0.22;
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
    uvs[i * 2 + 1] =
      ((y - bbox.min.y) / (size.y || 1)) * 0.5 + ((z - bbox.min.z) / (size.z || 1)) * 0.5;
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
