import { Play } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import './SurgicalTimeline.css';

export default function SurgicalTimeline({ steps, currentIndex, onSelect, compact }) {
  const stepProgress = useAppStore((s) => s.stepProgress);
  const playStep = useAppStore((s) => s.playStep);

  return (
    <div className={`surgical-timeline ${compact ? 'compact' : ''}`}>
      <div className="timeline-track">
        {steps.map((step, i) => {
          const active = i === currentIndex;
          const done = i < currentIndex;
          return (
            <button
              key={step.id}
              className={`timeline-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}
              onClick={() => {
                onSelect(i);
                playStep();
              }}
            >
              <div className="thumb">
                <span className="thumb-num">{String(step.number).padStart(2, '0')}</span>
                <div
                  className="thumb-art"
                  style={{
                    background: thumbGradient(step.number),
                  }}
                />
                {active && (
                  <div className="thumb-progress" style={{ width: `${stepProgress * 100}%` }} />
                )}
                <span className="thumb-play">
                  <Play size={12} fill="currentColor" />
                </span>
              </div>
              <div className="step-meta">
                <span className="step-num">{String(step.number).padStart(2, '0')}</span>
                <span className="step-title">{step.title}</span>
              </div>
              {i < steps.length - 1 && <div className="step-connector" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function thumbGradient(n) {
  const hues = [190, 175, 160, 145, 200, 210, 45, 30, 170];
  const h = hues[(n - 1) % hues.length];
  return `linear-gradient(145deg, hsl(${h}, 35%, 28%), hsl(${h}, 25%, 14%))`;
}
