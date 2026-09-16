import { Html, Line } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import './CalloutLabels.css';

/**
 * Medical callout: label text + thin leader line + circular anchor
 * Matches cinematic surgical education style.
 */
export function CalloutLabel({
  anchor = [0, 0, 0],
  labelOffset = [0.35, 0.35, 0.2],
  text,
  side = 'right',
}) {
  const points = useMemo(() => {
    const a = new THREE.Vector3(...anchor);
    const b = new THREE.Vector3(
      anchor[0] + labelOffset[0],
      anchor[1] + labelOffset[1],
      anchor[2] + labelOffset[2]
    );
    return [a, b];
  }, [anchor, labelOffset]);

  if (!text) return null;

  return (
    <group>
      <mesh position={anchor}>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={anchor}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <Line points={points} color="#ffffff" lineWidth={1.5} transparent opacity={0.85} />
      <Html
        position={[
          anchor[0] + labelOffset[0],
          anchor[1] + labelOffset[1],
          anchor[2] + labelOffset[2],
        ]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
        zIndexRange={[30, 0]}
      >
        <div className={`callout-label ${side}`}>{text}</div>
      </Html>
    </group>
  );
}

/** Per-step cinematic callouts for ACL module */
export const STEP_CALLOUTS = {
  positioning: [
    { structureId: 'patella', text: 'Patella', anchor: [0, 0.55, 0.95], offset: [0.55, 0.35, 0.15] },
    { structureId: 'femur', text: 'Femur', anchor: [0.15, 1.1, 0.1], offset: [-0.7, 0.35, 0.1] },
  ],
  portals: [
    { structureId: 'portalAL', text: 'AL portal', anchor: [0.38, 0.35, 0.9], offset: [0.55, 0.25, 0.1] },
    { structureId: 'portalAM', text: 'AM portal', anchor: [-0.28, 0.28, 0.92], offset: [-0.55, 0.3, 0.1] },
  ],
  diagnostic: [
    {
      structureId: 'meniscusMedial',
      text: 'Medial meniscus',
      anchor: [0.55, -0.05, 0.15],
      offset: [0.55, 0.25, 0.2],
    },
  ],
  'acl-assessment': [
    { structureId: 'acl', text: 'ACL', anchor: [-0.05, 0.08, 0.05], offset: [0.65, 0.45, 0.25] },
    { structureId: 'pcl', text: 'PCL', anchor: [0.05, 0.05, -0.1], offset: [-0.55, 0.4, -0.15] },
  ],
  'femoral-tunnel': [
    {
      structureId: 'femur',
      text: 'Femoral footprint',
      anchor: [0.18, 0.25, -0.05],
      offset: [0.7, 0.4, 0.15],
    },
    {
      structureId: 'acl',
      text: 'Guide trajectory',
      anchor: [0.35, 0.35, 0.15],
      offset: [-0.15, 0.55, 0.35],
    },
  ],
  'tibial-tunnel': [
    {
      structureId: 'tibia',
      text: 'Tibial footprint',
      anchor: [-0.12, -0.05, 0.12],
      offset: [-0.65, -0.35, 0.2],
    },
  ],
  'graft-passage': [
    { structureId: 'graft', text: 'Graft', anchor: [0.02, 0.1, 0.05], offset: [0.6, 0.45, 0.2] },
  ],
  fixation: [
    {
      structureId: 'graft',
      text: 'Interference screw',
      anchor: [0.18, 0.3, -0.05],
      offset: [0.55, 0.35, 0.15],
    },
  ],
  'final-construct': [
    {
      structureId: 'graft',
      text: 'Reconstructed ACL',
      anchor: [0.0, 0.1, 0.05],
      offset: [0.65, 0.4, 0.2],
    },
  ],
};

export function StepCallouts({ stepId, languageMode }) {
  const callouts = STEP_CALLOUTS[stepId] || [];
  return (
    <group>
      {callouts.map((c) => (
        <CalloutLabel
          key={c.text}
          anchor={c.anchor}
          labelOffset={c.offset}
          text={c.text}
          side={c.offset[0] >= 0 ? 'right' : 'left'}
        />
      ))}
    </group>
  );
}
