// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/**
 * Applies a ScrollSensor event to a view: a drag pans it, and a scroll zooms it around the cursor.
 * Updates pan in place and returns the new zoom.
 *
 * @param centerX The cursor's x position relative to the center of the canvas, in pixels.
 * @param centerY The cursor's y position relative to the center of the canvas, in pixels.
 * @param scale Pixels per view unit at a zoom of 1.
 */
export function scrollZoomPan(
  zoom: number,
  pan: [number, number],
  dx: number,
  dy: number,
  isPan: boolean,
  centerX: number,
  centerY: number,
  scale: number,
  limited = true
): number {
  if (!limited) {
    zoom = Math.min(1e4, Math.max(1e-3, Number.isNaN(zoom) ? 1 : zoom));
    scale = Number.isFinite(scale) && scale > 0 ? scale : 1;
    for (let i = 0; i < 2; i++) pan[i] = Number.isFinite(pan[i]) ? pan[i] : 0;
  }
  const clampPan = () => {
    if (!limited) for (let i = 0; i < 2; i++) pan[i] = Math.min(1e6, Math.max(-1e6, Number.isNaN(pan[i]) ? 0 : pan[i]));
  };
  if (isPan) {
    pan[0] += dx / (scale * zoom);
    pan[1] += dy / (scale * zoom);
    clampPan();
    return zoom;
  }
  const newZoom = limited
    ? Math.min(10, Math.max(1, zoom + dy * -0.005))
    : Math.min(1e4, Math.max(1e-3, zoom * Math.exp((Number.isNaN(dy) ? 0 : -dy) * 0.005)));
  if (newZoom !== zoom) {
    pan[0] += (centerX / scale) * (1 / zoom - 1 / newZoom);
    pan[1] += (centerY / scale) * (1 / zoom - 1 / newZoom);
  }
  clampPan();
  return newZoom;
}

/** How far a view may pan along one axis, in view units, before its content leaves the canvas. */
export function panMargin(displaySize: number, canvasSize: number, zoomedScale: number): number {
  const margin = Math.max(0, (displaySize - canvasSize) * 0.5) / zoomedScale;
  return Number.isFinite(margin) ? margin : 0;
}
