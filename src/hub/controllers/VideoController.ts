// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { createUUID } from "../../shared/util";
import TabController from "./TabController";

export default class VideoController implements TabController {
  private events = new AbortController();
  dispose() {
    this.events.abort();
  }

  UUID = createUUID();

  private LOCAL_SOURCE: HTMLButtonElement;

  private LOCK_BUTTON: HTMLButtonElement;
  private UNLOCK_BUTTON: HTMLButtonElement;
  private PLAY_BUTTON: HTMLButtonElement;
  private PAUSE_BUTTON: HTMLButtonElement;
  private FRAME_BACK_BUTTON: HTMLButtonElement;
  private FRAME_FORWARD_BUTTON: HTMLButtonElement;
  private SKIP_BACK_BUTTON: HTMLButtonElement;
  private SKIP_FORWARD_BUTTON: HTMLButtonElement;
  private VIDEO_TIMELINE_INPUT: HTMLInputElement;
  private VIDEO_TIMELINE_PROGRESS: HTMLElement;

  private imgFolder: string | null = null;
  private fps: number | null = null;
  private totalFrames: number | null = null;
  private completedFrames: number | null = null;

  private locked: boolean = false;
  private lockedStartLog: number = 0;
  private playing: boolean = false;
  private playStartFrame: number = 0;
  private playStartReal: number = 0;

  constructor(root: HTMLElement) {
    // Get elements
    let sourceSection = root.getElementsByClassName("video-source")[0] as HTMLElement;
    let timelineSection = root.getElementsByClassName("video-timeline-section")[0] as HTMLElement;
    let timelineControlsSection = root.getElementsByClassName("video-timeline-controls")[0] as HTMLElement;

    this.LOCAL_SOURCE = sourceSection.children[0] as HTMLButtonElement;

    this.LOCK_BUTTON = timelineSection.children[0] as HTMLButtonElement;
    this.UNLOCK_BUTTON = timelineSection.children[1] as HTMLButtonElement;

    this.PLAY_BUTTON = timelineControlsSection.children[2] as HTMLButtonElement;
    this.PAUSE_BUTTON = timelineControlsSection.children[3] as HTMLButtonElement;
    this.FRAME_BACK_BUTTON = timelineControlsSection.children[1] as HTMLButtonElement;
    this.FRAME_FORWARD_BUTTON = timelineControlsSection.children[4] as HTMLButtonElement;
    this.SKIP_BACK_BUTTON = timelineControlsSection.children[0] as HTMLButtonElement;
    this.SKIP_FORWARD_BUTTON = timelineControlsSection.children[5] as HTMLButtonElement;

    this.VIDEO_TIMELINE_INPUT = timelineSection.lastElementChild?.children[0] as HTMLInputElement;
    this.VIDEO_TIMELINE_PROGRESS = timelineSection.lastElementChild?.children[1].firstElementChild as HTMLElement;

    // Source selection
    this.LOCAL_SOURCE.addEventListener("click", () => {
      window.sendMainMessage("select-video", { uuid: this.UUID });
    });

    // Lock buttons
    let toggleLock = () => {
      if (!this.hasData()) return;
      this.locked = !this.locked;
      if (this.locked) {
        this.playing = false;
        let selectedTime = window.selection.getSelectedTime();
        if (selectedTime === null) selectedTime = 0;
        this.lockedStartLog = selectedTime - (Number(this.VIDEO_TIMELINE_INPUT.value) - 1) / this.fps!;
      }
      this.updateButtons();
    };
    this.LOCK_BUTTON.addEventListener("click", () => toggleLock());
    this.UNLOCK_BUTTON.addEventListener("click", () => toggleLock());

    // Playback buttons
    let togglePlayPause = () => {
      if (this.locked || !this.hasData()) return;
      this.playing = !this.playing;
      if (this.playing) {
        this.playStartFrame = Number(this.VIDEO_TIMELINE_INPUT.value);
        this.playStartReal = new Date().getTime() / 1000;
      }
      this.updateButtons();
    };
    let changeFrame = (delta: number) => {
      if (this.locked || !this.hasData() || this.playing) return;
      this.VIDEO_TIMELINE_INPUT.value = (Number(this.VIDEO_TIMELINE_INPUT.value) + delta).toString();
    };
    let skipTime = (delta: number) => {
      if (this.locked || !this.hasData()) return;
      if (this.fps) {
        this.VIDEO_TIMELINE_INPUT.value = (Number(this.VIDEO_TIMELINE_INPUT.value) + delta * this.fps).toString();
        if (this.playing) {
          this.playStartFrame = Number(this.VIDEO_TIMELINE_INPUT.value);
          this.playStartReal = new Date().getTime() / 1000;
        }
      }
    };
    this.PLAY_BUTTON.addEventListener("click", () => togglePlayPause());
    this.PAUSE_BUTTON.addEventListener("click", () => togglePlayPause());
    this.VIDEO_TIMELINE_INPUT.addEventListener("input", () => {
      if (this.playing) {
        this.playStartFrame = Number(this.VIDEO_TIMELINE_INPUT.value);
        this.playStartReal = new Date().getTime() / 1000;
      }
    });
    this.FRAME_BACK_BUTTON.addEventListener("click", () => changeFrame(-1));
    this.FRAME_FORWARD_BUTTON.addEventListener("click", () => changeFrame(1));
    this.SKIP_BACK_BUTTON.addEventListener("click", () => skipTime(-5));
    this.SKIP_FORWARD_BUTTON.addEventListener("click", () => skipTime(5));
    window.addEventListener(
      "keydown",
      (event) => {
        if (
          root === null ||
          root.hidden ||
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          (event.target instanceof HTMLElement && event.target.isContentEditable) ||
          (window.platform === "darwin" ? event.metaKey : event.ctrlKey)
        )
          return;
        switch (event.code) {
          case "ArrowUp":
          case "ArrowDown":
            toggleLock();
            break;
          case "Slash":
            togglePlayPause();
            break;
          case "Comma":
            skipTime(-5);
            break;
          case "Period":
            skipTime(5);
            break;
          case "ArrowLeft":
            changeFrame(-1);
            break;
          case "ArrowRight":
            changeFrame(1);
            break;
        }
      },
      { signal: this.events.signal }
    );
    this.updateButtons();
  }

