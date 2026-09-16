/** Easing + phase helpers for cinematic surgical timelines */

export function clamp01(t) {
  return Math.min(1, Math.max(0, t));
}

export function easeInOutCubic(t) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

export function easeOutCubic(t) {
  return 1 - (1 - clamp01(t)) ** 3;
}

export function easeInOutQuad(t) {
  const x = clamp01(t);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}

/** Map global progress [0,1] into a sub-phase [start,end] with easing */
export function phase(progress, start, end, ease = easeInOutCubic) {
  if (end <= start) return progress >= end ? 1 : 0;
  return ease((progress - start) / (end - start));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerpVec3(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/**
 * Cinematic camera keyframes per surgical animation id.
 * Each keyframe: { t, position, target }
 */
export const CINEMATIC_CAMERA = {
  positioning: [
    { t: 0, position: [3.4, 1.8, 3.6], target: [0, 0.1, 0] },
    { t: 0.35, position: [2.2, 0.9, 3.4], target: [0, 0.15, 0.1] },
    { t: 0.7, position: [0.2, 0.6, 3.8], target: [0, 0.2, 0.2] },
    { t: 1, position: [2.6, 1.1, 3.0], target: [0, 0.1, 0] },
  ],
  portals: [
    { t: 0, position: [1.6, 0.9, 3.2], target: [0, 0.25, 0.4] },
    { t: 0.45, position: [0.9, 0.55, 2.1], target: [0.1, 0.28, 0.55] },
    { t: 1, position: [1.2, 0.7, 2.4], target: [0, 0.25, 0.5] },
  ],
  diagnostic: [
    { t: 0, position: [1.1, 0.5, 2.0], target: [0, 0.1, 0.1] },
    { t: 0.4, position: [0.35, 0.35, 1.55], target: [0.05, 0.08, 0.05] },
    { t: 0.75, position: [-0.2, 0.4, 1.7], target: [-0.15, 0.05, 0.05] },
    { t: 1, position: [0.8, 0.55, 1.9], target: [0, 0.1, 0.05] },
  ],
  aclAssess: [
    { t: 0, position: [1.5, 0.8, 2.4], target: [0, 0.1, 0] },
    { t: 0.5, position: [0.55, 0.45, 1.5], target: [0, 0.08, 0.02] },
    { t: 1, position: [1.1, 0.7, 1.8], target: [0, 0.1, 0] },
  ],
  femoralTunnel: [
    { t: 0, position: [2.6, 1.35, 2.8], target: [0.1, 0.2, 0] },
    { t: 0.22, position: [2.0, 1.0, 1.9], target: [0.2, 0.28, 0] },
    { t: 0.48, position: [1.45, 0.72, 1.05], target: [0.22, 0.26, -0.06] },
    { t: 0.72, position: [1.15, 0.55, 0.85], target: [0.2, 0.24, -0.08] },
    { t: 1, position: [1.65, 0.9, 1.55], target: [0.16, 0.22, -0.05] },
  ],
  tibialTunnel: [
    { t: 0, position: [0.5, 1.7, 3.1], target: [0, 0, 0.1] },
    { t: 0.28, position: [-1.0, 0.35, 2.4], target: [-0.1, -0.05, 0.15] },
    { t: 0.55, position: [-1.55, -0.45, 1.45], target: [-0.15, -0.12, 0.12] },
    { t: 0.8, position: [-1.35, -0.2, 1.25], target: [-0.12, -0.08, 0.1] },
    { t: 1, position: [-0.75, 0.45, 2.35], target: [-0.05, -0.02, 0.1] },
  ],
  graftPassage: [
    { t: 0, position: [2.1, 0.55, 2.6], target: [-0.1, -0.2, 0.15] },
    { t: 0.3, position: [1.35, 0.25, 1.65], target: [-0.05, -0.05, 0.08] },
    { t: 0.55, position: [0.85, 0.45, 1.35], target: [0.05, 0.1, 0.02] },
    { t: 0.8, position: [0.55, 1.05, 1.9], target: [0.12, 0.25, -0.05] },
    { t: 1, position: [1.85, 1.05, 2.35], target: [0, 0.1, 0] },
  ],
  fixation: [
    { t: 0, position: [2.2, 1.0, 2.0], target: [0.15, 0.25, -0.05] },
    { t: 0.55, position: [1.3, 0.7, 1.2], target: [0.18, 0.28, -0.05] },
    { t: 1, position: [1.7, 0.9, 1.7], target: [0.12, 0.2, 0] },
  ],
  finalConstruct: [
    { t: 0, position: [1.5, 0.8, 2.2], target: [0, 0.1, 0] },
    { t: 0.5, position: [2.8, 1.5, 2.6], target: [0, 0.1, 0] },
    { t: 1, position: [0.3, 1.2, 3.4], target: [0, 0.15, 0.05] },
  ],
};

export function sampleCameraPath(keyframes, progress) {
  if (!keyframes?.length) return null;
  const p = clamp01(progress);
  if (p <= keyframes[0].t) {
    return { position: keyframes[0].position, target: keyframes[0].target };
  }
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (p <= b.t) {
      const local = easeInOutCubic((p - a.t) / (b.t - a.t || 1));
      return {
        position: lerpVec3(a.position, b.position, local),
        target: lerpVec3(a.target, b.target, local),
      };
    }
  }
  const last = keyframes[keyframes.length - 1];
  return { position: last.position, target: last.target };
}
