import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  FemurMesh,
  TibiaMesh,
  PatellaMesh,
  ACLMesh,
  PCLMesh,
  MCLMesh,
  LCLMesh,
  MeniscusMesh,
  CartilageCaps,
  MusclesMesh,
  NeurovascularMesh,
  GraftMesh,
  PortalMarkers,
  createMaterials,
  highlightedMaterial,
} from './KneeAnatomy';
import { StepInstruments } from './Instruments';
import { EXPLODE_OFFSETS } from './cameraPresets';
import { useAppStore } from '../store/useAppStore';
import { getStructure } from '../data/anatomy';

function StructureGroup({
  id,
  children,
  explode,
  selected,
  isolated,
  visible,
  opacity,
  onSelect,
  showLabel,
  labelText,
}) {
  const ref = useRef();
  const target = useMemo(() => {
    const o = EXPLODE_OFFSETS[id] || [0, 0, 0];
    return new THREE.Vector3(...(explode ? o : [0, 0, 0]));
  }, [id, explode]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.lerp(target, Math.min(1, dt * 4));
  });

  if (!visible) return null;
  if (isolated && isolated !== id && id !== 'graft') return null;

  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <group scale={selected ? 1.02 : 1}>{children}</group>
      {showLabel && labelText && (
        <Html distanceFactor={6} position={[0, 0.2, 0]} style={{ pointerEvents: 'none' }}>
          <div className="structure-label">{labelText}</div>
        </Html>
      )}
    </group>
  );
}

