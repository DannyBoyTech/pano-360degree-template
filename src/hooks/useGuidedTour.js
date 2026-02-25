import { useState, useCallback, useRef } from 'react';

/**
 * Guided tour: auto-advance through scenes with optional pause.
 * durationPerScene in ms.
 */
export function useGuidedTour({ sceneIds = [], durationPerScene = 8000, onSceneChange }) {
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setIsGuidedMode(false);
    setIsPaused(false);
  }, []);

  const advance = useCallback(() => {
    if (sceneIds.length === 0) return;
    const next = (currentIndex + 1) % sceneIds.length;
    setCurrentIndex(next);
    const sceneId = sceneIds[next];
    onSceneChange?.(sceneId);
    if (!isGuidedMode || isPaused) return;
    timerRef.current = setTimeout(advance, durationPerScene);
  }, [currentIndex, sceneIds, isGuidedMode, isPaused, durationPerScene, onSceneChange]);

  const start = useCallback(() => {
    if (sceneIds.length === 0) return;
    setIsGuidedMode(true);
    setIsPaused(false);
    setCurrentIndex(0);
    const first = sceneIds[0];
    onSceneChange?.(first);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(advance, durationPerScene);
  }, [sceneIds, durationPerScene, onSceneChange, advance]);

  const pauseResume = useCallback(() => {
    setIsPaused((p) => !p);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    isGuidedMode,
    isPaused,
    currentGuidedIndex: currentIndex,
    start,
    stop,
    pauseResume,
  };
}
