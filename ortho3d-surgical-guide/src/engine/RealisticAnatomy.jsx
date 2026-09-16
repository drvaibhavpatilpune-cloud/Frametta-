import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { KNEE_MODEL_PACK, STRUCTURE_COLORS } from './modelRegistry';

Object.values(KNEE_MODEL_PACK.structures).forEach((url) => useGLTF.preload(url));

function canvasTex(canvas, { repeat = [1, 1], colorSpace = null, anisotropy = 8 } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  if (colorSpace) tex.colorSpace = colorSpace;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Medical-illustration bone: warm ivory, porous cortex, soft AO mottling.
 * Not plastic white, not transparent.
 */
function makeBoneMaps(size = 768) {
  const albedo = document.createElement('canvas');
  albedo.width = albedo.height = size;
  const ctx = albedo.getContext('2d');

  // Warm ivory base (reference medical atlas tone)
  ctx.fillStyle = '#e9dcc6';
  ctx.fillRect(0, 0, size, size);

  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < size * size; i++) {
    const x = i % size;
    const y = (i / size) | 0;
    // Low-frequency warmth variation
    const low =
      Math.sin(x * 0.02) * Math.cos(y * 0.017) * 10 +
      Math.sin(x * 0.007 + y * 0.011) * 8;
    const n = (Math.random() - 0.5) * 22 + low;
    const j = i * 4;
    img.data[j] = Math.min(255, Math.max(0, img.data[j] + n));
    img.data[j + 1] = Math.min(255, Math.max(0, img.data[j + 1] + n * 0.88));
    img.data[j + 2] = Math.min(255, Math.max(0, img.data[j + 2] + n * 0.62 - 4));
  }
  ctx.putImageData(img, 0, 0);

  // Cortical pores / haversian pits
  for (let k = 0; k < 420; k++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 0.5 + Math.random() * 2.4;
    ctx.fillStyle = `rgba(110, 88, 68, ${0.1 + Math.random() * 0.28})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soft vascular / nutrient channel streaks
  for (let k = 0; k < 28; k++) {
    ctx.strokeStyle = `rgba(150, 120, 95, ${0.08 + Math.random() * 0.12})`;
    ctx.lineWidth = 1 + Math.random() * 2.5;
    ctx.beginPath();
    const x0 = Math.random() * size;
    const y0 = Math.random() * size;
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(
      x0 + 40,
      y0 + (Math.random() - 0.5) * 30,
      x0 + 80,
      y0 + (Math.random() - 0.5) * 40,
      x0 + 120,
      y0 + (Math.random() - 0.5) * 20
    );
    ctx.stroke();
  }

  // Warm marrow blotches in recesses
  for (let k = 0; k < 22; k++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 28 + Math.random() * 70;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(210, 170, 130, 0.22)');
    g.addColorStop(1, 'rgba(210, 170, 130, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Height field → normal map for porous relief
  const height = new Float32Array(size * size);
  const aimg = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < size * size; i++) {
    height[i] = aimg.data[i * 4] / 255;
  }
  const ncan = document.createElement('canvas');
  ncan.width = ncan.height = size;
  const nctx = ncan.getContext('2d');
  const nimg = nctx.createImageData(size, size);
  const strength = 2.4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const l = height[y * size + ((x - 1 + size) % size)];
      const r = height[y * size + ((x + 1) % size)];
      const u = height[((y - 1 + size) % size) * size + x];
      const d = height[((y + 1) % size) * size + x];
      const nx = (l - r) * strength;
      const ny = (u - d) * strength;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      const j = i * 4;
      nimg.data[j] = ((nx / len) * 0.5 + 0.5) * 255;
      nimg.data[j + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      nimg.data[j + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      nimg.data[j + 3] = 255;
    }
  }
  nctx.putImageData(nimg, 0, 0);

  // Roughness: matte cortex with slightly smoother patches
  const rcan = document.createElement('canvas');
  rcan.width = rcan.height = size;
  const rctx = rcan.getContext('2d');
  const rimg = rctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = 155 + Math.floor(Math.random() * 70) + (height[i] > 0.55 ? -18 : 8);
    const j = i * 4;
    rimg.data[j] = rimg.data[j + 1] = rimg.data[j + 2] = Math.max(80, Math.min(255, v));
    rimg.data[j + 3] = 255;
  }
  rctx.putImageData(rimg, 0, 0);

  // Soft AO map from height
  const aoCan = document.createElement('canvas');
  aoCan.width = aoCan.height = size;
  const aoCtx = aoCan.getContext('2d');
  const aoImg = aoCtx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = Math.floor(170 + height[i] * 85);
    const j = i * 4;
    aoImg.data[j] = aoImg.data[j + 1] = aoImg.data[j + 2] = v;
    aoImg.data[j + 3] = 255;
  }
  aoCtx.putImageData(aoImg, 0, 0);

  return {
    map: canvasTex(albedo, { repeat: [2.2, 2.2], colorSpace: THREE.SRGBColorSpace }),
    normalMap: canvasTex(ncan, { repeat: [2.2, 2.2] }),
    roughnessMap: canvasTex(rcan, { repeat: [2.8, 2.8] }),
    aoMap: canvasTex(aoCan, { repeat: [2.2, 2.2] }),
  };
}

/** Fibrous wet soft-tissue (ligament / tendon) — striated + soft specular */
function makeFiberMaps(size = 512, base = '#c4a078', wet = true) {
  const can = document.createElement('canvas');
  can.width = can.height = size;
  const ctx = can.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Longitudinal fiber bundles
  for (let i = 0; i < 110; i++) {
    const y = Math.random() * size;
    const bright = Math.random() > 0.45;
    ctx.strokeStyle = bright
      ? `rgba(255, 236, 210, ${0.1 + Math.random() * 0.22})`
      : `rgba(90, 60, 40, ${0.08 + Math.random() * 0.16})`;
    ctx.lineWidth = 0.8 + Math.random() * 2.8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + 6, size * 0.7, y - 6, size, y + (Math.random() - 0.5) * 8);
    ctx.stroke();
  }

  // Fine fibril noise
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < size * size; i++) {
    const n = (Math.random() - 0.5) * 18;
    const j = i * 4;
    img.data[j] = Math.min(255, Math.max(0, img.data[j] + n));
    img.data[j + 1] = Math.min(255, Math.max(0, img.data[j + 1] + n * 0.9));
    img.data[j + 2] = Math.min(255, Math.max(0, img.data[j + 2] + n * 0.7));
  }
  ctx.putImageData(img, 0, 0);

  const ncan = document.createElement('canvas');
  ncan.width = ncan.height = size;
  const nctx = ncan.getContext('2d');
  const nimg = nctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // Stripe normals along fibers
      const wave = Math.sin(y * 0.35) * 0.35;
      nimg.data[i] = (0.5 + wave * 0.5) * 255;
      nimg.data[i + 1] = 128;
      nimg.data[i + 2] = 220;
      nimg.data[i + 3] = 255;
    }
  }
  nctx.putImageData(nimg, 0, 0);

  const rcan = document.createElement('canvas');
  rcan.width = rcan.height = size;
  const rctx = rcan.getContext('2d');
  rctx.fillStyle = wet ? '#787878' : '#a0a0a0';
  rctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 40; i++) {
    rctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.12})`;
    rctx.fillRect(0, Math.random() * size, size, 1 + Math.random() * 3);
  }

  return {
    map: canvasTex(can, { repeat: [1, 5], colorSpace: THREE.SRGBColorSpace }),
    normalMap: canvasTex(ncan, { repeat: [1, 5] }),
    roughnessMap: canvasTex(rcan, { repeat: [1, 5] }),
  };
}

