export const FREE_FRAMES = {
  popular: new Set(["natural_wood_block", "black_modern_thin", "gold_ornate_wide"]),
  wooden: new Set(["whitewash", "mahogany"]),
  oil_painting: new Set(["gesso_white", "antique_gold_leaf"]),
  metal: new Set(["brushed_silver", "chrome"]),
  scandinavian: new Set(["whitewash_pine", "matte_white"]),
  marble_stone: new Set(["white_carrara"]),
  vintage: new Set(["classic_oak"]),
  acrylic: new Set(["clear_acrylic"]),
  creative: new Set(["paint_splatter"]),
  kids: new Set(["rainbow_painted"]),
  festival: new Set(["festive_multicolor"]),
  watercolour: new Set(["warm_ivory", "natural_oak"]),
};

export const FREE_INTERIORS = new Set(["exhibition", "living_room", "bedroom", "study_room", "minimal_wall"]);

export const isFramePremium = (categoryKey, frameKey) =>
  !(FREE_FRAMES[categoryKey] || new Set()).has(frameKey);

export const isInteriorPremium = (interiorKey) => !FREE_INTERIORS.has(interiorKey);

export const MAT_COLORS = {
  museum_white: { top: "#FBFAF7", bottom: "#F3F0E9", label: "Museum White" },
  warm_ivory: { top: "#F3EBDD", bottom: "#E7DCC7", label: "Warm Ivory" },
  charcoal: { top: "#4A4A4C", bottom: "#333335", label: "Charcoal" },
  sage: { top: "#C7D0BB", bottom: "#AEB99C", label: "Sage" },
  black: { top: "#2A2A2A", bottom: "#141414", label: "Black" },
};

export const MAT_TEXTURES = {
  smooth: { label: "Smooth", overlay: "none" },
  linen: {
    label: "Linen",
    overlay:
      "repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 3px)",
  },
  textured: {
    label: "Textured",
    overlay:
      "repeating-linear-gradient(45deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 2px, transparent 2px, transparent 5px)",
  },
};

export const TEXTURE_PATTERNS = {
  none: null,
  carved: "repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 7px)",
  brushed: "repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 3px)",
  patchwork: "repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 8px, rgba(0,0,0,0.07) 8px, rgba(0,0,0,0.07) 16px)",
  dots: "repeating-radial-gradient(circle at 10px 10px, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 2px, transparent 2px, transparent 14px)",
  sparkle: "repeating-radial-gradient(circle at 6px 6px, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1.5px, transparent 1.5px, transparent 12px)",
  beaded: "repeating-radial-gradient(circle at 5px 5px, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 1px, transparent 1px, transparent 6px)",
};

export const EXPORT_FORMATS = {
  square: { label: "Instagram Post (1:1)", ratio: "1 / 1" },
  story: { label: "Instagram/FB Story (9:16)", ratio: "9 / 16" },
  landscape: { label: "Facebook/Twitter (1.91:1)", ratio: "1.91 / 1" },
};
