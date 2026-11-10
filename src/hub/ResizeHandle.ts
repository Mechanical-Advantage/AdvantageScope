// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/**
 * Drags a divider, as the sidebar and tab controls handles do. Pressing the handle starts a drag that follows the
 * mouse anywhere in the window, and two clicks within 400 ms call `onDoubleClick`.
 */
export function attachResizeHandle(
  handle: HTMLElement,
  cursor: string | (() => string),
  onMove: (event: MouseEvent) => void,
  onDoubleClick: () => void,
  onActiveChange?: (active: boolean) => void,
  signal?: AbortSignal
) {
  let active = false;
  handle.addEventListener(
    "mousedown",
    () => {
      active = true;
      document.body.style.cursor = typeof cursor === "string" ? cursor : cursor();
      onActiveChange?.(true);
    },
    { signal }
  );
  window.addEventListener(
    "mouseup",
    () => {
      if (!active) return;
      active = false;
      document.body.style.cursor = "initial";
      onActiveChange?.(false);
    },
    { signal }
  );
  window.addEventListener(
    "mousemove",
    (event) => {
      if (active) onMove(event);
    },
    { signal }
  );
  let lastClick = 0;
  handle.addEventListener(
    "click",
    () => {
      let now = new Date().getTime();
      if (now - lastClick < 400) {
        onDoubleClick();
        lastClick = 0;
      } else {
        lastClick = now;
      }
    },
    { signal }
  );
}