/** Muscle belly — deep red fibrous bundles, slight wet sheen */
function makeMuscleMaps(size = 512) {
  const can = document.createElement('canvas');
  can.width = can.height = size;
  const ctx = can.getContext('2d');
  ctx.fillStyle = '#8b3a3a';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 140; i++) {
    const y = Math.random() * size;
    ctx.strokeStyle =
      Math.random() > 0.5
        ? `rgba(180, 70, 70, ${0.15 + Math.random() * 0.25})`
        : `rgba(40, 10, 10, ${0.12 + Math.random() * 0.2})`;
    ctx.lineWidth = 1.5 + Math.random() * 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.35, y + 8, size * 0.65, y - 8, size, y);
    ctx.stroke();
  }
  // Pale connective septa
  for (let i = 0; i < 18; i++) {
    ctx.strokeStyle = `rgba(220, 180, 170, ${0.08 + Math.random() * 0.12})`;
    ctx.lineWidth = 2 + Math.random() * 3;
    const y = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + (Math.random() - 0.5) * 10);
    ctx.stroke();
  }
  return {
    map: canvasTex(can, { repeat: [1.2, 3.5], colorSpace: THREE.SRGBColorSpace }),
  };
}

function makeBoneMaterial(color) {
  if (typeof document === 'undefined') {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0 });
  }
  const maps = makeBoneMaps();
  return new THREE.MeshStandardMaterial({
    color,
    map: maps.map,
    normalMap: maps.normalMap,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughnessMap: maps.roughnessMap,
    aoMap: maps.aoMap,
    aoMapIntensity: 0.85,
    roughness: 0.78,
    metalness: 0.02,
    envMapIntensity: 0.35,
  });
}

