import { Star, Lock, Play } from 'lucide-react';
import { PROCEDURE_REGIONS, getProcedure } from '../../data/procedures';
import { useAppStore } from '../../store/useAppStore';
import './ProceduresScreen.css';

export default function ProceduresScreen() {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const setTab = useAppStore((s) => s.setTab);
  const setActiveProcedureId = useAppStore((s) => s.setActiveProcedureId);
  const addRecent = useAppStore((s) => s.addRecent);
  const setStepCount = useAppStore((s) => s.setStepCount);
  const setCurrentStepIndex = useAppStore((s) => s.setCurrentStepIndex);
  const setViewMode = useAppStore((s) => s.setViewMode);

  const open = (id) => {
    const p = getProcedure(id);
    if (!p || p.status !== 'available') return;
    addRecent(id);
    setActiveProcedureId(id);
    setStepCount(p.steps.length);
    setCurrentStepIndex(0);
    setViewMode('surgical');
    setTab('viewer');
  };

  return (
    <div className="proc-screen fade-in">
      <header className="proc-header">
        <h1 className="section-title">Surgical Procedures</h1>
        <p className="section-sub">
          Organized by anatomical region. Each module is data-driven — new surgeries load without
          rewriting the app.
        </p>
      </header>

      {PROCEDURE_REGIONS.map((region) => (
        <section key={region.id} className="proc-region">
          <h2>{region.label}</h2>
          <div className="proc-grid">
            {region.procedures.map((id) => {
              const p = getProcedure(id);
              if (!p) return null;
              const available = p.status === 'available';
              const fav = favorites.includes(id);
              return (
                <article key={id} className={`proc-card ${available ? '' : 'locked'}`}>
                  <div className="proc-card-top">
                    <h3>{p.name}</h3>
                    <button
                      className={`fav-btn ${fav ? 'on' : ''}`}
                      onClick={() => toggleFavorite(id)}
                      aria-label="Toggle favorite"
                    >
                      <Star size={16} fill={fav ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <p>{available ? p.summary : p.summary}</p>
                  <div className="proc-card-actions">
                    {available ? (
                      <button className="btn btn-primary" onClick={() => open(id)}>
                        <Play size={16} /> Start module
                      </button>
                    ) : (
                      <span className="chip">
                        <Lock size={12} /> Coming soon
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
