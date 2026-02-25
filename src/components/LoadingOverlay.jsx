import React from 'react';

export default function LoadingOverlay({ visible, message = 'Loading...' }) {
  if (!visible) return null;
  return (
    <div className="loading-overlay" aria-busy="true">
      <div className="loading-spinner" />
      <span className="loading-message">{message}</span>
    </div>
  );
}
