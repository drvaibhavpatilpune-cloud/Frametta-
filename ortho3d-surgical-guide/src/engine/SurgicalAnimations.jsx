import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { phase, clamp01, lerp, lerpVec3, easeOutCubic } from './animMath';

const UP = new THREE.Vector3(0, 1, 0);
const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _quat = new THREE.Quaternion();

function orientAlong(from, to) {
  _dir.set(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = _dir.length();
  if (len < 1e-5) return { mid: from, quat: [0, 0, 0, 1], len: 0.001, dir: [0, 1, 0] };
  _dir.multiplyScalar(1 / len);
  _mid.set(from[0], from[1], from[2]).addScaledVector(_dir, len / 2);
  _quat.setFromUnitVectors(UP, _dir);
  return {
    mid: [_mid.x, _mid.y, _mid.z],
    quat: [_quat.x, _quat.y, _quat.z, _quat.w],
    len,
    dir: [_dir.x, _dir.y, _dir.z],
  };
}

function MetalMat({ color, emissive, emissiveIntensity = 0, roughness = 1 }) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={opacity < 1 ? 0.25 : 0.88}
      roughness={opacity < 1 ? 0.38 : 0.18}
      emissive={emissive || '#000000'}
      emissiveIntensity={emissiveIntensity}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity >= 0.95}
    />
  );
}

/** Cylinder grown from `from` toward `to` by progress, always axis-aligned. */
function AlignedCylinder({
  from,
  to,
  radius,
  progress = 1,
  color = '#9aa8b6',
  opacity = 1,
  emissive,
  emissiveIntensity = 0.4,
  radial = 16,
}) {
  const t = clamp01(progress);
  if (t < 0.008) return null;
  const end = lerpVec3(from, to, t);
  const { mid, quat, len } = orientAlong(from, end);
  if (len < 0.004) return null;
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[radius, radius, len, radial]} />
      <MetalMat
        color={color}
        opacity={opacity}
        emissive={emissive}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
      />
    </mesh>
  );
}

/** Place a child group at a point along an axis, oriented to the axis. */
function AlongAxis({ from, to, t = 0, children, offset = 0 }) {
  const tip = lerpVec3(from, to, clamp01(t));
  const { quat, dir } = orientAlong(from, to);
  const pos = [tip[0] + dir[0] * offset, tip[1] + dir[1] * offset, tip[2] + dir[2] * offset];
  return (
    <group position={pos} quaternion={quat}>
      {children}
    </group>
  );
}

function ScopeLight({ tip, intensity = 1 }) {
  if (intensity < 0.05) return null;
  return (
    <spotLight
      position={tip}
      angle={0.42}
      penumbra={0.55}
      intensity={2.8 * intensity}
      distance={2.8}
      color="#cfe9ff"
      castShadow={false}
    />
  );
}

function DrillSparks({ position, active, rate = 1, color = '#e8c46a' }) {
  const ref = useRef();
  const count = 36;
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = position[0];
      a[i * 3 + 1] = position[1];
      a[i * 3 + 2] = position[2];
    }
    return a;
  }, [position[0], position[1], position[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  const velocities = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        v: new THREE.Vector3(
          (Math.random() - 0.5) * 0.7,
          Math.random() * 0.55,
          (Math.random() - 0.5) * 0.7
        ),
        life: Math.random(),
      })),
    []
  );

  useFrame((_, dt) => {
    if (!ref.current || !active) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const p = velocities[i];
      p.life -= dt * rate;
      if (p.life <= 0) {
        p.life = 1;
        arr[i * 3] = position[0];
        arr[i * 3 + 1] = position[1];
        arr[i * 3 + 2] = position[2];
        p.v.set(
          (Math.random() - 0.5) * 0.95,
          0.25 + Math.random() * 0.7,
          (Math.random() - 0.5) * 0.95
        );
      } else {
        arr[i * 3] += p.v.x * dt;
        arr[i * 3 + 1] += p.v.y * dt;
        arr[i * 3 + 2] += p.v.z * dt;
        p.v.y -= 1.4 * dt;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.032} transparent opacity={0.9} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function BoneDustCloud({ position, active, progress }) {
  const ref = useRef();
  useFrame((s) => {
    if (!ref.current || !active) return;
    const pulse = 0.85 + Math.sin(s.clock.elapsedTime * 9) * 0.15;
    const scale = (0.12 + progress * 0.18) * pulse;
    ref.current.scale.setScalar(scale);
    ref.current.material.opacity = 0.12 + progress * 0.22;
    ref.current.rotation.y += 0.01;
  });
  if (!active) return null;
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color="#c9b896" transparent opacity={0.2} depthWrite={false} />
    </mesh>
  );
}

function PulseHighlight({ position, color = '#e8c46a', progress }) {
  const ref = useRef();
  useFrame((s) => {
    if (!ref.current) return;
    const pulse = 0.75 + Math.sin(s.clock.elapsedTime * 3.6) * 0.25;
    ref.current.scale.setScalar(0.06 + progress * 0.09 * pulse);
    ref.current.material.opacity = 0.18 + progress * 0.5;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 20, 20]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
}

function CutGuideLine({ points, progress, color = '#d9776f' }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    [points]
  );
  const geo = useMemo(() => {
    const segs = Math.max(2, Math.floor(progress * 48));
    return new THREE.TubeGeometry(curve, segs, 0.01, 8, false);
  }, [curve, progress]);
  if (progress < 0.02) return null;
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={color} transparent opacity={0.92} />
    </mesh>
  );
}

