import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, X, Volume2, Cast, MoreHorizontal } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import './CinematicOverlay.css';

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function CinematicOverlay({
  procedure,
  step,
  languageMode,
  onClose,
  onOpenLayers,
}) {
  const stepProgress = useAppStore((s) => s.stepProgress);
  const stepPlaying = useAppStore((s) => s.stepPlaying);
  const stepPaused = useAppStore((s) => s.stepPaused);
  const togglePlayPause = useAppStore((s) => s.togglePlayPause);
  const skipStepSeconds = useAppStore((s) => s.skipStepSeconds);
  const seekStepProgress = useAppStore((s) => s.seekStepProgress);
  const nextStep = useAppStore((s) => s.nextStep);
  const prevStep = useAppStore((s) => s.prevStep);
  const controlsVisible = useAppStore((s) => s.controlsVisible);
  const setControlsVisible = useAppStore((s) => s.setControlsVisible);
  const bumpControlsVisible = useAppStore((s) => s.bumpControlsVisible);
  const controlsBump = useAppStore((s) => s.controlsBump);
  const hideTimer = useRef(null);
  const [dragging, setDragging] = useState(false);

  const duration = step?.durationSec || 10;
  const currentSec = stepProgress * duration;
  const remaining = duration - currentSec;
  const isPlaying = stepPlaying && !stepPaused;

  const exp = languageMode === 'patient' ? step?.patientExplanation : step?.explanation;
  const caption = exp?.what || step?.title || '';

  useEffect(() => {
    bumpControlsVisible();
  }, [step?.id, bumpControlsVisible]);

  useEffect(() => {
    if (!controlsVisible || dragging) return undefined;
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 2800);
    return () => clearTimeout(hideTimer.current);
  }, [controlsVisible, controlsBump, isPlaying, dragging, setControlsVisible]);

  const onStageTap = (e) => {
    // Don't steal scrubber / button clicks
    if (e.target.closest('button, input, .cine-caption, .cine-scrub')) return;
    bumpControlsVisible();
    if (!controlsVisible) return;
    // tap empty area toggles play when controls already visible
    togglePlayPause();
  };

  return (
    <div
      className={`cinematic-overlay ${controlsVisible ? 'show-controls' : 'hide-controls'}`}
      onPointerDown={onStageTap}
    >
      <div className="cine-top">
        <button className="cine-icon-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className="cine-top-title">
          <span className="cine-proc">{procedure.name}</span>
          <span className="cine-step">
            {String(step.number).padStart(2, '0')} · {step.title}
          </span>
        </div>
        <div className="cine-top-actions">
          <button className="cine-icon-btn" aria-label="Cast" type="button">
            <Cast size={18} />
          </button>
          <button className="cine-icon-btn" aria-label="Audio" type="button">
            <Volume2 size={18} />
          </button>
        </div>
      </div>

      <div className="cine-center-controls">
        <button
          className="cine-round"
          onClick={(e) => {
            e.stopPropagation();
            skipStepSeconds(-5, duration);
            bumpControlsVisible();
          }}
          aria-label="Back 5 seconds"
        >
          <span className="cine-skip-num">5</span>
          <RotateCcw size={18} />
        </button>
        <button
          className="cine-round cine-round-main"
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
            bumpControlsVisible();
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
        </button>
        <button
          className="cine-round"
          onClick={(e) => {
            e.stopPropagation();
            skipStepSeconds(5, duration);
            bumpControlsVisible();
          }}
          aria-label="Forward 5 seconds"
        >
          <span className="cine-skip-num">5</span>
          <RotateCcw size={18} className="flip" />
        </button>
      </div>

      <div className="cine-bottom">
        {caption && (
          <div className="cine-caption">
            <p>{caption}</p>
          </div>
        )}

        <div className="cine-scrub">
          <span className="cine-time">{formatTime(currentSec)}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={stepProgress}
            onChange={(e) => {
              setDragging(true);
              seekStepProgress(parseFloat(e.target.value));
              bumpControlsVisible();
            }}
            onPointerUp={() => setDragging(false)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Animation progress"
          />
          <span className="cine-time">-{formatTime(remaining)}</span>
          <button
            className="cine-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLayers?.();
            }}
            aria-label="More"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="cine-step-rail">
          <button
            className="cine-chip"
            onClick={(e) => {
              e.stopPropagation();
              prevStep();
            }}
          >
            Prev
          </button>
          <div className="cine-dots">
            {Array.from({ length: procedure.steps.length }).map((_, i) => (
              <span
                key={procedure.steps[i].id}
                className={`cine-dot ${i === step.number - 1 ? 'on' : ''} ${i < step.number - 1 ? 'done' : ''}`}
              />
            ))}
          </div>
          <button
            className="cine-chip primary"
            onClick={(e) => {
              e.stopPropagation();
              nextStep();
            }}
          >
            Next step
          </button>
        </div>
      </div>
    </div>
  );
}
