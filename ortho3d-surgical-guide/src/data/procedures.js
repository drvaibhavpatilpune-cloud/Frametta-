/**
 * Data-driven surgical procedure catalog.
 * New procedures can be added here (or later via CMS) without rewriting the app.
 */

import { INSTRUMENTS } from './instruments';

export const PROCEDURE_REGIONS = [
  {
    id: 'knee',
    label: 'Knee',
    procedures: [
      'acl-reconstruction',
      'pcl-reconstruction',
      'meniscus-repair',
      'total-knee-arthroplasty',
      'high-tibial-osteotomy',
      'patellar-stabilization',
    ],
  },
  {
    id: 'hip',
    label: 'Hip',
    procedures: ['total-hip-arthroplasty', 'hip-resurfacing', 'hip-fracture-fixation'],
  },
  {
    id: 'shoulder',
    label: 'Shoulder',
    procedures: [
      'rotator-cuff-repair',
      'shoulder-arthroplasty',
      'bankart-repair',
      'latarjet-procedure',
    ],
  },
];

/** Stub metadata for procedures not yet fully authored */
const STUB = (id, name, region, popular = false) => ({
  id,
  name,
  region,
  status: 'coming-soon',
  popular,
  summary: `${name} module will be authored using the same data-driven architecture.`,
  patientSummary: `This surgical guide for ${name} is coming soon.`,
  anatomyModelId: region,
  tags: [region],
});

