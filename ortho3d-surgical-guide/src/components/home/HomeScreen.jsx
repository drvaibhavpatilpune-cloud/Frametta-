import { Search, Star, Clock, Flame, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { listPopularProcedures, getProcedure, searchProcedures } from '../../data/procedures';
import { ANATOMY_CATEGORIES, KNEE_STRUCTURES } from '../../data/anatomy';
import './HomeScreen.css';

export default function HomeScreen() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const favorites = useAppStore((s) => s.favorites);
  const recent = useAppStore((s) => s.recentProcedures);
  const setTab = useAppStore((s) => s.setTab);
  const setActiveProcedureId = useAppStore((s) => s.setActiveProcedureId);
  const addRecent = useAppStore((s) => s.addRecent);
  const setStepCount = useAppStore((s) => s.setStepCount);
  const setCurrentStepIndex = useAppStore((s) => s.setCurrentStepIndex);

  const setViewMode = useAppStore((s) => s.setViewMode);
  const setCinematicMode = useAppStore((s) => s.setCinematicMode);

  const openProcedure = (id) => {
    const p = getProcedure(id);
    if (!p || p.status !== 'available') {
      setTab('procedures');
      return;
    }
    addRecent(id);
    setActiveProcedureId(id);
    setStepCount(p.steps.length);
    setCurrentStepIndex(0);
    setViewMode('surgical');
    setCinematicMode(true);
    setTab('viewer');
  };

  const procedureHits = searchQuery ? searchProcedures(searchQuery) : [];
  const anatomyHits = searchQuery
    ? [
        ...ANATOMY_CATEGORIES.filter((c) => c.label.toLowerCase().includes(searchQuery.toLowerCase())),
        ...KNEE_STRUCTURES.filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.patientName.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      ]
    : [];

  return (
    <div className="home-screen fade-in">
      <section className="home-hero">
        <p className="home-eyebrow">Interactive surgical education</p>
        <h1 className="home-brand">Ortho3D</h1>
        <p className="home-lead">
          Explore anatomy. Walk each surgical step. Rotate the model while you learn.
        </p>
        <div className="home-search">
          <Search size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search surgery or anatomy…"
            aria-label="Search surgery or anatomy"
          />
        </div>
        <div className="home-cta-row">
          <button className="btn btn-primary" onClick={() => openProcedure('acl-reconstruction')}>
            Open ACL Reconstruction
          </button>
          <button className="btn btn-ghost" onClick={() => setTab('anatomy')}>
            Anatomy Library
          </button>
        </div>
      </section>

      {searchQuery && (
        <section className="home-section">
          <h2>Search results</h2>
          <div className="home-grid">
            {procedureHits.map((p) => (
              <ResultCard
                key={p.id}
                title={p.name}
                meta={`${p.region} · ${p.status === 'available' ? 'Available' : 'Coming soon'}`}
                onClick={() => openProcedure(p.id)}
              />
            ))}
            {anatomyHits.map((a) => (
              <ResultCard
                key={a.id}
                title={a.label || a.name}
                meta={a.region ? 'Region' : a.category || 'Anatomy'}
                onClick={() => setTab('anatomy')}
              />
            ))}
            {!procedureHits.length && !anatomyHits.length && (
              <p className="empty-note">No matches for “{searchQuery}”.</p>
            )}
          </div>
        </section>
      )}

      {!searchQuery && (
        <>
          <section className="home-section">
            <div className="section-head">
              <Clock size={16} />
              <h2>Recently viewed</h2>
            </div>
            <div className="home-row">
              {recent.map((id) => {
                const p = getProcedure(id);
                if (!p) return null;
                return (
                  <button key={id} className="proc-chip" onClick={() => openProcedure(id)}>
                    <span>{p.name}</span>
                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="home-section">
            <div className="section-head">
              <Flame size={16} />
              <h2>Popular procedures</h2>
            </div>
            <div className="home-grid">
              {listPopularProcedures().map((p) => (
                <ResultCard
                  key={p.id}
                  title={p.name}
                  meta={p.region}
                  badge={p.status === 'available' ? 'MVP' : 'Soon'}
                  onClick={() => openProcedure(p.id)}
                />
              ))}
            </div>
          </section>

          <section className="home-section">
            <div className="section-head">
              <Star size={16} />
              <h2>Favorites</h2>
            </div>
            <div className="home-row">
              {favorites.map((id) => {
                const p = getProcedure(id);
                if (!p) return null;
                return (
                  <button key={id} className="proc-chip fav" onClick={() => openProcedure(id)}>
                    <Star size={14} fill="currentColor" />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ResultCard({ title, meta, badge, onClick }) {
  return (
    <button className="result-card" onClick={onClick}>
      <div>
        <div className="result-title">{title}</div>
        <div className="result-meta">{meta}</div>
      </div>
      {badge && <span className="result-badge">{badge}</span>}
    </button>
  );
}
