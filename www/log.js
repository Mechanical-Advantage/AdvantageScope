// Represents all of the data in a log file
class Log {
  #entries = []

  add(entry) {
    // console.log(entry)
    this.#entries.push(entry)
  }

  getEntries() {
    return this.#entries
  }
}