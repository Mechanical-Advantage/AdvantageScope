// Manages shared timing data and real time playback for all tabs
export class Selection {
  #selectedTime = null
  #hoveredTime = null
  #playing = false
  #playStart = null

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
      var time = ((new Date().getTime() / 1000) - this.#playStart) + (this.#selectedTime == null ? 0 : this.#selectedTime)
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
    this.#selectedTime = ((new Date().getTime() / 1000) - this.#playStart) + (this.#selectedTime == null ? 0 : this.#selectedTime)
    this.#playButton.hidden = false
    this.#pauseButton.hidden = true
  }
}