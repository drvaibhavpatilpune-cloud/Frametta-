import { useEffect } from 'react';
import NavBar from './components/layout/NavBar';
import HomeScreen from './components/home/HomeScreen';
import AnatomyLibrary from './components/anatomy/AnatomyLibrary';
import ProceduresScreen from './components/procedures/ProceduresScreen';
import SurgicalModule from './components/surgery/SurgicalModule';
import AboutScreen from './components/about/AboutScreen';
import DisclaimerModal from './components/about/DisclaimerModal';
import { useAppStore } from './store/useAppStore';
import { getProcedure } from './data/procedures';

export default function App() {
  const currentTab = useAppStore((s) => s.currentTab);
  const activeProcedureId = useAppStore((s) => s.activeProcedureId);
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const setCameraPreset = useAppStore((s) => s.setCameraPreset);

  // Keep camera aligned with surgical step
  useEffect(() => {
    if (currentTab !== 'viewer' || !activeProcedureId) return;
    const procedure = getProcedure(activeProcedureId);
    const step = procedure?.steps?.[currentStepIndex];
    if (step?.camera) setCameraPreset(step.camera);
  }, [currentTab, activeProcedureId, currentStepIndex, setCameraPreset]);

  return (
    <div className="app-shell">
      {currentTab !== 'viewer' && <NavBar />}
      <main className="app-content">
        {currentTab === 'home' && <HomeScreen />}
        {currentTab === 'anatomy' && <AnatomyLibrary />}
        {currentTab === 'procedures' && <ProceduresScreen />}
        {currentTab === 'viewer' && <SurgicalModule />}
        {currentTab === 'about' && <AboutScreen />}
      </main>
      <DisclaimerModal />
    </div>
  );
}
