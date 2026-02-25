/**
 * Validates resort.config.json: startSceneId, duplicate scene IDs,
 * broken hotspot targets, empty guided tour.
 */
export function validateResortConfig(config) {
  const errors = [];
  if (!config) {
    errors.push('Config is null or undefined');
    return { valid: false, errors };
  }

  const scenes = config.scenes || [];
  const ids = scenes.map((s) => s.id);
  const sceneIds = new Set(ids);
  if (ids.length !== sceneIds.size) errors.push('Duplicate scene IDs');

  const startSceneId = config.startSceneId;
  if (!startSceneId) errors.push('startSceneId is required');
  else if (!sceneIds.has(startSceneId)) errors.push(`startSceneId "${startSceneId}" not found in scenes`);

  scenes.forEach((scene) => {
    (scene.hotspots || []).forEach((h) => {
      if (h.targetSceneId && !sceneIds.has(h.targetSceneId)) {
        errors.push(`Hotspot "${h.label}" targets missing scene: ${h.targetSceneId}`);
      }
    });
  });

  const guided = config.guidedTour || [];
  if (guided.length === 0) errors.push('guidedTour is empty');
  guided.forEach((id) => {
    if (!sceneIds.has(id)) errors.push(`guidedTour references missing scene: ${id}`);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
