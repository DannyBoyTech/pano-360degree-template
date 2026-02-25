import React, { useRef, useEffect, useState } from 'react';
import Marzipano from 'marzipano';
import ViewerShell from './ViewerShell';
import VideoAsset from './VideoAsset';

const MAX_TEXTURE_SIZE = 4096;
const LOOK_DURATION_MS = 400;
const SCENE_TRANSITION_DURATION_MS = 1000;

function getHotspotCoords(hotspot, index, total) {
  const yaw = hotspot.yaw != null ? hotspot.yaw : -Math.PI + (index / Math.max(1, total)) * 2 * Math.PI;
  const pitch = hotspot.pitch != null ? hotspot.pitch : 0;
  return { yaw, pitch };
}

function createLinkHotspotElement(hotspot, onNavigate, yaw, pitch) {
  const el = document.createElement('div');
  el.className = 'hotspot hotspot-link';
  el.textContent = hotspot.label;
  el.title = hotspot.label;
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    if (hotspot.targetSceneId) onNavigate(hotspot.targetSceneId, yaw, pitch);
  });
  return el;
}

function loadPanoramaImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (w <= MAX_TEXTURE_SIZE && h <= MAX_TEXTURE_SIZE / 2) {
        return resolve(img);
      }
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

function createMarzipanoScene(viewer, sceneDef, onNavigate) {
  return loadPanoramaImage(sceneDef.image).then((assetElement) => {
    const width = assetElement.naturalWidth ?? assetElement.width ?? 4096;
    const asset = new Marzipano.StaticAsset(assetElement);
    const source = new Marzipano.SingleAssetSource(asset);
    const geometry = new Marzipano.EquirectGeometry([{ width }]);
    const viewLimiter = Marzipano.RectilinearView.limit.traditional(
      2048,
      (120 * Math.PI) / 180,
      (120 * Math.PI) / 180
    );
    const view = new Marzipano.RectilinearView(
      { fov: (100 * Math.PI) / 180 },
      viewLimiter
    );
    const scene = viewer.createScene({
      source,
      geometry,
      view,
      pinFirstLevel: true,
    });

    const hotspots = sceneDef.hotspots || [];
    const container = scene.hotspotContainer();
    hotspots.forEach((h, i) => {
      const { yaw, pitch } = getHotspotCoords(h, i, hotspots.length);
      const el = createLinkHotspotElement(h, onNavigate, yaw, pitch);
      container.createHotspot(el, { yaw, pitch });
    });
    return scene;
  });
}

function createVideoScene(viewer, sceneDef) {
  const videoAsset = new VideoAsset(null);
  const source = new Marzipano.SingleAssetSource(videoAsset);
  const geometry = new Marzipano.EquirectGeometry([{ width: 1 }]);
  const viewLimiter = Marzipano.RectilinearView.limit.traditional(
    2048,
    (120 * Math.PI) / 180,
    (120 * Math.PI) / 180
  );
  const view = new Marzipano.RectilinearView(
    { fov: (100 * Math.PI) / 180 },
    viewLimiter
  );
  const scene = viewer.createScene({
    source,
    geometry,
    view,
    pinFirstLevel: true,
  });
  return { scene, videoAsset, videoUrl: sceneDef.video };
}

function attachVideoOnClick(container, videoUrl, videoAsset, onStarted) {
  if (!container || !videoUrl || !videoAsset) return () => {};
  const video = document.createElement('video');
  video.loop = true;
  video.muted = false;
  video.crossOrigin = 'anonymous';
  video.playsInline = true;

  const start = () => {
    cleanup();
    video.src = videoUrl;
    const onReady = () => {
      video.removeEventListener('loadedmetadata', onReady);
      videoAsset.setVideo(video);
      video.play().then(onStarted).catch(() => onStarted());
    };
    video.addEventListener('loadedmetadata', onReady);
  };

  const cleanup = () => {
    container.removeEventListener('click', start);
    container.removeEventListener('touchstart', start, { passive: true });
  };
  container.addEventListener('click', start);
  container.addEventListener('touchstart', start, { passive: true });
  return cleanup;
}

export default function MarzipanoViewer({
  sceneId,
  scenes = [],
  onSceneChange,
  loading,
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const sceneCacheRef = useRef({});
  const videoStartedRef = useRef({});
  const videoClickCleanupRef = useRef(null);
  const [loadError, setLoadError] = useState(null);
  const [videoPending, setVideoPending] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const viewer = new Marzipano.Viewer(containerRef.current, {});
    viewerRef.current = viewer;
    return () => {
      viewer.destroy();
      viewerRef.current = null;
      sceneCacheRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current || !sceneId) return;
    const sceneDef = scenes.find((s) => s.id === sceneId);
    if (!sceneDef) return;

    const viewer = viewerRef.current;
    const cache = sceneCacheRef.current;

    const isVideoScene = !!sceneDef.video;
    if (!isVideoScene) {
      videoClickCleanupRef.current?.();
      videoClickCleanupRef.current = null;
      setVideoPending(false);
    }

    const navigateCallback = (targetSceneId, hotspotYaw, hotspotPitch) => {
      viewer.lookTo(
        { yaw: hotspotYaw, pitch: hotspotPitch },
        {
          transitionDuration: LOOK_DURATION_MS,
          controlsInterrupt: true,
        },
        () => {
          onSceneChange(targetSceneId);
        }
      );
    };

    const applyScene = (scene) => {
      const currentScene = viewer.scene();
      if (!currentScene) {
        scene.switchTo();
        return;
      }
      viewer.switchScene(scene, {
        transitionDuration: SCENE_TRANSITION_DURATION_MS,
      });
    };

    if (cache[sceneId]) {
      const cached = cache[sceneId];
      const sceneToApply = cached.scene ?? cached;
      applyScene(sceneToApply);
      if (isVideoScene && cached.videoAsset && !videoStartedRef.current[sceneId]) {
        videoClickCleanupRef.current?.();
        setVideoPending(true);
        videoClickCleanupRef.current = attachVideoOnClick(
          containerRef.current,
          cached.videoUrl,
          cached.videoAsset,
          () => {
            videoStartedRef.current[sceneId] = true;
            setVideoPending(false);
            videoClickCleanupRef.current = null;
          }
        );
      } else {
        videoClickCleanupRef.current?.();
        videoClickCleanupRef.current = null;
        setVideoPending(false);
      }
      return;
    }

    setLoadError(null);
    if (isVideoScene) {
      const { scene, videoAsset, videoUrl } = createVideoScene(viewer, sceneDef);
      cache[sceneId] = { scene, videoAsset, videoUrl };
      applyScene(scene);
      videoClickCleanupRef.current?.();
      setVideoPending(true);
      videoClickCleanupRef.current = attachVideoOnClick(
        containerRef.current,
        videoUrl,
        videoAsset,
        () => {
          videoStartedRef.current[sceneId] = true;
          setVideoPending(false);
          videoClickCleanupRef.current = null;
        }
      );
      return;
    }

    createMarzipanoScene(viewer, sceneDef, navigateCallback)
      .then((scene) => {
        cache[sceneId] = scene;
        applyScene(scene);
        setVideoPending(false);
      })
      .catch((err) => {
        setLoadError(err.message || 'Failed to load scene');
      });
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
      {videoPending && (
        <div className="video-play-overlay" aria-hidden="true">
          <span>Click or tap to play 360° video</span>
        </div>
      )}
    </ViewerShell>
  );
}
