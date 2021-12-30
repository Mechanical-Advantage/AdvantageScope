// Manages shared timing data and real time playback for all tabs
export class Selection {
  #selectedTime = null
  #hoveredTime = null
  #playing = false
  #playStart = null
  #playbackSpeed = 1
  #locked = false

  #playButton = document.getElementsByClassName("play")[0]
  #pauseButton = document.getElementsByClassName("pause")[0]
  #unlockedButton = document.getElementsByClassName("unlocked")[0]
  #lockedButton = document.getElementsByClassName("locked")[0]

  constructor() {
    this.#playButton.addEventListener("click", () => { this.play() })
    this.#pauseButton.addEventListener("click", () => { this.pause() })
    window.addEventListener("keydown", event => {
      if (event.code == "Space" && event.target == document.body) {
        event.preventDefault()
        if (this.#playing || (window.liveStart != null && this.isLocked())) {
          this.pause()
        } else {
          this.play()
        }
      }
    })

    this.#unlockedButton.addEventListener("click", () => { this.lock() })
    this.#lockedButton.addEventListener("click", () => { this.unlock() })
    window.addEventListener("keydown", event => {
      if (event.code == "KeyL" && event.target == document.body && window.liveStart != null) {
        event.preventDefault()
        if (this.#locked) {
          this.unlock()
        } else {
          this.lock()
        }
      }
    })

    var setPlaybackSpeed = () => {
      window.dispatchEvent(new CustomEvent("set-playback-speed", {
        detail: this.#playbackSpeed
      }))
    }
    this.#playButton.addEventListener("contextmenu", setPlaybackSpeed)
    this.#pauseButton.addEventListener("contextmenu", setPlaybackSpeed)
    window.addEventListener("set-playback-speed-response", event => {
      if (this.#playing) {
        this.pause()
        this.#playbackSpeed = event.detail
        this.play()
      } else {
        this.#playbackSpeed = event.detail
      }
    })
  }

  // Standard function: retrieves current state
  get state() {
    return {
      selectedTime: this.selectedTime,
      playbackSpeed: this.#playbackSpeed
    }
  }

  // Standard function: restores state where possible
  set state(newState) {
    this.unlock()
    this.pause()
    this.#selectedTime = newState.selectedTime
    this.#playbackSpeed = newState.playbackSpeed
  }

  // Updates hovered time
  set hoveredTime(time) {
    this.#hoveredTime = time
  }

  // Retrieves hovered time
  get hoveredTime() {
    return this.#hoveredTime
  }

  // Updates selected time
  set selectedTime(time) {
    if (this.#locked) return
    this.#selectedTime = time
    if (this.#playing) this.#playStart = new Date().getTime() / 1000
  }

  // Retrieves selected time
  get selectedTime() {
    if (window.liveStatus == 2 && this.#locked) { // Based on live logging start time (continuously increase regardless of data)
      return ((new Date().getTime() / 1000) - window.liveStart) + log.getTimestamps()[0]
    } else if (this.#playing) { // Increase from last selected time until reaching the end of data
      var time = ((new Date().getTime() / 1000) - this.#playStart) * this.#playbackSpeed + (this.#selectedTime == null ? 0 : this.#selectedTime)
      var lastTime = log == null ? 10 : log.getTimestamps()[log.getTimestamps().length - 1]
      if (time >= lastTime) {
        this.#playing = false
        this.#playButton.hidden = false
        this.#pauseButton.hidden = true
        this.#selectedTime = lastTime
        return lastTime
      } else {
        return time
      }
    } else { // Return static time
      return this.#selectedTime
    }
  }

  // Begins real time playback
  play() {
    if (this.#locked) return
    this.#playing = true
    this.#playStart = new Date().getTime() / 1000
    this.#playButton.hidden = true
    this.#pauseButton.hidden = false
  }

  // Stops real time playback
  pause() {
    if (this.#locked) {
      this.unlock()
      return
    }
    this.#selectedTime = this.selectedTime
    this.#playing = false
    this.#playButton.hidden = false
    this.#pauseButton.hidden = true
  }

  // Locks playback to live data
  lock() {
    if (window.liveStatus == 2) {
      this.pause()
      this.#locked = true
    }
    this.updateLockButtons()
  }

  // Unlocks playback and returns to normal state
  unlock() {
    if (this.#locked) {
      this.#selectedTime = this.selectedTime
      this.#locked = false
    }
    this.updateLockButtons()
  }

  // Returns whether playback is active
  isPlaying() {
    return this.#playing
  }

  // Returns whether selection is locked
  isLocked() {
    return this.#locked
  }

  // Updates (including hiding or showing) lock buttons
  updateLockButtons() {
    var showButtons = window.liveStatus == 2
    document.documentElement.style.setProperty("--show-lock-buttons", showButtons ? 1 : 0)
    if (showButtons) {
      this.#unlockedButton.hidden = this.isLocked()
      this.#lockedButton.hidden = !this.isLocked()
      this.#playButton.hidden = this.isLocked()
      this.#pauseButton.hidden = !this.isLocked()
    } else {
      this.#unlockedButton.hidden = true
      this.#lockedButton.hidden = true
    }
  }
}