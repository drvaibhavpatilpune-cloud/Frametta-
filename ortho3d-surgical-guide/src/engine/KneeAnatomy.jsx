import * as THREE from 'three';
import { useMemo } from 'react';

const boneMat = (color = '#d9cbb0', opts = {}) =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.62,
    metalness: 0.02,
    clearcoat: 0.08,
    clearcoatRoughness: 0.75,
    sheen: 0.15,
    sheenRoughness: 0.85,
    sheenColor: new THREE.Color('#efe6d6'),
    flatShading: false,
    ...opts,
  });

const ligamentMat = (color = '#c4a57a') =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.78,
    metalness: 0.0,
    sheen: 0.4,
    sheenRoughness: 0.7,
    sheenColor: new THREE.Color('#e2c89a'),
  });

const cartilageMat = () =>
  new THREE.MeshPhysicalMaterial({
    color: '#b9d0dc',
    roughness: 0.22,
    metalness: 0.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    sheen: 0.3,
    sheenColor: new THREE.Color('#d8e8f0'),
  });

function makeLatheBone(profile, segments = 48) {
  const pts = profile.map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

/** Distal femur — lathed shaft + rounded condyles (no boxes) */
export function FemurMesh({ material }) {
  const shaft = useMemo(
    () =>
      makeLatheBone([
        [0.22, 2.55],
        [0.26, 2.2],
        [0.3, 1.7],
        [0.32, 1.2],
        [0.36, 0.85],
        [0.48, 0.55],
        [0.58, 0.35],
        [0.52, 0.18],
        [0.2, 0.12],
      ]),
    []
  );

  return (
    <group>
      <mesh geometry={shaft} material={material} castShadow receiveShadow />
      {/* Medial condyle */}
      <mesh position={[-0.34, 0.06, 0.02]} scale={[1.05, 0.92, 1.15]} material={material} castShadow>
        <sphereGeometry args={[0.4, 40, 32]} />
      </mesh>
      {/* Lateral condyle */}
      <mesh position={[0.34, 0.06, 0.02]} scale={[1.0, 0.9, 1.12]} material={material} castShadow>
        <sphereGeometry args={[0.39, 40, 32]} />
      </mesh>
      {/* Trochlea / anterior flange */}
      <mesh position={[0, 0.28, 0.28]} rotation={[0.55, 0, 0]} scale={[1.15, 0.55, 0.7]} material={material}>
        <sphereGeometry args={[0.32, 32, 24]} />
      </mesh>
      {/* Epicondylar width filler */}
      <mesh position={[0, 0.32, -0.05]} scale={[1.35, 0.55, 0.7]} material={material}>
        <sphereGeometry args={[0.36, 28, 20]} />
      </mesh>
    </group>
  );
}

/** Proximal tibia */
export function TibiaMesh({ material }) {
  const shaft = useMemo(
    () =>
      makeLatheBone([
        [0.55, 0.12],
        [0.5, -0.05],
        [0.38, -0.35],
        [0.3, -0.7],
        [0.27, -1.15],
        [0.25, -1.7],
        [0.24, -2.15],
        [0.22, -2.45],
      ]),
    []
  );

  return (
    <group>
      <mesh geometry={shaft} material={material} castShadow receiveShadow />
      {/* Plateau disc */}
      <mesh position={[0, 0.05, 0]} material={material} receiveShadow castShadow>
        <cylinderGeometry args={[0.6, 0.52, 0.16, 40]} />
      </mesh>
      {/* Medial plateau dome */}
      <mesh position={[-0.26, 0.12, 0.02]} scale={[1.1, 0.28, 1.05]} material={material}>
        <sphereGeometry args={[0.28, 28, 18]} />
      </mesh>
      {/* Lateral plateau dome */}
      <mesh position={[0.26, 0.12, 0.02]} scale={[1.05, 0.26, 1.0]} material={material}>
        <sphereGeometry args={[0.27, 28, 18]} />
      </mesh>
      {/* Tibial tuberosity */}
      <mesh position={[0, -0.42, 0.4]} scale={[0.85, 1.1, 1.0]} material={material} castShadow>
        <sphereGeometry args={[0.14, 20, 16]} />
      </mesh>
      {/* Fibular head hint (subtle) */}
      <mesh position={[0.55, -0.35, -0.15]} material={material}>
        <sphereGeometry args={[0.12, 16, 12]} />
      </mesh>
    </group>
  );
}

export function PatellaMesh({ material }) {
  return (
    <mesh
      position={[0, 0.38, 0.78]}
      rotation={[0.4, 0, 0]}
      scale={[1.05, 0.75, 0.55]}
      material={material}
      castShadow
    >
      <sphereGeometry args={[0.24, 28, 22]} />
    </mesh>
  );
}

function LigamentCurve({ points, radius = 0.045, material, tubular = 40 }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    [points]
  );
  const geo = useMemo(
    () => new THREE.TubeGeometry(curve, tubular, radius, 12, false),
    [curve, radius, tubular]
  );
  return <mesh geometry={geo} material={material} castShadow />;
}

export function ACLMesh({ material }) {
  return (
    <group>
      <LigamentCurve
        points={[
          [0.2, 0.28, -0.08],
          [0.1, 0.14, -0.02],
          [0.0, 0.04, 0.04],
          [-0.08, 0.0, 0.1],
          [-0.14, 0.02, 0.14],
        ]}
        radius={0.038}
        material={material}
      />
      <LigamentCurve
        points={[
          [0.16, 0.22, -0.02],
          [0.06, 0.1, 0.02],
          [-0.02, 0.02, 0.06],
          [-0.1, 0.0, 0.1],
        ]}
        radius={0.028}
        material={material}
      />
    </group>
  );
}

