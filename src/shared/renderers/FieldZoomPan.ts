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
  scale: number
): number {
  if (isPan) {
    pan[0] += dx / (scale * zoom);
    pan[1] += dy / (scale * zoom);
    return zoom;
  }
  let newZoom = Math.min(10, Math.max(1, zoom + dy * -0.005));
  if (newZoom !== zoom) {
    pan[0] += (centerX / scale) * (1 / zoom - 1 / newZoom);
    pan[1] += (centerY / scale) * (1 / zoom - 1 / newZoom);
  }
  return newZoom;
}

/** How far a view may pan along one axis, in view units, before its content leaves the canvas. */
export function panMargin(displaySize: number, canvasSize: number, zoomedScale: number): number {
  return Math.max(0, (displaySize - canvasSize) * 0.5) / zoomedScale;
}
