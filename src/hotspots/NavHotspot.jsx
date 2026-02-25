import React from 'react';

export default function NavHotspot({ label, targetSceneId, onClick }) {
  return (
    <button
      type="button"
      className="hotspot hotspot-nav"
      onClick={() => onClick?.({ targetSceneId, label })}
    >
      {label}
    </button>
  );
}
