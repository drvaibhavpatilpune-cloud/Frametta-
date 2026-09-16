import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Simple stylized medical instruments as 3D meshes */

export function Arthroscope({ position = [0.35, 0.25, 1.1], progress = 0, active }) {
  const ref = useRef();
  const insert = THREE.MathUtils.lerp(0, 0.55, progress);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.z = position[2] - insert;
  });
  if (!active) return null;
  return (
    <group ref={ref} position={position} rotation={[-0.35, 0.2, 0]}>
      <mesh>
        <cylinderGeometry args={[0.035, 0.035, 1.2, 12]} />
        <meshStandardMaterial color="#8a9aaa" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.12]} />
        <meshStandardMaterial color="#2a3340" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshStandardMaterial color="#3ea8a8" emissive="#1a5555" />
      </mesh>
    </group>
  );
}

export function DrillGuide({ position = [0.9, 0.4, 0.3], rotation = [0, 0, -0.6], progress = 0, active }) {
  if (!active) return null;
  const aim = THREE.MathUtils.lerp(0, 1, progress);
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.2 * (1 - aim)]}>
        <cylinderGeometry args={[0.06, 0.08, 0.9, 10]} />
        <meshStandardMaterial color="#6b7c8c" metalness={0.75} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.02, 8, 20]} />
        <meshStandardMaterial color="#c0cad4" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function GuidePin({ start = [0.55, 0.35, 0.2], end = [0.15, 0.15, -0.05], progress = 0, active }) {
  const mesh = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const mid = a.clone().lerp(b, 0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    return { mid, len, quat };
  }, [start, end]);

  if (!active) return null;
  const shown = mesh.len * Math.max(0.08, progress);
  return (
    <mesh position={mesh.mid} quaternion={mesh.quat}>
      <cylinderGeometry args={[0.015, 0.015, shown, 8]} />
      <meshStandardMaterial color="#d0d8e0" metalness={0.85} roughness={0.15} />
    </mesh>
  );
}

export function Reamer({ position = [0.4, 0.25, 0.1], progress = 0, active }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current && active) ref.current.rotation.y += dt * 8 * progress;
  });
  if (!active) return null;
  return (
    <group ref={ref} position={position} rotation={[0.4, 0, -0.5]}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.7, 10]} />
        <meshStandardMaterial color="#7a8a9a" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <coneGeometry args={[0.08, 0.2, 10]} />
        <meshStandardMaterial color="#b0bac4" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function Grasper({ position = [-0.2, 0.3, 0.9], progress = 0, active }) {
  if (!active) return null;
  const open = 0.15 + progress * 0.1;
  return (
    <group position={position} rotation={[-0.4, -0.3, 0]}>
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
        <meshStandardMaterial color="#667788" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-open, -0.5, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.02, 0.18, 0.04]} />
        <meshStandardMaterial color="#99aabb" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[open, -0.5, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.02, 0.18, 0.04]} />
        <meshStandardMaterial color="#99aabb" metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  );
}

export function InterferenceScrew({ position = [0.18, 0.28, -0.05], progress = 0, active }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (ref.current && active && progress > 0.2) ref.current.rotation.y += dt * 6;
  });
  if (!active) return null;
  const depth = THREE.MathUtils.lerp(0.25, 0, progress);
  return (
    <mesh ref={ref} position={[position[0], position[1] + depth, position[2]]}>
      <cylinderGeometry args={[0.06, 0.05, 0.28, 12]} />
      <meshStandardMaterial color="#c5ccd4" metalness={0.85} roughness={0.2} />
    </mesh>
  );
}

export function TunnelIndicator({ from, to, progress = 0, color = '#3ea8a8' }) {
  if (progress <= 0) return null;
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const dir = b.clone().sub(a);
  const len = dir.length() * progress;
  const mid = a.clone().add(dir.clone().normalize().multiplyScalar(len / 2));
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.055, 0.055, Math.max(0.05, len), 12]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.45}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

export function StepInstruments({ animation, progress, visible }) {
  if (!visible) return null;
  const p = progress;
  switch (animation) {
    case 'portals':
      return <Arthroscope progress={p} active />;
    case 'diagnostic':
      return (
        <>
          <Arthroscope progress={1} active />
          <Grasper progress={p} active />
        </>
      );
    case 'aclAssess':
      return (
        <>
          <Arthroscope progress={1} active />
          <Grasper progress={0.7} active />
        </>
      );
    case 'femoralTunnel':
      return (
        <>
          <DrillGuide progress={Math.min(1, p * 1.5)} active />
          <GuidePin progress={Math.min(1, Math.max(0, p * 1.8 - 0.2))} active />
          <Reamer
            progress={Math.min(1, Math.max(0, p * 2 - 0.8))}
            active={p > 0.4}
            position={[0.35, 0.22, 0.05]}
          />
          <TunnelIndicator
            from={[0.55, 0.4, 0.25]}
            to={[0.12, 0.18, -0.08]}
            progress={Math.min(1, Math.max(0, p * 1.5 - 0.3))}
          />
        </>
      );
    case 'tibialTunnel':
      return (
        <>
          <DrillGuide
            position={[-0.7, -0.3, 0.55]}
            rotation={[0.8, 0.2, 0.4]}
            progress={Math.min(1, p * 1.4)}
            active
          />
          <GuidePin
            start={[-0.45, -0.45, 0.5]}
            end={[-0.1, 0.02, 0.1]}
            progress={Math.min(1, Math.max(0, p * 1.6 - 0.15))}
            active
          />
          <Reamer
            position={[-0.3, -0.2, 0.35]}
            progress={Math.min(1, Math.max(0, p * 2 - 0.7))}
            active={p > 0.35}
          />
          <TunnelIndicator
            from={[-0.4, -0.5, 0.45]}
            to={[-0.08, 0.02, 0.1]}
            progress={Math.min(1, Math.max(0, p * 1.4 - 0.25))}
            color="#6aa3d8"
          />
        </>
      );
    case 'graftPassage':
      return (
        <>
          <GuidePin
            start={[-0.2, -0.4, 0.2]}
            end={[0.2, 0.35, -0.1]}
            progress={1}
            active
          />
          <Grasper position={[-0.15, 0.15, 0.7]} progress={p} active />
        </>
      );
    case 'fixation':
      return <InterferenceScrew progress={p} active />;
    default:
      return null;
  }
}