function makeSoftMaterial(color, opts = {}) {
  if (typeof document === 'undefined') {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05, ...opts });
  }
  const maps = makeFiberMaps(512, undefined, true);
  return new THREE.MeshStandardMaterial({
    color,
    map: maps.map,
    normalMap: maps.normalMap,
    normalScale: new THREE.Vector2(0.7, 0.7),
    roughnessMap: maps.roughnessMap,
    roughness: 0.42,
    metalness: 0.04,
    envMapIntensity: 0.85,
    ...opts,
  });
}

export function createRealisticMaterials() {
  const muscleMaps = typeof document !== 'undefined' ? makeMuscleMaps() : { map: null };

  return {
    femur: makeBoneMaterial(STRUCTURE_COLORS.femur),
    tibia: makeBoneMaterial(STRUCTURE_COLORS.tibia),
    patella: makeBoneMaterial(STRUCTURE_COLORS.patella),
    acl: makeSoftMaterial(STRUCTURE_COLORS.acl),
    pcl: makeSoftMaterial(STRUCTURE_COLORS.pcl),
    mcl: makeSoftMaterial(STRUCTURE_COLORS.mcl),
    lcl: makeSoftMaterial(STRUCTURE_COLORS.lcl),
    meniscusMedial: makeSoftMaterial(STRUCTURE_COLORS.meniscusMedial, {
      roughness: 0.55,
      envMapIntensity: 0.55,
    }),
    meniscusLateral: makeSoftMaterial(STRUCTURE_COLORS.meniscusLateral, {
      roughness: 0.55,
      envMapIntensity: 0.55,
    }),
    // Opaque cartilage with hyaline sheen — not ghosted plastic
    cartilage: new THREE.MeshPhysicalMaterial({
      color: STRUCTURE_COLORS.cartilage,
      roughness: 0.22,
      metalness: 0.0,
      clearcoat: 0.55,
      clearcoatRoughness: 0.28,
      sheen: 0.35,
      sheenColor: new THREE.Color('#d8e8f0'),
      sheenRoughness: 0.4,
      envMapIntensity: 0.9,
      transparent: false,
      opacity: 1,
    }),
    muscles: new THREE.MeshStandardMaterial({
      color: STRUCTURE_COLORS.muscles,
      map: muscleMaps.map,
      roughness: 0.48,
      metalness: 0.03,
      envMapIntensity: 0.7,
      transparent: false,
      opacity: 1,
    }),
    neurovascular: new THREE.MeshStandardMaterial({
      color: STRUCTURE_COLORS.neurovascular,
      roughness: 0.38,
      metalness: 0.05,
      envMapIntensity: 0.6,
    }),
    graft: makeSoftMaterial(STRUCTURE_COLORS.graft, {
      roughness: 0.4,
      envMapIntensity: 0.75,
    }),
  };
}

export function highlightedMaterial(base) {
  const m = base.clone();
  m.emissive = new THREE.Color('#b8924a');
  m.emissiveIntensity = 0.14;
  return m;
}

function ensureUVs(geometry) {
  if (geometry.attributes.uv) {
    // Also ensure uv2 for aoMap
    if (!geometry.attributes.uv2) {
      geometry.setAttribute('uv2', geometry.attributes.uv.clone());
    }
    return;
  }
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
  const attr = new THREE.BufferAttribute(uvs, 2);
  geometry.setAttribute('uv', attr);
  geometry.setAttribute('uv2', attr.clone());
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
