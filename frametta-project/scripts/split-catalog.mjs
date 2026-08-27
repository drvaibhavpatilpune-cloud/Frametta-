/**
 * Extracts embedded catalog data from App.jsx into lazy-loadable modules.
 * Run once: node scripts/split-catalog.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const appPath = path.join(root, "src/App.jsx");
const lines = fs.readFileSync(appPath, "utf8").split("\n");

function extractConst(name) {
  const start = lines.findIndex((l) => l.startsWith(`const ${name} =`));
  if (start === -1) throw new Error(`Could not find ${name}`);
  let depth = 0;
  let started = false;
  for (let i = start; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === "{") {
        depth++;
        started = true;
      } else if (ch === "}") depth--;
    }
    if (started && depth === 0) {
      return { start: start + 1, end: i + 1, text: lines.slice(start, i + 1).join("\n") };
    }
  }
  throw new Error(`Unclosed ${name}`);
}

const frameAssets = extractConst("FRAME_ASSETS");
const categories = extractConst("CATEGORIES");
const freeFrames = extractConst("FREE_FRAMES");
const interiors = extractConst("INTERIORS");
const matColors = extractConst("MAT_COLORS");
const matTextures = extractConst("MAT_TEXTURES");
const texturePatterns = extractConst("TEXTURE_PATTERNS");
const exportFormats = extractConst("EXPORT_FORMATS");

const dataDir = path.join(root, "src/data");
const catDir = path.join(dataDir, "categories");
fs.mkdirSync(catDir, { recursive: true });

// Evaluate categories without writing a duplicate frameAssets.js (category
// modules embed their own nine-slice data via JSON.stringify).
const categoriesBody = categories.text.replace(/^const CATEGORIES = /, "").replace(/;\s*$/, "");
const frameAssetsBody = frameAssets.text.replace(/^const FRAME_ASSETS = /, "").replace(/;\s*$/, "");
const FRAME_ASSETS = Function(`return (${frameAssetsBody})`)();
const CATEGORIES = Function("FRAME_ASSETS", `return (${categoriesBody})`)(FRAME_ASSETS);

const categoryKeys = Object.keys(CATEGORIES);
for (const key of categoryKeys) {
  fs.writeFileSync(
    path.join(catDir, `${key}.js`),
    `export default ${JSON.stringify(CATEGORIES[key])};\n`
  );
}

const indexEntries = categoryKeys
  .map(
    (key) =>
      `  ${key}: {\n    label: ${JSON.stringify(CATEGORIES[key].label)},\n    status: ${JSON.stringify(CATEGORIES[key].status)},\n    loader: () => import("./categories/${key}.js"),\n  }`
  )
  .join(",\n");

fs.writeFileSync(
  path.join(dataDir, "categoryIndex.js"),
  `/** Category metadata + lazy loaders. Full frame data loads on demand. */\nexport const CATEGORY_INDEX = {\n${indexEntries}\n};\n\nexport const CATEGORY_KEYS = ${JSON.stringify(categoryKeys)};\n`
);

fs.writeFileSync(
  path.join(dataDir, "constants.js"),
  `${freeFrames.text.replace("const FREE_FRAMES", "export const FREE_FRAMES")}

export const FREE_INTERIORS = new Set(["exhibition", "living_room", "bedroom", "study_room", "minimal_wall"]);

export const isFramePremium = (categoryKey, frameKey) =>
  !(FREE_FRAMES[categoryKey] || new Set()).has(frameKey);

export const isInteriorPremium = (interiorKey) => !FREE_INTERIORS.has(interiorKey);

${matColors.text.replace("const MAT_COLORS", "export const MAT_COLORS")}

${matTextures.text.replace("const MAT_TEXTURES", "export const MAT_TEXTURES")}

${texturePatterns.text.replace("const TEXTURE_PATTERNS", "export const TEXTURE_PATTERNS")}

${exportFormats.text.replace("const EXPORT_FORMATS", "export const EXPORT_FORMATS")}
`
);

const interiorsPath = path.join(dataDir, "interiors.js");
fs.writeFileSync(interiorsPath, `${interiors.text.replace("const INTERIORS", "export const INTERIORS")}\n`);

const nineSliceStart = lines.findIndex((l) => l.startsWith("function NineSliceFrame"));
const newHeader = `${lines.slice(0, 3).join("\n")}
import {
  MAT_COLORS,
  MAT_TEXTURES,
  TEXTURE_PATTERNS,
  EXPORT_FORMATS,
  isFramePremium,
  isInteriorPremium,
} from "./data/constants.js";
import { CATEGORY_INDEX, CATEGORY_KEYS } from "./data/categoryIndex.js";

export const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/REPLACE_WITH_YOUR_LINK";
export const CONFIG_STORAGE_KEY = "framelab:config:v1";
export const WELCOME_STORAGE_KEY = "frametta:welcome:v1";

`;

fs.writeFileSync(appPath, newHeader + lines.slice(nineSliceStart).join("\n"));

console.log(`Created ${categoryKeys.length} category modules in src/data/categories/`);
console.log(`App.jsx trimmed to ${newHeader.split("\n").length + lines.length - nineSliceStart} lines`);
