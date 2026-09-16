import { getContentManifest } from '../../services/contentLoader';
import './AboutScreen.css';

export default function AboutScreen() {
  const manifest = getContentManifest();

  return (
    <div className="about-screen fade-in">
      <h1 className="section-title">Ortho3D Surgical Guide</h1>
      <p className="section-sub">
        A 3D interactive surgical textbook combined with an animated surgical simulator.
      </p>

      <section className="about-card panel">
        <h2>Educational disclaimer</h2>
        <p>
          Ortho3D Surgical Guide is an <strong>educational visualization platform</strong>. It is
          not a substitute for surgical training, institutional protocols, supervised practice, or
          professional clinical judgment.
        </p>
        <p>
          Surgical animations are illustrative and based on commonly published orthopedic
          principles. Technique variations exist. Animations do <strong>not</strong> represent the
          only correct surgical technique and must not be used as the sole basis for patient care
          decisions.
        </p>
        <p>
          Content intended for production clinical education should be reviewed by qualified
          orthopedic surgeons before institutional use.
        </p>
      </section>

      <section className="about-card panel">
        <h2>Anatomy attribution</h2>
        <p>
          Primary knee meshes are adapted from <strong>Z-Anatomy</strong> (The libre 3D atlas of
          anatomy), licensed under <strong>CC BY-SA 4.0</strong> —{' '}
          <a href="https://www.z-anatomy.com/" target="_blank" rel="noreferrer">
            z-anatomy.com
          </a>
          . Z-Anatomy is based on BodyParts3D / The Database Center for Life Science (CC-BY-SA 2.1
          JP). FBX sources via the LluisV/Z-Anatomy project; knee structures were extracted,
          recentered, and exported to GLB for this viewer.
        </p>
        <p className="muted">
          Legacy SPL Knee Atlas (Apache-2.0) meshes remain available under{' '}
          <code>public/models/knee/</code> for comparison.
        </p>
      </section>

      <section className="about-card panel">
        <h2>Mobile & tablet</h2>
        <ul>
          <li>Installable PWA (Add to Home Screen)</li>
          <li>Touch: one-finger rotate, pinch zoom, two-finger pan</li>
          <li>Phone layout with floating panels and compact timeline</li>
          <li>Capacitor-ready for native iOS/Android packaging (`capacitor.config.json`)</li>
        </ul>
      </section>

      <section className="about-card panel">
        <h2>MVP scope</h2>
        <ul>
          <li>Knee anatomy complex (procedural medical visualization; GLB-ready architecture)</li>
          <li>ACL Reconstruction — 9 interactive surgical steps</li>
          <li>Layer visibility, transparency, isolation, explode view</li>
          <li>Anatomy / Surgical / Teaching modes</li>
          <li>Professional / Patient language modes</li>
          <li>Presentation mode with arrows, marks, and notes</li>
          <li>Data-driven procedure catalog for future CMS content packs</li>
        </ul>
      </section>

      <section className="about-card panel">
        <h2>Content system</h2>
        <p>
          Version <code>{manifest.version}</code> · Channel <code>{manifest.updateChannel}</code>
        </p>
        <p>
          New anatomy models, procedures, animations, instruments, and explanations can be delivered
          as content packs without rewriting the application shell.
        </p>
        <p className="muted">
          Supported production formats: GLB / glTF (preferred), OBJ where appropriate.
        </p>
      </section>
    </div>
  );
}
