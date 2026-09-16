/**
 * Content management / loading architecture.
 * MVP ships bundled JSON-like modules. Production can swap this loader
 * for authenticated CMS fetches (models, steps, animations) without UI rewrites.
 */

import { PROCEDURES, getProcedure } from '../data/procedures';
import { KNEE_STRUCTURES, ANATOMY_CATEGORIES } from '../data/anatomy';
import { INSTRUMENTS } from '../data/instruments';

const modelRegistry = {
  knee: {
    id: 'knee',
    label: 'Knee complex',
    preferredFormat: 'glb',
    sources: {
      glb: '/models/knee/manifest.json',
      gltf: null,
      procedural: null,
    },
    attribution:
      "SPL Knee Atlas — Brigham and Women's Hospital Surgical Planning Laboratory (Apache-2.0)",
    lod: ['mobile', 'high'],
    structures: KNEE_STRUCTURES.map((s) => s.id),
  },
};

const cache = new Map();

export async function loadProcedureBundle(procedureId) {
  const cacheKey = `procedure:${procedureId}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // Simulate lazy network fetch for CMS-ready architecture
  await delay(40);
  const procedure = getProcedure(procedureId);
  if (!procedure) throw new Error(`Unknown procedure: ${procedureId}`);

  const anatomy = modelRegistry[procedure.anatomyModelId] || null;
  const instruments = (procedure.instruments || []).map((id) => INSTRUMENTS[id]).filter(Boolean);

  const bundle = {
    procedure,
    anatomy,
    instruments,
    structures: KNEE_STRUCTURES,
    loadedAt: Date.now(),
    source: 'bundled', // later: 'cms'
  };

  cache.set(cacheKey, bundle);
  return bundle;
}

export async function loadAnatomyCategory(categoryId) {
  await delay(20);
  return {
    category: ANATOMY_CATEGORIES.find((c) => c.id === categoryId),
    structures:
      categoryId === 'knee'
        ? KNEE_STRUCTURES
        : KNEE_STRUCTURES.filter((s) => s.category === categoryId || categoryId === 'ligaments' && s.category === 'ligament'),
    available: categoryId === 'knee' || ['ligaments', 'muscles', 'nerves', 'vascular', 'tendons'].includes(categoryId),
  };
}

export function getContentManifest() {
  return {
    version: '1.0.0-mvp',
    regions: Object.keys(modelRegistry),
    procedures: Object.keys(PROCEDURES),
    instruments: Object.keys(INSTRUMENTS),
    updateChannel: 'bundled',
    cmsEndpoint: null, // e.g. https://content.ortho3d.example/v1
  };
}

export function clearContentCache() {
  cache.clear();
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
