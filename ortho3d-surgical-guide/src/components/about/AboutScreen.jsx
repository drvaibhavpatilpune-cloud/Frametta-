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
