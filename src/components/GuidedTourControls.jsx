import React from 'react';

export default function GuidedTourControls({
  isGuidedMode,
  isPaused,
  onToggleGuided,
  onPauseResume,
  onStop,
}) {
  if (!isGuidedMode) {
    return (
      <div className="guided-tour-controls">
        <button type="button" className="btn-guided-start" onClick={onToggleGuided}>
          Start Guided Tour
        </button>
      </div>
    );
  }
  return (
    <div className="guided-tour-controls">
      <button type="button" onClick={onPauseResume}>
        {isPaused ? 'Resume' : 'Pause'}
      </button>
      <button type="button" onClick={onStop}>
        Stop tour
      </button>
    </div>
  );
}
