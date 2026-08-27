import React, { useState, useRef, useEffect } from "react";
import { Lock, Download, Upload, X, ZoomIn, ZoomOut, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Move, Square, Image as ImageIcon, LayoutTemplate, Sparkles } from "lucide-react";
import { createSampleArtwork } from "./utils/sampleArtwork.js";
import {
  MAT_COLORS,
  MAT_TEXTURES,
  TEXTURE_PATTERNS,
  EXPORT_FORMATS,
  isFramePremium,
  isInteriorPremium,
} from "./data/constants.js";
import { CATEGORY_INDEX, CATEGORY_KEYS } from "./data/categoryIndex.js";

const EMPTY_CATEGORY = {
  label: "Loading…",
  status: "ready",
  shape: "rect",
  widthScale: 1,
  cornerRadius: 0,
  texture: "none",
  frames: {},
};

const PLACEHOLDER_FRAME = {
  base: "#8B7355",
  hi: "#C4A574",
  lo: "#5C4A32",
  label: "Loading",
  widthScale: 1,
};

export const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/REPLACE_WITH_YOUR_LINK";
export const CONFIG_STORAGE_KEY = "framelab:config:v1";
export const WELCOME_STORAGE_KEY = "frametta:welcome:v1";

function NineSliceFrame({ tl, tr, bl, br, edge, edgeVertical, cornerSize, mattInset, tileMode, children }) {
  const contentRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  const outerW = size.w + mattInset * 2;
  const outerH = size.h + mattInset * 2;
  // Marble & Stone: real veining doesn't repeat in nature — tiling it looks
  // like an obvious stamp. Stretch the edge once instead of repeating it.
  const edgeRepeat = tileMode === "stretch" ? "no-repeat" : "repeat-x";
  const edgeSize = tileMode === "stretch" ? `100% ${mattInset}px` : `auto ${mattInset}px`;

  return (
    <div className="relative" style={{ width: outerW || undefined, height: outerH || undefined, overflow: "hidden", boxShadow: size.w ? "0 18px 40px -12px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3)" : undefined }}>
      <div ref={contentRef} className="absolute" style={{ top: mattInset, left: mattInset, zIndex: 3 }}>
        {children}
      </div>
      {size.w > 0 && (
        <>
          <div className="absolute" style={{ top: 0, left: 0, width: outerW, height: mattInset, backgroundImage: `url(${edge})`, backgroundRepeat: edgeRepeat, backgroundSize: edgeSize, zIndex: 1 }} />
          <div className="absolute" style={{ bottom: 0, left: 0, width: outerW, height: mattInset, backgroundImage: `url(${edge})`, backgroundRepeat: edgeRepeat, backgroundSize: edgeSize, transform: "scaleY(-1)", zIndex: 1 }} />
          {edgeVertical ? (
            <>
              {/* Dedicated vertical-edge photo — grain/veining runs the
                  correct direction natively, no rotation needed. */}
              <div className="absolute" style={{ top: 0, left: 0, width: mattInset, height: outerH, backgroundImage: `url(${edgeVertical})`, backgroundRepeat: tileMode === "stretch" ? "no-repeat" : "repeat-y", backgroundSize: tileMode === "stretch" ? `${mattInset}px 100%` : `${mattInset}px auto`, zIndex: 1 }} />
              <div className="absolute" style={{ top: 0, right: 0, width: mattInset, height: outerH, backgroundImage: `url(${edgeVertical})`, backgroundRepeat: tileMode === "stretch" ? "no-repeat" : "repeat-y", backgroundSize: tileMode === "stretch" ? `${mattInset}px 100%` : `${mattInset}px auto`, transform: "scaleX(-1)", zIndex: 1 }} />
            </>
          ) : (
            <>
              <div className="absolute overflow-hidden" style={{ top: 0, left: 0, width: mattInset, height: outerH, zIndex: 1 }}>
                <div style={{ width: outerH, height: mattInset, backgroundImage: `url(${edge})`, backgroundRepeat: edgeRepeat, backgroundSize: edgeSize, transform: `translateX(${(mattInset - outerH) / 2}px) translateY(${(outerH - mattInset) / 2}px) rotate(-90deg)` }} />
              </div>
              <div className="absolute overflow-hidden" style={{ top: 0, right: 0, width: mattInset, height: outerH, zIndex: 1, transform: "scaleX(-1)" }}>
                <div style={{ width: outerH, height: mattInset, backgroundImage: `url(${edge})`, backgroundRepeat: edgeRepeat, backgroundSize: edgeSize, transform: `translateX(${(mattInset - outerH) / 2}px) translateY(${(outerH - mattInset) / 2}px) rotate(-90deg)` }} />
              </div>
            </>
          )}
          <img
            src={tl}
            alt=""
            className="absolute pointer-events-none"
            style={{
              top: 0,
              left: 0,
              width: cornerSize,
              height: cornerSize,
              zIndex: 2,
              WebkitMaskImage: "radial-gradient(circle at top left, black 97%, transparent 100%)",
              maskImage: "radial-gradient(circle at top left, black 97%, transparent 100%)",
            }}
          />
          <img
            src={tr}
            alt=""
            className="absolute pointer-events-none"
            style={{
              top: 0,
              right: 0,
              width: cornerSize,
              height: cornerSize,
              zIndex: 2,
              WebkitMaskImage: "radial-gradient(circle at top right, black 97%, transparent 100%)",
              maskImage: "radial-gradient(circle at top right, black 97%, transparent 100%)",
            }}
          />
          <img
            src={bl}
            alt=""
            className="absolute pointer-events-none"
            style={{
              bottom: 0,
              left: 0,
              width: cornerSize,
              height: cornerSize,
              zIndex: 2,
              WebkitMaskImage: "radial-gradient(circle at bottom left, black 97%, transparent 100%)",
              maskImage: "radial-gradient(circle at bottom left, black 97%, transparent 100%)",
            }}
          />
          <img
            src={br}
            alt=""
            className="absolute pointer-events-none"
            style={{
              bottom: 0,
              right: 0,
              width: cornerSize,
              height: cornerSize,
              zIndex: 2,
              WebkitMaskImage: "radial-gradient(circle at bottom right, black 97%, transparent 100%)",
              maskImage: "radial-gradient(circle at bottom right, black 97%, transparent 100%)",
            }}
          />
        </>
      )}
    </div>
  );
}

