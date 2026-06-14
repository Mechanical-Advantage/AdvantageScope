// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import TabRenderer from "./TabRenderer";

export default class VideoRenderer implements TabRenderer {
  private IMAGE: HTMLImageElement;

  private aspectRatio: number | null = null;

  constructor(root: HTMLElement) {
    this.IMAGE = root.getElementsByTagName("img")[0] as HTMLImageElement;
  }

  getAspectRatio(): number | null {
    return this.aspectRatio;
  }

  render(command: unknown): void {
    if (typeof command !== "string") return;
    this.IMAGE.hidden = command === "";
    this.IMAGE.src = command;
    let width = this.IMAGE.naturalWidth;
    let height = this.IMAGE.naturalHeight;
    if (width > 0 && height > 0) {
      this.aspectRatio = width / height;
    } else {
      this.aspectRatio = null;
    }
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}
}
