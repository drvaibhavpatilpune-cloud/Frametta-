import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

/**
 * Cinematic surgical action overlays: cut paths, tunnel axes, focus rings.
 * Driven by step animation id + progress (0–1).
 */
export function SurgicalActionMarkers({ animation, progress = 0 }) {
  const p = Math.min(1, Math.max(0, progress));
  const pulse = useRef(0);
  useFrame((_, dt) => {
    pulse.current += dt;
  });

  if (!animation) return null;

  switch (animation) {
    case 'portals':
      return (
        <>
          <FocusRing position={[0.38, 0.35, 0.9]} progress={p} color="#3ea8a8" />
          <FocusRing position={[-0.28, 0.28, 0.92]} progress={Math.max(0, p - 0.2)} color="#6aa3d8" />
        </>
      );
    case 'aclAssess':
      return <FocusRing position={[-0.05, 0.08, 0.05]} progress={p} color="#e8c46a" scale={0.12} />;
    case 'femoralTunnel':
      return (
        <>
          <DashedCutPath
            points={[
              [0.55, 0.42, 0.28],
              [0.35, 0.3, 0.1],
              [0.18, 0.22, -0.05],
            ]}
            progress={p}
            color="#d9776f"
          />
          <FocusRing position={[0.18, 0.25, -0.05]} progress={Math.max(0, p - 0.35)} color="#e8c46a" />
        </>
      );
    case 'tibialTunnel':
      return (
        <>
          <DashedCutPath
            points={[
              [-0.42, -0.55, 0.48],
              [-0.25, -0.28, 0.28],
              [-0.1, -0.02, 0.12],
            ]}
            progress={p}
            color="#d9776f"
          />
          <FocusRing position={[-0.1, -0.02, 0.12]} progress={Math.max(0, p - 0.3)} color="#6aa3d8" />
        </>
      );
    case 'graftPassage':
      return (
        <DashedCutPath
          points={[
            [-0.16, -0.28, 0.16],
            [0.0, 0.04, 0.04],
            [0.18, 0.32, -0.08],
          ]}
          progress={p}
          color="#e8c46a"
        />
      );
    case 'fixation':
      return <FocusRing position={[0.18, 0.28, -0.05]} progress={p} color="#c5ccd4" scale={0.1} />;
    case 'finalConstruct':
      return <FocusRing position={[0.02, 0.1, 0.04]} progress={1} color="#6bbf8a" scale={0.14} />;
    default:
      return null;
  }
}

function FocusRing({ position, progress, color = '#fff', scale = 0.09 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const s = scale * (0.85 + Math.sin(t * 3) * 0.08) * (0.35 + progress);
    ref.current.scale.setScalar(Math.max(0.01, s / scale));
    ref.current.material.opacity = 0.25 + progress * 0.55;
  });
  if (progress <= 0) return null;
  return (
    <mesh ref={ref} position={position}>
      <ringGeometry args={[scale * 0.7, scale, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function DashedCutPath({ points, progress, color = '#d9776f' }) {
  const curvePoints = useMemo(
    () => points.map((p) => new THREE.Vector3(...p)),
    [points]
  );
  const visibleCount = Math.max(2, Math.ceil(curvePoints.length * Math.max(0.05, progress)));
  const shown = curvePoints.slice(0, visibleCount);

  return (
    <group>
      <Line
        points={shown}
        color={color}
        lineWidth={2}
        dashed
        dashSize={0.06}
        gapSize={0.04}
        transparent
        opacity={0.9}
      />
      {progress > 0.05 && (
        <mesh position={shown[shown.length - 1]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </group>
  );
}