/* ---------- Step choreography ---------- */

function AnimatedPositioning({ progress }) {
  const flex = phase(progress, 0.1, 0.75);
  const settle = phase(progress, 0.7, 1);
  const angle = lerp(0, -0.55, flex) + lerp(0, 0.12, settle);
  return (
    <group>
      <group position={[0, -0.35, 0.15]} rotation={[angle, 0.08, 0]}>
        <mesh position={[0, -0.55, 0]}>
          <boxGeometry args={[0.35, 1.1, 0.28]} />
          <meshStandardMaterial color="#2a3544" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>
      <PulseHighlight position={[0, 0.35, 0.75]} progress={phase(progress, 0.15, 0.85)} color="#ffffff" />
      <PulseHighlight position={[0.55, -0.2, 0.4]} progress={phase(progress, 0.4, 1)} color="#6aa3d8" />
    </group>
  );
}

function AnimatedScope({ progress, parked = false }) {
  const approach = parked ? 1 : phase(progress, 0, 0.38);
  const insert = parked ? 1 : phase(progress, 0.28, 0.88);
  const start = [0.72, 0.62, 1.85];
  const end = [0.34, 0.3, 1.02];
  const pos = lerpVec3(start, end, approach);
  const tipExtend = lerp(0, 0.42, insert);
  const tipWorld = [pos[0] - 0.02, pos[1] - 0.48 - tipExtend * 0.2, pos[2] - 0.08];

  return (
    <group position={pos} rotation={[-0.72, 0.32, 0.08]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.026, 0.03, 1.2, 18]} />
        <MetalMat color="#a8b4c0" />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.12, 0.18, 0.12]} />
        <meshStandardMaterial color="#151c26" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
        <meshStandardMaterial color="#0e141c" />
      </mesh>
      <mesh position={[0, -0.55 - tipExtend * 0.12, 0]}>
        <sphereGeometry args={[0.032, 14, 14]} />
        <meshStandardMaterial
          color="#7ad4ff"
          emissive="#1a7aaa"
          emissiveIntensity={0.9 + insert * 0.6}
        />
      </mesh>
      <mesh position={[0.09, 0.2, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.012, 0.012, 0.35, 8]} />
        <MetalMat color="#6a7788" />
      </mesh>
      <ScopeLight tip={tipWorld} intensity={insert} />
      <pointLight position={[0, -0.55, 0]} intensity={insert * 1.4} color="#9fd8ff" distance={1.6} />
    </group>
  );
}

function AnimatedTrocar({ progress, side = 'al' }) {
  const cut = phase(progress, 0.05, 0.45);
  const seat = phase(progress, 0.4, 0.85);
  const isAL = side === 'al';
  const entry = isAL ? [0.38, 0.32, 0.92] : [-0.28, 0.26, 0.94];
  const approach = isAL ? [0.7, 0.55, 1.55] : [-0.55, 0.5, 1.55];
  const pos = lerpVec3(approach, entry, cut);
  const depth = lerp(0, 0.28, seat);

  return (
    <group position={[pos[0], pos[1] - depth * 0.5, pos[2] - depth * 0.35]} rotation={[-0.85, isAL ? 0.2 : -0.2, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.038, 0.042, 0.55, 14]} />
        <MetalMat color="#8b98a8" />
      </mesh>
      <mesh position={[0, -0.32, 0]}>
        <coneGeometry args={[0.04, 0.12, 10]} />
        <MetalMat color="#c5d0da" />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.08, 12]} />
        <meshStandardMaterial color="#1a222c" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}