export default function Frametta() {
  const [devMode, setDevMode] = useState(false); // dev toggle: free premium access
  const [premium, setPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  // Mock entitlement state — stands in for real App Store/Play Store IAP,
  // which needs the native Capacitor conversion to wire up for real. Toggled
  // by the Unlock Frames / Unlock Studio buttons in the paywall sheet.
  const [hasFramesUnlock, setHasFramesUnlock] = useState(false);
  const [hasStudioUnlock, setHasStudioUnlock] = useState(false);

  const [category, setCategory] = useState("popular");
  // Bottom-sheet nav: which tab is open (null = sheet collapsed). Selecting
  // a tab's icon directly sets this, so "reopen where you left off" falls
  // out naturally — no separate last-tab tracking needed.
  const [activeSheet, setActiveSheet] = useState(null);
  const [wood, setWood] = useState("natural_wood_block");
  const [interior, setInterior] = useState("exhibition");
  const [liveCameraOn, setLiveCameraOn] = useState(false);
  const [liveCameraError, setLiveCameraError] = useState(null);
  const [liveCameraAspect, setLiveCameraAspect] = useState(3 / 4);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const [matColor, setMatColor] = useState("museum_white");
  const [matTexture, setMatTexture] = useState("linen");
  const [matWidth, setMatWidth] = useState(46);
  const [borderLine, setBorderLine] = useState(true);
  const [frameWidth, setFrameWidth] = useState(28);
  const [exportFormat, setExportFormat] = useState("square");
  const [exportMode, setExportMode] = useState("with_interior"); // "with_interior" | "frame_only"
  const [exportMime, setExportMime] = useState("png"); // "png" | "jpeg"
  const [loadedCategories, setLoadedCategories] = useState({});
  const [interiors, setInteriors] = useState(null);

  // Lazy-load the active frame category (and room photos) so the first paint
  // only downloads the default "popular" frames + one interior chunk.
  useEffect(() => {
    let cancelled = false;
    CATEGORY_INDEX[category]?.loader().then((mod) => {
      if (!cancelled) {
        setLoadedCategories((prev) => ({ ...prev, [category]: mod.default }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    import("./data/interiors.js").then((mod) => setInteriors(mod.INTERIORS));
  }, []);

  // Persist the lightweight config choices (frame, mat, interior, etc.) so
  // closing the tab doesn't lose someone's setup — deliberately NOT the
  // uploaded image itself, which is far too large for localStorage's
  // typical 5–10MB limit and would risk silently failing to save at all.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY) || "null");
      if (saved) {
        if (saved.category) setCategory(saved.category);
        if (saved.wood) setWood(saved.wood);
        if (saved.interior) setInterior(saved.interior);
        if (saved.matColor) setMatColor(saved.matColor);
        if (saved.matTexture) setMatTexture(saved.matTexture);
        if (typeof saved.matWidth === "number") setMatWidth(saved.matWidth);
        if (typeof saved.borderLine === "boolean") setBorderLine(saved.borderLine);
        if (typeof saved.frameWidth === "number") setFrameWidth(saved.frameWidth);
        if (saved.exportFormat) setExportFormat(saved.exportFormat);
        if (saved.exportMode) setExportMode(saved.exportMode);
        if (saved.exportMime === "jpeg" || saved.exportMime === "png") setExportMime(saved.exportMime);
      }
    } catch {
      // Private browsing / storage disabled / corrupted value — just skip
      // restoring and start from the normal defaults above.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        CONFIG_STORAGE_KEY,
        JSON.stringify({
          category,
          wood,
          interior,
          matColor,
          matTexture,
          matWidth,
          borderLine,
          frameWidth,
          exportFormat,
          exportMode,
          exportMime,
        })
      );
    } catch {
      // Storage full or unavailable — the app still works fine this
      // session, it just won't remember the setup for next time.
    }
  }, [category, wood, interior, matColor, matTexture, matWidth, borderLine, frameWidth, exportFormat, exportMode, exportMime]);
  const [image, setImage] = useState(null);
  const [rawImage, setRawImage] = useState(null); // uploaded original, pre-crop
  const [showCropModal, setShowCropModal] = useState(false);
  const [artworkAspect, setArtworkAspect] = useState(320 / 400); // set from the ACTUAL crop, not a fixed preset
  const [cropRect, setCropRect] = useState({ x: 20, y: 20, w: 200, h: 250 }); // fully freeform, in rendered crop-image px
  const [toast, setToast] = useState(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(() => {
    try {
      return localStorage.getItem(WELCOME_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const showToast = (message) => setToast(message);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const dismissWelcome = () => {
    setWelcomeDismissed(true);
    try {
      localStorage.setItem(WELCOME_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  const handleLoadSampleArtwork = () => {
    const sample = createSampleArtwork();
    setImage(sample.dataUrl);
    setRawImage(sample.dataUrl);
    setArtworkAspect(sample.aspect);
    setShowCropModal(false);
    dismissWelcome();
    showToast("Sample artwork loaded — swap in yours anytime");
  };

  const startLiveCamera = async () => {
    setLiveCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setLiveCameraOn(true);
    } catch (err) {
      setLiveCameraError(
        err && err.name === "NotAllowedError"
          ? "Camera access was denied. Allow camera access in your browser/app settings to use Live Camera."
          : "Couldn't access the camera on this device."
      );
      setLiveCameraOn(false);
    }
  };

  const stopLiveCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setLiveCameraOn(false);
  };

  // The <video> element only exists in the DOM once liveCameraOn is true
  // (it's conditionally rendered), so the stream can't be attached inside
  // startLiveCamera itself — videoRef.current is still null at that point.
  // Attach it here instead, once React has actually mounted the element.
  useEffect(() => {
    if (liveCameraOn && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [liveCameraOn]);

  // Stop the camera whenever the user switches to a regular interior photo,
  // and make sure the stream is released if the component itself unmounts —
  // getUserMedia streams keep the camera hardware active (and the camera
  // indicator lit) until every track is explicitly stopped.
  useEffect(() => {
    if (!liveCameraOn && cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
  }, [liveCameraOn]);

  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const fileRef = useRef(null);
  const captureRef = useRef(null);
  const frameContentRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  // Manual size adjustment on top of the auto-fit scale — lets the user
  // nudge the frame bigger/smaller with buttons. 1 = auto-fit size.
  const [sizeAdjust, setSizeAdjust] = useState(1);
  const MIN_SIZE_ADJUST = 0.5;
  const MAX_SIZE_ADJUST = 1.8;
  const handleIncreaseSize = () =>
    setSizeAdjust((s) => Math.min(MAX_SIZE_ADJUST, Math.round((s + 0.1) * 100) / 100));
  const handleDecreaseSize = () =>
    setSizeAdjust((s) => Math.max(MIN_SIZE_ADJUST, Math.round((s - 0.1) * 100) / 100));
  const handleResetSize = () => setSizeAdjust(1);

  // Manual frame position, remembered per interior (each photo needs a
  // different spot — a chair in one room, a console in another — so one
  // shared offset can never work everywhere). Default sits slightly above
  // dead-center since most interior photos have furniture in the lower
  // third — still fully adjustable from there.
  const DEFAULT_POSITION = { x: 0, y: -45 };
  const [framePositions, setFramePositions] = useState({});
  const dragStateRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const POSITION_STEP = 14;
  const getPos = (key) => framePositions[key] || DEFAULT_POSITION;
  const currentPos = getPos(interior);
  const nudgePosition = (dx, dy) => {
    setFramePositions((prev) => {
      const p = prev[interior] || DEFAULT_POSITION;
      return { ...prev, [interior]: { x: p.x + dx, y: p.y + dy } };
    });
  };
  const handleResetPosition = () =>
    setFramePositions((prev) => ({ ...prev, [interior]: DEFAULT_POSITION }));
  const [showPositionPad, setShowPositionPad] = useState(false);

  const handleDragStart = (clientX, clientY) => {
    const p = getPos(interior);
    dragStateRef.current = { startX: clientX, startY: clientY, baseX: p.x, baseY: p.y };
    setIsDragging(true);
  };
  const handleDragMove = (clientX, clientY) => {
    if (!dragStateRef.current) return;
    const { startX, startY, baseX, baseY } = dragStateRef.current;
    setFramePositions((prev) => ({
      ...prev,
      [interior]: { x: baseX + (clientX - startX), y: baseY + (clientY - startY) },
    }));
  };
  const handleDragEnd = () => {
    dragStateRef.current = null;
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEnd();
    const onTouchMove = (e) => {
      if (e.touches.length === 1 && e.touches[0]) handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handleDragEnd();
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, interior]);

  // Pinch-to-zoom — two-finger touch resizes the frame, same underlying
  // sizeAdjust value the +/- buttons use, so they always agree.
  const pinchStateRef = useRef(null);
  const [isPinching, setIsPinching] = useState(false);
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };
  const handlePinchStart = (touches) => {
    pinchStateRef.current = { startDist: getTouchDistance(touches), startSize: sizeAdjust };
    setIsPinching(true);
  };
  const handlePinchMove = (touches) => {
    if (!pinchStateRef.current) return;
    const { startDist, startSize } = pinchStateRef.current;
    const ratio = getTouchDistance(touches) / startDist;
    const next = Math.min(MAX_SIZE_ADJUST, Math.max(MIN_SIZE_ADJUST, Math.round(startSize * ratio * 100) / 100));
    setSizeAdjust(next);
  };
  const handlePinchEnd = () => {
    pinchStateRef.current = null;
    setIsPinching(false);
  };

  useEffect(() => {
    if (!isPinching) return;
    const onTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        handlePinchMove(e.touches);
      }
    };
    const onTouchEnd = (e) => {
      if (e.touches.length < 2) handlePinchEnd();
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isPinching]);
  const cropImgRef = useRef(null);
  const dragInfo = useRef(null);

  // Whether the CURRENTLY SELECTED frame+interior combo exports/shares clean
  // (no watermark). Browsing/selecting anything is always allowed regardless
  // of this value — it only gates the export/share output. Frames pack
  // clears frame-locks; interiors always need Studio specifically.
  const currentFrameLocked = isFramePremium(category, wood) && !(hasFramesUnlock || hasStudioUnlock);
  const currentInteriorLocked =
    exportMode === "with_interior" && !liveCameraOn && isInteriorPremium(interior) && !hasStudioUnlock;
  const hasPremiumAccess = !currentFrameLocked && !currentInteriorLocked;
  const currentCat = loadedCategories[category] || EMPTY_CATEGORY;
  const w = currentCat.frames[wood] || Object.values(currentCat.frames)[0] || PLACEHOLDER_FRAME;
  const mat = MAT_COLORS[matColor];
  const texture = MAT_TEXTURES[matTexture];
  const currentInterior = interiors?.[interior];

  // Real per-category frame profile — this is what makes categories actually
  // different shapes/styles, not just different colors on the same box.
  // Profile now resolves per-FRAME first, category second. This is what lets
  // a single category (e.g. "Popular" or "Wooden") mix genuinely different
  // silhouettes — a thin canvas-float next to a thick ornate double-mat —
  // instead of every frame in a category being forced into one shape.
  // Individual frames can set their own shape/widthScale/cornerRadius/texture
  // in CATEGORIES[...].frames[key]; if they don't, the category default applies.
  const isRoundFrame = (w.shape || currentCat.shape) === "round";
  const effectiveFrameWidth = frameWidth * (w.widthScale ?? currentCat.widthScale ?? 1);
  const frameCornerRadius = isRoundFrame ? "50%" : (w.cornerRadius ?? currentCat.cornerRadius ?? 0);
  const frameTexturePattern = TEXTURE_PATTERNS[w.texture || currentCat.texture] || null;
  // Nine-slice photo frames previously ignored the Frame Width slider
  // entirely — mattInset/cornerSize were baked-in fixed numbers from the
  // asset data. Scale them by the slider (relative to its default of 28)
  // so photo-based frames respond to Frame Width the same as flat-CSS ones.
  const nsScale = frameWidth / 28;
  const dynMattInset = w.nineSlice ? Math.max(8, Math.round(w.nineSlice.mattInset * nsScale)) : null;
  const dynCornerSize = w.nineSlice ? Math.max(dynMattInset, Math.round(w.nineSlice.cornerSize * nsScale)) : null;

  // Artwork slot size — derived from whatever you actually cropped, not a
  // fixed portrait/landscape preset. A fixed preset meant object-cover had
  // to crop AGAIN to force your selection into that shape, silently eating
  // an edge (usually the left/right) even after you'd already cropped
  // correctly. Matching the slot to the real crop aspect means zero
  // additional cropping happens after you hit "Apply Crop".
  const SLOT_MAX_W = 340;
  const SLOT_MAX_H = 420;
  const slotW = artworkAspect >= SLOT_MAX_W / SLOT_MAX_H ? SLOT_MAX_W : SLOT_MAX_H * artworkAspect;
  const slotH = artworkAspect >= SLOT_MAX_W / SLOT_MAX_H ? SLOT_MAX_W / artworkAspect : SLOT_MAX_H;

  // Round frames use a circular opening (diameter = the smaller side) rather
  // than the freeform-crop rectangle — the art is center-cropped to a circle.
  const displaySlotW = isRoundFrame ? Math.min(slotW, slotH) : slotW;
  const displaySlotH = isRoundFrame ? Math.min(slotW, slotH) : slotH;

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reverted from URL.createObjectURL back to base64: object URLs are
    // more memory-efficient, but broke uploads entirely when tested inside
    // Claude's sandboxed artifact preview (same category of restriction as
    // the camera-access block encountered earlier) — the blob: URL never
    // resolved, so the crop modal showed nothing. base64 has no such
    // dependency on the viewing context, so it's the safer default even
    // though it holds the image in memory less efficiently.
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImage(ev.target.result);
      setShowCropModal(true);
      dismissWelcome();
    };
    reader.readAsDataURL(file);
  };

  // Called once the raw image has rendered in the crop modal, so we know its
  // actual displayed size and can start with a generous centered box.
  const initCropRect = () => {
    const imgEl = cropImgRef.current;
    if (!imgEl) return;
    const iw = imgEl.offsetWidth;
    const ih = imgEl.offsetHeight;
    const cw = iw * 0.9;
    const ch = ih * 0.9;
    setCropRect({ x: (iw - cw) / 2, y: (ih - ch) / 2, w: cw, h: ch });
  };

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const MIN_SIZE = 40;

  const startBodyDrag = (clientX, clientY) => {
    dragInfo.current = { type: "move", startX: clientX, startY: clientY, origin: { ...cropRect } };
  };
  const startHandleDrag = (handle) => (clientX, clientY) => {
    dragInfo.current = { type: "resize", handle, startX: clientX, startY: clientY, origin: { ...cropRect } };
  };
  const onDragMove = (clientX, clientY) => {
    const info = dragInfo.current;
    if (!info) return;
    const imgEl = cropImgRef.current;
    if (!imgEl) return;
    const iw = imgEl.offsetWidth;
    const ih = imgEl.offsetHeight;
    const dx = clientX - info.startX;
    const dy = clientY - info.startY;
    const o = info.origin;

    if (info.type === "move") {
      const newX = clamp(o.x + dx, 0, iw - o.w);
      const newY = clamp(o.y + dy, 0, ih - o.h);
      setCropRect({ x: newX, y: newY, w: o.w, h: o.h });
      return;
    }

    // Freeform resize — each handle only touches the side(s) it's on.
    let { x, y, w: rw, h: rh } = o;
    const has = (s) => info.handle.includes(s);
    if (has("l")) {
      const newX = clamp(o.x + dx, 0, o.x + o.w - MIN_SIZE);
      rw = o.x + o.w - newX;
      x = newX;
    }
    if (has("r")) {
      rw = clamp(o.w + dx, MIN_SIZE, iw - o.x);
    }
    if (has("t")) {
      const newY = clamp(o.y + dy, 0, o.y + o.h - MIN_SIZE);
      rh = o.y + o.h - newY;
      y = newY;
    }
    if (has("b")) {
      rh = clamp(o.h + dy, MIN_SIZE, ih - o.y);
    }
    setCropRect({ x, y, w: rw, h: rh });
  };
  const endDrag = () => {
    dragInfo.current = null;
  };

  const applyCrop = () => {
    const imgEl = cropImgRef.current;
    if (!imgEl) return;
    const scaleToNatural = imgEl.naturalWidth / imgEl.offsetWidth;
    const srcX = cropRect.x * scaleToNatural;
    const srcY = cropRect.y * scaleToNatural;
    const srcW = cropRect.w * scaleToNatural;
    const srcH = cropRect.h * scaleToNatural;
    // Output preserves the crop's own natural proportions — no forced
    // stretch to a fixed ratio. object-cover in the frame slot then fits it.
    const outW = 800;
    const outH = outW * (srcH / srcW);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
    setImage(canvas.toDataURL("image/png"));
    setArtworkAspect(srcW / srcH); // slot now matches this exactly — no re-crop
    setShowCropModal(false);
  };

  const handleFrameClick = (key) => {
    // Browsing/previewing every frame is always free — only exporting or
    // sharing a locked one (checked via hasPremiumAccess at export time)
    // requires unlocking. Selection itself is never blocked.
    setWood(key);
  };

  const [isExporting, setIsExporting] = useState(false);

  // Loads a data-URL/URL into an Image, resolving once it's ready to draw.
  const loadImg = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // Draws `img` into (x,y,w,h) using the same crop/scale behavior as CSS
  // `background-size:cover` / `object-fit:cover` — fill the box, crop
  // whichever dimension overflows, centered.
  const drawCover = (ctx, img, x, y, w, h) => {
    const iw = img.videoWidth || img.width;
    const ih = img.videoHeight || img.height;
    const srcRatio = iw / ih;
    const boxRatio = w / h;
    let sx, sy, sw, sh;
    if (srcRatio > boxRatio) {
      sh = ih;
      sw = sh * boxRatio;
      sx = (iw - sw) / 2;
      sy = 0;
    } else {
      sw = iw;
      sh = sw / boxRatio;
      sx = 0;
      sy = (ih - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  };

  // Manual re-composite of the frame preview onto a canvas — no DOM
  // screenshot library involved (html2canvas and similar aren't available
  // in this sandbox). This mirrors the same box model the live CSS
  // preview uses (see NineSliceFrame / the frame render branch below), but
  // it's a simplified re-draw: fine details like the grain-noise overlay,
  // mitred-corner highlight lines, and the mat's inset bevel shadow are
  // left out. Colors, textures, and proportions should still match closely.
  const renderExportCanvas = async () => {
    const [rw, rh] = EXPORT_FORMATS[exportFormat].ratio.split("/").map((n) => parseFloat(n));
      const targetW = 1080;
      const targetH = Math.round((targetW * rh) / rw);
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");

      // --- Interior background (letterboxed, not cropped, so the whole
      // room + frame composition survives regardless of export ratio) ---
      const pcW = captureRef.current.offsetWidth || 900;
      const pcH = captureRef.current.offsetHeight || 1125;
      const previewScaleToCanvas = Math.min(targetW / pcW, targetH / pcH);
      const drawnW = pcW * previewScaleToCanvas;
      const drawnH = pcH * previewScaleToCanvas;
      const originX = (targetW - drawnW) / 2;
      const originY = (targetH - drawnH) / 2;

      ctx.fillStyle = "#f5f4f0";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.save();
      ctx.translate(originX, originY);
      ctx.scale(previewScaleToCanvas, previewScaleToCanvas);
      ctx.beginPath();
      ctx.rect(0, 0, pcW, pcH);
      ctx.clip();

      if (exportMode === "with_interior" && liveCameraOn && videoRef.current && videoRef.current.videoWidth) {
        drawCover(ctx, videoRef.current, 0, 0, pcW, pcH);
      } else if (exportMode === "with_interior" && currentInterior?.img) {
        const bg = await loadImg(currentInterior.img);
        drawCover(ctx, bg, 0, 0, pcW, pcH);
      } else if (exportMode === "with_interior") {
        ctx.fillStyle = "#DCD6CC";
        ctx.fillRect(0, 0, pcW, pcH);
      } else {
        // "frame_only" — plain white behind the frame; this whole canvas
        // gets cropped tightly around just the frame further below, so the
        // room-sized canvas here is only scratch space, not the final output.
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, pcW, pcH);
      }

      // --- Frame box model (matches the live layout math, computed
      // directly instead of measured from the DOM) ---
      const accentPad = w.accentColor ? Math.max(4, effectiveFrameWidth * 0.08) : 3;
      const stackW = displaySlotW + accentPad * 2 + matWidth * 2;
      const stackH = displaySlotH + accentPad * 2 + matWidth * 2;
      // Use the actual rendered size of the frame instead of re-deriving it
      // from the style formulas above — that derivation didn't match the
      // real layout (this is what caused the frame to render wildly
      // oversized/cropped in earlier exports). Measuring it directly
      // guarantees it agrees with `previewScale`, which was itself
      // calculated from this exact same measurement.
      const measuredW = frameContentRef.current?.offsetWidth;
      const measuredH = frameContentRef.current?.offsetHeight;
      const contentW = measuredW || (w.nineSlice ? stackW + dynMattInset * 2 : stackW + 2 * (1.18 * effectiveFrameWidth));
      const contentH = measuredH || (w.nineSlice ? stackH + dynMattInset * 2 : stackH + 2 * (1.18 * effectiveFrameWidth));

      const effScale = previewScale * sizeAdjust;
      const frameX = (pcW - contentW * effScale) / 2 + currentPos.x;
      const frameY = (pcH - contentH * effScale) / 2 + currentPos.y;

      ctx.save();
      ctx.translate(frameX, frameY);
      ctx.scale(effScale, effScale);

      // Soft drop shadow under the whole frame
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 14;
      ctx.fillStyle = "rgba(0,0,0,0.001)"; // shadow-only pass
      ctx.fillRect(0, 0, contentW, contentH);
      ctx.restore();

      if (w.nineSlice) {
        const mattInset = dynMattInset;
        const cornerSize = dynCornerSize;
        const [edgeImg, tlImg, trImg, blImg, brImg, edgeVImg] = await Promise.all([
          loadImg(w.nineSlice.edge),
          loadImg(w.nineSlice.tl),
          loadImg(w.nineSlice.tr),
          loadImg(w.nineSlice.bl),
          loadImg(w.nineSlice.br),
          w.nineSlice.edgeVertical ? loadImg(w.nineSlice.edgeVertical) : Promise.resolve(null),
        ]);
        // Top / bottom edges (stretched to fill — a simplification of the
        // live version's repeat-tile option, but visually close)
        ctx.drawImage(edgeImg, 0, 0, contentW, mattInset);
        ctx.save();
        ctx.translate(0, contentH);
        ctx.scale(1, -1);
        ctx.drawImage(edgeImg, 0, 0, contentW, mattInset);
        ctx.restore();
        if (edgeVImg) {
          // Dedicated vertical-edge photo — draw directly, no rotation.
          ctx.drawImage(edgeVImg, 0, 0, mattInset, contentH);
          ctx.save();
          ctx.translate(contentW, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(edgeVImg, 0, 0, mattInset, contentH);
          ctx.restore();
        } else {
          // Left edge (rotated 90°)
          ctx.save();
          ctx.translate(mattInset, 0);
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(edgeImg, 0, 0, contentH, mattInset);
          ctx.restore();
          // Right edge (rotated 90°, mirrored)
          ctx.save();
          ctx.translate(contentW, 0);
          ctx.rotate(Math.PI / 2);
          ctx.scale(1, -1);
          ctx.drawImage(edgeImg, 0, 0, contentH, mattInset);
          ctx.restore();
        }
        // Corners
        ctx.drawImage(tlImg, 0, 0, cornerSize, cornerSize);
        ctx.drawImage(trImg, contentW - cornerSize, 0, cornerSize, cornerSize);
        ctx.drawImage(blImg, 0, contentH - cornerSize, cornerSize, cornerSize);
        ctx.drawImage(brImg, contentW - cornerSize, contentH - cornerSize, cornerSize, cornerSize);
      } else {
        // CSS-gradient frame — approximate the radial lighting gradient
        // with a simple linear one from highlight to shadow tone.
        const grad = ctx.createLinearGradient(0, 0, contentW, contentH);
        grad.addColorStop(0, w.hi || w.base);
        grad.addColorStop(0.5, w.base);
        grad.addColorStop(1, w.lo || w.base);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, contentW, contentH);
      }

      // Accent band + mat + artwork, inset from the outer border
      const stackX = contentW / 2 - stackW / 2;
      const stackY = contentH / 2 - stackH / 2;
      ctx.fillStyle = w.accentColor || w.lo || w.base;
      ctx.fillRect(stackX, stackY, stackW, stackH);

      const matX = stackX + accentPad;
      const matY = stackY + accentPad;
      const matW = stackW - accentPad * 2;
      const matH = stackH - accentPad * 2;
      const matGrad = ctx.createLinearGradient(matX, matY, matX, matY + matH);
      matGrad.addColorStop(0, mat.top);
      matGrad.addColorStop(1, mat.bottom);
      ctx.fillStyle = matGrad;
      ctx.fillRect(matX, matY, matW, matH);

      // Artwork
      const artX = matX + matWidth;
      const artY = matY + matWidth;
      const artImg = await loadImg(image);
      ctx.save();
      if (isRoundFrame) {
        ctx.beginPath();
        ctx.arc(artX + displaySlotW / 2, artY + displaySlotH / 2, Math.min(displaySlotW, displaySlotH) / 2, 0, Math.PI * 2);
        ctx.clip();
      }
      drawCover(ctx, artImg, artX, artY, displaySlotW, displaySlotH);
      ctx.restore();

      ctx.restore(); // frame transform
      ctx.restore(); // background clip/scale

      // Watermark the actual exported pixels (not just the live preview) —
      // otherwise a locked frame/interior could still be exported clean by
      // just hitting Export, defeating the whole free/paid split.
      if (!hasPremiumAccess) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((-32 * Math.PI) / 180);
        ctx.font = `bold ${Math.max(14, canvas.width / 40)}px sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.32)";
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 1;
        ctx.textAlign = "center";
        const step = Math.max(60, canvas.width / 8);
        for (let row = -3; row <= 3; row++) {
          for (let col = -3; col <= 3; col++) {
            const x = col * step * 1.8;
            const y = row * step;
            ctx.strokeText("FRAMETTA", x, y);
            ctx.fillText("FRAMETTA", x, y);
          }
        }
        ctx.restore();
      }

      if (exportMode === "frame_only") {
        // Map the frame's box (known in pcW/pcH space) into this canvas's
        // pixel space using the same originX/originY/previewScaleToCanvas
        // used to draw everything above, then crop tightly around it —
        // padded enough to keep the drop shadow from getting clipped.
        const padding = 48;
        const canvasFrameX = originX + frameX * previewScaleToCanvas;
        const canvasFrameY = originY + frameY * previewScaleToCanvas;
        const canvasFrameW = contentW * effScale * previewScaleToCanvas;
        const canvasFrameH = contentH * effScale * previewScaleToCanvas;

        const cropX = Math.max(0, canvasFrameX - padding);
        const cropY = Math.max(0, canvasFrameY - padding);
        const cropW = Math.min(canvas.width - cropX, canvasFrameW + padding * 2);
        const cropH = Math.min(canvas.height - cropY, canvasFrameH + padding * 2);

        const tight = document.createElement("canvas");
        tight.width = Math.round(cropW);
        tight.height = Math.round(cropH);
        const tctx = tight.getContext("2d");
        tctx.fillStyle = "#FFFFFF";
        tctx.fillRect(0, 0, tight.width, tight.height);
        tctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        return tight;
      }

      return canvas;
  };

  const [exportPreviewUrl, setExportPreviewUrl] = useState(null);
  const [exportPreviewExt, setExportPreviewExt] = useState("png");

  // Instead of trying to trigger a browser download or the native share
  // sheet — both of which this sandboxed preview blocks — just render the
  // finished image and show it on screen. Long-pressing an image to save
  // or share it is a plain OS gesture that works the same everywhere,
  // with no special browser permission involved.
  const handleGenerateExport = async () => {
    if (!image) {
      showToast("Upload artwork or try the sample first");
      setActiveSheet("export");
      return;
    }
    setIsExporting(true);
    try {
      const canvas = await renderExportCanvas();
      const mime = exportMime === "jpeg" ? "image/jpeg" : "image/png";
      const ext = exportMime === "jpeg" ? "jpg" : "png";
      setExportPreviewUrl(canvas.toDataURL(mime, exportMime === "jpeg" ? 0.92 : undefined));
      setExportPreviewExt(ext);
    } catch (err) {
      console.error("Export failed", err);
      showToast("Export failed — try again in a moment");
    } finally {
      setIsExporting(false);
    }
  };


  // Dynamically size the frame to fill the available preview width/height —
  // as large as possible, never clipped. transform:scale doesn't affect
  // offsetWidth/offsetHeight, so we can read the frame's true unscaled size
  // even while a previous scale is still applied, and re-measure whenever
  // anything that changes the frame's shape/size changes.
  useEffect(() => {
    const measure = () => {
      const content = frameContentRef.current;
      const container = captureRef.current;
      if (!content || !container) return;
      const contentW = content.offsetWidth;
      const contentH = content.offsetHeight;
      const containerW = container.clientWidth;
      const containerH = container.clientHeight;
      if (!contentW || !contentH || !containerW || !containerH) return;
      const fitScale = Math.min((containerW * 0.58) / contentW, (containerH * 0.58) / contentH, 1);
      setPreviewScale(fitScale);
    };
    measure();
    window.addEventListener("resize", measure);
    // NineSliceFrame sizes itself asynchronously (its own internal
    // ResizeObserver, starting from {w:0, h:0} and growing to its real size
    // a beat after mount). If this effect's very first `measure()` call
    // lands before that settles, it reads a near-zero contentW/H, which
    // divides into a huge ratio that the `Math.min(..., 1)` cap turns into
    // "no scale down at all" — previewScale gets stuck at 1 and never
    // recovers, since nothing in the deps list below changes again on a
    // fresh page load. That's what made the frame open zoomed past the
    // edges of the screen. Watching the content node directly re-measures
    // the instant its real size lands, regardless of why it changed.
    const ro = frameContentRef.current ? new ResizeObserver(measure) : null;
    if (ro && frameContentRef.current) ro.observe(frameContentRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      if (ro) ro.disconnect();
    };
  }, [frameWidth, matWidth, wood, category, slotW, slotH, interior]);

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden font-sans">
      {/* Floating top bar — transparent gradient over the canvas instead of
          a static header pushing it down. */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 pb-8 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)" }}
      >
        <p className="text-white/80 text-xs tracking-[0.25em] uppercase font-medium pointer-events-auto">Frametta</p>
        <div className="flex items-center gap-2 pointer-events-auto">
          {!hasPremiumAccess && (
            <button
              onClick={() => setShowPaywall(true)}
              className="h-8 px-3 rounded-full bg-amber-500/90 text-white text-xs font-medium flex items-center gap-1 active:scale-95 transition"
            >
              <Lock size={12} /> Unlock
            </button>
          )}
          <label
            htmlFor="artwork-upload-input"
            title="Upload / change art"
            className="h-8 w-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white/90 active:scale-95 transition cursor-pointer"
          >
            <Upload size={14} />
          </label>
          <button
            onClick={handleGenerateExport}
            disabled={isExporting}
            className="h-8 px-4 rounded-full bg-white text-black text-xs font-medium flex items-center gap-1.5 active:scale-95 transition disabled:opacity-60"
          >
            <Download size={13} /> {isExporting ? "…" : "Save"}
          </button>
        </div>
      </div>

      {/* PREVIEW — frame composited over real interior photo.
          The frame now sizes itself dynamically to fill the available width
          as large as possible without ever clipping — no more fixed 50%
          shrink that could make it look small like the old app did. */}
      <div
        ref={captureRef}
        className="absolute inset-0 overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: !liveCameraOn && currentInterior?.img ? `url(${currentInterior.img})` : undefined,
          backgroundColor: !liveCameraOn && !currentInterior?.img ? "#0a0d0b" : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          // When a sheet is open, shift the (unchanged-size) artwork up into
          // the space that stays clear above it, instead of letting it sit
          // centered on the whole screen and get covered by the sheet.
          paddingBottom: activeSheet ? "calc(42vh + 84px)" : 0,
          transition: "padding-bottom 300ms ease-out",
        }}
      >
        {liveCameraOn && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoWidth && v.videoHeight) {
                setLiveCameraAspect(v.videoWidth / v.videoHeight);
              }
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        {liveCameraError && (
          <div
            className="absolute inset-0 flex items-center justify-center text-center p-6 text-sm text-white"
            style={{ background: "rgba(0,0,0,0.75)", zIndex: 5 }}
          >
            {liveCameraError}
          </div>
        )}
        <div
          ref={frameContentRef}
          className="relative"
          onMouseDown={(e) => {
            e.preventDefault();
            handleDragStart(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 2) {
              e.preventDefault();
              handlePinchStart(e.touches);
            } else if (e.touches[0]) {
              handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          style={{
            perspective: "1600px",
            transform: `translate(${currentPos.x}px, ${currentPos.y}px) scale(${previewScale * sizeAdjust})`,
            transformOrigin: "center",
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          {/* SVG grain filter — genuine randomized noise (feTurbulence),
              not a repeating pattern. Reused by the grain overlay below. */}
          <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
            <filter id="frameGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise" />
              <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0" />
            </filter>
          </svg>
          <div
            className="absolute"
            style={{
              inset: "-6px -6px -22px -6px",
              borderRadius: frameCornerRadius,
              background: "radial-gradient(60% 80% at 50% 100%, rgba(0,0,0,0.35), rgba(0,0,0,0) 70%)",
              filter: "blur(14px)",
              transform: "translateY(14px) scaleX(0.96)",
            }}
          />
{w.nineSlice ? (
            <NineSliceFrame
              tl={w.nineSlice.tl}
              tr={w.nineSlice.tr}
              bl={w.nineSlice.bl}
              br={w.nineSlice.br}
              edge={w.nineSlice.edge}
              edgeVertical={w.nineSlice.edgeVertical}
              cornerSize={dynCornerSize}
              mattInset={dynMattInset}
              tileMode={w.nineSliceTileMode || "repeat"}
            >
              <div
                style={{
                  // A few reference frames have a thin contrasting reveal
                  // line here (gold or black) between the wood and the mat —
                  // w.accentColor turns this into a flat accent band. For all
                  // other nine-slice frames, the real photographed corner/edge
                  // already IS the frame surface right up to the mat, so we
                  // must NOT draw another synthetic color ring here — doing so
                  // created a visible extra "step" between the true frame
                  // photo and the mat (very obvious on thin Acrylic frames).
                  padding: w.accentColor ? Math.max(4, effectiveFrameWidth * 0.08) : 0,
                  borderRadius: frameCornerRadius,
                  background: w.accentColor || "transparent",
                  boxShadow: w.accentColor ? "inset 0 1px 2px rgba(0,0,0,0.6)" : "none",
                }}
              >
                <div
                  style={{
                    padding: matWidth,
                    borderRadius: frameCornerRadius,
                    background: `linear-gradient(160deg, ${mat.top} 0%, ${mat.bottom} 100%)`,
                    backgroundImage:
                      texture.overlay !== "none"
                        ? `${texture.overlay}, linear-gradient(160deg, ${mat.top} 0%, ${mat.bottom} 100%)`
                        : undefined,
                    // Added a crisp bright/dark pair right at the inner edge —
                    // this is the mat's blade-cut bevel catching light.
                    boxShadow:
                      "inset 0 3px 10px rgba(0,0,0,0.18), inset 0 -1px 2px rgba(255,255,255,0.6), inset 0 0 0 1px rgba(255,255,255,0.45)",
                  }}
                >
                  <div
                    className="relative overflow-hidden bg-neutral-300 flex items-center justify-center"
                    style={{
                      borderRadius: frameCornerRadius,
                      boxShadow: borderLine
                        ? "inset 0 0 0 1.5px rgba(0,0,0,0.35), inset 0 2px 6px rgba(0,0,0,0.5)"
                        : "inset 0 2px 6px rgba(0,0,0,0.5)",
                      width: displaySlotW,
                      height: displaySlotH,
                    }}
                  >
                    {image ? (
                      <img src={image} alt="artwork" className="w-full h-full object-cover" style={{ filter: "saturate(1.03) contrast(1.02)" }} />
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-4 text-center">
                        <label
                          htmlFor="artwork-upload-input"
                          className="flex flex-col items-center gap-2 text-neutral-500 hover:text-neutral-700 transition cursor-pointer"
                        >
                          <Upload size={26} />
                          <span className="text-sm">Upload your artwork</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleLoadSampleArtwork}
                          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition"
                        >
                          <Sparkles size={12} /> Try sample art
                        </button>
                      </div>
                    )}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(120deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 18%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.06) 78%, rgba(255,255,255,0.14) 100%)",
                      }}
                    />
                    {image && !hasPremiumAccess && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none">
                        <div style={{ transform: "rotate(-32deg)", display: "flex", flexDirection: "column", gap: "30px", opacity: 0.28 }}>
                          {Array.from({ length: 5 }).map((_, row) => (
                            <div key={row} style={{ display: "flex", gap: "30px" }}>
                              {Array.from({ length: 3 }).map((_, col) => (
                                <span key={col} className="text-white text-xs font-semibold tracking-widest whitespace-nowrap" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
                                  FRAMETTA
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </NineSliceFrame>
          ) : (
          <div
            className="relative shadow-2xl"
            style={{
              padding: effectiveFrameWidth * 0.18,
              borderRadius: frameCornerRadius,
              // Directional lighting: light source off-center (top-left-ish)
              // instead of a flat diagonal band — real molding catches light
              // unevenly, not in a perfectly even gradient stripe.
              background: `radial-gradient(140% 160% at 20% 10%, ${w.base} 0%, ${w.lo} 65%, ${w.lo} 100%)`,
              boxShadow: "0 18px 40px -12px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="relative"
              style={{
                padding: effectiveFrameWidth,
                borderRadius: frameCornerRadius,
                // Proof of concept: when a frame has a real photoTexture, use
                // the actual photo as the base instead of a painted gradient.
                // Everything else (miter seams, grain, lighting) still layers
                // on top the same way, whether the base is a photo or CSS.
                backgroundImage: w.photoTexture
                  ? `url(${w.photoTexture})`
                  : frameTexturePattern
                  ? `${frameTexturePattern}, radial-gradient(150% 170% at 22% 12%, ${w.hi} 0%, ${w.base} 45%, ${w.lo} 100%)`
                  : `radial-gradient(150% 170% at 22% 12%, ${w.hi} 0%, ${w.base} 45%, ${w.lo} 100%)`,
                backgroundSize: w.photoTexture ? "cover" : undefined,
                backgroundPosition: w.photoTexture ? "center" : undefined,
                boxShadow: "inset 0 2px 3px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(0,0,0,0.4)",
                overflow: "hidden",
              }}
            >
              {/* Color tint over the real photo — ties it to the frame's
                  chosen tone/finish without hiding the actual grain. Only
                  applied when using a real photo texture. */}
              {w.photoTexture && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: w.base, opacity: 0.28, mixBlendMode: "multiply" }}
                />
              )}
              {/* Genuine noise grain, blended over the molding color */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ filter: "url(#frameGrain)", opacity: 0.12, mixBlendMode: "overlay" }}
              />
              {/* Mitered corner seams — a real frame's corners are a 45°
                  diagonal joint, not a flat L overlap. */}
              {effectiveFrameWidth > 0 && (
                <>
                  <div className="absolute pointer-events-none" style={{ top: 0, left: 0, width: effectiveFrameWidth, height: effectiveFrameWidth, backgroundImage: "linear-gradient(135deg, transparent calc(50% - 1px), rgba(0,0,0,0.4) 50%, rgba(255,255,255,0.15) calc(50% + 1px), transparent calc(50% + 2px))" }} />
                  <div className="absolute pointer-events-none" style={{ top: 0, right: 0, width: effectiveFrameWidth, height: effectiveFrameWidth, backgroundImage: "linear-gradient(45deg, transparent calc(50% - 1px), rgba(0,0,0,0.4) 50%, rgba(255,255,255,0.15) calc(50% + 1px), transparent calc(50% + 2px))" }} />
                  <div className="absolute pointer-events-none" style={{ bottom: 0, left: 0, width: effectiveFrameWidth, height: effectiveFrameWidth, backgroundImage: "linear-gradient(45deg, transparent calc(50% - 1px), rgba(0,0,0,0.4) 50%, rgba(255,255,255,0.15) calc(50% + 1px), transparent calc(50% + 2px))" }} />
                  <div className="absolute pointer-events-none" style={{ bottom: 0, right: 0, width: effectiveFrameWidth, height: effectiveFrameWidth, backgroundImage: "linear-gradient(135deg, transparent calc(50% - 1px), rgba(0,0,0,0.4) 50%, rgba(255,255,255,0.15) calc(50% + 1px), transparent calc(50% + 2px))" }} />
                </>
              )}
              <div
                style={{
                  // A few reference frames have a thin contrasting reveal
                  // line here (gold or black) between the wood and the mat —
                  // w.accentColor turns this into a flat accent band instead
                  // of just a darker shade of the same wood. This band's
                  // thickness now scales with the frame's own actual width
                  // instead of a flat 3px — a fixed 3px reads as a whole
                  // extra "step" on very thin frames (e.g. Acrylic at 0.35x
                  // scale) even though it's barely noticeable on thick wood.
                  padding: w.accentColor ? Math.max(4, effectiveFrameWidth * 0.08) : Math.max(1, effectiveFrameWidth * 0.08),
                  borderRadius: frameCornerRadius,
                  background: w.accentColor || `linear-gradient(115deg, ${w.hi}, ${w.lo})`,
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)",
                }}
              >
                <div
                  style={{
                    padding: matWidth,
                    borderRadius: frameCornerRadius,
                    background: `linear-gradient(160deg, ${mat.top} 0%, ${mat.bottom} 100%)`,
                    backgroundImage:
                      texture.overlay !== "none"
                        ? `${texture.overlay}, linear-gradient(160deg, ${mat.top} 0%, ${mat.bottom} 100%)`
                        : undefined,
                    // Added a crisp bright/dark pair right at the inner edge —
                    // this is the mat's blade-cut bevel catching light.
                    boxShadow:
                      "inset 0 3px 10px rgba(0,0,0,0.18), inset 0 -1px 2px rgba(255,255,255,0.6), inset 0 0 0 1px rgba(255,255,255,0.45)",
                  }}
                >
                  <div
                    className="relative overflow-hidden bg-neutral-300 flex items-center justify-center"
                    style={{
                      borderRadius: frameCornerRadius,
                      boxShadow: borderLine
                        ? "inset 0 0 0 1.5px rgba(0,0,0,0.35), inset 0 2px 6px rgba(0,0,0,0.5)"
                        : "inset 0 2px 6px rgba(0,0,0,0.5)",
                      width: displaySlotW,
                      height: displaySlotH,
                    }}
                  >
                    {image ? (
                      <img src={image} alt="artwork" className="w-full h-full object-cover" style={{ filter: "saturate(1.03) contrast(1.02)" }} />
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-4 text-center">
                        <label
                          htmlFor="artwork-upload-input"
                          className="flex flex-col items-center gap-2 text-neutral-500 hover:text-neutral-700 transition cursor-pointer"
                        >
                          <Upload size={26} />
                          <span className="text-sm">Upload your artwork</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleLoadSampleArtwork}
                          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition"
                        >
                          <Sparkles size={12} /> Try sample art
                        </button>
                      </div>
                    )}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(120deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 18%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.06) 78%, rgba(255,255,255,0.14) 100%)",
                      }}
                    />
                    {image && !hasPremiumAccess && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none">
                        <div style={{ transform: "rotate(-32deg)", display: "flex", flexDirection: "column", gap: "30px", opacity: 0.28 }}>
                          {Array.from({ length: 5 }).map((_, row) => (
                            <div key={row} style={{ display: "flex", gap: "30px" }}>
                              {Array.from({ length: 3 }).map((_, col) => (
                                <span key={col} className="text-white text-xs font-semibold tracking-widest whitespace-nowrap" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
                                  FRAMETTA
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
        {/* Frame position controls — collapsed to a small toggle by default
            so it doesn't sit on top of the preview; drag works either way,
            the pad is just for precise nudging. Position is remembered per
            interior since each photo needs a different spot. */}
        {showPositionPad ? (
          <div
            className="absolute left-3 flex flex-col items-center gap-1 bg-white/90 backdrop-blur rounded-xl shadow-md p-1.5"
            style={{ top: "64px" }}
          >
            <div className="flex items-center justify-between w-full pb-0.5 px-0.5">
              <span className="flex items-center gap-1 text-neutral-400 text-[10px] font-medium">
                <Move size={11} /> Nudge
              </span>
              <button
                onClick={() => setShowPositionPad(false)}
                title="Hide"
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X size={12} />
              </button>
            </div>
            <button
              onClick={() => nudgePosition(0, -POSITION_STEP)}
              title="Move up"
              className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition"
            >
              <ArrowUp size={14} />
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => nudgePosition(-POSITION_STEP, 0)}
                title="Move left"
                className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition"
              >
                <ArrowLeft size={14} />
              </button>
              <button
                onClick={handleResetPosition}
                title="Reset position"
                disabled={currentPos.x === DEFAULT_POSITION.x && currentPos.y === DEFAULT_POSITION.y}
                className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 disabled:hover:bg-transparent transition"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onClick={() => nudgePosition(POSITION_STEP, 0)}
                title="Move right"
                className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition"
              >
                <ArrowRight size={14} />
              </button>
            </div>
            <button
              onClick={() => nudgePosition(0, POSITION_STEP)}
              title="Move down"
              className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 transition"
            >
              <ArrowDown size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPositionPad(true)}
            title="Nudge frame position"
            className="absolute left-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur text-neutral-500 hover:bg-white hover:text-neutral-700 shadow-sm transition"
            style={{ top: "64px" }}
          >
            <Move size={14} />
          </button>
        )}
        {/* Frame size controls — adjust on top of the auto-fit scale.
            Positioned above the floating bottom nav's ~84px footprint
            (previously bottom-3, from before that nav existed — collided
            with it once the nav was added). */}
        <div
          className="absolute right-3 flex items-center gap-1 bg-white/90 backdrop-blur rounded-full shadow-md px-1.5 py-1.5"
          style={{ bottom: "100px" }}
        >
          <button
            onClick={handleDecreaseSize}
            disabled={sizeAdjust <= MIN_SIZE_ADJUST}
            title="Decrease frame size"
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-medium text-neutral-500 w-10 text-center tabular-nums">
            {Math.round(sizeAdjust * 100)}%
          </span>
          <button
            onClick={handleIncreaseSize}
            disabled={sizeAdjust >= MAX_SIZE_ADJUST}
            title="Increase frame size"
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <ZoomIn size={16} />
          </button>
          {sizeAdjust !== 1 && (
            <button
              onClick={handleResetSize}
              title="Reset to auto size"
              className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Sheet backdrop — tap outside to collapse */}
      {activeSheet && (
        <div
          className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[1px]"
          onClick={() => setActiveSheet(null)}
        />
      )}

      {/* Bottom sheet — slides up over the canvas instead of pushing it.
          Content swaps per tab; every row inside scrolls horizontally with
          scroll-snap so nothing sits half-cut-off requiring a second nudge. */}
      <div
        className="absolute left-0 right-0 z-30 bg-[#12140f] rounded-t-2xl transition-transform duration-300 ease-out text-white"
        style={{
          transform: activeSheet ? "translateY(0)" : "translateY(calc(100% + 84px))",
          // Stops short of the floating nav bar (which sits ~84px above the
          // screen bottom) instead of extending to bottom:0 and relying on
          // internal padding to avoid the nav — that padding-based approach
          // only reserves clearance if it isn't scrolled past, so it broke
          // as soon as a tab (e.g. Frames, with its category row + Recent
          // row + swatch row) had enough content to fill the visible area.
          // A hard `bottom` offset makes the overlap structurally impossible
          // no matter how much content a tab has.
          bottom: "84px",
          maxHeight: "42vh",
          overflowY: "auto",
        }}
      >
        <div className="flex justify-center pt-2.5 pb-1 sticky top-0 bg-[#12140f] z-10">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>

        {activeSheet === "frames" && (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {/* Category selector — sticky within the sheet so switching
                category doesn't mean closing/reopening the sheet. */}
            <div className="sticky top-3 z-10 bg-[#12140f] pb-1">
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x [&>*]:snap-start">
                {CATEGORY_KEYS.map((key) => {
                  const cat = CATEGORY_INDEX[key];
                  return (
                  <button
                    key={key}
                    onClick={() => {
                      if (cat.status !== "ready") return;
                      setCategory(key);
                      cat.loader().then((mod) => {
                        const data = mod.default;
                        setLoadedCategories((prev) => ({ ...prev, [key]: data }));
                        const firstKey = Object.keys(data.frames)[0];
                        if (firstKey) setWood(firstKey);
                      });
                    }}
                    disabled={cat.status !== "ready"}
                    className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
                      category === key ? "bg-white text-black border-white" : "border-white/20 text-white/60"
                    } ${cat.status !== "ready" ? "opacity-40 cursor-not-allowed" : "hover:border-white/50"}`}
                  >
                    {cat.label}
                    {cat.status !== "ready" && " (soon)"}
                  </button>
                  );
                })}
              </div>
            </div>

            {/* Frame swatches for the current category — the selected one is
                sorted to the front so it's always at the start of the row,
                not wherever it happens to sit alphabetically. */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wide text-white/40 font-medium">{currentCat.label} Frames</label>
              {!loadedCategories[category] ? (
                <p className="text-xs text-white/40 py-4">Loading frames…</p>
              ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 snap-x [&>*]:snap-start">
                {Object.entries(currentCat.frames)
                  .sort(([keyA], [keyB]) => (keyA === wood ? -1 : keyB === wood ? 1 : 0))
                  .map(([key, val]) => {
                    const isRound = (val.shape || currentCat.shape) === "round";
                    const thickness = Math.round(Math.min(28, Math.max(4, 16 * (val.widthScale ?? currentCat.widthScale ?? 1))));
                    const texturePattern = TEXTURE_PATTERNS[val.texture || currentCat.texture] || null;
                    const gradientBg = `linear-gradient(135deg, ${val.hi}, ${val.base} 55%, ${val.lo})`;
                    const swatchBg = val.photoTexture
                      ? `url(${val.photoTexture})`
                      : texturePattern
                      ? `${texturePattern}, ${gradientBg}`
                      : gradientBg;
                    const selected = wood === key;
                    const locked = isFramePremium(category, key) && !(hasFramesUnlock || hasStudioUnlock);
                    return (
                      <button
                        key={key}
                        onClick={() => handleFrameClick(key)}
                        title={locked ? `${val.label} (Premium)` : val.label}
                        className={`relative w-14 h-14 shrink-0 transition ${selected ? "scale-110" : ""}`}
                        style={{
                          borderRadius: isRound ? "50%" : Math.min(val.cornerRadius ?? currentCat.cornerRadius ?? 0, 10),
                          boxShadow: selected ? "0 0 0 2px #34d399" : "0 0 0 1px rgba(255,255,255,0.15)",
                          overflow: "hidden",
                          background: "#A9A398",
                        }}
                      >
                        {val.nineSlice ? (
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `url(${val.nineSlice.tl})`,
                              backgroundSize: "180%",
                              backgroundPosition: "top left",
                              backgroundRepeat: "no-repeat",
                            }}
                          />
                        ) : val.photoTexture ? (
                          <div
                            className="absolute inset-0"
                            style={{ backgroundImage: swatchBg, backgroundSize: "cover", backgroundPosition: "center" }}
                          />
                        ) : isRound ? (
                          <>
                            <div className="absolute inset-0 rounded-full" style={{ backgroundImage: swatchBg }} />
                            <div className="absolute rounded-full" style={{ inset: thickness, background: "#A9A398" }} />
                          </>
                        ) : (
                          <>
                            <div className="absolute top-0 left-0 right-0" style={{ height: thickness, backgroundImage: swatchBg }} />
                            <div className="absolute top-0 left-0 bottom-0" style={{ width: thickness, backgroundImage: swatchBg }} />
                          </>
                        )}
                        {locked && (
                          <span className="absolute bottom-1 right-1 bg-black rounded-full p-0.5 z-10">
                            <Lock size={9} color="white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
              )}
            </div>
          </div>
        )}

        {activeSheet === "interiors" && (
          <div className="flex flex-col gap-1.5 px-4 pb-4">
            <label className="text-[10px] uppercase tracking-wide text-white/40 font-medium">Interior Setting</label>
            <div className="flex gap-2 overflow-x-auto pb-1 snap-x [&>*]:snap-start">
              <button
                onClick={() => (liveCameraOn ? stopLiveCamera() : startLiveCamera())}
                title="Point your camera at your wall and preview the frame live"
                className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden transition flex flex-col items-center justify-center gap-0.5 ${
                  liveCameraOn ? "scale-105" : ""
                }`}
                style={{
                  boxShadow: liveCameraOn ? "0 0 0 2px #34d399" : "0 0 0 1px rgba(255,255,255,0.15)",
                  backgroundColor: "#1a1a1a",
                }}
              >
                <Upload size={18} color="white" style={{ transform: "rotate(180deg)" }} />
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs leading-tight px-1 py-0.5 text-center truncate">
                  {liveCameraOn ? "Stop" : "Live Camera"}
                </span>
              </button>
              {interiors ? (
              Object.entries(interiors)
                .sort(([keyA], [keyB]) => (keyA === interior ? -1 : keyB === interior ? 1 : 0))
                .map(([key, val]) => {
                  const ready = val.status === "ready";
                  const selected = interior === key;
                  const interiorLocked = isInteriorPremium(key) && !hasStudioUnlock;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (ready) {
                          stopLiveCamera();
                          setInterior(key);
                        }
                      }}
                      disabled={!ready}
                      title={!ready ? `${val.label} (coming soon)` : interiorLocked ? `${val.label} (Studio)` : val.label}
                      className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden transition ${
                        selected ? "scale-105" : ""
                      } ${!ready ? "opacity-35 cursor-not-allowed" : ""}`}
                      style={{
                        boxShadow: selected ? "0 0 0 2px #34d399" : "0 0 0 1px rgba(255,255,255,0.15)",
                        backgroundImage: val.img ? `url(${val.img})` : undefined,
                        backgroundColor: !val.img ? "#DCD6CC" : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {interiorLocked && ready && (
                        <span className="absolute top-1 right-1 z-10 bg-black/60 rounded-full p-0.5">
                          <Lock size={10} color="white" />
                        </span>
                      )}
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs leading-tight px-1 py-0.5 text-center truncate">
                        {val.label}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-white/40 self-center py-4">Loading rooms…</p>
              )}
            </div>
          </div>
        )}

        {activeSheet === "mat" && (
          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wide text-white/40 font-medium">Mat Color</label>
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x [&>*]:snap-start">
                {Object.entries(MAT_COLORS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setMatColor(key)}
                    title={val.label}
                    className={`shrink-0 w-8 h-8 rounded-full border-2 transition ${
                      matColor === key ? "border-white scale-110" : "border-white/20"
                    }`}
                    style={{ background: val.top }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wide text-white/40 font-medium">Mat Texture</label>
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x [&>*]:snap-start">
                {Object.entries(MAT_TEXTURES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setMatTexture(key)}
                    className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
                      matTexture === key ? "bg-white text-black border-white" : "border-white/20 text-white/60"
                    }`}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wide text-white/40 font-medium">Mat Width</label>
              <input type="range" min="0" max="80" value={matWidth} onChange={(e) => setMatWidth(Number(e.target.value))} className="w-full" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wide text-white/40 font-medium">Frame Width</label>
              <input type="range" min="10" max="50" value={frameWidth} onChange={(e) => setFrameWidth(Number(e.target.value))} className="w-full" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={borderLine} onChange={(e) => setBorderLine(e.target.checked)} id="borderline" />
              <label htmlFor="borderline" className="text-sm text-white/60">
                Show mat border line
              </label>
            </div>
          </div>
        )}

        {activeSheet === "export" && (
          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wide text-white/40 font-medium">What to Export</label>
              <div className="flex rounded-lg border border-white/15 overflow-hidden text-sm">
                <button
                  type="button"
                  onClick={() => setExportMode("with_interior")}
                  className={`flex-1 px-3 py-2 transition ${
                    exportMode === "with_interior" ? "bg-white text-black" : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  Frame + Room
                </button>
                <button
                  type="button"
                  onClick={() => setExportMode("frame_only")}
                  className={`flex-1 px-3 py-2 transition ${
                    exportMode === "frame_only" ? "bg-white text-black" : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  Frame Only
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wide text-white/40 font-medium">Export Format (download only)</label>
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x [&>*]:snap-start">
                {Object.entries(EXPORT_FORMATS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setExportFormat(key)}
                    disabled={exportMode === "frame_only"}
                    className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition disabled:opacity-40 ${
                      exportFormat === key ? "bg-white text-black border-white" : "border-white/20 text-white/60"
                    }`}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
              {exportMode === "frame_only" && (
                <p className="text-xs text-white/40">Frame Only exports a tight crop around just the frame, so the format above doesn't apply.</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wide text-white/40 font-medium">File Type</label>
              <div className="flex rounded-lg border border-white/15 overflow-hidden text-sm">
                <button
                  type="button"
                  onClick={() => setExportMime("png")}
                  className={`flex-1 px-3 py-2 transition ${
                    exportMime === "png" ? "bg-white text-black" : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  PNG (best quality)
                </button>
                <button
                  type="button"
                  onClick={() => setExportMime("jpeg")}
                  className={`flex-1 px-3 py-2 transition ${
                    exportMime === "jpeg" ? "bg-white text-black" : "text-white/60 hover:bg-white/5"
                  }`}
                >
                  JPEG (smaller)
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-white/10">
              {rawImage && (
                <button
                  onClick={() => setShowCropModal(true)}
                  className="text-sm px-4 py-2 rounded-lg border border-white/20 text-white/70 hover:border-white/50 transition"
                >
                  Re-crop
                </button>
              )}
              <button
                onClick={handleGenerateExport}
                disabled={isExporting}
                className="text-sm px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <Download size={14} /> {isExporting ? "Rendering…" : "Export"}
              </button>
              {!hasPremiumAccess && (
                <button
                  onClick={() => setShowPaywall(true)}
                  className="text-sm px-4 py-2 rounded-lg border border-amber-500 text-amber-400 hover:bg-amber-500/10 transition flex items-center gap-2"
                >
                  <Lock size={14} /> Remove watermark
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating bottom icon nav — always visible, claims almost no
          permanent screen space; tapping an icon opens/closes its sheet.
          Scrolls horizontally itself on very narrow screens so it never
          clips a tab. */}
      <div className="absolute left-0 right-0 bottom-5 z-40 flex justify-center px-4">
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-lg rounded-full px-2 py-2 shadow-lg overflow-x-auto max-w-full snap-x [&>*]:snap-start">
          {[
            { key: "frames", label: "Frames", Icon: Square },
            { key: "interiors", label: "Interiors", Icon: ImageIcon },
            { key: "mat", label: "Mat", Icon: LayoutTemplate },
            { key: "export", label: "Export", Icon: Download },
          ].map((t) => {
            const Icon = t.Icon;
            const isActive = activeSheet === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveSheet(isActive ? null : t.key)}
                className={`shrink-0 flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-full transition ${
                  isActive ? "bg-emerald-500/20 text-emerald-400" : "text-white/70"
                }`}
              >
                <Icon size={16} />
                <span className="text-[9px] leading-none">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <input id="artwork-upload-input" ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

      {exportPreviewUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-serif">{exportMode === "frame_only" ? "Your frame" : "Your framed art in the room"}</h2>
              <button
                onClick={() => setExportPreviewUrl(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-black/50 mb-3">
              Press and hold the image, then choose "Save Image" or "Share" —
              from there you can send it straight to WhatsApp, Instagram,
              Facebook, or your Photos app.
            </p>
            <img
              src={exportPreviewUrl}
              alt="Exported frame"
              className="w-full h-auto rounded-lg border border-black/10"
            />
            <div className="mt-3 flex gap-2">
              <a
                href={exportPreviewUrl}
                download={`frametta-${Date.now()}.${exportPreviewExt}`}
                className="flex-1 text-sm px-4 py-2 rounded-lg bg-black text-white text-center hover:bg-black/80 transition"
              >
                Download {exportPreviewExt.toUpperCase()}
              </a>
              <button
                onClick={() => setExportPreviewUrl(null)}
                className="flex-1 text-sm px-4 py-2 rounded-lg border border-black/15 text-black/70 hover:border-black/40 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaywall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPaywall(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg">Remove the watermark</h2>
              <button onClick={() => setShowPaywall(false)} className="text-black/40 hover:text-black">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-black/60">
              You can browse every frame and interior for free. Unlocking removes the watermark on export/share for the ones outside the free set.
            </p>
            <button
              onClick={() => {
                setHasFramesUnlock(true);
                setShowPaywall(false);
              }}
              disabled={hasFramesUnlock || hasStudioUnlock}
              className="w-full text-left rounded-xl border border-black/15 p-4 hover:border-black/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Frames — $9.99</span>
                <span className="text-xs text-black/40">one-time</span>
              </div>
              <p className="text-xs text-black/50 mt-1">All frame categories, watermark-free. Interiors stay at the free 5.</p>
            </button>
            <button
              onClick={() => {
                setHasStudioUnlock(true);
                setShowPaywall(false);
              }}
              disabled={hasStudioUnlock}
              className="w-full text-left rounded-xl border-2 border-emerald-700 p-4 hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Studio — $14.99</span>
                <span className="text-xs text-emerald-700 font-medium">everything</span>
              </div>
              <p className="text-xs text-black/50 mt-1">All frames + all interiors + future premium features, watermark-free.</p>
            </button>
          </div>
        </div>
      )}

      {showCropModal && rawImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full">
            <h2 className="text-base font-serif mb-1">Crop your artwork</h2>
            <p className="text-xs text-black/50 mb-3">
              Drag inside the box to move it, or drag any corner/edge to
              resize that side. The frame will match whatever shape you crop
              to — no forced portrait or landscape.
            </p>

            <div
              className="relative mx-auto select-none"
              style={{ maxWidth: 300 }}
              onMouseMove={(e) => onDragMove(e.clientX, e.clientY)}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchMove={(e) => onDragMove(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={endDrag}
            >
              <img
                ref={cropImgRef}
                src={rawImage}
                alt="crop preview"
                draggable={false}
                onLoad={initCropRect}
                className="block w-full h-auto rounded"
                style={{ maxHeight: 380, objectFit: "contain" }}
              />
              {/* Dark mask outside the crop box */}
              <div className="absolute inset-0 pointer-events-none bg-black/50" style={{
                clipPath: `polygon(0% 0%, 0% 100%, ${cropRect.x}px 100%, ${cropRect.x}px ${cropRect.y}px, ${cropRect.x + cropRect.w}px ${cropRect.y}px, ${cropRect.x + cropRect.w}px ${cropRect.y + cropRect.h}px, ${cropRect.x}px ${cropRect.y + cropRect.h}px, ${cropRect.x}px 100%, 100% 100%, 100% 0%)`
              }} />
              {/* Crop box */}
              <div
                className="absolute border-2 border-white cursor-move"
                style={{
                  left: cropRect.x,
                  top: cropRect.y,
                  width: cropRect.w,
                  height: cropRect.h,
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
                }}
                onMouseDown={(e) => startBodyDrag(e.clientX, e.clientY)}
                onTouchStart={(e) => startBodyDrag(e.touches[0].clientX, e.touches[0].clientY)}
              >
                {[
                  { key: "tl", pos: "-top-2 -left-2 cursor-nwse-resize" },
                  { key: "tr", pos: "-top-2 -right-2 cursor-nesw-resize" },
                  { key: "bl", pos: "-bottom-2 -left-2 cursor-nesw-resize" },
                  { key: "br", pos: "-bottom-2 -right-2 cursor-nwse-resize" },
                ].map((h) => (
                  <div
                    key={h.key}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      startHandleDrag(h.key)(e.clientX, e.clientY);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      startHandleDrag(h.key)(e.touches[0].clientX, e.touches[0].clientY);
                    }}
                    className={`absolute w-4 h-4 bg-white border-2 border-black rounded-full z-10 ${h.pos}`}
                  />
                ))}
                {[
                  { key: "t", pos: "-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
                  { key: "b", pos: "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
                  { key: "l", pos: "top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize" },
                  { key: "r", pos: "top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize" },
                ].map((h) => (
                  <div
                    key={h.key}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      startHandleDrag(h.key)(e.clientX, e.clientY);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      startHandleDrag(h.key)(e.touches[0].clientX, e.touches[0].clientY);
                    }}
                    className={`absolute w-3 h-3 bg-white border-2 border-black rounded-full ${h.pos}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowCropModal(false)}
                className="flex-1 py-2 rounded-lg border border-black/15 text-sm text-black/60"
              >
                Cancel
              </button>
              <button
                onClick={applyCrop}
                className="flex-1 py-2 rounded-lg bg-black text-white text-sm hover:bg-black/80 transition"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {!image && !welcomeDismissed && !activeSheet && (
        <div className="absolute left-4 right-4 bottom-28 z-30 pointer-events-auto">
          <div className="rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 px-4 py-3 text-white shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Welcome to Frametta</p>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Upload a photo or tap <span className="text-white/80">Try sample art</span>, then browse frames and rooms with the bar below.
                </p>
              </div>
              <button
                type="button"
                onClick={dismissWelcome}
                className="shrink-0 text-white/40 hover:text-white/80 transition"
                aria-label="Dismiss welcome message"
              >
                <X size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleLoadSampleArtwork}
              className="mt-3 w-full text-xs py-2 rounded-lg bg-white/10 hover:bg-white/15 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles size={12} /> Load sample artwork
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="frametta-toast fixed left-1/2 bottom-28 z-50 max-w-[90vw] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-black shadow-lg"
        >
          {toast}
        </div>
      )}

    </div>
  );
}
