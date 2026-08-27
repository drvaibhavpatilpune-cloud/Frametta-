# Frametta

Art-framing mockup app — see your artwork framed and hung in a real room
before ordering a physical frame.

**App ID:** `com.drvaibhavpatilpune.frametta`

## Quick start (web)

```bash
cd frametta-project
npm install
npm run dev
```

## Build for production (web)

```bash
npm run build
npm run preview
```

## Capacitor (Android native wrapper)

The Android project is already scaffolded under `android/`.

### On your Windows or Mac machine (needs Android Studio)

```bash
cd frametta-project
npm install
npm run cap:android
```

That builds the web app, syncs it into `android/`, and opens **Android Studio**.

Then in Android Studio:
1. Wait for Gradle sync to finish
2. Press **Run ▶** on an emulator or a USB-debugged phone

### Useful scripts

| Script | What it does |
|--------|----------------|
| `npm run cap:sync` | `vite build` + `cap sync` |
| `npm run cap:android` | Sync and open Android Studio |
| `npm run cap:assets` | Regenerate icons/splash from `resources/` |
| `npm run cap:ios` | Sync and open Xcode (Mac only; run `npx cap add ios` first) |

### Native plugins included

- `@capacitor/camera` — Live Camera permission + capture
- `@capacitor/share` — native share sheet helper
- `@capacitor/status-bar` / `@capacitor/splash-screen` / `@capacitor/app`

### Not done yet (post-wrap)

- **Google Play Billing / App Store IAP** — unlock buttons are still mocked
- **iOS platform** — add with `npx cap add ios` on a Mac when ready
- **Play Store listing** — signed `.aab` via Android Studio → Generate Signed Bundle

## What's in here

- `src/App.jsx` — main app UI
- `src/components/CropModal.jsx` — mobile-friendly cropper
- `src/native/` — Capacitor bootstrap + camera/share helpers
- `src/data/` — lazy-loaded frames & interiors
- `android/` — Capacitor Android project
- `resources/icon.png` + `resources/splash.png` — source assets for native icons

## Current status

- Web app working (`npm run build` verified)
- Capacitor Android shell ready to open in Android Studio
- Camera permission declared in `AndroidManifest.xml`
- Crop, frames, mats, export, watermark/paywall UI in place
- Purchases still mocked until real IAP is wired