function AnimatedProbe({ progress }) {
  const sweep = phase(progress, 0.1, 0.95);
  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.25, 0.12, 0.35),
        new THREE.Vector3(0.15, 0.05, 0.12),
        new THREE.Vector3(-0.05, 0.02, 0.05),
        new THREE.Vector3(-0.2, 0.06, 0.08),
        new THREE.Vector3(-0.12, 0.1, 0.2),
        new THREE.Vector3(0.1, 0.08, 0.28),
      ]),
    []
  );
  const tip = path.getPoint(sweep);
  const tangent = path.getTangent(sweep).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(UP, tangent);

  return (
    <group position={tip} quaternion={quat}>
      <mesh castShadow>
        <cylinderGeometry args={[0.012, 0.014, 0.75, 10]} />
        <MetalMat color="#b0bac6" />
      </mesh>
      <mesh position={[0, -0.4, 0]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.008, 0.12, 8]} />
        <MetalMat color="#d0d8e0" />
      </mesh>
    </group>
  );
}

function AnimatedGuideAndReamer({ progress, guideFrom, axisFrom, axisTo }) {
  const aim = phase(progress, 0, 0.22);
  const pin = phase(progress, 0.18, 0.42);
  const reamIn = phase(progress, 0.4, 0.88);
  const reamOut = phase(progress, 0.88, 1);
  const ream = reamIn * (1 - reamOut * 0.35);
  const spinRef = useRef();

  useFrame((_, dt) => {
    if (spinRef.current && reamIn > 0.02) {
      spinRef.current.rotation.y += dt * (14 + reamIn * 22);
    }
  });

  const tipT = Math.max(pin, reamIn * 0.92);
  const tip = lerpVec3(axisFrom, axisTo, tipT);
  const guidePos = lerpVec3(
    [guideFrom[0] + 0.4, guideFrom[1] + 0.3, guideFrom[2] + 0.45],
    guideFrom,
    aim
  );

  return (
    <group>
      {/* Aiming guide sleeve — oriented to tunnel axis */}
      <AlongAxis from={axisFrom} to={axisTo} t={0} offset={-0.05}>
        <group
          position={[
            (guidePos[0] - axisFrom[0]) * (1 - aim),
            (guidePos[1] - axisFrom[1]) * (1 - aim),
            (guidePos[2] - axisFrom[2]) * (1 - aim),
          ]}
        >
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.07, 0.7, 16]} />
            <MetalMat color="#7a8898" />
          </mesh>
          <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.095, 0.016, 10, 28]} />
            <MetalMat color="#d8e0e8" />
          </mesh>
          <mesh position={[0.12, 0.45, 0]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.08, 0.22, 0.04]} />
            <meshStandardMaterial color="#1c2430" metalness={0.35} roughness={0.45} />
          </mesh>
        </group>
      </AlongAxis>

      {/* Beath / guide pin advancing through bone */}
      <AlignedCylinder from={axisFrom} to={axisTo} radius={0.011} progress={pin} color="#eef2f6" />

      {/* Cannulated reamer — spins and advances along exact axis */}
      {reamIn > 0.015 && (
        <AlongAxis from={axisFrom} to={axisTo} t={ream * 0.88} offset={0.12}>
          <group ref={spinRef}>
            <mesh castShadow>
              <cylinderGeometry args={[0.042, 0.042, 0.62, 16]} />
              <MetalMat color="#8e9aa8" />
            </mesh>
            <mesh position={[0, -0.36, 0]}>
              <coneGeometry args={[0.068, 0.16, 14]} />
              <MetalMat color="#c8d2dc" emissive="#664418" emissiveIntensity={0.25 + reamIn * 0.35} />
            </mesh>
            <mesh position={[0, 0.28, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.1, 12]} />
              <meshStandardMaterial color="#121820" metalness={0.4} roughness={0.4} />
            </mesh>
            {/* flutes */}
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]} position={[0.038, -0.1, 0]}>
                <boxGeometry args={[0.012, 0.35, 0.02]} />
                <MetalMat color="#aab4c0" />
              </mesh>
            ))}
          </group>
        </AlongAxis>
      )}

      {/* Tunnel lumen appearing */}
      <AlignedCylinder
        from={axisFrom}
        to={axisTo}
        radius={0.052}
        progress={Math.max(0, reamIn)}
        color="#2d8f8f"
        opacity={0.32}
        emissive="#1a5555"
        emissiveIntensity={0.55}
      />

      <DrillSparks position={tip} active={reamIn > 0.06 && reamIn < 0.97} rate={1.6} />
      <BoneDustCloud position={tip} active={reamIn > 0.08 && reamIn < 0.95} progress={reamIn} />
      <pointLight position={tip} intensity={reamIn * 1.8} color="#ffc978" distance={1.2} />
    </group>
  );
}

