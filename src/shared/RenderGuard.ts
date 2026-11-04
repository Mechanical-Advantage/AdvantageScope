// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** Isolates independent periodic tasks, reporting a failure once until recovery. */
export class RenderGuard {
  private failed = false;
  run(action: () => void, onError: () => void = () => {}, onRecovery: () => void = () => {}) {
    try {
      action();
      if (this.failed) onRecovery();
      this.failed = false;
    } catch (error) {
      if (!this.failed) console.error("Unable to update telemetry view", error);
      this.failed = true;
      onError();
    }
  }
}

/** Inline status shared by hub and satellite renderers; never replaces controls. */
export function inlineStatus(root: HTMLElement, message: string) {
  let status = root.querySelector<HTMLElement>(":scope > .telemetry-status");
  if (!status && message) {
    status = document.createElement("p");
    status.className = "telemetry-status lap-empty";
    status.setAttribute("role", "status");
    Object.assign(status.style, { zIndex: "10", pointerEvents: "none" });
    root.append(status);
  }
  if (status) {
    status.textContent = message;
    status.hidden = !message;
  }
}
