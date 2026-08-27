import React, { useEffect, useRef, useState, useCallback } from "react";

const MIN_SIZE = 48;
const ASPECT_PRESETS = [
  { id: "free", label: "Free", ratio: null },
  { id: "original", label: "Original", ratio: "original" },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:5", label: "4:5", ratio: 4 / 5 },
  { id: "3:4", label: "3:4", ratio: 3 / 4 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
];

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function fitRectInBounds(x, y, w, h, maxW, maxH) {
  let nw = clamp(w, MIN_SIZE, maxW);
  let nh = clamp(h, MIN_SIZE, maxH);
  let nx = clamp(x, 0, maxW - nw);
  let ny = clamp(y, 0, maxH - nh);
  return { x: nx, y: ny, w: nw, h: nh };
}

function makeCenteredCrop(iw, ih, ratio) {
  if (!iw || !ih) return { x: 0, y: 0, w: 0, h: 0 };
  let cw;
  let ch;
  if (!ratio) {
    cw = iw * 0.88;
    ch = ih * 0.88;
  } else {
    const boxRatio = iw / ih;
    if (boxRatio > ratio) {
      ch = ih * 0.88;
      cw = ch * ratio;
    } else {
      cw = iw * 0.88;
      ch = cw / ratio;
    }
  }
  return {
    x: (iw - cw) / 2,
    y: (ih - ch) / 2,
    w: cw,
    h: ch,
  };
}

/**
 * Mobile-friendly artwork cropper: large handles, aspect presets,
 * rule-of-thirds grid, and pointer-capture dragging.
 */
export default function CropModal({ imageSrc, onCancel, onApply }) {
  const imgRef = useRef(null);
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const cropRef = useRef({ x: 20, y: 20, w: 200, h: 250 });
  const aspectIdRef = useRef("free");
  const [crop, setCrop] = useState({ x: 20, y: 20, w: 200, h: 250 });
  const [aspectId, setAspectId] = useState("free");
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    cropRef.current = crop;
  }, [crop]);
  useEffect(() => {
    aspectIdRef.current = aspectId;
  }, [aspectId]);

  const getRatioFor = (id, el) => {
    const preset = ASPECT_PRESETS.find((p) => p.id === id);
    if (!preset || preset.ratio === null) return null;
    if (preset.ratio === "original") {
      if (!el || !el.naturalWidth) return null;
      return el.naturalWidth / el.naturalHeight;
    }
    return preset.ratio;
  };

  const syncFromImage = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const iw = el.offsetWidth;
    const ih = el.offsetHeight;
    if (!iw || !ih) return;
    setImgSize({ w: iw, h: ih });
    const ratio = (() => {
      const preset = ASPECT_PRESETS.find((p) => p.id === aspectId);
      if (!preset || preset.ratio === null) return null;
      if (preset.ratio === "original") return el.naturalWidth / el.naturalHeight;
      return preset.ratio;
    })();
    setCrop(makeCenteredCrop(iw, ih, ratio));
  }, [aspectId]);

  useEffect(() => {
    // Re-measure when the modal mounts or the aspect preset changes.
    const id = requestAnimationFrame(syncFromImage);
    return () => cancelAnimationFrame(id);
  }, [syncFromImage, imageSrc]);

  useEffect(() => {
    const onResize = () => syncFromImage();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [syncFromImage]);

  const applyAspect = (id) => {
    setAspectId(id);
    const el = imgRef.current;
    if (!el) return;
    const iw = el.offsetWidth;
    const ih = el.offsetHeight;
    const preset = ASPECT_PRESETS.find((p) => p.id === id);
    let ratio = null;
    if (preset?.ratio === "original") ratio = el.naturalWidth / el.naturalHeight;
    else if (typeof preset?.ratio === "number") ratio = preset.ratio;
    setCrop(makeCenteredCrop(iw, ih, ratio));
  };

  const resizeWithAspect = (handle, origin, dx, dy, iw, ih, ratio) => {
    let { x, y, w, h } = origin;
    const has = (s) => handle.includes(s);

    if (!ratio) {
      if (has("l")) {
        const nx = clamp(origin.x + dx, 0, origin.x + origin.w - MIN_SIZE);
        w = origin.x + origin.w - nx;
        x = nx;
      }
      if (has("r")) w = clamp(origin.w + dx, MIN_SIZE, iw - origin.x);
      if (has("t")) {
        const ny = clamp(origin.y + dy, 0, origin.y + origin.h - MIN_SIZE);
        h = origin.y + origin.h - ny;
        y = ny;
      }
      if (has("b")) h = clamp(origin.h + dy, MIN_SIZE, ih - origin.y);
      return { x, y, w, h };
    }

    // Locked aspect — drive from the dominant axis of the active handle.
    const fromCorner = handle.length === 2;
    if (fromCorner) {
      const signX = has("l") ? -1 : 1;
      const signY = has("t") ? -1 : 1;
      // Prefer the larger movement so the gesture feels responsive.
      let nextW = origin.w + dx * signX;
      let nextH = nextW / ratio;
      if (Math.abs(dy) > Math.abs(dx)) {
        nextH = origin.h + dy * signY;
        nextW = nextH * ratio;
      }
      nextW = Math.max(MIN_SIZE, nextW);
      nextH = nextW / ratio;
      if (nextH < MIN_SIZE) {
        nextH = MIN_SIZE;
        nextW = nextH * ratio;
      }

      if (has("l")) x = origin.x + origin.w - nextW;
      else x = origin.x;
      if (has("t")) y = origin.y + origin.h - nextH;
      else y = origin.y;

      // Keep inside image bounds, shrinking if needed.
      if (x < 0) {
        nextW += x;
        nextH = nextW / ratio;
        x = 0;
        if (has("t")) y = origin.y + origin.h - nextH;
      }
      if (y < 0) {
        nextH += y;
        nextW = nextH * ratio;
        y = 0;
        if (has("l")) x = origin.x + origin.w - nextW;
      }
      if (x + nextW > iw) {
        nextW = iw - x;
        nextH = nextW / ratio;
        if (has("t")) y = origin.y + origin.h - nextH;
      }
      if (y + nextH > ih) {
        nextH = ih - y;
        nextW = nextH * ratio;
        if (has("l")) x = origin.x + origin.w - nextW;
      }
      return fitRectInBounds(x, y, nextW, nextH, iw, ih);
    }

    // Edge handles with locked aspect: grow/shrink from opposite edge, recenter the free axis.
    if (has("l") || has("r")) {
      let nextW = has("l") ? origin.w - dx : origin.w + dx;
      nextW = clamp(nextW, MIN_SIZE, iw);
      let nextH = nextW / ratio;
      if (nextH > ih) {
        nextH = ih;
        nextW = nextH * ratio;
      }
      x = has("l") ? origin.x + origin.w - nextW : origin.x;
      y = origin.y + (origin.h - nextH) / 2;
      return fitRectInBounds(x, y, nextW, nextH, iw, ih);
    }
    if (has("t") || has("b")) {
      let nextH = has("t") ? origin.h - dy : origin.h + dy;
      nextH = clamp(nextH, MIN_SIZE, ih);
      let nextW = nextH * ratio;
      if (nextW > iw) {
        nextW = iw;
        nextH = nextW / ratio;
      }
      y = has("t") ? origin.y + origin.h - nextH : origin.y;
      x = origin.x + (origin.w - nextW) / 2;
      return fitRectInBounds(x, y, nextW, nextH, iw, ih);
    }
    return origin;
  };

  const onPointerDown = (e, type, handle = null) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      type,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...cropRef.current },
      pointerId: e.pointerId,
    };
    setDragging(true);
  };

  // Window-level move/up so dragging stays smooth if the finger leaves the box.
  useEffect(() => {
    if (!dragging) return;

    const move = (e) => {
      const info = dragRef.current;
      if (!info) return;
      e.preventDefault();
      const el = imgRef.current;
      if (!el) return;
      const iw = el.offsetWidth;
      const ih = el.offsetHeight;
      const dx = e.clientX - info.startX;
      const dy = e.clientY - info.startY;
      const ratio = getRatioFor(aspectIdRef.current, el);

      if (info.type === "move") {
        setCrop(
          fitRectInBounds(info.origin.x + dx, info.origin.y + dy, info.origin.w, info.origin.h, iw, ih)
        );
        return;
      }
      setCrop(resizeWithAspect(info.handle, info.origin, dx, dy, iw, ih, ratio));
    };

    const up = () => {
      dragRef.current = null;
      setDragging(false);
    };

    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging]);

  const handleApply = () => {
    const el = imgRef.current;
    if (!el || !crop.w || !crop.h) return;
    const scale = el.naturalWidth / el.offsetWidth;
    const srcX = crop.x * scale;
    const srcY = crop.y * scale;
    const srcW = crop.w * scale;
    const srcH = crop.h * scale;
    // Keep strong detail from phone photos — cap longest edge at 1600px.
    const maxEdge = 1600;
    const long = Math.max(srcW, srcH);
    const outScale = long > maxEdge ? maxEdge / long : 1;
    const outW = Math.max(1, Math.round(srcW * outScale));
    const outH = Math.max(1, Math.round(srcH * outScale));
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(el, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
    onApply({
      dataUrl: canvas.toDataURL("image/jpeg", 0.92),
      aspect: srcW / srcH,
    });
  };

  const handleReset = () => applyAspect(aspectId);

  const corners = [
    { key: "tl", style: { top: -10, left: -10 }, cursor: "nwse-resize" },
    { key: "tr", style: { top: -10, right: -10 }, cursor: "nesw-resize" },
    { key: "bl", style: { bottom: -10, left: -10 }, cursor: "nesw-resize" },
    { key: "br", style: { bottom: -10, right: -10 }, cursor: "nwse-resize" },
  ];
  const edges = [
    { key: "t", style: { top: -8, left: "50%", transform: "translateX(-50%)" }, cursor: "ns-resize" },
    { key: "b", style: { bottom: -8, left: "50%", transform: "translateX(-50%)" }, cursor: "ns-resize" },
    { key: "l", style: { left: -8, top: "50%", transform: "translateY(-50%)" }, cursor: "ew-resize" },
    { key: "r", style: { right: -8, top: "50%", transform: "translateY(-50%)" }, cursor: "ew-resize" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.72)", touchAction: "none" }}
    >
      <div
        className="bg-neutral-950 text-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-medium">Crop artwork</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Drag to move · pull corners to resize · lock a ratio if you want
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-white/50 text-sm px-2 py-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {ASPECT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyAspect(p.id)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition"
              style={{
                background: aspectId === p.id ? "#fff" : "rgba(255,255,255,0.08)",
                color: aspectId === p.id ? "#000" : "rgba(255,255,255,0.75)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div
          ref={stageRef}
          className="relative mx-auto flex-1 flex items-center justify-center px-3 py-2"
          style={{ minHeight: 280, maxHeight: "58vh", width: "100%" }}
        >
          <div className="relative select-none" style={{ maxWidth: "100%", maxHeight: "100%" }}>
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              onLoad={syncFromImage}
              className="block max-w-full h-auto rounded-lg"
              style={{ maxHeight: "54vh", touchAction: "none", userSelect: "none" }}
            />

            {imgSize.w > 0 && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "rgba(0,0,0,0.55)",
                    clipPath: `polygon(
                      0% 0%, 0% 100%,
                      ${crop.x}px 100%, ${crop.x}px ${crop.y}px,
                      ${crop.x + crop.w}px ${crop.y}px, ${crop.x + crop.w}px ${crop.y + crop.h}px,
                      ${crop.x}px ${crop.y + crop.h}px, ${crop.x}px 100%,
                      100% 100%, 100% 0%
                    )`,
                  }}
                />

                <div
                  className="absolute"
                  style={{
                    left: crop.x,
                    top: crop.y,
                    width: crop.w,
                    height: crop.h,
                    border: "2px solid #fff",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.45)",
                    cursor: dragging ? "grabbing" : "grab",
                    touchAction: "none",
                  }}
                  onPointerDown={(e) => onPointerDown(e, "move")}
                >
                  {/* Rule of thirds */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[1, 2].map((i) => (
                      <div
                        key={`v${i}`}
                        className="absolute top-0 bottom-0"
                        style={{
                          left: `${(i * 100) / 3}%`,
                          width: 1,
                          background: "rgba(255,255,255,0.35)",
                        }}
                      />
                    ))}
                    {[1, 2].map((i) => (
                      <div
                        key={`h${i}`}
                        className="absolute left-0 right-0"
                        style={{
                          top: `${(i * 100) / 3}%`,
                          height: 1,
                          background: "rgba(255,255,255,0.35)",
                        }}
                      />
                    ))}
                  </div>

                  {corners.map((h) => (
                    <div
                      key={h.key}
                      onPointerDown={(e) => onPointerDown(e, "resize", h.key)}
                      style={{
                        position: "absolute",
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        background: "#fff",
                        border: "2px solid #111",
                        zIndex: 2,
                        cursor: h.cursor,
                        touchAction: "none",
                        ...h.style,
                      }}
                    />
                  ))}
                  {edges.map((h) => (
                    <div
                      key={h.key}
                      onPointerDown={(e) => onPointerDown(e, "resize", h.key)}
                      style={{
                        position: "absolute",
                        width: h.key === "l" || h.key === "r" ? 16 : 28,
                        height: h.key === "t" || h.key === "b" ? 16 : 28,
                        borderRadius: 5,
                        background: "#fff",
                        border: "2px solid #111",
                        zIndex: 2,
                        cursor: h.cursor,
                        touchAction: "none",
                        ...h.style,
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-4 pb-5 pt-2 flex gap-2 safe-pb">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-3 rounded-xl text-sm text-white/70 bg-white/10"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm text-white/70 bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-[1.4] py-3 rounded-xl text-sm font-medium bg-white text-black"
          >
            Apply crop
          </button>
        </div>
      </div>
    </div>
  );
}
