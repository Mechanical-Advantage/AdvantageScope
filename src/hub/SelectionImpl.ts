import Selection, { SelectionMode } from "../shared/Selection";
import { AKIT_TIMESTAMP_KEYS } from "../shared/log/LogUtil";

export default class SelectionImpl implements Selection {
  private STEP_SIZE = 0.02; // When using left-right arrows keys on non-AdvantageKit logs
  private TIMELINE_MIN_ZOOM_TIME = 0.05;
  private TIMELINE_ZOOM_BASE = 1.001;

  private PLAY_BUTTON = document.getElementsByClassName("play")[0] as HTMLElement;
  private PAUSE_BUTTON = document.getElementsByClassName("pause")[0] as HTMLElement;
  private LOCK_BUTTON = document.getElementsByClassName("lock")[0] as HTMLElement;
  private UNLOCK_BUTTON = document.getElementsByClassName("unlock")[0] as HTMLElement;

  private mode: SelectionMode = SelectionMode.Idle;
  private hoveredTime: number | null = null;
  private staticTime: number = 0;
  private timelineRange: [number, number] = [0, 10];
  private timelineMaxZoom = true; // When at maximum zoom, maintain it as the available range increases
  private grabZoomRange: [number, number] | null = null;
  private playbackStartLog: number = 0;
  private playbackStartReal: number = 0;
  private playbackSpeed: number = 1;
  private liveConnected: boolean = false;
  private liveTimeSupplier: (() => number) | null = null;

  private now(): number {
    return new Date().getTime() / 1000;
  }

  constructor() {
    this.PLAY_BUTTON.addEventListener("click", () => this.play());
    this.PAUSE_BUTTON.addEventListener("click", () => this.pause());
    this.LOCK_BUTTON.addEventListener("click", () => this.lock());
    this.UNLOCK_BUTTON.addEventListener("click", () => this.unlock());
    [this.PLAY_BUTTON, this.PAUSE_BUTTON].forEach((button) => {
      button.addEventListener("contextmenu", () => {
        let rect = button.getBoundingClientRect();
        window.sendMainMessage("ask-playback-speed", {
          x: Math.round(rect.right),
          y: Math.round(rect.top),
          speed: this.playbackSpeed
        });
      });
    });

    window.addEventListener("keydown", (event) => {
      if (event.target !== document.body) return;
      switch (event.code) {
        case "Space":
          event.preventDefault();
          this.togglePlayback();
          break;

        case "KeyL":
          event.preventDefault();
          this.toggleLock();
          break;

        case "ArrowLeft":
        case "ArrowRight":
          // Unlocked video uses arrow keys to navigate by frame
          if (window.tabs.isUnlockedVideoSelected() || this.mode !== SelectionMode.Static || event.metaKey) {
            return;
          }

          event.preventDefault();
          this.stepCycle(event.code === "ArrowRight");
          break;
      }
    });
  }

  /** Returns the current selection mode. */
  getMode(): SelectionMode {
    return this.mode;
  }

  /** Switches the current mode and updates the buttons. */
  private setMode(newMode: SelectionMode) {
    this.mode = newMode;
    document.documentElement.style.setProperty("--show-lock-buttons", this.liveConnected ? "1" : "0");
    this.PLAY_BUTTON.hidden = this.mode === SelectionMode.Playback || this.mode === SelectionMode.Locked;
    this.PAUSE_BUTTON.hidden = this.mode === SelectionMode.Idle || this.mode === SelectionMode.Static;
    this.LOCK_BUTTON.hidden = !this.liveConnected || this.mode === SelectionMode.Locked;
    this.UNLOCK_BUTTON.hidden = !this.liveConnected || this.mode !== SelectionMode.Locked;
  }

  /** Gets the current the hovered time. */
  getHoveredTime(): number | null {
    return this.hoveredTime;
  }

  /** Updates the hovered time. */
  setHoveredTime(value: number | null) {
    this.hoveredTime = value;
  }

  /** Return the selected time based on the current mode. */
  getSelectedTime(): number | null {
    switch (this.mode) {
      case SelectionMode.Idle:
        return null;
      case SelectionMode.Static:
        return Math.max(this.staticTime, window.log.getTimestampRange()[0]);
      case SelectionMode.Playback:
        let time = (this.now() - this.playbackStartReal) * this.playbackSpeed + this.playbackStartLog;
        let maxTime = window.log.getTimestampRange()[1];
        if (this.liveTimeSupplier !== null) {
          maxTime = Math.max(maxTime, this.liveTimeSupplier());
        }
        if (time > maxTime) {
          if (this.liveConnected) {
            this.setMode(SelectionMode.Locked);
          } else {
            this.setMode(SelectionMode.Static);
            this.staticTime = maxTime;
          }
          return maxTime;
        } else {
          return Math.max(time, window.log.getTimestampRange()[0]);
        }
      case SelectionMode.Locked:
        if (this.liveTimeSupplier === null) return 0;
        return this.liveTimeSupplier();
    }
  }

