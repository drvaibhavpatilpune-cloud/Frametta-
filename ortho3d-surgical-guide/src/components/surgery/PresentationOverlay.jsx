import { useRef, useState } from 'react';
import {
  X,
  MousePointer2,
  ArrowUpRight,
  StickyNote,
  Highlighter,
  Trash2,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import './PresentationOverlay.css';

export default function PresentationOverlay({ procedure, step, onExit }) {
  const drawingTool = useAppStore((s) => s.drawingTool);
  const setDrawingTool = useAppStore((s) => s.setDrawingTool);
  const annotations = useAppStore((s) => s.annotations);
  const addAnnotation = useAppStore((s) => s.addAnnotation);
  const clearAnnotations = useAppStore((s) => s.clearAnnotations);
  const stepPlaying = useAppStore((s) => s.stepPlaying);
  const stepPaused = useAppStore((s) => s.stepPaused);
  const playStep = useAppStore((s) => s.playStep);
  const pauseStep = useAppStore((s) => s.pauseStep);
  const nextStep = useAppStore((s) => s.nextStep);
  const languageMode = useAppStore((s) => s.languageMode);
  const setLanguageMode = useAppStore((s) => s.setLanguageMode);
  const [noteDraft, setNoteDraft] = useState('');
  const layerRef = useRef(null);

  const onCanvasClick = (e) => {
    if (!drawingTool || !layerRef.current) return;
    const rect = layerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (drawingTool === 'note') {
      if (!noteDraft.trim()) return;
      addAnnotation({ id: Date.now(), type: 'note', x, y, text: noteDraft.trim() });
      setNoteDraft('');
      return;
    }
    addAnnotation({ id: Date.now(), type: drawingTool, x, y });
  };

  const exp = languageMode === 'patient' ? step.patientExplanation : step.explanation;

  return (
    <div className="presentation-overlay">
      <div className="pres-top">
        <div>
          <div className="pres-eyebrow">Presentation Mode</div>
          <div className="pres-title">
            {procedure.name} · {step.title}
          </div>
        </div>
        <div className="pres-tools">
          <Tool
            active={!drawingTool}
            onClick={() => setDrawingTool(null)}
            icon={MousePointer2}
            label="Navigate"
          />
          <Tool
            active={drawingTool === 'arrow'}
            onClick={() => setDrawingTool('arrow')}
            icon={ArrowUpRight}
            label="Arrow"
          />
          <Tool
            active={drawingTool === 'highlight'}
            onClick={() => setDrawingTool('highlight')}
            icon={Highlighter}
            label="Mark"
          />
          <Tool
            active={drawingTool === 'note'}
            onClick={() => setDrawingTool('note')}
            icon={StickyNote}
            label="Note"
          />
          <button className="btn btn-ghost" onClick={clearAnnotations}>
            <Trash2 size={16} /> Clear
          </button>
          <button
            className="btn btn-ghost"
            onClick={() =>
              setLanguageMode(languageMode === 'patient' ? 'professional' : 'patient')
            }
          >
            {languageMode === 'patient' ? 'Patient' : 'Pro'}
          </button>
          <button className="btn btn-danger" onClick={onExit}>
            <X size={16} /> Exit
          </button>
        </div>
      </div>

      {drawingTool === 'note' && (
        <div className="pres-note-input">
          <input
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Type note, then tap the screen to place…"
          />
        </div>
      )}

      <div
        ref={layerRef}
        className={`pres-draw-layer ${drawingTool ? 'drawing' : ''}`}
        onClick={onCanvasClick}
      >
        {annotations.map((a) => (
          <div
            key={a.id}
            className={`ann ann-${a.type}`}
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
          >
            {a.type === 'arrow' && <ArrowUpRight size={28} />}
            {a.type === 'highlight' && <span className="ann-mark" />}
            {a.type === 'note' && <span className="ann-note">{a.text}</span>}
          </div>
        ))}
      </div>

      <div className="pres-caption panel">
        <p>{exp?.what}</p>
        <div className="pres-caption-actions">
          {stepPlaying && !stepPaused ? (
            <button className="btn btn-ghost" onClick={pauseStep}>
              <Pause size={16} /> Pause
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={playStep}>
              <Play size={16} /> Play
            </button>
          )}
          <button className="btn btn-primary" onClick={nextStep}>
            <SkipForward size={16} /> Next step
          </button>
        </div>
      </div>
    </div>
  );
}

function Tool({ active, onClick, icon: Icon, label }) {
  return (
    <button className={`btn btn-ghost ${active ? 'active' : ''}`} onClick={onClick} title={label}>
      <Icon size={16} />
      <span className="tool-label">{label}</span>
    </button>
  );
}
