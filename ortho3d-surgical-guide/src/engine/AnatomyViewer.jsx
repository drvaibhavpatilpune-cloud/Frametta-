import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import AnatomyScene from './AnatomyScene';
import { CAMERA_PRESETS, orientationFromCamera } from './cameraPresets';
import { useAppStore } from '../store/useAppStore';
import './viewer.css';

function CameraRig() {
  const controls = useRef();
  const { camera } = useThree();
  const cameraPreset = useAppStore((s) => s.cameraPreset);
  const cameraNonce = useAppStore((s) => s.cameraNonce);
  const resetCameraNonce = useAppStore((s) => s.resetCameraNonce);
  const autoRotate = useAppStore((s) => s.autoRotate);
  const setOrientation = useAppStore((s) => s.setOrientation);
  const customCameras = useAppStore((s) => s.customCameras);
  const targetPos = useRef(new THREE.Vector3(2.6, 1.2, 3.0));
  const targetLook = useRef(new THREE.Vector3(0, 0.1, 0));
  const animating = useRef(false);

  useEffect(() => {
    const custom = customCameras[cameraPreset];
    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.oblique;
    const pos = custom?.position || preset.position;
    const look = custom?.target || preset.target;
    targetPos.current.set(...pos);
    targetLook.current.set(...look);
    animating.current = true;
  }, [cameraPreset, cameraNonce, resetCameraNonce, customCameras]);

  useFrame((_, dt) => {
    if (controls.current) controls.current.autoRotate = autoRotate;

    if (animating.current) {
      camera.position.lerp(targetPos.current, Math.min(1, dt * 3.2));
      if (controls.current) {
        controls.current.target.lerp(targetLook.current, Math.min(1, dt * 3.2));
        controls.current.update();
      }
      if (camera.position.distanceTo(targetPos.current) < 0.02) {
        animating.current = false;
      }
    }

    const ori = orientationFromCamera(camera.position, controls.current?.target);
    setOrientation(ori);
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.85}
      zoomSpeed={0.9}
      panSpeed={0.7}
      minDistance={1.6}
      maxDistance={8}
      target={[0, 0.1, 0]}
      autoRotateSpeed={0.55}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.48} />
      <directionalLight
        castShadow
        position={[4, 6, 3]}
        intensity={1.55}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.00025}
      />
      <directionalLight position={[-3, 2.5, -2]} intensity={0.65} color="#9eb6cc" />
      <directionalLight position={[1, 3, 5]} intensity={0.45} color="#fff1dc" />
      <hemisphereLight args={['#dbe6f2', '#151c26', 0.6]} />
    </>
  );
}

function StepPlayback({ step }) {
  const stepPlaying = useAppStore((s) => s.stepPlaying);
  const stepPaused = useAppStore((s) => s.stepPaused);
  const setStepProgress = useAppStore((s) => s.setStepProgress);
  const stepProgress = useAppStore((s) => s.stepProgress);
  const stepReplayNonce = useAppStore((s) => s.stepReplayNonce);
  const seekNonce = useAppStore((s) => s.seekNonce);
  const pauseStep = useAppStore((s) => s.pauseStep);
  const nextStep = useAppStore((s) => s.nextStep);
  const cinematicMode = useAppStore((s) => s.cinematicMode);
  const elapsed = useRef(0);

  useEffect(() => {
    elapsed.current = 0;
    setStepProgress(0);
  }, [step?.id, stepReplayNonce, setStepProgress]);

  useEffect(() => {
    // Sync elapsed when user scrubs / skips
    const dur = step?.durationSec || 10;
    elapsed.current = stepProgress * dur;
  }, [seekNonce]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    if (!step || !stepPlaying || stepPaused) return;
    const dur = step.durationSec || 10;
    elapsed.current += dt;
    const p = Math.min(1, elapsed.current / dur);
    setStepProgress(p);
    if (p >= 1) {
      pauseStep();
      // Auto-advance in cinematic mode after a brief hold
      if (cinematicMode) {
        window.setTimeout(() => {
          const st = useAppStore.getState();
          if (st.stepProgress >= 0.999 && st.currentStepIndex < st.stepCount - 1) {
            nextStep();
          }
        }, 900);
      }
    }
  });

  return null;
}

export default function AnatomyViewer({ step, viewMode, languageMode }) {
  const stepProgress = useAppStore((s) => s.stepProgress);
  const isMobile =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches;

  return (
    <div className="anatomy-viewer">
      <Canvas
        shadows={!isMobile}
        dpr={isMobile ? [1, 1.5] : [1, 1.75]}
        camera={{ position: [2.6, 1.2, 3.0], fov: isMobile ? 48 : 42, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        onPointerMissed={() => useAppStore.getState().setSelectedStructure(null)}
      >
        <color attach="background" args={['#0b1218']} />
        <fog attach="fog" args={['#0b1218', 9, 16]} />
        <Lights />
        <Suspense fallback={null}>
          <AnatomyScene
            step={step}
            stepProgress={stepProgress}
            viewMode={viewMode}
            languageMode={languageMode}
          />
          <ContactShadows position={[0, -2.05, 0]} opacity={0.4} scale={12} blur={2.8} far={5} />
        </Suspense>
        <CameraRig />
        <StepPlayback step={step} />
      </Canvas>
      <div className="viewer-vignette" />
      <div className="viewer-loading-hint">Drag to rotate · Pinch to zoom</div>
    </div>
  );
}