  /** Updates the selected time based on the current mode. */
  setSelectedTime(time: number) {
    switch (this.mode) {
      case SelectionMode.Idle:
        this.setMode(SelectionMode.Static);
        this.staticTime = time;
        break;
      case SelectionMode.Static:
        this.staticTime = time;
        break;
      case SelectionMode.Playback:
        this.playbackStartLog = time;
        this.playbackStartReal = this.now();
        break;
      case SelectionMode.Locked:
        break;
    }
  }

  /** Switches to idle if possible */
  goIdle() {
    switch (this.mode) {
      case SelectionMode.Static:
        this.setMode(SelectionMode.Idle);
        break;
      case SelectionMode.Idle:
      case SelectionMode.Playback:
      case SelectionMode.Locked:
        break;
    }
  }

  /** Switches to playback mode. */
  play() {
    switch (this.mode) {
      case SelectionMode.Idle:
        this.setMode(SelectionMode.Playback);
        this.playbackStartLog = window.log.getTimestampRange()[0];
        this.playbackStartReal = this.now();
        break;
      case SelectionMode.Static:
        let maxTime = window.log.getTimestampRange()[1];
        if (this.liveTimeSupplier !== null) {
          maxTime = Math.max(maxTime, this.liveTimeSupplier());
        }
        if (this.staticTime < maxTime) {
          this.setMode(SelectionMode.Playback);
          this.playbackStartLog = Math.max(this.staticTime, window.log.getTimestampRange()[0]);
          this.playbackStartReal = this.now();
        }
        break;
      case SelectionMode.Playback:
      case SelectionMode.Locked:
        break;
    }
  }

  /** Exits playback and locked modes. */
  pause() {
    switch (this.mode) {
      case SelectionMode.Idle:
      case SelectionMode.Static:
        break;
      case SelectionMode.Playback:
      case SelectionMode.Locked:
        let selectedTime = this.getSelectedTime();
        this.setMode(SelectionMode.Static);
        this.staticTime = selectedTime !== null ? selectedTime : 0;
        break;
    }
  }

  /** Switches between pausing and playback. */
  togglePlayback() {
    if (this.mode === SelectionMode.Playback || this.mode === SelectionMode.Locked) {
      this.pause();
    } else {
      this.play();
    }
  }

  /** Switches to locked mode if possible. */
  lock() {
    if (this.liveConnected) {
      this.setMode(SelectionMode.Locked);
    }
  }

  /** Exits locked mode. */
  unlock() {
    if (this.mode === SelectionMode.Locked) {
      let selectedTime = this.getSelectedTime();
      this.setMode(SelectionMode.Static);
      this.staticTime = selectedTime !== null ? selectedTime : 0;
    }
  }

  /** Switches beteween locked and unlocked modes. */
  toggleLock() {
    if (this.mode === SelectionMode.Locked) {
      this.unlock();
    } else {
      this.lock();
    }
  }

  /** Steps forward or backward by one cycle. */
  stepCycle(isForward: boolean) {
    const akitTimestampKey = window.log.getFieldKeys().find((key) => AKIT_TIMESTAMP_KEYS.includes(key));
    if (akitTimestampKey !== undefined) {
      const timestampData = window.log.getNumber(akitTimestampKey, -Infinity, Infinity);
      if (timestampData === undefined) return;
      if (isForward) {
        let next = timestampData.timestamps.find((value) => value > this.staticTime);
        if (next !== undefined) this.staticTime = next;
      } else {
        let prev = timestampData.timestamps.findLast((value) => value < this.staticTime);
        if (prev !== undefined) this.staticTime = prev;
      }
    } else {
      this.staticTime += isForward ? this.STEP_SIZE : -this.STEP_SIZE;
    }
  }

  /** Records that the live connection has started. */
  setLiveConnected(timeSupplier: () => number) {
    let newConnection = !this.liveConnected;
    this.liveConnected = true;
    this.liveTimeSupplier = timeSupplier;
    if (newConnection) {
      this.setMode(SelectionMode.Locked);
    } else {
      this.setMode(this.mode); // Just update buttons
    }
  }

  /** Records that the live connection has stopped. */
  setLiveDisconnected() {
    this.unlock();
    this.liveConnected = false;
    this.liveTimeSupplier = null;
    this.setMode(this.mode); // Just update buttons
  }

  /** Returns the latest live timestamp if available. */
  getCurrentLiveTime(): number | null {
    if (this.liveTimeSupplier === null) {
      return null;
    } else {
      return this.liveTimeSupplier();
    }
  }

  /** Returns the time that should be displayed, for views that can only display a single sample. */
  getRenderTime(): number | null {
    let selectedTime = this.getSelectedTime();
    if (this.mode === SelectionMode.Playback || this.mode === SelectionMode.Locked) {
      return selectedTime as number;
    } else if (this.hoveredTime !== null) {
      return this.hoveredTime;
    } else if (selectedTime !== null) {
      return selectedTime;
    } else {
      return null;
    }
  }

