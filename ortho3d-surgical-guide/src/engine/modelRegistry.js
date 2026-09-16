/**
 * Modular anatomy model registry.
 * Production models are GLB packs under /models; procedural fallback remains available.
 */
export const KNEE_MODEL_PACK = {
  id: 'knee',
  label: 'Knee complex',
  preferredFormat: 'glb',
  attribution:
    "SPL Knee Atlas — Brigham and Women's Hospital Surgical Planning Laboratory (Apache-2.0)",
  structures: {
    femur: '/models/knee/femur.glb',
    tibia: '/models/knee/tibia.glb',
    patella: '/models/knee/patella.glb',
    acl: '/models/knee/acl.glb',
    pcl: '/models/knee/pcl.glb',
    mcl: '/models/knee/mcl.glb',
    lcl: '/models/knee/lcl.glb',
    meniscusMedial: '/models/knee/meniscusMedial.glb',
    meniscusLateral: '/models/knee/meniscusLateral.glb',
    cartilageFemoral: '/models/knee/cartilageFemoral.glb',
    cartilageMedial: '/models/knee/cartilageMedial.glb',
    cartilageLateral: '/models/knee/cartilageLateral.glb',
  },
};

export const STRUCTURE_COLORS = {
  femur: '#f0e4d0',
  tibia: '#eee0cc',
  patella: '#f3e8d6',
  acl: '#c9a67a',
  pcl: '#b8956a',
  mcl: '#b08962',
  lcl: '#b08962',
  meniscusMedial: '#d0b484',
  meniscusLateral: '#d0b484',
  cartilage: '#b8d0dc',
  muscles: '#8f3e3e',
  neurovascular: '#9a3f4c',
  graft: '#d4b06a',
};
