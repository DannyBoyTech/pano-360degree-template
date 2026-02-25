import React from 'react';
import LoadingOverlay from '../components/LoadingOverlay';

export default function ViewerShell({ children, loading, loadingMessage }) {
  return (
    <div className="viewer-shell">
      <div className="viewer-container">{children}</div>
      <LoadingOverlay visible={loading} message={loadingMessage} />
    </div>
  );
}
