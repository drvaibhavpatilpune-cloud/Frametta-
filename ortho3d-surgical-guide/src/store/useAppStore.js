import { create } from 'zustand';

const defaultVisibility = {
  femur: true,
  tibia: true,
  patella: true,
  fibula: true,
  acl: true,
  pcl: true,
  mcl: true,
  lcl: true,
  meniscusMedial: true,
  meniscusLateral: true,
  cartilage: true,
  fatPad: false,
  muscles: false,
  neurovascular: false,
  graft: false,
  instruments: true,
  portals: false,
};

export const useAppStore = create((set, get) => ({
  // Navigation
  currentTab: 'home',
  setTab: (tab) => set({ currentTab: tab }),

  // Search / favorites / recent
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  favorites: ['acl-reconstruction'],
  recentProcedures: ['acl-reconstruction'],
  toggleFavorite: (id) => {
    const favs = get().favorites;
    set({
      favorites: favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id],
    });
  },
  addRecent: (id) => {
    const recent = get().recentProcedures.filter((r) => r !== id);
    set({ recentProcedures: [id, ...recent].slice(0, 8) });
  },

  // Viewing modes
  viewMode: 'surgical', // anatomy | surgical | teaching
  setViewMode: (mode) => set({ viewMode: mode }),
  languageMode: 'professional', // professional | patient
  setLanguageMode: (mode) => set({ languageMode: mode }),
  presentationMode: false,
  setPresentationMode: (on) => set({ presentationMode: on }),

  // Anatomy layers
  visibility: { ...defaultVisibility },
  setStructureVisible: (id, visible) =>
    set({ visibility: { ...get().visibility, [id]: visible } }),
  toggleStructure: (id) =>
    set({
      visibility: {
        ...get().visibility,
        [id]: !get().visibility[id],
      },
    }),
  setVisibilityBatch: (patch) =>
    set({ visibility: { ...get().visibility, ...patch } }),
  resetVisibility: () => set({ visibility: { ...defaultVisibility } }),

  transparency: {},
  setTransparency: (id, value) =>
    set({ transparency: { ...get().transparency, [id]: value } }),

  selectedStructure: null,
  setSelectedStructure: (id) => set({ selectedStructure: id }),
  isolatedStructure: null,
  setIsolatedStructure: (id) => set({ isolatedStructure: id }),
  explodeView: false,
  setExplodeView: (on) => set({ explodeView: on }),
  toggleExplodeView: () => set({ explodeView: !get().explodeView }),

  // Camera
  cameraPreset: 'oblique',
  setCameraPreset: (preset) => set({ cameraPreset: preset, cameraNonce: Date.now() }),
  cameraNonce: 0,
  autoRotate: false,
  setAutoRotate: (on) => set({ autoRotate: on }),
  toggleAutoRotate: () => set({ autoRotate: !get().autoRotate }),
  resetCameraNonce: 0,
  requestCameraReset: () => set({ resetCameraNonce: Date.now(), cameraPreset: 'oblique' }),
  customCameras: {},
  saveCustomCamera: (key, pose) =>
    set({ customCameras: { ...get().customCameras, [key]: pose } }),

  // Labels
  showLabels: true,
  setShowLabels: (on) => set({ showLabels: on }),

  // Surgical timeline
  activeProcedureId: null,
  setActiveProcedureId: (id) => set({ activeProcedureId: id }),
  currentStepIndex: 0,
  setCurrentStepIndex: (index) => set({ currentStepIndex: index, stepPlaying: true, stepPaused: false }),
  stepPlaying: false,
  stepPaused: false,
  stepProgress: 0,
  setStepProgress: (p) => set({ stepProgress: p }),
  seekNonce: 0,
  seekStepProgress: (p) =>
    set({
      stepProgress: Math.min(1, Math.max(0, p)),
      seekNonce: Date.now(),
      stepPlaying: true,
      stepPaused: false,
    }),
  skipStepSeconds: (deltaSec, durationSec) => {
    const dur = durationSec || 10;
    const cur = get().stepProgress * dur;
    const next = Math.min(dur, Math.max(0, cur + deltaSec));
    set({
      stepProgress: next / dur,
      seekNonce: Date.now(),
      stepPlaying: true,
      stepPaused: false,
    });
  },
  playStep: () => set({ stepPlaying: true, stepPaused: false }),
  pauseStep: () => set({ stepPaused: true, stepPlaying: false }),
  togglePlayPause: () => {
    const { stepPlaying, stepPaused, stepProgress } = get();
    if (stepPlaying && !stepPaused) {
      set({ stepPaused: true, stepPlaying: false });
    } else {
      // replay from start if finished
      if (stepProgress >= 0.999) {
        set({
          stepPlaying: true,
          stepPaused: false,
          stepProgress: 0,
          stepReplayNonce: Date.now(),
        });
      } else {
        set({ stepPlaying: true, stepPaused: false });
      }
    }
  },
  replayStep: () =>
    set({
      stepPlaying: true,
      stepPaused: false,
      stepProgress: 0,
      stepReplayNonce: Date.now(),
    }),
  stepReplayNonce: 0,
  cinematicMode: true,
  setCinematicMode: (on) => set({ cinematicMode: on }),
  controlsVisible: true,
  setControlsVisible: (on) => set({ controlsVisible: on }),
  bumpControlsVisible: () => set({ controlsVisible: true, controlsBump: Date.now() }),
  controlsBump: 0,
  nextStep: () => {
    const { currentStepIndex, stepCount } = get();
    if (currentStepIndex < stepCount - 1) {
      set({
        currentStepIndex: currentStepIndex + 1,
        stepPlaying: true,
        stepPaused: false,
        stepProgress: 0,
      });
    }
  },
  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({
        currentStepIndex: currentStepIndex - 1,
        stepPlaying: true,
        stepPaused: false,
        stepProgress: 0,
      });
    }
  },
  stepCount: 9,
  setStepCount: (n) => set({ stepCount: n }),

  // Presentation annotations
  annotations: [],
  addAnnotation: (ann) => set({ annotations: [...get().annotations, ann] }),
  clearAnnotations: () => set({ annotations: [] }),
  drawingTool: null, // arrow | note | highlight | null
  setDrawingTool: (tool) => set({ drawingTool: tool }),

  // Panels
  layersOpen: true,
  setLayersOpen: (on) => set({ layersOpen: on }),
  explanationOpen: true,
  setExplanationOpen: (on) => set({ explanationOpen: on }),
  disclaimerAccepted: false,
  acceptDisclaimer: () => set({ disclaimerAccepted: true }),

  // Orientation readout from scene
  orientation: { A: true, P: false, M: false, L: false, S: false, I: false },
  setOrientation: (o) => set({ orientation: o }),
}));
