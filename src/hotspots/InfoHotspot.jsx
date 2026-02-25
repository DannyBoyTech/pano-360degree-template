import React from 'react';

export default function InfoHotspot({ label, content, onClick }) {
  return (
    <button
      type="button"
      className="hotspot hotspot-info"
      onClick={() => onClick?.({ label, content })}
    >
      {label}
    </button>
  );
}
