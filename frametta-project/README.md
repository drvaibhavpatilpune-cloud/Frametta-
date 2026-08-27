# Frametta

Art-framing mockup app — see your artwork framed and hung in a real room
before ordering a physical frame.

## Quick start

```bash
npm install
npm run dev
```

Opens a local dev server (prints the URL to visit — usually
`http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

Outputs a static site to `dist/` — this is what gets deployed to a web host,
or fed into Capacitor for a native mobile build.

## What's in here

- `src/App.jsx` — main app UI and rendering logic
- `src/utils/sampleArtwork.js` — procedurally generated demo art for first-time users
- `src/index.css` — global mobile-friendly styles
- `public/` — PWA manifest and icons
- Frame/interior assets are embedded as base64 inside `App.jsx` (no separate asset pipeline)

## Current status

- **Web app, fully working.** Production build verified with `npm run build`.
- **12 frame categories**, ~182 frames, **22 interior scenes**
- **Try sample art** — explore frames instantly without uploading
- **Export options** — PNG or JPEG, social aspect ratios, frame-only or room mockup, direct download
- **Settings persist** — frame, mat, interior, and export preferences saved in `localStorage`
- **Monetization UI is built** (paywall, watermarking, free/paid gating) but purchases are still mocked locally — real Apple/Google IAP is not wired up yet
- **Live Camera** uses the browser camera API; may need `@capacitor/camera` when wrapped as a native app

## Turning this into a mobile app

See `frametta-mobile-conversion-guide.md` in this same folder — Capacitor
setup, Android + Play Store steps, iOS + App Store steps.

## App icon & splash screen

`resources/icon.png` (1024×1024) and `resources/splash.png` (2732×2732) are
included. After adding Capacitor:

```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate
```
