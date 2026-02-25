/**
 * Marzipano Asset for 360 video. Implements the Asset interface so the
 * viewer can use a video element as a dynamic equirectangular source.
 * Based on Marzipano demos/video/VideoAsset.js
 */
function VideoAsset(videoElement) {
  this._videoElement = videoElement || null;
  this._destroyed = false;
  this._listeners = { change: [] };
  this._emitChange = this.emit.bind(this, 'change');
  this._lastTimestamp = -1;
  this._rafId = null;

  this._emptyCanvas = document.createElement('canvas');
  this._emptyCanvas.width = 1;
  this._emptyCanvas.height = 1;

  if (videoElement) this._attachVideo(videoElement);
}

VideoAsset.prototype.on = function (event, fn) {
  if (!this._listeners[event]) this._listeners[event] = [];
  this._listeners[event].push(fn);
};

VideoAsset.prototype.emit = function (event) {
  const list = this._listeners[event];
  if (list) list.forEach((fn) => fn());
};

VideoAsset.prototype._attachVideo = function (videoElement) {
  if (this._videoElement) {
    this._videoElement.removeEventListener('timeupdate', this._emitChange);
  }
  this._videoElement = videoElement;
  if (!this._videoElement) return;
  this._videoElement.addEventListener('timeupdate', this._emitChange);
  const self = this;
  function loop() {
    if (!self._destroyed && self._videoElement && !self._videoElement.paused) {
      self.emit('change');
    }
    if (!self._destroyed) self._rafId = requestAnimationFrame(loop);
  }
  this._rafId = requestAnimationFrame(loop);
  this.emit('change');
};

VideoAsset.prototype.setVideo = function (videoElement) {
  this._attachVideo(videoElement || null);
};

VideoAsset.prototype.width = function () {
  if (this._videoElement && this._videoElement.videoWidth) {
    return this._videoElement.videoWidth;
  }
  return this._emptyCanvas.width;
};

VideoAsset.prototype.height = function () {
  if (this._videoElement && this._videoElement.videoHeight) {
    return this._videoElement.videoHeight;
  }
  return this._emptyCanvas.height;
};

VideoAsset.prototype.element = function () {
  return this._videoElement && this._videoElement.videoWidth
    ? this._videoElement
    : this._emptyCanvas;
};

VideoAsset.prototype.isDynamic = function () {
  return true;
};

VideoAsset.prototype.timestamp = function () {
  if (this._videoElement) this._lastTimestamp = this._videoElement.currentTime;
  return this._lastTimestamp;
};

VideoAsset.prototype.destroy = function () {
  this._destroyed = true;
  if (this._videoElement) {
    this._videoElement.removeEventListener('timeupdate', this._emitChange);
  }
  if (this._rafId) {
    cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }
};

export default VideoAsset;