export default function AnatomyScene({
  step,
  stepProgress,
  viewMode,
  languageMode,
}) {
  const materials = useMemo(() => createMaterials(), []);
  const visibility = useAppStore((s) => s.visibility);
  const transparency = useAppStore((s) => s.transparency);
  const selected = useAppStore((s) => s.selectedStructure);
  const isolated = useAppStore((s) => s.isolatedStructure);
  const explode = useAppStore((s) => s.explodeView);
  const showLabels = useAppStore((s) => s.showLabels);
  const setSelected = useAppStore((s) => s.setSelectedStructure);

  const highlightIds = new Set(step?.highlight || []);
  if (selected) highlightIds.add(selected);

  const applyMat = (id, base) => {
    let mat = base;
    if (
      highlightIds.has(id) &&
      (viewMode === 'teaching' || viewMode === 'surgical' || selected === id)
    ) {
      mat = highlightedMaterial(base);
    }
    const t = transparency[id];
    if (t != null && t < 1) {
      mat = mat.clone();
      mat.transparent = true;
      mat.opacity = t;
      mat.depthWrite = t > 0.85;
    }
    return mat;
  };

  const labelFor = (id) => {
    if (!showLabels || viewMode === 'anatomy') {
      // anatomy mode: only show when selected
      if (!(selected === id || (step?.labels || []).some((l) => l.structureId === id))) return null;
    }
    if (viewMode === 'anatomy' && selected !== id) return null;
    const stepLabel = (step?.labels || []).find((l) => l.structureId === id);
    if (stepLabel && viewMode !== 'anatomy') return stepLabel.text;
    if (selected === id) {
      const s = getStructure(id);
      return languageMode === 'patient' ? s?.patientName || s?.name : s?.name;
    }
    return null;
  };

  // Apply step visibility overrides (reset defaults first so prior steps don't leak)
  useEffect(() => {
    if (!step) return;
    const defaults = {
      femur: true,
      tibia: true,
      patella: true,
      acl: true,
      pcl: true,
      mcl: true,
      lcl: true,
      meniscusMedial: true,
      meniscusLateral: true,
      cartilage: true,
      muscles: false,
      neurovascular: false,
      graft: false,
      instruments: true,
      portals: false,
    };
    useAppStore.getState().setVisibilityBatch({ ...defaults, ...(step.visibility || {}) });
  }, [step?.id]);

  const instrumentsOn =
    visibility.instruments !== false && viewMode !== 'anatomy' && step?.animation;

  const graftProgress =
    step?.animation === 'graftPassage'
      ? stepProgress
      : step?.animation === 'fixation' || step?.animation === 'finalConstruct'
        ? 1
        : visibility.graft
          ? 1
          : 0;

  return (
    <group>
      <StructureGroup
        id="femur"
        explode={explode}
        selected={selected === 'femur'}
        isolated={isolated}
        visible={visibility.femur}
        onSelect={setSelected}
        showLabel={!!labelFor('femur')}
        labelText={labelFor('femur')}
      >
        <FemurMesh material={applyMat('femur', materials.femur)} />
      </StructureGroup>

      <StructureGroup
        id="tibia"
        explode={explode}
        selected={selected === 'tibia'}
        isolated={isolated}
        visible={visibility.tibia}
        onSelect={setSelected}
        showLabel={!!labelFor('tibia')}
        labelText={labelFor('tibia')}
      >
        <TibiaMesh material={applyMat('tibia', materials.tibia)} />
      </StructureGroup>

      <StructureGroup
        id="patella"
        explode={explode}
        selected={selected === 'patella'}
        isolated={isolated}
        visible={visibility.patella}
        onSelect={setSelected}
        showLabel={!!labelFor('patella')}
        labelText={labelFor('patella')}
      >
        <PatellaMesh material={applyMat('patella', materials.patella)} />
      </StructureGroup>

      <StructureGroup
        id="acl"
        explode={explode}
        selected={selected === 'acl'}
        isolated={isolated}
        visible={visibility.acl}
        onSelect={setSelected}
        showLabel={!!labelFor('acl')}
        labelText={labelFor('acl')}
      >
        <ACLMesh material={applyMat('acl', materials.acl)} />
      </StructureGroup>

      <StructureGroup
        id="pcl"
        explode={explode}
        selected={selected === 'pcl'}
        isolated={isolated}
        visible={visibility.pcl}
        onSelect={setSelected}
        showLabel={!!labelFor('pcl')}
        labelText={labelFor('pcl')}
      >
        <PCLMesh material={applyMat('pcl', materials.pcl)} />
      </StructureGroup>

      <StructureGroup
        id="mcl"
        explode={explode}
        selected={selected === 'mcl'}
        isolated={isolated}
        visible={visibility.mcl}
        onSelect={setSelected}
        showLabel={!!labelFor('mcl')}
        labelText={labelFor('mcl')}
      >
        <MCLMesh material={applyMat('mcl', materials.mcl)} />
      </StructureGroup>

      <StructureGroup
        id="lcl"
        explode={explode}
        selected={selected === 'lcl'}
        isolated={isolated}
        visible={visibility.lcl}
        onSelect={setSelected}
        showLabel={!!labelFor('lcl')}
        labelText={labelFor('lcl')}
      >
        <LCLMesh material={applyMat('lcl', materials.lcl)} />
      </StructureGroup>

      <StructureGroup
        id="meniscusMedial"
        explode={explode}
        selected={selected === 'meniscusMedial'}
        isolated={isolated}
        visible={visibility.meniscusMedial}
        onSelect={setSelected}
        showLabel={!!labelFor('meniscusMedial')}
        labelText={labelFor('meniscusMedial')}
      >
        <MeniscusMesh side="medial" material={applyMat('meniscusMedial', materials.meniscusMedial)} />
      </StructureGroup>

      <StructureGroup
        id="meniscusLateral"
        explode={explode}
        selected={selected === 'meniscusLateral'}
        isolated={isolated}
        visible={visibility.meniscusLateral}
        onSelect={setSelected}
        showLabel={!!labelFor('meniscusLateral')}
        labelText={labelFor('meniscusLateral')}
      >
        <MeniscusMesh side="lateral" material={applyMat('meniscusLateral', materials.meniscusLateral)} />
      </StructureGroup>

      <StructureGroup
        id="cartilage"
        explode={explode}
        selected={selected === 'cartilage'}
        isolated={isolated}
        visible={visibility.cartilage}
        onSelect={setSelected}
        showLabel={!!labelFor('cartilage')}
        labelText={labelFor('cartilage')}
      >
        <CartilageCaps material={applyMat('cartilage', materials.cartilage)} />
      </StructureGroup>

      <StructureGroup
        id="muscles"
        explode={explode}
        selected={selected === 'muscles'}
        isolated={isolated}
        visible={visibility.muscles}
        onSelect={setSelected}
        showLabel={!!labelFor('muscles')}
        labelText={labelFor('muscles')}
      >
        <MusclesMesh material={applyMat('muscles', materials.muscles)} />
      </StructureGroup>

      <StructureGroup
        id="neurovascular"
        explode={explode}
        selected={selected === 'neurovascular'}
        isolated={isolated}
        visible={visibility.neurovascular}
        onSelect={setSelected}
        showLabel={!!labelFor('neurovascular')}
        labelText={labelFor('neurovascular')}
      >
        <NeurovascularMesh material={applyMat('neurovascular', materials.neurovascular)} />
      </StructureGroup>

      <StructureGroup
        id="graft"
        explode={explode}
        selected={selected === 'graft'}
        isolated={isolated}
        visible={visibility.graft || graftProgress > 0}
        onSelect={setSelected}
        showLabel={!!labelFor('graft')}
        labelText={labelFor('graft')}
      >
        <GraftMesh material={applyMat('graft', materials.graft)} progress={graftProgress || 1} />
      </StructureGroup>

      <PortalMarkers visible={visibility.portals && viewMode !== 'anatomy'} />

      <StepInstruments
        animation={step?.animation}
        progress={stepProgress}
        visible={instrumentsOn}
      />
    </group>
  );
}
