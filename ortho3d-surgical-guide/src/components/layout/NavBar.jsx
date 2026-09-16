import { Home, Bone, Syringe, BookOpen } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import './NavBar.css';

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'anatomy', label: 'Anatomy', icon: Bone },
  { id: 'procedures', label: 'Procedures', icon: Syringe },
  { id: 'about', label: 'Guide', icon: BookOpen },
];

export default function NavBar() {
  const currentTab = useAppStore((s) => s.currentTab);
  const setTab = useAppStore((s) => s.setTab);
  const presentationMode = useAppStore((s) => s.presentationMode);

  if (presentationMode) return null;

  return (
    <header className="nav-bar">
      <div className="nav-brand" onClick={() => setTab('home')}>
        <div className="nav-mark">O3</div>
        <div className="nav-brand-text">
          <span className="nav-name">Ortho3D</span>
          <span className="nav-tag">Surgical Guide</span>
        </div>
      </div>
      <nav className="nav-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-tab ${currentTab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
