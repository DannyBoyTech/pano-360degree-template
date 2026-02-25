import React, { useRef, useEffect, useState } from 'react';
import Marzipano from 'marzipano';
import ViewerShell from './ViewerShell';

/**
 * Place hotspot at yaw (radians). If not in config, spread around the horizon.
 */
function getHotspotCoords(hotspot, index, total) {
  const yaw = hotspot.yaw != null ? hotspot.yaw : -Math.PI + (index / Math.max(1, total)) * 2 * Math.PI;
  const pitch = hotspot.pitch != null ? hotspot.pitch : 0;
  return { yaw, pitch };
}

/**
 * Create a DOM element for a nav hotspot (click to go to another scene).
 */
function createLinkHotspotElement(hotspot, onNavigate) {
  const el = document.createElement('div');
  el.className = 'hotspot hotspot-link';
  el.textContent = hotspot.label;
  el.title = hotspot.label;
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (hotspot.targetSceneId) onNavigate(hotspot.targetSceneId);
  });
  return el;
}

const MAX_TEXTURE_SIZE = 4096;

/**
 * Load image and return promise; resolves with img or canvas suitable for Marzipano.
 * Images wider than MAX_TEXTURE_SIZE are drawn to a canvas to avoid WebGL texture limits.
 */
function loadPanoramaImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (w <= MAX_TEXTURE_SIZE && h <= MAX_TEXTURE_SIZE / 2) {
        return resolve(img);
      }
      const scale = Math.min(1, MAX_TEXTURE_SIZE / w);
      const cw = Math.min(w, MAX_TEXTURE_SIZE);
      const ch = Math.round((h * cw) / w);
      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(img);
      ctx.drawImage(img, 0, 0, w, h, 0, 0, cw, ch);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export default function MarzipanoViewer({
  sceneId,
  scenes = [],
  onSceneChange,
  loading,
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !sceneId) return;
    const sceneDef = scenes.find((s) => s.id === sceneId);
    if (!sceneDef) return;

    setLoadError(null);
    let cancelled = false;

    loadPanoramaImage(sceneDef.image)
      .then((assetElement) => {
        if (cancelled || !containerRef.current) return;
        const width = assetElement.naturalWidth ?? assetElement.width ?? 4096;
        const viewer = new Marzipano.Viewer(containerRef.current, {});
        viewerRef.current = viewer;

        const asset = new Marzipano.StaticAsset(assetElement);
        const source = new Marzipano.SingleAssetSource(asset);
        const geometry = new Marzipano.EquirectGeometry([{ width }]);
        const viewLimiter = Marzipano.RectilinearView.limit.traditional(1024, (100 * Math.PI) / 180);
        const view = new Marzipano.RectilinearView(null, viewLimiter);
        const scene = viewer.createScene({
          source,
          geometry,
          view,
          pinFirstLevel: true,
        });
        scene.switchTo();

        const hotspots = sceneDef.hotspots || [];
        const container = scene.hotspotContainer();
        hotspots.forEach((h, i) => {
          const el = createLinkHotspotElement(h, onSceneChange);
          const { yaw, pitch } = getHotspotCoords(h, i, hotspots.length);
          container.createHotspot(el, { yaw, pitch });
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Failed to load scene');
      });

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [sceneId, scenes, onSceneChange]);

  if (loadError) {
    return (
      <ViewerShell loading={false}>
        <div className="viewer-load-error">
          <p>{loadError}</p>
          <p>Check that the image exists in public/panos/ and is a valid equirectangular JPG.</p>
        </div>
      </ViewerShell>
    );
  }

  return (
    <ViewerShell loading={loading} loadingMessage="Loading scene...">
      <div ref={containerRef} className="marzipano-container" />
    </ViewerShell>
  );
}
