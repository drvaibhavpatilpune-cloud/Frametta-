import * as THREE from 'three';
import { useMemo } from 'react';

const boneMat = (color = '#d4c4a8', opts = {}) =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.55,
    metalness: 0.05,
    clearcoat: 0.15,
    clearcoatRoughness: 0.6,
    sheen: 0.2,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color('#f0e6d4'),
    ...opts,
  });

const ligamentMat = (color = '#c9a882') =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.7,
    metalness: 0.0,
    sheen: 0.35,
    sheenColor: new THREE.Color('#e8d4b0'),
  });

const cartilageMat = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#c8dce8',
    roughness: 0.25,
    metalness: 0.05,
    transmission: 0.15,
    thickness: 0.2,
    transparent: true,
    opacity: 0.72,
  });

function Condyle({ position, scale = [1, 1, 1] }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[0.42, 32, 32]} />
    </mesh>
  );
}

/** Procedural medical-style distal femur */
export function FemurMesh({ material }) {
  const shaft = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.28, 0.34, 2.2, 24);
    geo.translate(0, 1.35, 0);
    return geo;
  }, []);

  return (
    <group>
      <mesh geometry={shaft} material={material} castShadow receiveShadow />
      <mesh position={[0, 0.55, 0]} material={material} castShadow>
        <boxGeometry args={[0.95, 0.55, 0.7]} />
      </mesh>
      {/* Medial / lateral condyles */}
      <mesh position={[-0.32, 0.08, 0.05]} material={material} castShadow>
        <sphereGeometry args={[0.38, 28, 28]} />
      </mesh>
      <mesh position={[0.32, 0.08, 0.05]} material={material} castShadow>
        <sphereGeometry args={[0.38, 28, 28]} />
      </mesh>
      {/* Trochlear groove approximation */}
      <mesh position={[0, 0.22, 0.32]} material={material}>
        <boxGeometry args={[0.35, 0.35, 0.22]} />
      </mesh>
      {/* Intercondylar notch void suggested by inset */}
      <mesh position={[0, 0.05, -0.05]} material={material}>
        <boxGeometry args={[0.22, 0.35, 0.45]} />
      </mesh>
    </group>
  );
}

/** Proximal tibia */
export function TibiaMesh({ material }) {
  const shaft = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.3, 0.26, 2.0, 24);
    geo.translate(0, -1.2, 0);
    return geo;
  }, []);

  return (
    <group>
      <mesh geometry={shaft} material={material} castShadow receiveShadow />
      <mesh position={[0, -0.12, 0]} material={material} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.48, 0.28, 28]} />
      </mesh>
      {/* Plateaus */}
      <mesh position={[-0.28, 0.05, 0]} material={material} receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 24]} />
      </mesh>
      <mesh position={[0.28, 0.05, 0]} material={material} receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 24]} />
      </mesh>
      {/* Tibial tuberosity */}
      <mesh position={[0, -0.35, 0.38]} material={material} castShadow>
        <sphereGeometry args={[0.16, 16, 16]} />
      </mesh>
    </group>
  );
}

export function PatellaMesh({ material }) {
  return (
    <mesh position={[0, 0.35, 0.72]} rotation={[0.35, 0, 0]} material={material} castShadow>
      <sphereGeometry args={[0.22, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
    </mesh>
  );
}

function LigamentCurve({ points, radius = 0.045, material }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    [points]
  );
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 32, radius, 10, false), [curve, radius]);
  return <mesh geometry={geo} material={material} castShadow />;
}

export function ACLMesh({ material, remnant = true }) {
  return (
    <LigamentCurve
      points={[
        [0.18, 0.22, -0.05],
        [0.05, 0.08, 0.02],
        [-0.05, -0.02, 0.06],
        [-0.12, 0.02, 0.12],
      ]}
      radius={remnant ? 0.04 : 0.035}
      material={material}
    />
  );
}

export function PCLMesh({ material }) {
  return (
    <LigamentCurve
      points={[
        [-0.12, 0.2, -0.12],
        [-0.02, 0.05, -0.08],
        [0.08, -0.02, -0.02],
        [0.14, 0.0, 0.05],
      ]}
      radius={0.042}
      material={material}
    />
  );
}

export function MCLMesh({ material }) {
  return (
    <LigamentCurve
      points={[
        [-0.55, 0.45, 0.05],
        [-0.58, 0.15, 0.08],
        [-0.55, -0.15, 0.05],
        [-0.48, -0.35, 0.02],
      ]}
      radius={0.035}
      material={material}
    />
  );
}

