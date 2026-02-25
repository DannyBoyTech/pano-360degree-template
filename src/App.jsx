import { useState, useMemo } from 'react';
import config from './data/resort.config.json';
import { validateResortConfig } from './utils/configValidation';
import { useViewerState } from './hooks/useViewerState';
import { useGuidedTour } from './hooks/useGuidedTour';
import Header from './components/Header';
import CTAButton from './components/CTAButton';
import GuidedTourControls from './components/GuidedTourControls';
import MarzipanoViewer from './viewers/MarzipanoViewer';
import './styles/viewer.css';

const brand = config.brand || {};
const scenes = config.scenes || [];
const guidedTourIds = config.guidedTour || [];

export default function App() {
  const validation = useMemo(() => validateResortConfig(config), []);
  const { currentSceneId, setScene } = useViewerState(config);

  const { isGuidedMode, isPaused, start, stop, pauseResume } = useGuidedTour({
    sceneIds: guidedTourIds,
    durationPerScene: 6000,
    onSceneChange: setScene,
  });

  const currentScene = useMemo(
    () => scenes.find((s) => s.id === currentSceneId),
    [currentSceneId, scenes]
  );

  const handleExploreFreely = () => {
    if (isGuidedMode) stop();
  };

  return (
    <div className="app">
      <Header brandName={brand.name} />
      <div className="toolbar">
        <button
          type="button"
          className="toolbar-btn"
          onClick={handleExploreFreely}
        >
          Explore Freely
        </button>
        <GuidedTourControls
          isGuidedMode={isGuidedMode}
          isPaused={isPaused}
          onToggleGuided={start}
          onPauseResume={pauseResume}
          onStop={stop}
        />
        <CTAButton label={brand.ctaLabel} url={brand.ctaUrl} />
      </div>
      <div className="app-body">
        <main className="main-viewer">
          <MarzipanoViewer
            sceneId={currentSceneId}
            scenes={scenes}
            onSceneChange={setScene}
            loading={false}
          />
        </main>
        <aside className="info-panel info-panel-optional">
          {currentScene && (
            <h2 className="info-panel-title">{currentScene.title}</h2>
          )}
        </aside>
      </div>
      {currentScene && (
        <div className="scene-title-bottom" role="status">
          {currentScene.title}
        </div>
      )}
      {!validation.valid && (
        <pre className="config-errors" role="alert">
          Config: {validation.errors.join('; ')}
        </pre>
      )}
    </div>
  );
}
