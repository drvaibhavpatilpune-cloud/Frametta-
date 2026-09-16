import { useAppStore } from '../../store/useAppStore';
import './DisclaimerModal.css';

export default function DisclaimerModal() {
  const accepted = useAppStore((s) => s.disclaimerAccepted);
  const accept = useAppStore((s) => s.acceptDisclaimer);
  if (accepted) return null;

  return (
    <div className="disclaimer-backdrop">
      <div className="disclaimer-modal panel fade-in">
        <div className="disc-brand">Ortho3D Surgical Guide</div>
        <h2>Educational use only</h2>
        <p>
          This application provides interactive 3D visualizations for orthopedic education. It does
          not replace formal surgical training, hospital protocols, or the judgment of a qualified
          clinician.
        </p>
        <p>
          Illustrated techniques may differ from those used in your institution. Always follow
          local standards of care and supervision requirements.
        </p>
        <button className="btn btn-primary" onClick={accept}>
          I understand — continue
        </button>
      </div>
    </div>
  );
}