export function LCLMesh({ material }) {
  return (
    <LigamentCurve
      points={[
        [0.55, 0.4, 0.0],
        [0.6, 0.15, 0.05],
        [0.58, -0.1, 0.02],
        [0.52, -0.35, -0.02],
      ]}
      radius={0.03}
      material={material}
    />
  );
}

export function MeniscusMesh({ side = 'medial', material }) {
  const x = side === 'medial' ? -0.28 : 0.28;
  const open = side === 'medial' ? 1.2 : 0.4;
  return (
    <mesh position={[x, 0.08, 0.02]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <torusGeometry args={[0.22, 0.055, 12, 32, Math.PI + open]} />
    </mesh>
  );
}

export function CartilageCaps({ material }) {
  return (
    <group>
      <mesh position={[-0.32, 0.12, 0.05]} material={material}>
        <sphereGeometry args={[0.39, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
      </mesh>
      <mesh position={[0.32, 0.12, 0.05]} material={material}>
        <sphereGeometry args={[0.39, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
      </mesh>
      <mesh position={[-0.28, 0.1, 0]} rotation={[Math.PI, 0, 0]} material={material}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 24]} />
      </mesh>
      <mesh position={[0.28, 0.1, 0]} rotation={[Math.PI, 0, 0]} material={material}>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 24]} />
      </mesh>
    </group>
  );
}

export function MusclesMesh({ material }) {
  return (
    <group>
      <mesh position={[0, 1.2, 0.15]} material={material}>
        <capsuleGeometry args={[0.38, 1.1, 8, 16]} />
      </mesh>
      <mesh position={[0.15, -1.0, 0.1]} material={material}>
        <capsuleGeometry args={[0.32, 0.9, 8, 16]} />
      </mesh>
    </group>
  );
}

export function NeurovascularMesh({ material }) {
  const vessel = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.05, 0.8, -0.45),
          new THREE.Vector3(0.02, 0.2, -0.5),
          new THREE.Vector3(0.0, -0.3, -0.48),
          new THREE.Vector3(-0.02, -0.9, -0.42),
        ]),
        24,
        0.04,
        8,
        false
      ),
    []
  );
  return <mesh geometry={vessel} material={material} />;
}

export function GraftMesh({ material, progress = 1 }) {
  const points = [
    [0.2, 0.35, -0.08],
    [0.12, 0.15, -0.02],
    [0.0, 0.02, 0.04],
    [-0.1, -0.05, 0.1],
    [-0.18, -0.25, 0.15],
  ];
  const count = Math.max(2, Math.ceil(points.length * Math.min(1, Math.max(0.05, progress))));
  return <LigamentCurve points={points.slice(0, count)} radius={0.048} material={material} />;
}

export function PortalMarkers({ visible }) {
  if (!visible) return null;
  return (
    <group>
      <mesh position={[0.35, 0.25, 0.75]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#3ea8a8" emissive="#1a5555" />
      </mesh>
      <mesh position={[-0.25, 0.2, 0.78]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#6aa3d8" emissive="#1a3a55" />
      </mesh>
    </group>
  );
}

export function createMaterials() {
  return {
    femur: boneMat('#d4c4a8'),
    tibia: boneMat('#cfc0a0'),
    patella: boneMat('#ddd0b8'),
    acl: ligamentMat('#c9a882'),
    pcl: ligamentMat('#b8956f'),
    mcl: ligamentMat('#b89070'),
    lcl: ligamentMat('#b89070'),
    meniscusMedial: ligamentMat('#d8c098'),
    meniscusLateral: ligamentMat('#d8c098'),
    cartilage: cartilageMat(),
    muscles: new THREE.MeshPhysicalMaterial({
      color: '#a85c5c',
      roughness: 0.65,
      transparent: true,
      opacity: 0.45,
    }),
    neurovascular: new THREE.MeshStandardMaterial({ color: '#a84858', roughness: 0.4 }),
    graft: ligamentMat('#e8c46a'),
    highlight: new THREE.MeshPhysicalMaterial({
      color: '#e8c46a',
      emissive: '#8a7020',
      emissiveIntensity: 0.35,
      roughness: 0.4,
    }),
  };
}

export { boneMat, ligamentMat, Condyle };
