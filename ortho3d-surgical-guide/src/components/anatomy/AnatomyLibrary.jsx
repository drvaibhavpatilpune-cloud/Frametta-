import { useState } from 'react';
import { Lock, ChevronRight } from 'lucide-react';
import { ANATOMY_CATEGORIES, KNEE_STRUCTURES } from '../../data/anatomy';
import { useAppStore } from '../../store/useAppStore';
import { getProcedure } from '../../data/procedures';
import './AnatomyLibrary.css';

export default function AnatomyLibrary() {
  const [active, setActive] = useState('knee');
  const setTab = useAppStore((s) => s.setTab);
  const setActiveProcedureId = useAppStore((s) => s.setActiveProcedureId);
  const setStepCount = useAppStore((s) => s.setStepCount);
  const setCurrentStepIndex = useAppStore((s) => s.setCurrentStepIndex);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const addRecent = useAppStore((s) => s.addRecent);

  const openKneeViewer = () => {
    const p = getProcedure('acl-reconstruction');
    addRecent(p.id);
    setActiveProcedureId(p.id);
    setStepCount(p.steps.length);
    setCurrentStepIndex(0);
    setViewMode('anatomy');
    setTab('viewer');
  };

  const cat = ANATOMY_CATEGORIES.find((c) => c.id === active);

  return (
    <div className="anatomy-lib fade-in">
      <header className="lib-header">
        <h1 className="section-title">Anatomy Library</h1>
        <p className="section-sub">
          Modular anatomical regions. MVP includes a complete interactive knee complex.
        </p>
      </header>

      <div className="lib-layout">
        <aside className="lib-cats panel">
          {ANATOMY_CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`lib-cat ${active === c.id ? 'active' : ''}`}
              onClick={() => setActive(c.id)}
            >
              <span>{c.label}</span>
              {c.available ? <ChevronRight size={16} /> : <Lock size={14} className="lock" />}
            </button>
          ))}
        </aside>

        <section className="lib-detail panel">
          <div className="lib-detail-head">
            <h2>{cat?.label}</h2>
            {active === 'knee' ? (
              <button className="btn btn-primary" onClick={openKneeViewer}>
                Open 3D Knee
              </button>
            ) : (
              <span className="chip">Coming in content pack</span>
            )}
          </div>

          {active === 'knee' ? (
            <div className="struct-list">
              {KNEE_STRUCTURES.map((s) => (
                <div key={s.id} className="struct-item">
                  <span className="struct-swatch" style={{ background: s.color }} />
                  <div>
                    <div className="struct-name">{s.name}</div>
                    <div className="struct-desc">{s.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="lib-placeholder">
              {cat?.label} models will load independently through the content system once authored.
              The architecture already supports GLB/glTF packs per region.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
