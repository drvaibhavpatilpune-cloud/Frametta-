import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import './ExplanationPanel.css';

export default function ExplanationPanel({ step, languageMode, open, onToggle }) {
  const exp = languageMode === 'patient' ? step.patientExplanation : step.explanation;
  if (!exp) return null;

  return (
    <div className={`explanation-panel panel ${open ? 'open' : 'collapsed'}`}>
      <button className="panel-toggle" onClick={onToggle}>
        <span>Step explanation</span>
        {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
      {open && (
        <div className="exp-body">
          <ExpBlock label="What is being done?" text={exp.what} />
          <ExpBlock label="Why is it done?" text={exp.why} />
          <div className="exp-block">
            <div className="exp-label">Important anatomy</div>
            <ul>
              {(exp.anatomy || []).map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <ExpBlock label="Key surgical point" text={exp.keyPoint} accent />
          {exp.pitfall && (
            <div className="exp-block pitfall">
              <div className="exp-label">
                <AlertTriangle size={13} /> Pitfall
              </div>
              <p>{exp.pitfall}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExpBlock({ label, text, accent }) {
  return (
    <div className={`exp-block ${accent ? 'accent' : ''}`}>
      <div className="exp-label">{label}</div>
      <p>{text}</p>
    </div>
  );
}
