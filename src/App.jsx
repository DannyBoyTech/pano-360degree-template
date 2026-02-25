import { useMemo } from 'react';
import config from './data/resort.config.json';
import { validateResortConfig } from './utils/configValidation';
import { useViewerState } from './hooks/useViewerState';
import MarzipanoViewer from './viewers/MarzipanoViewer';
import './styles/viewer.css';

const scenes = config.scenes || [];

export default function App() {
  const validation = useMemo(() => validateResortConfig(config), []);
  const { currentSceneId, setScene } = useViewerState(config);

  const currentScene = useMemo(
    () => scenes.find((s) => s.id === currentSceneId),
    [currentSceneId, scenes]
  );

  return (
    <div className="app">
      <main className="app-viewer">
        <MarzipanoViewer
          sceneId={currentSceneId}
          scenes={scenes}
          onSceneChange={setScene}
          loading={false}
        />
      </main>
      <footer className="status-bar" role="status">
        {currentScene ? currentScene.title : ''}
      </footer>
      {!validation.valid && (
        <pre className="config-errors" role="alert">
          Config: {validation.errors.join('; ')}
        </pre>
      )}
    </div>
  );
}
