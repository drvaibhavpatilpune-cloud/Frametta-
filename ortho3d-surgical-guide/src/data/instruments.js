/** Instrument library — only relevant instruments surface per surgical step */

export const INSTRUMENTS = {
  arthroscope: {
    id: 'arthroscope',
    name: 'Arthroscope',
    description: 'Optical instrument for intra-articular visualization.',
  },
  drillGuide: {
    id: 'drillGuide',
    name: 'Drill guide',
    description: 'Aiming guide for anatomic tunnel placement.',
  },
  guidePin: {
    id: 'guidePin',
    name: 'Guide pin',
    description: 'Beath or guide pin establishing tunnel trajectory.',
  },
  reamer: {
    id: 'reamer',
    name: 'Reamer',
    description: 'Cannulated reamer creating tunnel diameter.',
  },
  suturePasser: {
    id: 'suturePasser',
    name: 'Suture passer',
    description: 'Device for suture management through soft tissue.',
  },
  grasper: {
    id: 'grasper',
    name: 'Grasper',
    description: 'Arthroscopic grasper for tissue handling.',
  },
  screw: {
    id: 'screw',
    name: 'Interference screw',
    description: 'Fixation device securing graft within tunnel.',
  },
  plate: {
    id: 'plate',
    name: 'Plate',
    description: 'Internal fixation plate (fracture / osteotomy contexts).',
  },
  imNail: {
    id: 'imNail',
    name: 'Intramedullary nail',
    description: 'Intramedullary fixation device for long-bone fractures.',
  },
  retractor: {
    id: 'retractor',
    name: 'Retractor',
    description: 'Soft-tissue retractor for open exposure.',
  },
  saw: {
    id: 'saw',
    name: 'Surgical saw',
    description: 'Oscillating saw for osteotomy or arthroplasty cuts.',
  },
};

export const INSTRUMENT_LIST = Object.values(INSTRUMENTS);
