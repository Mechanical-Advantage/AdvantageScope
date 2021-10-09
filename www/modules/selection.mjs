// Manages shared timing data and real time playback for all tabs
export class Selection {
  #selectedTime = null
  #hoveredTime = null
  #playing = false
  #playStart = null
  #playbackSpeed = 1

  #playButton = document.getElementsByClassName("play")[0]
  #pauseButton = document.getElementsByClassName("pause")[0]

  constructor() {
    this.#playButton.addEventListener("click", () => { this.play() })
    this.#pauseButton.addEventListener("click", () => { this.pause() })
    window.addEventListener("keydown", event => {
      if (event.code == "Space" && event.target == document.body) {
        event.preventDefault()
        if (this.#playing) {
          this.pause()
        } else {
          this.play()
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
    this.#selectedTime = time
    if (this.#playing) this.#playStart = new Date().getTime() / 1000
  }

  // Retrieves selected time
  get selectedTime() {
    if (this.#playing) {
      var time = ((new Date().getTime() / 1000) - this.#playStart) * this.#playbackSpeed + (this.#selectedTime == null ? 0 : this.#selectedTime)
      var lastTime = log == null ? 10 : log.getTimestamps()[log.getTimestamps().length - 1]
      if (time >= lastTime) {
        this.pause()
        this.#selectedTime = lastTime
        return lastTime
      } else {
        return time
      }
    } else {
      return this.#selectedTime
    }
  }

  // Begins real time playback
  play() {
    this.#playing = true
    this.#playStart = new Date().getTime() / 1000
    this.#playButton.hidden = true
    this.#pauseButton.hidden = false
  }

  // Stops real time playback
  pause() {
    this.#playing = false
    this.#selectedTime = ((new Date().getTime() / 1000) - this.#playStart) * this.#playbackSpeed + (this.#selectedTime == null ? 0 : this.#selectedTime)
    this.#playButton.hidden = false
    this.#pauseButton.hidden = true
  }

  // Returns whether playback is active
  isPlaying() {
    return this.#playing
  }
}