/** Category metadata + lazy loaders. Full frame data loads on demand. */
export const CATEGORY_INDEX = {
  popular: {
    label: "Popular",
    status: "ready",
    loader: () => import("./categories/popular.js"),
  },
  wooden: {
    label: "Wooden",
    status: "ready",
    loader: () => import("./categories/wooden.js"),
  },
  oil_painting: {
    label: "Oil Painting Style",
    status: "ready",
    loader: () => import("./categories/oil_painting.js"),
  },
  metal: {
    label: "Metal",
    status: "ready",
    loader: () => import("./categories/metal.js"),
  },
  scandinavian: {
    label: "Scandinavian",
    status: "ready",
    loader: () => import("./categories/scandinavian.js"),
  },
  marble_stone: {
    label: "Marble & Stone",
    status: "ready",
    loader: () => import("./categories/marble_stone.js"),
  },
  vintage: {
    label: "Vintage",
    status: "ready",
    loader: () => import("./categories/vintage.js"),
  },
  acrylic: {
    label: "Acrylic",
    status: "ready",
    loader: () => import("./categories/acrylic.js"),
  },
  creative: {
    label: "Creative",
    status: "ready",
    loader: () => import("./categories/creative.js"),
  },
  kids: {
    label: "Kids",
    status: "ready",
    loader: () => import("./categories/kids.js"),
  },
  festival: {
    label: "Festival",
    status: "ready",
    loader: () => import("./categories/festival.js"),
  },
  watercolour: {
    label: "Watercolour",
    status: "ready",
    loader: () => import("./categories/watercolour.js"),
  }
};

export const CATEGORY_KEYS = ["popular","wooden","oil_painting","metal","scandinavian","marble_stone","vintage","acrylic","creative","kids","festival","watercolour"];