export const PROCEDURES = {
  'acl-reconstruction': {
    id: 'acl-reconstruction',
    name: 'ACL Reconstruction',
    region: 'knee',
    status: 'available',
    popular: true,
    summary:
      'Arthroscopic reconstruction of the anterior cruciate ligament with anatomic tunnel placement and graft fixation.',
    patientSummary:
      'A keyhole procedure that replaces a torn front knee ligament so the knee can feel stable again.',
    anatomyModelId: 'knee',
    modelFormats: ['glb', 'gltf'],
    tags: ['knee', 'sports', 'arthroscopy', 'ligament'],
    instruments: [
      INSTRUMENTS.arthroscope.id,
      INSTRUMENTS.drillGuide.id,
      INSTRUMENTS.guidePin.id,
      INSTRUMENTS.reamer.id,
      INSTRUMENTS.grasper.id,
      INSTRUMENTS.screw.id,
    ],
    layers: [
      'femur',
      'tibia',
      'patella',
      'acl',
      'pcl',
      'mcl',
      'lcl',
      'meniscusMedial',
      'meniscusLateral',
      'cartilage',
      'muscles',
      'neurovascular',
      'graft',
    ],
    references: [
      {
        title: 'Anatomic ACL reconstruction principles',
        note: 'Educational visualization based on published orthopedic technique literature. Not a substitute for institutional protocol.',
      },
    ],
    disclaimer:
      'For educational visualization only. Technique variations exist; clinical decisions require qualified orthopedic judgment.',
    steps: [
      {
        id: 'positioning',
        number: 1,
        title: 'Patient positioning',
        durationSec: 12,
        camera: 'lateral',
        highlight: ['femur', 'tibia', 'patella'],
        visibility: {
          muscles: false,
          neurovascular: false,
          graft: false,
          portals: false,
          instruments: false,
        },
        instruments: [],
        animation: 'positioning',
        labels: [{ structureId: 'patella', text: 'Patella' }],
        explanation: {
          what: 'Position the knee to allow arthroscopic access and controlled flexion during tunnel work.',
          why: 'Stable positioning enables reproducible portal placement and graft tensioning.',
          anatomy: ['Femur', 'Tibia', 'Patella', 'Soft-tissue envelope'],
          keyPoint: 'Confirm ability to flex and extend through the working range before draping.',
          pitfall: 'Inadequate flexion access can compromise femoral tunnel aiming later.',
        },
        patientExplanation: {
          what: 'We position your leg so we can safely look inside the knee with a small camera.',
          why: 'Good positioning helps the surgery stay accurate and efficient.',
          anatomy: ['Thigh bone', 'Shin bone', 'Kneecap'],
          keyPoint: 'Your knee needs to bend and straighten freely during the procedure.',
          pitfall: null,
        },
      },
      {
        id: 'portals',
        number: 2,
        title: 'Portal placement',
        durationSec: 14,
        camera: 'oblique',
        highlight: ['patella'],
        visibility: {
          portals: true,
          instruments: true,
          graft: false,
        },
        instruments: ['arthroscope'],
        animation: 'portals',
        labels: [
          { structureId: 'portalAL', text: 'AL portal' },
          { structureId: 'portalAM', text: 'AM portal' },
        ],
        explanation: {
          what: 'Establish anterolateral viewing and anteromedial working portals.',
          why: 'Correct portals provide triangulation for diagnostic arthroscopy and instrumentation.',
          anatomy: ['Patellar tendon', 'Joint line', 'Infrapatellar fat pad'],
          keyPoint: 'Portal height and medial-lateral position critically affect instrument reach.',
          pitfall: 'Portals placed too high or too medial can injure cartilage or limit access.',
        },
        patientExplanation: {
          what: 'We make two tiny openings in the front of the knee for the camera and tools.',
          why: 'These openings let us see and work inside the knee without a large cut.',
          anatomy: ['Kneecap tendon', 'Joint line'],
          keyPoint: 'Small openings reduce recovery impact compared with open surgery.',
          pitfall: null,
        },
      },
      {
        id: 'diagnostic',
        number: 3,
        title: 'Diagnostic arthroscopy',
        durationSec: 16,
        camera: 'arthroscopic',
        highlight: ['cartilage', 'meniscusMedial', 'meniscusLateral'],
        visibility: {
          portals: true,
          instruments: true,
          acl: true,
        },
        instruments: ['arthroscope', 'grasper'],
        animation: 'diagnostic',
        labels: [{ structureId: 'meniscusMedial', text: 'Meniscus' }],
        explanation: {
          what: 'Systematically inspect compartments, cartilage, menisci, and cruciate ligaments.',
          why: 'Associated injuries change reconstruction planning and rehabilitation expectations.',
          anatomy: ['Medial/lateral compartments', 'Notch', 'ACL remnant', 'Menisci'],
          keyPoint: 'Document chondral and meniscal pathology before committing to tunnel strategy.',
          pitfall: 'Missing concurrent meniscal root injury can leave residual instability symptoms.',
        },
        patientExplanation: {
          what: 'We carefully inspect the whole knee joint with the camera.',
          why: 'We look for other injuries that should be treated at the same time.',
          anatomy: ['Cartilage', 'Meniscus cushions', 'Ligaments'],
          keyPoint: 'A complete look inside helps plan the safest repair.',
          pitfall: null,
        },
      },
      {
        id: 'acl-assessment',
        number: 4,
        title: 'ACL assessment',
        durationSec: 14,
        camera: 'surgical',
        highlight: ['acl'],
        visibility: {
          acl: true,
          pcl: true,
          graft: false,
        },
        instruments: ['arthroscope', 'grasper'],
        animation: 'aclAssess',
        labels: [{ structureId: 'acl', text: 'ACL' }],
        explanation: {
          what: 'Probe the ACL remnant, confirm rupture pattern, and identify footprint landmarks.',
          why: 'Anatomic footprint recognition guides tunnel centers for graft isometry.',
          anatomy: ['ACL anteromedial/posterolateral bundles', 'Femoral footprint', 'Tibial footprint'],
          keyPoint: 'Preserve useful remnant tissue when it can aid vascularity and proprioception.',
          pitfall: 'Relying on non-anatomic notch references alone can malposition tunnels.',
        },
        patientExplanation: {
          what: 'We confirm the ligament tear and find the exact places it used to attach.',
          why: 'Putting the new ligament in the right spot is key for stability.',
          anatomy: ['Torn ACL', 'Attachment sites on thigh and shin bones'],
          keyPoint: 'We aim to copy your natural ligament position as closely as possible.',
          pitfall: null,
        },
      },
      {
        id: 'femoral-tunnel',
        number: 5,
        title: 'Femoral tunnel',
        durationSec: 20,
        camera: 'oblique',
        highlight: ['femur', 'acl'],
        visibility: {
          instruments: true,
          graft: false,
          acl: true,
        },
        instruments: ['drillGuide', 'guidePin', 'reamer'],
        animation: 'femoralTunnel',
        labels: [{ structureId: 'femur', text: 'Femoral footprint' }],
        explanation: {
          what: 'Creation of the femoral tunnel at the anatomical ACL footprint.',
          why: 'To reproduce the native ACL attachment and optimize graft positioning.',
          anatomy: ['Lateral femoral condyle', 'Intercondylar notch', 'ACL footprint'],
          keyPoint: 'Demonstrate tunnel orientation and footprint relationship visually.',
          pitfall: 'Vertical tunnels can leave residual rotational laxity.',
        },
        patientExplanation: {
          what: 'We create a small tunnel in the thigh bone so the new ligament can be positioned correctly.',
          why: 'This tunnel anchors the top end of the new ligament in the right place.',
          anatomy: ['Thigh bone', 'Natural ligament attachment'],
          keyPoint: 'Correct angle and location help the knee feel stable in twisting motions.',
          pitfall: null,
        },
      },
      {
        id: 'tibial-tunnel',
        number: 6,
        title: 'Tibial tunnel',
        durationSec: 18,
        camera: 'ap',
        highlight: ['tibia', 'acl'],
        visibility: {
          instruments: true,
          graft: false,
        },
        instruments: ['drillGuide', 'guidePin', 'reamer'],
        animation: 'tibialTunnel',
        labels: [{ structureId: 'tibia', text: 'Tibial footprint' }],
        explanation: {
          what: 'Create the tibial tunnel centered on the native tibial ACL footprint.',
          why: 'Tibial aperture position influences graft impingement and knee extension.',
          anatomy: ['Tibial spine', 'Anterior horn lateral meniscus', 'PCL', 'ACL footprint'],
          keyPoint: 'Avoid anterior placement that causes roof impingement in extension.',
          pitfall: 'Too posterior tibial tunnels can cause excessive graft tension or PCL conflict.',
        },
        patientExplanation: {
          what: 'We create a matching tunnel in the shin bone for the lower end of the new ligament.',
          why: 'Both ends of the graft need secure, accurate anchors.',
          anatomy: ['Shin bone', 'Natural lower attachment of the ACL'],
          keyPoint: 'Tunnel position is checked so the new ligament will not rub when you straighten the knee.',
          pitfall: null,
        },
      },
      {
        id: 'graft-passage',
        number: 7,
        title: 'Graft passage',
        durationSec: 18,
        camera: 'surgical',
        highlight: ['graft'],
        visibility: {
          graft: true,
          acl: false,
          instruments: true,
        },
        instruments: ['guidePin', 'grasper'],
        animation: 'graftPassage',
        labels: [{ structureId: 'graft', text: 'Graft' }],
        explanation: {
          what: 'Pass the prepared graft through tibial and femoral tunnels into anatomic position.',
          why: 'Secure seating of graft in both tunnels is required before fixation.',
          anatomy: ['Femoral tunnel', 'Tibial tunnel', 'Notch'],
          keyPoint: 'Maintain graft orientation markings to avoid twist errors.',
          pitfall: 'Soft-tissue bridges or inadequate tunnel aperture debridement can block passage.',
        },
        patientExplanation: {
          what: 'We pass the new ligament through the tunnels into its final position.',
          why: 'The graft must sit correctly before it is locked in place.',
          anatomy: ['New ligament graft', 'Bone tunnels'],
          keyPoint: 'We check that the graft moves smoothly into place without catching.',
          pitfall: null,
        },
      },
      {
        id: 'fixation',
        number: 8,
        title: 'Fixation',
        durationSec: 16,
        camera: 'lateral',
        highlight: ['graft', 'screw'],
        visibility: {
          graft: true,
          instruments: true,
          acl: false,
        },
        instruments: ['screw'],
        animation: 'fixation',
        labels: [{ structureId: 'graft', text: 'Fixed graft' }],
        explanation: {
          what: 'Fix the graft on the femoral and tibial sides under controlled tension.',
          why: 'Stable fixation allows early protected motion while biologic incorporation occurs.',
          anatomy: ['Tunnel apertures', 'Graft–bone interface'],
          keyPoint: 'Cycle the knee and confirm tension before final tibial fixation.',
          pitfall: 'Overtensioning or fixation in full extension/flexion extremes can constrain motion.',
        },
        patientExplanation: {
          what: 'We lock the new ligament securely into the bone tunnels.',
          why: 'Strong fixation lets you begin guided movement while healing starts.',
          anatomy: ['Graft', 'Fixation devices'],
          keyPoint: 'We tension the graft carefully so the knee can bend and straighten well.',
          pitfall: null,
        },
      },
      {
        id: 'final-construct',
        number: 9,
        title: 'Final construct',
        durationSec: 14,
        camera: 'oblique',
        highlight: ['graft', 'femur', 'tibia'],
        visibility: {
          graft: true,
          acl: false,
          instruments: false,
          portals: false,
        },
        instruments: [],
        animation: 'finalConstruct',
        labels: [{ structureId: 'graft', text: 'Reconstructed ACL' }],
        explanation: {
          what: 'Confirm graft position, absence of impingement, and restored stability testing.',
          why: 'Final verification reduces risk of early mechanical failure or motion loss.',
          anatomy: ['Reconstructed ACL graft', 'Notch', 'Menisci'],
          keyPoint: 'Visualize full extension for notch–graft clearance.',
          pitfall: 'Leaving residual notch osteophytes can abrade an otherwise well-placed graft.',
        },
        patientExplanation: {
          what: 'We confirm the new ligament is in the right place and the knee moves smoothly.',
          why: 'A final check helps protect your result before the procedure ends.',
          anatomy: ['Reconstructed ligament', 'Knee joint'],
          keyPoint: 'Your rehab plan begins from this stable reconstructed starting point.',
          pitfall: null,
        },
      },
    ],
  },

  'pcl-reconstruction': STUB('pcl-reconstruction', 'PCL Reconstruction', 'knee', true),
  'meniscus-repair': STUB('meniscus-repair', 'Meniscus Repair', 'knee', true),
  'total-knee-arthroplasty': STUB('total-knee-arthroplasty', 'Total Knee Arthroplasty', 'knee', true),
  'high-tibial-osteotomy': STUB('high-tibial-osteotomy', 'High Tibial Osteotomy', 'knee'),
  'patellar-stabilization': STUB('patellar-stabilization', 'Patellar Stabilization', 'knee'),
  'total-hip-arthroplasty': STUB('total-hip-arthroplasty', 'Total Hip Arthroplasty', 'hip', true),
  'hip-resurfacing': STUB('hip-resurfacing', 'Hip Resurfacing', 'hip'),
  'hip-fracture-fixation': STUB('hip-fracture-fixation', 'Hip Fracture Fixation', 'hip', true),
  'rotator-cuff-repair': STUB('rotator-cuff-repair', 'Rotator Cuff Repair', 'shoulder', true),
  'shoulder-arthroplasty': STUB('shoulder-arthroplasty', 'Shoulder Arthroplasty', 'shoulder'),
  'bankart-repair': STUB('bankart-repair', 'Bankart Repair', 'shoulder', true),
  'latarjet-procedure': STUB('latarjet-procedure', 'Latarjet Procedure', 'shoulder'),
};

export function getProcedure(id) {
  return PROCEDURES[id] || null;
}

export function listProcedures() {
  return Object.values(PROCEDURES);
}

export function listAvailableProcedures() {
  return listProcedures().filter((p) => p.status === 'available');
}

export function listPopularProcedures() {
  return listProcedures().filter((p) => p.popular);
}

export function searchProcedures(query) {
  const q = query.trim().toLowerCase();
  if (!q) return listProcedures();
  return listProcedures().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.region.includes(q) ||
      (p.tags || []).some((t) => t.includes(q))
  );
}

export function searchAnatomy(query) {
  const q = query.trim().toLowerCase();
  // Imported lazily-style to avoid circular deps in bundlers — static import is fine
  return q;
}