  /** Updates the playback speed. */
  setPlaybackSpeed(speed: number) {
    if (this.mode === SelectionMode.Playback) {
      let selectedTime = this.getSelectedTime();
      this.playbackStartLog = selectedTime !== null ? selectedTime : 0;
      this.playbackStartReal = this.now();
    }
    this.playbackSpeed = speed;
  }

  /** Sets a new time range for an in-progress grab zoom. */
  setGrabZoomRange(range: [number, number] | null) {
    if (range !== null) {
      if (range[1] < range[0]) {
        range.reverse();
      }
    }
    this.grabZoomRange = range;
  }

  /** Gets the time range to display for an in-progress grab zoom. */
  getGrabZoomRange(): [number, number] | null {
    return this.grabZoomRange;
  }

  /** Ends an in-progress grab zoom, optionally applying the resulting zoom. */
  finishGrabZoom() {
    if (this.grabZoomRange !== null) {
      this.timelineMaxZoom = false;
      this.timelineRange = [this.grabZoomRange[0], this.grabZoomRange[1]];
      if (this.timelineRange[1] - this.timelineRange[0] < this.TIMELINE_MIN_ZOOM_TIME) {
        this.timelineRange[1] = this.timelineRange[0] + this.TIMELINE_MIN_ZOOM_TIME;
      }
    }
    this.grabZoomRange = null;
  }

  /** Returns the visible range for the timeline. */
  getTimelineRange(): [number, number] {
    this.applyTimelineScroll(0, 0, 0);
    return this.timelineRange;
  }

  /** Updates the timeline range based on a scroll event. */
  applyTimelineScroll(dx: number, dy: number, widthPixels: number) {
    // Find available timestamp range
    let availableRange = window.log.getTimestampRange();
    availableRange = [availableRange[0], availableRange[1]];
    let liveTime = this.getCurrentLiveTime();
    if (liveTime !== null) {
      availableRange[1] = liveTime;
    }
    if (availableRange[1] - availableRange[0] < this.TIMELINE_MIN_ZOOM_TIME) {
      availableRange[1] = availableRange[0] + this.TIMELINE_ZOOM_BASE;
    }

    // Apply horizontal scroll
    if (this.mode === SelectionMode.Locked) {
      let zoom = this.timelineRange[1] - this.timelineRange[0];
      this.timelineRange[0] = availableRange[1] - zoom;
      this.timelineRange[1] = availableRange[1];
      if (dx < 0) this.unlock(); // Unlock if attempting to scroll away
    } else if (dx !== 0) {
      let secsPerPixel = (this.timelineRange[1] - this.timelineRange[0]) / widthPixels;
      this.timelineRange[0] += dx * secsPerPixel;
      this.timelineRange[1] += dx * secsPerPixel;
    }

    // Apply vertical scroll
    if (dy !== 0 && (!this.timelineMaxZoom || dy < 0)) {
      // If max zoom, ignore positive scroll (no effect, just apply the max zoom)
      let zoomPercent = Math.pow(this.TIMELINE_ZOOM_BASE, dy);
      let newZoom = (this.timelineRange[1] - this.timelineRange[0]) * zoomPercent;
      if (newZoom < this.TIMELINE_MIN_ZOOM_TIME) newZoom = this.TIMELINE_MIN_ZOOM_TIME;
      if (newZoom > availableRange[1] - availableRange[0]) newZoom = availableRange[1] - availableRange[0];

      let hoveredTime = this.getHoveredTime();
      if (hoveredTime === null) {
        hoveredTime = (this.timelineRange[0] + this.timelineRange[1]) / 2;
      }
      let hoveredPercent = (hoveredTime - this.timelineRange[0]) / (this.timelineRange[1] - this.timelineRange[0]);
      this.timelineRange[0] = hoveredTime - newZoom * hoveredPercent;
      this.timelineRange[1] = hoveredTime + newZoom * (1 - hoveredPercent);
    } else if (this.timelineMaxZoom) {
      this.timelineRange = availableRange;
    }

    // Enforce max range
    if (this.timelineRange[1] - this.timelineRange[0] > availableRange[1] - availableRange[0]) {
      this.timelineRange = availableRange;
    }
    this.timelineMaxZoom = this.timelineRange[1] - this.timelineRange[0] === availableRange[1] - availableRange[0];

    // Enforce left limit
    if (this.timelineRange[0] < availableRange[0]) {
      let shift = availableRange[0] - this.timelineRange[0];
      this.timelineRange[0] += shift;
      this.timelineRange[1] += shift;
    }

    // Enforce right limit
    if (this.timelineRange[1] > availableRange[1]) {
      let shift = availableRange[1] - this.timelineRange[1];
      this.timelineRange[0] += shift;
      this.timelineRange[1] += shift;
      if (dx > 0) this.lock(); // Lock if action is intentional
    }
  }
}
