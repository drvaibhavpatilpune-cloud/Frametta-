import * as THREE from 'three';

export const CAMERA_PRESETS = {
  ap: {
    id: 'ap',
    label: 'AP',
    position: [0, 0.15, 4.2],
    target: [0, 0.05, 0],
  },
  posterior: {
    id: 'posterior',
    label: 'Posterior',
    position: [0, 0.15, -4.2],
    target: [0, 0.05, 0],
  },
  lateral: {
    id: 'lateral',
    label: 'Lateral',
    position: [4.2, 0.2, 0.3],
    target: [0, 0.05, 0],
  },
  medial: {
    id: 'medial',
    label: 'Medial',
    position: [-4.2, 0.2, 0.3],
    target: [0, 0.05, 0],
  },
  superior: {
    id: 'superior',
    label: 'Superior',
    position: [0.2, 4.4, 0.2],
    target: [0, 0, 0],
  },
  inferior: {
    id: 'inferior',
    label: 'Inferior',
    position: [0.2, -4.2, 0.2],
    target: [0, 0.1, 0],
  },
  oblique: {
    id: 'oblique',
    label: 'Oblique',
    position: [2.8, 1.6, 3.2],
    target: [0, 0.05, 0],
  },
  axial: {
    id: 'axial',
    label: 'Axial',
    position: [0.4, 3.8, 0.1],
    target: [0, 0, 0],
  },
  surgical: {
    id: 'surgical',
    label: 'Surgical',
    position: [1.8, 1.2, 3.6],
    target: [0, 0.1, 0],
  },
  arthroscopic: {
    id: 'arthroscopic',
    label: 'Arthroscopic',
    position: [0.9, 0.55, 2.2],
    target: [0, 0.12, 0],
  },
};

export function orientationFromCamera(position, target = new THREE.Vector3()) {
  const dir = new THREE.Vector3().subVectors(position, target).normalize();
  const ax = Math.abs(dir.x);
  const ay = Math.abs(dir.y);
  const az = Math.abs(dir.z);

  let primary = 'A';
  if (ay >= ax && ay >= az) {
    primary = dir.y > 0 ? 'S' : 'I';
  } else if (ax >= az) {
    primary = dir.x > 0 ? 'L' : 'M';
  } else {
    primary = dir.z > 0 ? 'A' : 'P';
  }

  return {
    A: primary === 'A',
    P: primary === 'P',
    M: primary === 'M',
    L: primary === 'L',
    S: primary === 'S',
    I: primary === 'I',
    primary,
  };
}

export const EXPLODE_OFFSETS = {
  femur: [0, 0.35, 0],
  tibia: [0, -0.35, 0],
  patella: [0, 0.15, 0.45],
  acl: [0.08, 0, 0.08],
  pcl: [-0.08, 0, -0.08],
  mcl: [-0.35, 0, 0],
  lcl: [0.35, 0, 0],
  meniscusMedial: [-0.12, -0.05, 0],
  meniscusLateral: [0.12, -0.05, 0],
  cartilage: [0, 0, 0],
  muscles: [0, 0, 0.5],
  neurovascular: [0, -0.2, -0.45],
  graft: [0, 0, 0.05],
};
