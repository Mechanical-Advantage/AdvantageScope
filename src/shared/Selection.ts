// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export default interface Selection {
  /** Returns the current selection mode. */
  getMode(): SelectionMode;

  /** Gets the current the hovered time. */
  getHoveredTime(): number | null;

  /** Updates the hovered time. */
  setHoveredTime(value: number | null): void;

  /** Return the selected time based on the current mode. */
  getSelectedTime(): number | null;

  /** Updates the selected time based on the current mode. */
  setSelectedTime(time: number): void;

  /** Switches to idle if possible */
  goIdle(): void;

  /** Switches to playback mode. */
  play(): void;

  /** Exits playback and locked modes. */
  pause(): void;

  /** Switches between pausing and playback. */
  togglePlayback(): void;

  /** Switches to locked mode if possible. */
  lock(): void;

  /** Exits locked mode. */
  unlock(): void;

  /** Switches beteween locked and unlocked modes. */
  toggleLock(): void;

  /** Steps forward or backward by one cycle. */
  stepCycle(isForward: boolean): void;

  /** Records that the live connection has started. */
  setLiveConnected(timeSupplier: () => number): void;

  /** Records that the live connection has stopped. */
  setLiveDisconnected(): void;

  /** Returns the latest live timestamp if available. */
  getCurrentLiveTime(): number | null;

  /** Returns the time that should be displayed, for views that can only display a single sample. */
  getRenderTime(): number | null;

  /** Updates the playback speed. */
  setPlaybackSpeed(speed: number): void;

  /** Updates whether playback is looping. */
  setPlaybackLooping(looping: boolean): void;

  /** Sets a new time range for an in-progress grab zoom. */
  setGrabZoomRange(range: [number, number] | null): void;

  /** Gets the time range to display for an in-progress grab zoom. */
  getGrabZoomRange(): [number, number] | null;

  /** Ends an in-progress grab zoom, applying the resulting zoom. */
  finishGrabZoom(): void;

  /** Returns the visible range for the timeline. */
  getTimelineRange(): [number, number];

  /** Returns whether the timeline is locked to max zoom. */
  getTimelineIsMaxZoom(): boolean;

  /** Set the visible range for the timeline. */
  setTimelineRange(range: [number, number], lockMaxZoom: boolean): void;

  /** Updates the timeline range based on a scroll event. */
  applyTimelineScroll(dx: number, dy: number, widthPixels: number): void;
}

export enum SelectionMode {
  /** Nothing is selected and playback is inactive. */
  Idle,

  /** A time is selected but playback is inactive. */
  Static,

  /** Historical playback is active. */
  Playback,

  /** Playback is locked to the live data. */
  Locked
}
