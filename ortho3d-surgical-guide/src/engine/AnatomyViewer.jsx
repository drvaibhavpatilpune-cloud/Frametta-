import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  ContactShadows,
  SoftShadows,
  AccumulativeShadows,
  RandomizedLight,
} from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
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

/** Local studio HDR — wet tissue specular without CDN fetch */
function StudioEnvironment({ intensity = 0.42 }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
}

/** Soft medical-studio lighting like reference teaching videos */
function Lights({ isMobile }) {
  return (
    <>
      <ambientLight intensity={0.42} color="#f5efe8" />
      <hemisphereLight args={['#f5f0ea', '#3a322c', 0.55]} />
      <directionalLight
        castShadow={!isMobile}
        position={[3.8, 5.5, 2.8]}
        intensity={1.85}
        color="#fff6ec"
        shadow-mapSize-width={isMobile ? 512 : 2048}
        shadow-mapSize-height={isMobile ? 512 : 2048}
        shadow-bias={-0.0002}
        shadow-normalBias={0.03}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[-3.2, 2.2, -1.5]} intensity={0.55} color="#c8d6e4" />
      <directionalLight position={[0.2, 1.8, -4]} intensity={0.45} color="#ffe8d0" />
      <pointLight position={[0.4, 1.2, 1.8]} intensity={0.4} color="#ffe2c4" distance={7} decay={2} />
      {!isMobile && <SoftShadows size={18} samples={12} focus={0.85} />}
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
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [2.6, 1.2, 3.0], fov: isMobile ? 46 : 40, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.22,
        }}
        onPointerMissed={() => useAppStore.getState().setSelectedStructure(null)}
      >
        <color attach="background" args={['#32302e']} />
        <fog attach="fog" args={['#32302e', 8, 18]} />
        <Lights isMobile={isMobile} />
        <StudioEnvironment intensity={0.42} />
        <Suspense fallback={null}>
          <AnatomyScene
            step={step}
            stepProgress={stepProgress}
            viewMode={viewMode}
            languageMode={languageMode}
          />
          {!isMobile ? (
            <AccumulativeShadows
              position={[0, -2.02, 0]}
              frames={48}
              alphaTest={0.85}
              opacity={0.35}
              scale={12}
              color="#1a1512"
            >
              <RandomizedLight
                amount={6}
                radius={4}
                ambient={0.45}
                intensity={1.1}
                position={[4, 6, 3]}
                bias={0.001}
              />
            </AccumulativeShadows>
          ) : (
            <ContactShadows position={[0, -2.05, 0]} opacity={0.5} scale={12} blur={2.6} far={5} />
          )}
        </Suspense>
        <CameraRig step={step} />
        <StepPlayback step={step} />
      </Canvas>
      <div className="viewer-vignette" />
    </div>
  );
}
