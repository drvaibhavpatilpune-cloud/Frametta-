import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  GlbStructure,
  CartilageGroup,
  createRealisticMaterials,
  highlightedMaterial,
  KNEE_MODEL_PACK,
} from './RealisticAnatomy';
import {
  MusclesMesh,
  NeurovascularMesh,
  GraftMesh,
  PortalMarkers,
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
  onSelect,
  showLabel,
  labelText,
  labelOffset = [0, 0.15, 0],
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
      <group scale={selected ? 1.01 : 1}>{children}</group>
      {showLabel && labelText && (
        <Html
          distanceFactor={7}
          position={labelOffset}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[20, 0]}
        >
          <div className="structure-label">{labelText}</div>
        </Html>
      )}
    </group>
  );
}

function useStructureMaterial(id, materials, highlightIds, viewMode, selected, transparency) {
  return useMemo(() => {
    const baseKey = id.startsWith('cartilage') ? 'cartilage' : id;
    const base = materials[baseKey] || materials.femur;
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
      mat.opacity = Math.min(mat.opacity ?? 1, t);
      mat.depthWrite = t > 0.85;
    }
    return mat;
  }, [id, materials, highlightIds, viewMode, selected, transparency]);
}

function BonePart({ id, url, materials, highlightIds, viewMode, selected, transparency, ...rest }) {
  const mat = useStructureMaterial(id, materials, highlightIds, viewMode, selected, transparency);
  return (
    <StructureGroup id={id} {...rest}>
      <GlbStructure url={url} material={mat} />
    </StructureGroup>
  );
}

export default function AnatomyScene({ step, stepProgress, viewMode, languageMode }) {
  const materials = useMemo(() => createRealisticMaterials(), []);
  const visibility = useAppStore((s) => s.visibility);
  const transparency = useAppStore((s) => s.transparency);
  const selected = useAppStore((s) => s.selectedStructure);
  const isolated = useAppStore((s) => s.isolatedStructure);
  const explode = useAppStore((s) => s.explodeView);
  const showLabels = useAppStore((s) => s.showLabels);
  const setSelected = useAppStore((s) => s.setSelectedStructure);

  const highlightIds = useMemo(() => {
    const set = new Set(step?.highlight || []);
    if (selected) set.add(selected);
    return set;
  }, [step?.highlight, selected]);

  const labelFor = (id) => {
    if (viewMode === 'anatomy' && selected !== id) return null;
    const stepLabel = (step?.labels || []).find((l) => l.structureId === id);
    if (stepLabel && viewMode !== 'anatomy') return stepLabel.text;
    if (selected === id) {
      const s = getStructure(id);
      return languageMode === 'patient' ? s?.patientName || s?.name : s?.name;
    }
    if (showLabels && viewMode === 'teaching' && highlightIds.has(id)) {
      const s = getStructure(id);
      return languageMode === 'patient' ? s?.patientName || s?.name : s?.name;
    }
    return null;
  };

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

  const paths = KNEE_MODEL_PACK.structures;
  const layerProps = { explode, isolated, onSelect: setSelected };
  const matCtx = { highlightIds, viewMode, selected, transparency, materials };

  const cartilageMat = useStructureMaterial(
    'cartilage',
    materials,
    highlightIds,
    viewMode,
    selected,
    transparency
  );
  const graftMat = useStructureMaterial(
    'graft',
    materials,
    highlightIds,
    viewMode,
    selected,
    transparency
  );
  const muscleMat = useStructureMaterial(
    'muscles',
    materials,
    highlightIds,
    viewMode,
    selected,
    transparency
  );
  const nvMat = useStructureMaterial(
    'neurovascular',
    materials,
    highlightIds,
    viewMode,
    selected,
    transparency
  );

  return (
    <group position={[0, 0.15, 0]}>
      <Suspense fallback={null}>
        <BonePart
          id="femur"
          url={paths.femur}
          visible={visibility.femur}
          selected={selected === 'femur'}
          showLabel={!!labelFor('femur')}
          labelText={labelFor('femur')}
          labelOffset={[0, 1.2, 0.2]}
          {...layerProps}
          {...matCtx}
        />
        <BonePart
          id="tibia"
          url={paths.tibia}
          visible={visibility.tibia}
          selected={selected === 'tibia'}
          showLabel={!!labelFor('tibia')}
          labelText={labelFor('tibia')}
          labelOffset={[0, -1.2, 0.2]}
          {...layerProps}
          {...matCtx}
        />
        <BonePart
          id="patella"
          url={paths.patella}
          visible={visibility.patella}
          selected={selected === 'patella'}
          showLabel={!!labelFor('patella')}
          labelText={labelFor('patella')}
          labelOffset={[0, 0.3, 0.4]}
          {...layerProps}
          {...matCtx}
        />
        <BonePart
          id="acl"
          url={paths.acl}
          visible={visibility.acl}
          selected={selected === 'acl'}
          showLabel={!!labelFor('acl')}
          labelText={labelFor('acl')}
          {...layerProps}
          {...matCtx}
        />
        <BonePart
          id="pcl"
          url={paths.pcl}
          visible={visibility.pcl}
          selected={selected === 'pcl'}
          showLabel={!!labelFor('pcl')}
          labelText={labelFor('pcl')}
          {...layerProps}
          {...matCtx}
        />
        <BonePart
          id="mcl"
          url={paths.mcl}
          visible={visibility.mcl}
          selected={selected === 'mcl'}
          showLabel={!!labelFor('mcl')}
          labelText={labelFor('mcl')}
          {...layerProps}
          {...matCtx}
        />
        <BonePart
          id="lcl"
          url={paths.lcl}
          visible={visibility.lcl}
          selected={selected === 'lcl'}
          showLabel={!!labelFor('lcl')}
          labelText={labelFor('lcl')}
          {...layerProps}
          {...matCtx}
        />
        <BonePart
          id="meniscusMedial"
          url={paths.meniscusMedial}
          visible={visibility.meniscusMedial}
          selected={selected === 'meniscusMedial'}
          showLabel={!!labelFor('meniscusMedial')}
          labelText={labelFor('meniscusMedial')}
          {...layerProps}
          {...matCtx}
        />
        <BonePart
          id="meniscusLateral"
          url={paths.meniscusLateral}
          visible={visibility.meniscusLateral}
          selected={selected === 'meniscusLateral'}
          showLabel={!!labelFor('meniscusLateral')}
          labelText={labelFor('meniscusLateral')}
          {...layerProps}
          {...matCtx}
        />

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
          <CartilageGroup material={cartilageMat} />
        </StructureGroup>
      </Suspense>

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
        <MusclesMesh material={muscleMat} />
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
        <NeurovascularMesh material={nvMat} />
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
        <GraftMesh material={graftMat} progress={graftProgress || 1} />
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
