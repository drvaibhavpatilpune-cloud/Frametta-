import {
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layers,
  Eye,
  Presentation,
  X,
  Focus,
  ChevronDown,
  ChevronUp,
  Bookmark,
} from 'lucide-react';
import { useEffect } from 'react';
import AnatomyViewer from '../../engine/AnatomyViewer';
import { CAMERA_PRESETS } from '../../engine/cameraPresets';
import { useAppStore } from '../../store/useAppStore';
import { getProcedure } from '../../data/procedures';
import { getStructure, LAYER_GROUPS } from '../../data/anatomy';
import { useIsMobile } from '../../hooks/useMediaQuery';
import SurgicalTimeline from './SurgicalTimeline';
import ExplanationPanel from './ExplanationPanel';
import OrientationIndicator from './OrientationIndicator';
import PresentationOverlay from './PresentationOverlay';
import './SurgicalModule.css';

export default function SurgicalModule() {
  const isMobile = useIsMobile();
  const activeProcedureId = useAppStore((s) => s.activeProcedureId);
  const procedure = getProcedure(activeProcedureId) || getProcedure('acl-reconstruction');
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const step = procedure.steps[currentStepIndex];
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const languageMode = useAppStore((s) => s.languageMode);
  const setLanguageMode = useAppStore((s) => s.setLanguageMode);
  const presentationMode = useAppStore((s) => s.presentationMode);
  const setPresentationMode = useAppStore((s) => s.setPresentationMode);
  const layersOpen = useAppStore((s) => s.layersOpen);
  const setLayersOpen = useAppStore((s) => s.setLayersOpen);
  const explanationOpen = useAppStore((s) => s.explanationOpen);
  const setExplanationOpen = useAppStore((s) => s.setExplanationOpen);
  const setTab = useAppStore((s) => s.setTab);
  const requestCameraReset = useAppStore((s) => s.requestCameraReset);
  const toggleAutoRotate = useAppStore((s) => s.toggleAutoRotate);
  const autoRotate = useAppStore((s) => s.autoRotate);
  const setCameraPreset = useAppStore((s) => s.setCameraPreset);
  const cameraPreset = useAppStore((s) => s.cameraPreset);
  const visibility = useAppStore((s) => s.visibility);
  const toggleStructure = useAppStore((s) => s.toggleStructure);
  const setTransparency = useAppStore((s) => s.setTransparency);
  const transparency = useAppStore((s) => s.transparency);
  const selected = useAppStore((s) => s.selectedStructure);
  const setSelected = useAppStore((s) => s.setSelectedStructure);
  const isolated = useAppStore((s) => s.isolatedStructure);
  const setIsolated = useAppStore((s) => s.setIsolatedStructure);
  const explodeView = useAppStore((s) => s.explodeView);
  const toggleExplodeView = useAppStore((s) => s.toggleExplodeView);
  const stepPlaying = useAppStore((s) => s.stepPlaying);
  const stepPaused = useAppStore((s) => s.stepPaused);
  const playStep = useAppStore((s) => s.playStep);
  const pauseStep = useAppStore((s) => s.pauseStep);
  const replayStep = useAppStore((s) => s.replayStep);
  const nextStep = useAppStore((s) => s.nextStep);
  const prevStep = useAppStore((s) => s.prevStep);
  const setCurrentStepIndex = useAppStore((s) => s.setCurrentStepIndex);
  const saveCustomCamera = useAppStore((s) => s.saveCustomCamera);
  const showLabels = useAppStore((s) => s.showLabels);
  const setShowLabels = useAppStore((s) => s.setShowLabels);

  const selectedInfo = selected ? getStructure(selected) : null;

  useEffect(() => {
    if (isMobile) {
      setLayersOpen(false);
      setExplanationOpen(false);
    }
  }, [isMobile, setLayersOpen, setExplanationOpen]);

  const onStepSelect = (index) => {
    setCurrentStepIndex(index);
    const s = procedure.steps[index];
    if (s?.camera) setCameraPreset(s.camera);
  };

  return (
    <div
      className={`surgical-module ${presentationMode ? 'presentation' : ''} ${isMobile ? 'mobile' : ''}`}
    >
      <AnatomyViewer step={step} viewMode={viewMode} languageMode={languageMode} />

      {!presentationMode && (
        <div className="sm-topbar">
          <button className="btn btn-ghost sm-back" onClick={() => setTab('procedures')}>
            <X size={16} />
            {!isMobile && ' Close'}
          </button>
          <div className="sm-title-block">
            <h1>{procedure.name}</h1>
            <span>
              Step {String(step.number).padStart(2, '0')} — {step.title}
            </span>
          </div>
          <div className="sm-mode-switch">
            {['anatomy', 'surgical', 'teaching'].map((m) => (
              <button
                key={m}
                className={`mode-btn ${viewMode === m ? 'active' : ''}`}
                onClick={() => setViewMode(m)}
              >
                {isMobile ? m.slice(0, 3) : m}
              </button>
            ))}
          </div>
          {!isMobile && (
            <button
              className={`btn btn-ghost ${languageMode === 'patient' ? 'active' : ''}`}
              onClick={() =>
                setLanguageMode(languageMode === 'patient' ? 'professional' : 'patient')
              }
            >
              {languageMode === 'patient' ? 'Patient' : 'Professional'}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setPresentationMode(true)}>
            <Presentation size={16} />
            {!isMobile && ' Present'}
          </button>
        </div>
      )}

      {isMobile && !presentationMode && (
        <div className="sm-mobile-fabs">
          <button
            className={`fab ${layersOpen ? 'active' : ''}`}
            onClick={() => {
              setLayersOpen(!layersOpen);
              if (!layersOpen) setExplanationOpen(false);
            }}
          >
            <Layers size={18} />
          </button>
          <button
            className={`fab ${explanationOpen ? 'active' : ''}`}
            onClick={() => {
              setExplanationOpen(!explanationOpen);
              if (!explanationOpen) setLayersOpen(false);
            }}
          >
            <Eye size={18} />
          </button>
          <button
            className={`fab ${languageMode === 'patient' ? 'active' : ''}`}
            onClick={() =>
              setLanguageMode(languageMode === 'patient' ? 'professional' : 'patient')
            }
          >
            {languageMode === 'patient' ? 'Pt' : 'Pro'}
          </button>
        </div>
      )}

      <OrientationIndicator />

      <div className="sm-camera-rail">
        <button
          className="rail-btn"
          title="Reset"
          onClick={requestCameraReset}
        >
          <RotateCcw size={16} />
        </button>
        <button
          className={`rail-btn ${autoRotate ? 'active' : ''}`}
          title="Auto rotate"
          onClick={toggleAutoRotate}
        >
          <RotateCw size={16} />
        </button>
        {Object.values(CAMERA_PRESETS)
          .filter((p) =>
            ['ap', 'posterior', 'medial', 'lateral', 'superior', 'inferior', 'oblique', 'axial', 'surgical', 'arthroscopic'].includes(
              p.id
            )
          )
          .map((p) => (
            <button
              key={p.id}
              className={`rail-btn text ${cameraPreset === p.id ? 'active' : ''}`}
              onClick={() => setCameraPreset(p.id)}
              title={p.label}
            >
              {shortLabel(p.id)}
            </button>
          ))}
        <button
          className="rail-btn"
          title="Save custom camera for this step"
          onClick={() => {
            saveCustomCamera(`step-${step.id}`, {
              position: null, // placeholder — live capture via store extension later
              target: null,
              note: `Saved for ${step.title}`,
            });
            // Capture is approximate via preset remap
            saveCustomCamera(step.camera || 'custom', CAMERA_PRESETS[cameraPreset]);
          }}
        >
          <Bookmark size={16} />
        </button>
      </div>

      <div className="sm-playback">
        <button className="rail-btn" onClick={prevStep} title="Previous step">
          <SkipBack size={16} />
        </button>
        {stepPlaying && !stepPaused ? (
          <button className="rail-btn active" onClick={pauseStep} title="Pause">
            <Pause size={16} />
          </button>
        ) : (
          <button className="rail-btn" onClick={playStep} title="Play">
            <Play size={16} />
          </button>
        )}
        <button className="rail-btn" onClick={replayStep} title="Replay">
          <RotateCcw size={16} />
        </button>
        <button className="rail-btn" onClick={nextStep} title="Next step">
          <SkipForward size={16} />
        </button>
      </div>

      {!presentationMode && (
        <>
          <aside
            className={`sm-layers panel ${layersOpen ? 'open' : 'collapsed'} ${isMobile && !layersOpen ? 'hidden-mobile' : ''}`}
          >
            <button className="panel-toggle" onClick={() => setLayersOpen(!layersOpen)}>
              <Layers size={16} />
              <span>Layers</span>
              {layersOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            {layersOpen && (
              <div className="layers-body">
                {LAYER_GROUPS.map((g) => (
                  <div key={g.title} className="layer-group">
                    <div className="layer-group-title">{g.title}</div>
                    {g.ids.map((id) => {
                      const s = getStructure(id);
                      if (!s) return null;
                      return (
                        <label key={id} className="layer-row">
                          <input
                            type="checkbox"
                            checked={!!visibility[id]}
                            onChange={() => toggleStructure(id)}
                          />
                          <span>{s.name.replace(/ \(.+\)/, '')}</span>
                          <input
                            type="range"
                            min="0.15"
                            max="1"
                            step="0.05"
                            title="Transparency"
                            value={transparency[id] ?? 1}
                            onChange={(e) => setTransparency(id, parseFloat(e.target.value))}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </label>
                      );
                    })}
                  </div>
                ))}
                <div className="layer-actions">
                  <button
                    className={`btn btn-ghost ${explodeView ? 'active' : ''}`}
                    onClick={toggleExplodeView}
                  >
                    Explode view
                  </button>
                  <button
                    className={`btn btn-ghost ${showLabels ? 'active' : ''}`}
                    onClick={() => setShowLabels(!showLabels)}
                  >
                    <Eye size={14} /> Labels
                  </button>
                </div>
              </div>
            )}
          </aside>

          {(selectedInfo || ((viewMode === 'teaching' || viewMode === 'surgical') && (explanationOpen || !isMobile))) && (
            <div className={`sm-right-stack ${isMobile && !explanationOpen && !selectedInfo ? 'hidden-mobile' : ''}`}>
              {selectedInfo && (
                <div className="sm-selection panel">
                  <div className="sel-name">
                    {languageMode === 'patient' ? selectedInfo.patientName : selectedInfo.name}
                  </div>
                  <p>
                    {languageMode === 'patient'
                      ? selectedInfo.patientDescription
                      : selectedInfo.description}
                  </p>
                  <div className="sel-actions">
                    <button
                      className={`btn btn-ghost ${isolated === selectedInfo.id ? 'active' : ''}`}
                      onClick={() =>
                        setIsolated(isolated === selectedInfo.id ? null : selectedInfo.id)
                      }
                    >
                      <Focus size={14} /> Isolate
                    </button>
                    <button className="btn btn-ghost" onClick={() => setSelected(null)}>
                      Clear
                    </button>
                  </div>
                </div>
              )}
              {(viewMode === 'teaching' || viewMode === 'surgical') && (explanationOpen || !isMobile) && (
                <ExplanationPanel
                  step={step}
                  languageMode={languageMode}
                  open={explanationOpen || !isMobile}
                  onToggle={() => setExplanationOpen(!explanationOpen)}
                />
              )}
            </div>
          )}
        </>
      )}

      {viewMode !== 'anatomy' && (
        <SurgicalTimeline
          steps={procedure.steps}
          currentIndex={currentStepIndex}
          onSelect={onStepSelect}
          compact={presentationMode}
        />
      )}

      {presentationMode && (
        <PresentationOverlay
          procedure={procedure}
          step={step}
          onExit={() => setPresentationMode(false)}
        />
      )}
    </div>
  );
}

function shortLabel(id) {
  const map = {
    ap: 'A',
    posterior: 'P',
    medial: 'M',
    lateral: 'L',
    superior: 'S',
    inferior: 'I',
    oblique: 'Obl',
    axial: 'Ax',
    surgical: 'Surg',
    arthroscopic: 'Scope',
  };
  return map[id] || id;
}
