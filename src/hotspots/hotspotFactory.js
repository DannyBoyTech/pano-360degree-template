/**
 * Factory for creating hotspot DOM elements or config for Marzipano.
 * Types: nav (jump to scene), info (info card), cta (booking).
 */
export function createNavHotspot(label, targetSceneId, onClick) {
  const el = document.createElement('div');
  el.className = 'hotspot hotspot-nav';
  el.textContent = label;
  el.addEventListener('click', () => onClick?.({ type: 'nav', targetSceneId, label }));
  return el;
}

export function createInfoHotspot(label, content, onClick) {
  const el = document.createElement('div');
  el.className = 'hotspot hotspot-info';
  el.textContent = label;
  el.addEventListener('click', () => onClick?.({ type: 'info', label, content }));
  return el;
}
