// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export default interface TabRenderer {
  /** Returns the current state. */
  saveState(): unknown;

  /** Restores to the provided state. */
  restoreState(state: unknown): void;

  /** Get the desired window aspect ratio for satellites. */
  getAspectRatio(): number | null;

  /** Called once per frame. */
  render(command: unknown): void;
}

export class NoopRenderer implements TabRenderer {
  saveState(): unknown {
    return null;
  }

  restoreState(): void {}

  getAspectRatio(): number | null {
    return null;
  }

  render(): void {}
}
