import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import AnatomyScene from './AnatomyScene';
import { CAMERA_PRESETS, orientationFromCamera } from './cameraPresets';
import { CINEMATIC_CAMERA, sampleCameraPath } from './animMath';
import { useAppStore } from '../store/useAppStore';
import './viewer.css';

function CameraRig({ step }) {
  const controls = useRef();
  const { camera } = useThree();
  const cameraPreset = useAppStore((s) => s.cameraPreset);
  const cameraNonce = useAppStore((s) => s.cameraNonce);
  const resetCameraNonce = useAppStore((s) => s.resetCameraNonce);
  const autoRotate = useAppStore((s) => s.autoRotate);
  const setOrientation = useAppStore((s) => s.setOrientation);
  const customCameras = useAppStore((s) => s.customCameras);
  const cinematicMode = useAppStore((s) => s.cinematicMode);
  const stepProgress = useAppStore((s) => s.stepProgress);
  const stepPlaying = useAppStore((s) => s.stepPlaying);
  const stepPaused = useAppStore((s) => s.stepPaused);
  const targetPos = useRef(new THREE.Vector3(2.6, 1.2, 3.0));
  const targetLook = useRef(new THREE.Vector3(0, 0.1, 0));
  const animating = useRef(false);
  const userOverride = useRef(false);

  useEffect(() => {
    userOverride.current = false;
    const custom = customCameras[cameraPreset];
    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.oblique;
    const pos = custom?.position || preset.position;
    const look = custom?.target || preset.target;
    targetPos.current.set(...pos);
    targetLook.current.set(...look);
    animating.current = true;
  }, [cameraPreset, cameraNonce, resetCameraNonce, customCameras, step?.id]);

  useFrame((_, dt) => {
    if (controls.current) {
      controls.current.autoRotate = autoRotate && !cinematicMode;
      // If user starts dragging during cinematic, pause camera path briefly
      if (controls.current.enabled && cinematicMode) {
        // keep enabled so they can still explore
      }
    }

    const path = cinematicMode && step?.animation ? CINEMATIC_CAMERA[step.animation] : null;
    const playingCinematic = cinematicMode && path && (stepPlaying || stepPaused);

    if (playingCinematic && !userOverride.current) {
      const sample = sampleCameraPath(path, stepProgress);
      if (sample) {
        targetPos.current.set(...sample.position);
        targetLook.current.set(...sample.target);
        camera.position.lerp(targetPos.current, Math.min(1, dt * 2.4));
        if (controls.current) {
          controls.current.target.lerp(targetLook.current, Math.min(1, dt * 2.4));
          controls.current.update();
        }
      }
    } else if (animating.current) {
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
      minDistance={1.2}
      maxDistance={8}
      target={[0, 0.1, 0]}
      autoRotateSpeed={0.45}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
      onStart={() => {
        userOverride.current = true;
      }}
    />
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.42} />
      <directionalLight
        castShadow
        position={[4, 6, 3]}
        intensity={1.65}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.00025}
      />
      <directionalLight position={[-3, 2.5, -2]} intensity={0.7} color="#9eb6cc" />
      <directionalLight position={[1, 3, 5]} intensity={0.5} color="#fff1dc" />
      <hemisphereLight args={['#dbe6f2', '#151c26', 0.55]} />
      {/* Soft key fill for cinematic medical look */}
      <pointLight position={[0.5, 1.5, 2]} intensity={0.35} color="#ffe6c8" distance={8} />
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
  const advanceTimer = useRef(null);

  useEffect(() => {
    elapsed.current = 0;
    setStepProgress(0);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, [step?.id, stepReplayNonce, setStepProgress]);

  useEffect(() => {
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
      if (cinematicMode) {
        if (advanceTimer.current) clearTimeout(advanceTimer.current);
        advanceTimer.current = setTimeout(() => {
          const st = useAppStore.getState();
          if (st.stepProgress >= 0.999 && st.currentStepIndex < st.stepCount - 1) {
            nextStep();
          }
        }, 1100);
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
        dpr={isMobile ? [1, 1.5] : [1, 1.85]}
        camera={{ position: [2.6, 1.2, 3.0], fov: isMobile ? 46 : 40, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        onPointerMissed={() => useAppStore.getState().setSelectedStructure(null)}
      >
        <color attach="background" args={['#080d12']} />
        <fog attach="fog" args={['#080d12', 7, 14]} />
        <Lights />
        <Suspense fallback={null}>
          <AnatomyScene
            step={step}
            stepProgress={stepProgress}
            viewMode={viewMode}
            languageMode={languageMode}
          />
          <ContactShadows position={[0, -2.05, 0]} opacity={0.45} scale={12} blur={2.8} far={5} />
        </Suspense>
        <CameraRig step={step} />
        <StepPlayback step={step} />
      </Canvas>
      <div className="viewer-vignette" />
    </div>
  );
}
