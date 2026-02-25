import { useState, useCallback } from 'react';

/**
 * Single-tour viewer state: current scene and setter.
 * Initial scene from config.startSceneId.
 */
export function useViewerState(config) {
  const startSceneId = config?.startSceneId || null;
  const [currentSceneId, setCurrentSceneIdState] = useState(startSceneId);

  const setScene = useCallback((sceneId) => {
    setCurrentSceneIdState(sceneId);
  }, []);

  const effectiveSceneId = currentSceneId || startSceneId;
  return {
    currentSceneId: effectiveSceneId,
    setScene,
  };
}
