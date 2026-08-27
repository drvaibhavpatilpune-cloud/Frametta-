# Frametta: Web App → Mobile App Guide

You have a Windows laptop and a Mac — that's actually ideal. Android work can
be done on either one; iOS work needs the Mac (Apple only allows iOS builds
on macOS). This guide covers both, but focuses on Android/Play Store first
since that's your immediate goal.

**Total cost:** Google Play Developer account is a one-time $25 fee. (Apple's
developer program, if you do iOS later, is $99/year.)

---

## Part 1 — One-time setup (do this once, on whichever laptop you're using)

1. **Install Node.js** — go to [nodejs.org](https://nodejs.org), download the
   "LTS" version, run the installer. This works the same on Windows and Mac.
2. **Install a code editor** — [VS Code](https://code.visualstudio.com) is
   free and standard. Not strictly required, but makes everything easier to
   follow.
3. **Install Android Studio** (only needed on whichever machine you'll build
   Android with) — [developer.android.com/studio](https://developer.android.com/studio).
   This is a big download (~1GB+) and includes everything needed to build
   and test Android apps.

---

## Part 2 — Turn the code into a real project (one time)

Open a terminal (Command Prompt on Windows, Terminal on Mac) and run:

```bash
npm create vite@latest frametta-app -- --template react
cd frametta-app
npm install
npm install lucide-react
```

This creates a working, empty React project. Now:

1. Open the new `frametta-app` folder in VS Code.
2. Inside `src/`, replace the contents of `App.jsx` with the entire content
   of the `framecraft.tsx` file I gave you (rename it to `App.jsx` if it asks,
   or just paste the code in — the export at the bottom, `Frametta`, becomes
   your main component).
3. Test it works locally:

```bash
npm run dev
```

This prints a `localhost` link — open it in your browser. If you see the app
working, you're ready to move on.

---

## Part 3 — Android + Play Store

### 3a. Add Capacitor (already done in this repo)

Capacitor is already initialized. App ID: `com.drvaibhavpatilpune.frametta`.

On your laptop:

```bash
cd frametta-project
npm install
npm run cap:android
```

That builds the web app, syncs into `android/`, and opens Android Studio.
Let it finish Gradle sync (progress bar at the bottom — can take several
minutes the first time).

### 3b. Test on an emulator or your own phone

- **Emulator**: in Android Studio, click the green ▶ Run button — it'll
  offer to create a virtual Android phone if you don't have one yet.
- **Your own phone**: enable Developer Options (Settings → About Phone → tap
  "Build Number" 7 times), turn on USB Debugging, plug in via USB, then hit
  Run — Android Studio will list your phone as a target.

### 3c. Create a signed build for the Play Store

In Android Studio: **Build → Generate Signed Bundle / APK → Android App
Bundle**. It'll walk you through creating a signing key — **save this key
file somewhere safe and back it up**; if you lose it, you can never update
your app again under the same listing.

This produces a `.aab` file — that's what you upload to the Play Store.

### 3d. Create your Play Store listing

1. Go to [play.google.com/console](https://play.google.com/console), pay the
   one-time $25 fee, create your developer account.
2. Create a new app, fill in the required listing info (description,
   screenshots, privacy policy URL — required since your app has in-app
   purchases).
3. Upload the `.aab` file under "Production" (or "Internal testing" first,
   to try it privately before going live).
4. Submit for review. Google's review usually takes a few hours to a
   few days.

---

## Part 4 — iOS + App Store (Mac only, do this later if you want)

Same project, different platform — do this from your Mac:

```bash
npm install @capacitor/ios
npx cap add ios
npx cap copy
npx cap open ios
```

This opens Xcode. You'll need:
- A free Apple ID to test on your own device.
- A paid **Apple Developer Program** membership ($99/year) to actually
  publish to the App Store — enroll at
  [developer.apple.com/programs](https://developer.apple.com/programs).

The submission flow is similar in spirit to Play Store (App Store Connect
instead of Play Console) but Apple's review is generally stricter and
slower (days, sometimes longer).

---

## Important: what's NOT done yet in the code

- **In-app purchases are currently mocked** (the unlock buttons just flip a
  local switch). Before publishing for real, this needs to be wired to
  actual **Google Play Billing** (Android) — a real, separate integration
  step, not automatic from Capacitor.
- **Live Camera needs a permissions step added** in `AndroidManifest.xml`
  (camera permission) once you're in Android Studio — Capacitor has a
  `@capacitor/camera` plugin that handles this properly; the current code
  uses the browser's camera API directly, which may need adjusting for the
  native wrapper to work reliably.

If you get stuck on either of those specifically, come back and I can walk
through that part in more detail once you're at that step.

---

## If something breaks

The most common snag is a version mismatch or a missing dependency error in
the terminal. If you hit an error message, copy the exact text and bring it
back here — I can help debug it directly rather than guessing.
