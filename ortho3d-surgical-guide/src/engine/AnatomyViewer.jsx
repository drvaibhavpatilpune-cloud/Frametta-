import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
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
  const targetPos = useRef(new THREE.Vector3(2.8, 1.6, 3.2));
  const targetLook = useRef(new THREE.Vector3(0, 0.05, 0));
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
      dampingFactor={0.08}
      minDistance={1.4}
      maxDistance={9}
      target={[0, 0.05, 0]}
      autoRotateSpeed={0.6}
    />
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        position={[4, 6, 3]}
        intensity={1.15}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#a8c4d8" />
      <hemisphereLight args={['#d8e4f0', '#1a222c', 0.35]} />
    </>
  );
}

function StepPlayback({ step }) {
  const stepPlaying = useAppStore((s) => s.stepPlaying);
  const stepPaused = useAppStore((s) => s.stepPaused);
  const setStepProgress = useAppStore((s) => s.setStepProgress);
  const stepProgress = useAppStore((s) => s.stepProgress);
  const stepReplayNonce = useAppStore((s) => s.stepReplayNonce);
  const nextStep = useAppStore((s) => s.nextStep);
  const pauseStep = useAppStore((s) => s.pauseStep);
  const elapsed = useRef(0);

  useEffect(() => {
    elapsed.current = 0;
    setStepProgress(0);
  }, [step?.id, stepReplayNonce, setStepProgress]);

  useFrame((_, dt) => {
    if (!step || !stepPlaying || stepPaused) return;
    const dur = step.durationSec || 10;
    elapsed.current += dt;
    const p = Math.min(1, elapsed.current / dur);
    setStepProgress(p);
    if (p >= 1) {
      pauseStep();
    }
  });

  return null;
}

export default function AnatomyViewer({ step, viewMode, languageMode }) {
  const stepProgress = useAppStore((s) => s.stepProgress);

  return (
    <div className="anatomy-viewer">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [2.8, 1.6, 3.2], fov: 42, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => useAppStore.getState().setSelectedStructure(null)}
      >
        <color attach="background" args={['#0b1218']} />
        <fog attach="fog" args={['#0b1218', 8, 18]} />
        <Lights />
        <Suspense fallback={null}>
          <AnatomyScene
            step={step}
            stepProgress={stepProgress}
            viewMode={viewMode}
            languageMode={languageMode}
          />
          <ContactShadows
            position={[0, -2.15, 0]}
            opacity={0.35}
            scale={10}
            blur={2.5}
            far={4}
          />
        </Suspense>
        <CameraRig />
        <StepPlayback step={step} />
      </Canvas>
      <div className="viewer-vignette" />
    </div>
  );
}
