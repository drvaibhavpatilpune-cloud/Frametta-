# Ortho3D Surgical Guide

Interactive 3D orthopedic surgical education for mobile and tablet.

**Product principle:** a 3D interactive surgical textbook combined with an animated surgical simulator — rotate, explore, select anatomy, walk each surgical step, and keep full camera control during teaching.

## MVP

- **Region:** Knee
- **Procedure:** ACL Reconstruction (9 interactive steps)
- Anatomy layers, transparency, isolation, explode view
- Anatomy / Surgical / Teaching modes
- Professional / Patient language
- Presentation mode (arrows, marks, notes)
- Data-driven procedure architecture (CMS-ready)

## Stack

- React + Vite (tablet-first UI; Capacitor-ready for iOS/Android)
- React Three Fiber / Three.js modular 3D engine (GLB/glTF-ready)
- Zustand state
- Procedural medical-style knee model for the MVP (replaceable with production GLB packs)

> Flutter is a recommended alternate shell for a future native rewrite. This MVP keeps the UI layer and 3D engine modular so either shell can host the same content packs.

## Run

```bash
cd ortho3d-surgical-guide
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Adding procedures

Author structured data in `src/data/procedures.js` (or later via CMS through `src/services/contentLoader.js`):

- Procedure metadata, anatomy model id, instruments
- Steps with camera preset, highlights, visibility, animation id, labels
- Professional + patient explanations (what / why / anatomy / key point / pitfall)

## Disclaimer

Educational visualization only. Not a substitute for surgical training, institutional protocols, or professional judgment. Technique variations exist.
