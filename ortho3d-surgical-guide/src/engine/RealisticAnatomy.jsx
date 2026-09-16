import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { KNEE_MODEL_PACK, STRUCTURE_COLORS } from './modelRegistry';

const ALL_URLS = Object.values(KNEE_MODEL_PACK.structures);
ALL_URLS.forEach((url) => useGLTF.preload(url));

function makeBoneMaterial(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.68,
    metalness: 0.0,
    clearcoat: 0.06,
    clearcoatRoughness: 0.85,
    sheen: 0.18,
    sheenRoughness: 0.88,
    sheenColor: new THREE.Color('#f4eee0'),
  });
}

function makeSoftMaterial(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.76,
    metalness: 0.0,
    sheen: 0.22,
    sheenRoughness: 0.7,
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
      opacity: 0.52,
      roughness: 0.25,
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
  m.emissiveIntensity = 0.38;
  return m;
}

export function GlbStructure({ url, material, castShadow = true }) {
  const { scene } = useGLTF(url);
  const root = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((obj) => {
      if (obj.isMesh) {
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
