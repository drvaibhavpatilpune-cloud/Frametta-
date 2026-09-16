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

## Mobile & tablet

- Responsive phone layout with floating Layers / Explain controls
- Touch gestures: 1-finger rotate, pinch zoom, 2-finger pan
- Install as PWA via browser “Add to Home Screen”
- Native packaging (optional):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
npm run cap:android   # or cap:ios on macOS
```

## Anatomy source

Knee GLB meshes derived from **SPL Knee Atlas** (Apache-2.0), Brigham and Women's Hospital Surgical Planning Laboratory. See `public/models/knee/ATTRIBUTION.md`.

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
