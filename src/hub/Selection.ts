export default class Selection {
  private PLAY_BUTTON = document.getElementsByClassName("play")[0] as HTMLElement;
  private PAUSE_BUTTON = document.getElementsByClassName("pause")[0] as HTMLElement;
  private LOCK_BUTTON = document.getElementsByClassName("lock")[0] as HTMLElement;
  private UNLOCK_BUTTON = document.getElementsByClassName("unlock")[0] as HTMLElement;

  private mode: SelectionMode = SelectionMode.Idle;
  private hoveredTime: number | null = null;
  private staticTime: number = 0;
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
          if (this.mode === SelectionMode.Playback || this.mode === SelectionMode.Locked) {
            this.pause();
          } else {
            this.play();
          }
          break;

        case "KeyL":
          event.preventDefault();
          if (this.mode === SelectionMode.Locked) {
            this.unlock();
          } else {
            this.lock();
          }
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

  /** Updates the hovered time. */
  getHoveredTime(): number | null {
    return this.hoveredTime;
  }

  /** Returns the hovered time. */
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

  getCurrentLiveTime(): number | null {
    if (this.liveTimeSupplier === null) {
      return null;
    } else {
      return this.liveTimeSupplier();
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