function AnimatedGraftPassage({ progress }) {
  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.22, -0.58, 0.24),
        new THREE.Vector3(-0.14, -0.28, 0.16),
        new THREE.Vector3(-0.02, -0.02, 0.08),
        new THREE.Vector3(0.08, 0.14, 0.02),
        new THREE.Vector3(0.16, 0.28, -0.06),
        new THREE.Vector3(0.22, 0.44, -0.14),
      ]),
    []
  );

  const leadIn = phase(progress, 0, 0.12);
  const pull = phase(progress, 0.08, 0.88);
  const seat = phase(progress, 0.85, 1);
  const geo = useMemo(() => {
    const pts = Math.max(6, Math.floor(10 + pull * 48));
    const radius = lerp(0.038, 0.046, seat);
    return new THREE.TubeGeometry(path, pts, radius, 14, false);
  }, [path, pull, seat]);

  const tip = path.getPoint(Math.max(0.02, pull));
  const sutureFrom = [-0.28, -0.78, 0.3];

  return (
    <group>
      {pull > 0.02 && (
        <mesh geometry={geo} castShadow>
          <meshStandardMaterial
            color="#e2b86a"
            roughness={0.52}
            metalness={0.06}
            emissive="#6a5010"
            emissiveIntensity={0.2 + seat * 0.15}
          />
        </mesh>
      )}
      <mesh position={tip} scale={1 + leadIn * 0.1}>
        <sphereGeometry args={[0.048, 16, 16]} />
        <meshStandardMaterial color="#f0d090" emissive="#8a7020" emissiveIntensity={0.4} />
      </mesh>
      {/* Passing suture / shuttle */}
      <AlignedCylinder
        from={sutureFrom}
        to={tip.toArray()}
        radius={0.007}
        progress={1}
        color="#d4dce4"
      />
      <AlongAxis from={sutureFrom} to={tip.toArray()} t={0} offset={-0.15}>
        <mesh>
          <boxGeometry args={[0.06, 0.14, 0.04]} />
          <meshStandardMaterial color="#1a2430" metalness={0.3} roughness={0.5} />
        </mesh>
      </AlongAxis>
      <PulseHighlight position={tip.toArray()} progress={phase(progress, 0.3, 1)} color="#e8c46a" />
    </group>
  );
}

function AnimatedScrew({ progress, entry, exit }) {
  const approach = phase(progress, 0, 0.22);
  const drive = phase(progress, 0.18, 0.95);
  const spinRef = useRef();
  useFrame((_, dt) => {
    if (spinRef.current && drive > 0.04) spinRef.current.rotation.y += dt * (10 + drive * 14);
  });

  // -0.4 = hovering before entry; 0.65 = driven into bone
  const along = lerp(-0.4, 0.65, easeOutCubic(Math.max(approach, drive)));
  const t = clamp01(along);
  const backOffset = along < 0 ? along * orientAlong(entry, exit).len : 0;
  const lightPos = lerpVec3(entry, exit, clamp01(drive * 0.55));
  const tip = lerpVec3(entry, exit, t);

  return (
    <group>
      <AlongAxis from={entry} to={exit} t={t} offset={backOffset}>
        <group ref={spinRef}>
          <mesh castShadow>
            <cylinderGeometry args={[0.052, 0.045, 0.34, 18]} />
            <MetalMat color="#cfd6de" emissive="#333333" emissiveIntensity={0.08} />
          </mesh>
          {[0, 0.07, 0.14].map((y, i) => (
            <mesh key={i} position={[0, y - 0.05, 0]}>
              <torusGeometry args={[0.054, 0.005, 8, 22]} />
              <meshStandardMaterial color="#a8b2bc" metalness={0.9} roughness={0.18} />
            </mesh>
          ))}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.08, 8]} />
            <MetalMat color="#9aa4b0" />
          </mesh>
        </group>
      </AlongAxis>
      {drive < 0.98 && approach > 0.08 && (
        <AlongAxis from={entry} to={exit} t={t} offset={backOffset + 0.32}>
          <mesh>
            <cylinderGeometry args={[0.018, 0.018, 0.55, 10]} />
            <MetalMat color="#7d8896" />
          </mesh>
        </AlongAxis>
      )}
      <pointLight position={lightPos} intensity={drive * 0.9} color="#dde4ec" distance={1.1} />
      <PulseHighlight position={tip} progress={phase(progress, 0.5, 1)} color="#c5ccd4" />
    </group>
  );
}