  isLocked(): boolean {
    return this.locked;
  }

  private hasData(): boolean {
    return this.imgFolder !== null && this.fps !== null && this.totalFrames !== null && this.completedFrames !== null;
  }

  private updateButtons() {
    this.LOCK_BUTTON.disabled = !this.hasData();
    this.UNLOCK_BUTTON.disabled = !this.hasData();
    this.LOCK_BUTTON.hidden = this.locked;
    this.UNLOCK_BUTTON.hidden = !this.locked;
    this.PLAY_BUTTON.hidden = this.playing;
    this.PAUSE_BUTTON.hidden = !this.playing;

    let disableControls = this.locked || !this.hasData();
    this.PLAY_BUTTON.disabled = disableControls;
    this.PAUSE_BUTTON.disabled = disableControls;
    this.FRAME_BACK_BUTTON.disabled = disableControls;
    this.FRAME_FORWARD_BUTTON.disabled = disableControls;
    this.SKIP_BACK_BUTTON.disabled = disableControls;
    this.SKIP_FORWARD_BUTTON.disabled = disableControls;
    this.VIDEO_TIMELINE_INPUT.disabled = disableControls;
  }

  processVideoData(data: any) {
    if (data.uuid !== this.UUID) return;

    if ("fps" in data) {
      // Set progress
      this.imgFolder = data.imgFolder;
      this.fps = data.fps;
      this.totalFrames = data.totalFrames;
      this.completedFrames = data.completedFrames;

      if (this.totalFrames === null || this.completedFrames === null) return;
      this.VIDEO_TIMELINE_PROGRESS.style.width = ((this.completedFrames / this.totalFrames) * 100).toString() + "%";
      this.VIDEO_TIMELINE_INPUT.max = this.totalFrames.toString();
    } else if (!("error" in data)) {
      // Start to load new source, reset controls
      this.locked = false;
      this.playing = false;
    }
    this.updateButtons();
  }

  getCommand(): unknown {
    if (this.hasData()) {
      // Set time if locked
      let renderTime = window.selection.getRenderTime();
      if (this.locked && renderTime !== null) {
        this.VIDEO_TIMELINE_INPUT.value = (Math.floor((renderTime - this.lockedStartLog) * this.fps!) + 1).toString();
      }

      // Set time if playing
      if (this.playing) {
        this.VIDEO_TIMELINE_INPUT.value = (
          (new Date().getTime() / 1000 - this.playStartReal) * this.fps! +
          this.playStartFrame
        ).toString();
      }

      // Find filename
      let frame = Number(this.VIDEO_TIMELINE_INPUT.value);
      if (frame >= 1 && frame <= this.completedFrames!) {
        let filename = frame.toString();
        while (filename.length < 8) filename = "0" + filename;
        return this.imgFolder + filename + ".jpg";
      }
    }
    return "";
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  refresh(): void {}

  newAssets(): void {}

  getActiveFields(): string[] {
    return [];
  }

  showTimeline(): boolean {
    return true;
  }
}
