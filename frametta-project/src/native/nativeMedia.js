import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Share } from "@capacitor/share";

/**
 * Prefer Capacitor Camera on native; fall back to getUserMedia in browser.
 * Returns a stream-like object for live preview when possible, or a photo dataUrl.
 */
export async function requestLiveCameraPermission() {
  if (!Capacitor.isNativePlatform()) {
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
  }

  // On native, ensure camera permission is granted via the Capacitor plugin
  // before opening the WebView getUserMedia stream (Android WebView still
  // uses mediaDevices once the OS permission is approved).
  const perm = await Camera.checkPermissions();
  if (perm.camera !== "granted") {
    const asked = await Camera.requestPermissions({ permissions: ["camera"] });
    if (asked.camera !== "granted") {
      const err = new Error("Camera permission denied");
      err.name = "NotAllowedError";
      throw err;
    }
  }

  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" } },
    audio: false,
  });
}

/** Optional one-shot photo capture via native camera UI. */
export async function captureArtworkPhoto() {
  const photo = await Camera.getPhoto({
    quality: 92,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Prompt,
    correctOrientation: true,
  });
  return photo.dataUrl;
}

/** Native share sheet when available; otherwise returns false for web fallback. */
export async function shareFileOrUrl({ title, text, url, dialogTitle }) {
  if (!Capacitor.isNativePlatform()) return false;
  const can = await Share.canShare();
  if (!can.value) return false;
  await Share.share({ title, text, url, dialogTitle });
  return true;
}