export function PCLMesh({ material }) {
  return (
    <LigamentCurve
      points={[
        [-0.14, 0.26, -0.14],
        [-0.04, 0.1, -0.1],
        [0.06, 0.0, -0.04],
        [0.14, -0.02, 0.04],
      ]}
      radius={0.04}
      material={material}
    />
  );
}

export function MCLMesh({ material }) {
  return (
    <LigamentCurve
      points={[
        [-0.58, 0.5, 0.04],
        [-0.62, 0.22, 0.08],
        [-0.58, -0.05, 0.06],
        [-0.5, -0.38, 0.02],
      ]}
      radius={0.032}
      material={material}
    />
  );
}

export function LCLMesh({ material }) {
  return (
    <LigamentCurve
      points={[
        [0.58, 0.45, -0.02],
        [0.64, 0.18, 0.04],
        [0.6, -0.08, 0.02],
        [0.52, -0.4, -0.04],
      ]}
      radius={0.028}
      material={material}
    />
  );
}

export function MeniscusMesh({ side = 'medial', material }) {
  const x = side === 'medial' ? -0.27 : 0.27;
  const arc = side === 'medial' ? Math.PI * 1.35 : Math.PI * 1.55;
  return (
    <mesh position={[x, 0.11, 0.02]} rotation={[-Math.PI / 2, 0, side === 'medial' ? 0.3 : -0.3]} material={material}>
      <torusGeometry args={[0.2, 0.048, 14, 40, arc]} />
    </mesh>
  );
}

export function CartilageCaps({ material }) {
  return (
    <group>
      <mesh position={[-0.34, 0.14, 0.02]} scale={[1.02, 0.55, 1.1]} material={material}>
        <sphereGeometry args={[0.4, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      </mesh>
      <mesh position={[0.34, 0.14, 0.02]} scale={[1.0, 0.52, 1.08]} material={material}>
        <sphereGeometry args={[0.39, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      </mesh>
      <mesh position={[-0.26, 0.14, 0.02]} scale={[1, 0.2, 1]} material={material}>
        <sphereGeometry args={[0.26, 24, 12]} />
      </mesh>
      <mesh position={[0.26, 0.14, 0.02]} scale={[1, 0.2, 1]} material={material}>
        <sphereGeometry args={[0.25, 24, 12]} />
      </mesh>
    </group>
  );
}

export function MusclesMesh({ material }) {
  return (
    <group>
      <mesh position={[0.05, 1.35, 0.18]} scale={[1.1, 1, 0.9]} material={material}>
        <sphereGeometry args={[0.42, 24, 18]} />
      </mesh>
      <mesh position={[0.05, 1.0, 0.12]} material={material}>
        <cylinderGeometry args={[0.4, 0.34, 1.0, 20]} />
      </mesh>
      <mesh position={[0.1, -1.05, 0.12]} material={material}>
        <cylinderGeometry args={[0.3, 0.26, 1.1, 18]} />
      </mesh>
    </group>
  );
}

export function NeurovascularMesh({ material }) {
  const vessel = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.04, 0.9, -0.48),
          new THREE.Vector3(0.02, 0.25, -0.52),
          new THREE.Vector3(0.0, -0.35, -0.5),
          new THREE.Vector3(-0.02, -1.0, -0.44),
        ]),
        32,
        0.035,
        10,
        false
      ),
    []
  );
  return <mesh geometry={vessel} material={material} />;
}

export function GraftMesh({ material, progress = 1 }) {
  const points = [
    [0.2, 0.38, -0.1],
    [0.12, 0.18, -0.04],
    [0.02, 0.04, 0.04],
    [-0.08, -0.02, 0.1],
    [-0.16, -0.28, 0.16],
  ];
  const count = Math.max(2, Math.ceil(points.length * Math.min(1, Math.max(0.05, progress))));
  return <LigamentCurve points={points.slice(0, count)} radius={0.045} material={material} />;
}

export function PortalMarkers({ visible }) {
  if (!visible) return null;
  return (
    <group>
      <mesh position={[0.38, 0.28, 0.82]}>
        <sphereGeometry args={[0.045, 14, 14]} />
        <meshStandardMaterial color="#3ea8a8" emissive="#1a5555" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.28, 0.22, 0.84]}>
        <sphereGeometry args={[0.045, 14, 14]} />
        <meshStandardMaterial color="#6aa3d8" emissive="#1a3a55" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export function createMaterials() {
  return {
    femur: boneMat('#d9cbb0'),
    tibia: boneMat('#d2c3a6'),
    patella: boneMat('#e0d3bb'),
    acl: ligamentMat('#c4a57a'),
    pcl: ligamentMat('#b8956f'),
    mcl: ligamentMat('#b08968'),
    lcl: ligamentMat('#b08968'),
    meniscusMedial: ligamentMat('#cbb07f'),
    meniscusLateral: ligamentMat('#cbb07f'),
    cartilage: cartilageMat(),
    muscles: new THREE.MeshPhysicalMaterial({
      color: '#8f4e4e',
      roughness: 0.7,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    }),
    neurovascular: new THREE.MeshStandardMaterial({ color: '#9a3f4c', roughness: 0.45 }),
    graft: ligamentMat('#d4b06a'),
  };
}

/** Soft medical highlight — warm emissive, keeps anatomical color */
export function highlightedMaterial(base) {
  const m = base.clone();
  m.emissive = new THREE.Color('#c9a24a');
  m.emissiveIntensity = 0.45;
  m.roughness = Math.max(0.25, (base.roughness || 0.5) * 0.85);
  return m;
}

export { boneMat, ligamentMat };