/**
 * Full cinematic instrument + action choreography for each ACL step.
 */
export default function SurgicalAnimations({ animation, progress, visible }) {
  if (!visible || !animation) return null;
  const p = clamp01(progress);

  switch (animation) {
    case 'positioning':
      return <AnimatedPositioning progress={p} />;

    case 'portals':
      return (
        <group>
          <AnimatedTrocar progress={phase(p, 0, 0.55)} side="al" />
          <AnimatedTrocar progress={phase(p, 0.35, 0.95)} side="am" />
          <AnimatedScope progress={phase(p, 0.55, 1)} />
          <PulseHighlight position={[0.38, 0.32, 0.88]} progress={phase(p, 0.1, 0.5)} color="#3ea8a8" />
          <PulseHighlight position={[-0.28, 0.26, 0.9]} progress={phase(p, 0.4, 0.85)} color="#6aa3d8" />
        </group>
      );

    case 'diagnostic':
      return (
        <group>
          <AnimatedScope progress={1} parked />
          <AnimatedProbe progress={p} />
          <PulseHighlight position={[-0.22, 0.02, 0.08]} progress={phase(p, 0.15, 0.5)} />
          <PulseHighlight position={[0.22, 0.02, 0.06]} progress={phase(p, 0.45, 0.9)} color="#6aa3d8" />
          <PulseHighlight position={[0.05, -0.05, 0.12]} progress={phase(p, 0.65, 1)} color="#c9a06a" />
        </group>
      );

    case 'aclAssess':
      return (
        <group>
          <AnimatedScope progress={1} parked />
          <PulseHighlight position={[0.0, 0.08, 0.04]} progress={phase(p, 0.05, 1)} color="#e8c46a" />
          <CutGuideLine
            points={[
              [0.18, 0.26, -0.06],
              [0.06, 0.12, 0.02],
              [-0.08, 0.02, 0.1],
              [-0.14, -0.05, 0.14],
            ]}
            progress={phase(p, 0.2, 0.9)}
            color="#e8c46a"
          />
          <AnimatedProbe progress={phase(p, 0.15, 0.85)} />
        </group>
      );

    case 'femoralTunnel':
      return (
        <AnimatedGuideAndReamer
          progress={p}
          guideFrom={[0.55, 0.42, 0.38]}
          axisFrom={[0.58, 0.44, 0.35]}
          axisTo={[0.12, 0.18, -0.1]}
        />
      );

    case 'tibialTunnel':
      return (
        <AnimatedGuideAndReamer
          progress={p}
          guideFrom={[-0.58, -0.48, 0.7]}
          axisFrom={[-0.52, -0.58, 0.58]}
          axisTo={[-0.06, 0.04, 0.08]}
        />
      );

    case 'graftPassage':
      return <AnimatedGraftPassage progress={p} />;

    case 'fixation':
      return (
        <group>
          <AnimatedGraftPassage progress={1} />
          <AnimatedScrew
            progress={phase(p, 0, 0.55)}
            entry={[0.28, 0.42, -0.02]}
            exit={[0.1, 0.1, -0.02]}
          />
          <AnimatedScrew
            progress={phase(p, 0.4, 1)}
            entry={[-0.22, -0.48, 0.32]}
            exit={[-0.06, -0.1, 0.1]}
          />
        </group>
      );

    case 'finalConstruct':
      return (
        <group>
          <AnimatedGraftPassage progress={1} />
          <PulseHighlight position={[0.02, 0.1, 0.04]} progress={1} color="#6bbf8a" />
          <PulseHighlight position={[0.18, 0.24, -0.05]} progress={phase(p, 0.2, 0.8)} color="#c5ccd4" />
          <PulseHighlight position={[-0.12, -0.2, 0.12]} progress={phase(p, 0.4, 1)} color="#c5ccd4" />
        </group>
      );

    default:
      return null;
  }
}
