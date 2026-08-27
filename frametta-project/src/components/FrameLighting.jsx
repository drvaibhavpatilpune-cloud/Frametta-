import React from "react";

/** Layered contact + ambient shadow cast onto the wall behind the frame. */
export function WallContactShadow({ borderRadius = 0 }) {
  return (
    <>
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          inset: "-4px -4px -20px -4px",
          borderRadius,
          background: "radial-gradient(68% 58% at 50% 100%, rgba(0,0,0,0.58), rgba(0,0,0,0) 68%)",
          filter: "blur(7px)",
          transform: "translateY(7px) scaleX(0.93)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          inset: "-10px -10px -34px -10px",
          borderRadius,
          background: "radial-gradient(82% 88% at 50% 100%, rgba(0,0,0,0.32), rgba(0,0,0,0) 74%)",
          filter: "blur(20px)",
          transform: "translateY(16px) scaleX(0.97)",
        }}
      />
    </>
  );
}

/** Ambient occlusion where the frame molding meets the mat opening (rabbet). */
export function FrameRabbetAO({ borderRadius, depth = 14, zIndex = 4 }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{
        borderRadius,
        zIndex,
        boxShadow: `
          inset 0 0 ${depth}px rgba(0,0,0,0.48),
          inset 0 3px 7px rgba(0,0,0,0.38),
          inset 0 -1px 2px rgba(255,255,255,0.14)
        `,
      }}
    />
  );
}

/** Edge darkening + directional highlight for photo-based nine-slice frames. */
export function NineSliceLighting({ outerW, outerH, mattInset, borderRadius = 0 }) {
  if (!outerW || !outerH) return null;

  const innerInset = Math.max(0, mattInset - 3);

  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          zIndex: 2,
          borderRadius,
          boxShadow: "inset 0 0 28px rgba(0,0,0,0.24), inset 0 0 10px rgba(0,0,0,0.16)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          zIndex: 2,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 32%, transparent 68%, rgba(0,0,0,0.14) 100%)",
          mixBlendMode: "overlay",
        }}
      />
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          top: innerInset,
          left: innerInset,
          width: outerW - innerInset * 2,
          height: outerH - innerInset * 2,
          zIndex: 4,
          borderRadius,
          boxShadow: "inset 0 0 16px rgba(0,0,0,0.52), inset 0 4px 8px rgba(0,0,0,0.42)",
        }}
      />
    </>
  );
}

/** Subtle glass reflection over artwork. */
export function ArtworkGlassSheen() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{
        background:
          "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 16%, rgba(255,255,255,0) 38%, rgba(255,255,255,0.05) 76%, rgba(255,255,255,0.16) 100%)",
      }}
    />
  );
}

/** Soft vignette over room photos so the frame reads more clearly. */
export function InteriorVignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse 85% 75% at 50% 42%, transparent 45%, rgba(0,0,0,0.22) 100%)",
        zIndex: 1,
      }}
    />
  );
}
