// Controls rendering of tables
export class TableController {
  #content = null
  #noDataAlert = null
  #headerTemplate = null
  #tableContainer = null
  #tableBody = null
  #dragHighlight = null
  #input = null

  #stateCache = null
  #rowHeight = 25
  #scrollMargin = 3000
  #fields = []
  #currentRange = [0, 0]

  constructor(content) {
    this.#content = content
    this.#noDataAlert = content.getElementsByClassName("tab-centered")[0]
    this.#headerTemplate = content.getElementsByClassName("data-table-header-template")[0]
    this.#tableContainer = content.getElementsByClassName("data-table-container")[0]
    this.#tableBody = content.getElementsByClassName("data-table")[0].firstElementChild
    this.#dragHighlight = content.getElementsByClassName("data-table-drag-highlight")[0]
    this.#input = content.getElementsByClassName("data-table-jump-input")[0]
    window.addEventListener("drag-update", (event) => this.#handleDrag(event))
    window.addEventListener("drag-stop", (event) => this.#handleDrag(event))
    if (log) this.state = this.state

    var jump = () => {
      // Determine target time
      if (this.#input.value == "") {
        if (window.selection.selectedTime) {
          var targetTime = window.selection.selectedTime
        } else {
          var targetTime = 0
        }
      } else {
        var targetTime = Number(this.#input.value)
      }

      this.#jumpToTime(targetTime)
    }
    this.#input.addEventListener("keydown", event => { if (event.code == "Enter") jump() })
    content.getElementsByClassName("data-table-jump-button")[0].addEventListener("click", jump)
  }

  // Handles dragging events (moving and stopping)
  #handleDrag(event) {
    if (this.#content.hidden) return

    // Find selected section
    var header = this.#tableBody.firstElementChild
    var tableBox = this.#tableContainer.getBoundingClientRect()
    var selected = null
    var selectedX = null
    if (event.detail.y > tableBox.y) {
      for (let i = 0; i < header.childElementCount; i++) {
        if (i == 0 && this.#fields.length > 0) {
          var targetX = header.children[1].getBoundingClientRect().left
        } else {
          var targetX = header.children[i].getBoundingClientRect().right
        }
        if (targetX < header.firstElementChild.getBoundingClientRect().right) continue
        var leftBound = i == 0 ? tableBox.x : targetX - (header.children[i].getBoundingClientRect().width / 2)
        var rightBound = i == header.childElementCount - 1 ? Infinity : targetX + (header.children[i + 1].getBoundingClientRect().width / 2)
        if (leftBound < event.detail.x && rightBound > event.detail.x) {
          selected = i
          selectedX = targetX
        }
      }
    }

    // Update highlight or add field
    if (event.type == "drag-update") {
      this.#dragHighlight.hidden = selected == null
      if (selected != null) {
        this.#dragHighlight.style.left = (selectedX - tableBox.x - 12.5).toString() + "px"
      }
    } else {
      this.#dragHighlight.hidden = true
      if (selected != null) {
        this.#fields.splice(selected, 0, { id: event.detail.data.id })
        this.#updateFields()
      }
    }
  }

  // Standard function: retrieves current state
  get state() {
    if (this.#stateCache != null) {
      return this.#stateCache
    }

    var fields = this.#fields.map(x => {
      if (x.id == null) {
        return x.missingKey
      } else {
        return log.getFieldInfo(x.id).displayKey
      }
    })
    var time = log == null ? null : log.getTimestamps()[Math.floor(this.#tableContainer.scrollTop / this.#rowHeight) + this.#currentRange[0]]
    var scrollVert = this.#tableContainer.scrollTop % this.#rowHeight
    var scrollHorz = this.#tableContainer.scrollLeft
    return {
      fields: fields,
      time: time,
      scrollVert: scrollVert,
      scrollHorz: scrollHorz
    }
  }

  // Standard function: restores state where possible
  set state(newState) {
    if (log == null) {
      this.#stateCache = newState
      return
    } else {
      this.#stateCache = null
    }
    this.#noDataAlert.hidden = true
    this.#tableContainer.hidden = false

    this.#currentRange = [0, log.getTimestamps().length < 1000 ? log.getTimestamps().length - 1 : 999]
    this.#fields = newState.fields.map(x => {
      var id = log.findFieldDisplay(x)
      if (id != -1) {
        return { id: id }
      } else {
        return { id: null, missingKey: x }
      }
    })
    this.#updateFields()
    this.#tableContainer.scrollTop = 0
    this.#tableContainer.scrollLeft = newState.scrollHorz

    if (newState.time) {
      this.#jumpToTime(newState.time)
      this.#tableContainer.scrollTop += newState.scrollVert
    }
  }

  // Standard function: updates based on new live data
  updateLive() { }

  // Called by tab controller when side bar size changes
  sideBarResize() { }

  // Jumps to the specified time
  #jumpToTime(targetTime) {
    // Find index
    var target = log.getTimestamps().findIndex(value => Math.floor(value * 1000) / 1000 > targetTime)
    if (target == -1) target = log.getTimestamps().length
    if (target < 1) target = 1
    target -= 1

    // Jump to index
    if (log.getTimestamps().length < 1000) {
      this.#currentRange = [0, log.getTimestamps().length - 1]
    } else {
      this.#currentRange = [target - 500, target + 499]
      var offset = 0
      if (this.#currentRange[0] < 0) offset = this.#currentRange[0] * -1
      if (this.#currentRange[1] > log.getTimestamps().length - 1) offset = log.getTimestamps().length - 1 - this.#currentRange[1]
      this.#currentRange[0] += offset
      this.#currentRange[1] += offset
    }
    this.#clearTable()
    this.#fillRange(this.#currentRange, false)
    this.#tableContainer.scrollTop = (target - this.#currentRange[0]) * this.#rowHeight
  }

  // Updates the table based on the current field list
  #updateFields() {
    // Clear old header cells
    var header = this.#tableBody.firstElementChild
    while (header.childElementCount > 1) {
      header.removeChild(header.lastChild)
    }

    // Add new header cells
    this.#fields.forEach((field, index) => {
      var cell = document.createElement("th")
      Array.from(this.#headerTemplate.children).forEach(element => {
        cell.appendChild(element.cloneNode(true))
      })
      header.appendChild(cell)
      if (field.id == null) {
        var text = field.missingKey
        cell.firstElementChild.firstElementChild.style.textDecoration = "line-through"
      } else {
        var text = log.getFieldInfo(field.id).displayKey
      }
      cell.title = text
      cell.firstElementChild.firstElementChild.innerText = text
      cell.lastElementChild.title = ""
      cell.lastElementChild.addEventListener("click", () => {
        this.#fields.splice(index, 1)
        this.#updateFields()
      })
    })

    // Reset table data
    var oldScrollTop = this.#tableContainer.scrollTop
    this.#clearTable()
    this.#fillRange(this.#currentRange, false)
    this.#tableContainer.scrollTop = oldScrollTop
  }

  // Clears all data currently in the table
  #clearTable() {
    while (this.#tableBody.childElementCount > 1) {
      this.#tableBody.removeChild(this.#tableBody.lastChild)
    }
  }

  // Updates highlighted times (selected & hovered)
  #updateHighlights() {
    var highlight = (time, className) => {
      Array.from(this.#tableBody.children).forEach(row => row.classList.remove(className))
      if (time) {
        var target = log.getTimestamps().findIndex(value => value > time)
        if (target == -1) target = log.getTimestamps().length
        if (target < 1) target = 1
        target -= 1
        if (target >= this.#currentRange[0] && target <= this.#currentRange[1]) this.#tableBody.children[target - this.#currentRange[0] + 1].classList.add(className)
      }
    }
    highlight(window.selection.selectedTime, "selected")
    highlight(window.selection.hoveredTime, "hovered")
  }

  // Formats a time as a string of the correct length
  #formatTime(time) {
    var seconds = Math.floor(time)
    var milliseconds = Math.floor((time - seconds) * 1000)
    return seconds.toString() + "." + milliseconds.toString().padStart(3, "0")
  }

  // Adds rows on the top or bottom in the specified range
  #fillRange(range, top) {
    // Get data
    var dataLookup = {}
    var typeLookup = {}
    this.#fields.forEach(field => {
      if (field.id == null) return
      var data = log.getDataInRange(field.id, log.getTimestamps()[range[0]], log.getTimestamps()[range[1]])
      var fullData = []
      for (let i = range[0]; i < range[1] + 1; i++) {
        var nextIndex = data.timestampIndexes.findIndex(value => value > i)
        if (nextIndex == -1) nextIndex = data.timestampIndexes.length
        if (nextIndex == 0) {
          fullData.push(null)
        } else {
          fullData.push(data.values[nextIndex - 1])
        }
      }
      dataLookup[field.id] = fullData
      typeLookup[field.id] = log.getFieldInfo(field.id).type
    })

    // Add rows
    if (top) var nextRow = this.#tableBody.children[1]
    for (let i = range[0]; i < range[1] + 1; i++) {
      // Create row
      var row = document.createElement("tr")
      if (top) {
        this.#tableBody.insertBefore(row, nextRow)
      } else {
        this.#tableBody.appendChild(row)
      }

      // Bind selection controls
      row.addEventListener("mouseenter", () => {
        window.selection.hoveredTime = log.getTimestamps()[i]
      })
      row.addEventListener("mouseleave", () => {
        window.selection.hoveredTime = null
      })
      row.addEventListener("click", () => {
        window.selection.selectedTime = log.getTimestamps()[i]
      })
      row.addEventListener("contextmenu", () => {
        window.selection.selectedTime = null
      })

      // Add timestamp
      var timestampCell = document.createElement("td")
      row.appendChild(timestampCell)
      timestampCell.innerText = this.#formatTime(log.getTimestamps()[i])

      // Add data
      this.#fields.forEach(field => {
        var dataCell = document.createElement("td")
        row.appendChild(dataCell)
        if (field.id == null) {
          var text = "null"
        } else {
          var value = dataLookup[field.id][i - range[0]]
          if (typeLookup[field.id] == "Byte") {
            var text = "0x" + (value & 0xff).toString(16).padStart(2, "0")
          } else if (typeLookup[field.id] == "ByteArray") {
            var hexArray = value.map(byte => {
              "0x" + (byte & 0xff).toString(16).padStart(2, "0")
            })
            var text = "[" + hexArray.toString() + "]"
          } else {
            var text = JSON.stringify(value)
          }
        }
        dataCell.innerText = text
      })
    }

    // Update highlights
    this.#updateHighlights()

    // Update row height (not all platforms render the same way)
    var rowHeight = this.#tableBody.children[1].getBoundingClientRect().height
    if (rowHeight > 0 && rowHeight != this.#rowHeight) this.#rowHeight = rowHeight
  }

  // Called every 15ms by the tab controller
  periodic() {
    if (log == null) return

    // Determine if rows need to be updated
    var adjusted = false
    if (this.#tableContainer.scrollTop < this.#scrollMargin && this.#currentRange[0] > 0) {
      adjusted = true
      var offset = this.#tableContainer.scrollTop - this.#scrollMargin
    }
    if (this.#tableContainer.scrollHeight - this.#tableContainer.clientHeight - this.#tableContainer.scrollTop < this.#scrollMargin && this.#currentRange[1] < log.getTimestamps().length - 1) {
      adjusted = true
      var offset = this.#scrollMargin - (this.#tableContainer.scrollHeight - this.#tableContainer.clientHeight - this.#tableContainer.scrollTop)
    }

    // Update rows
    if (adjusted) {
      var rowOffset = Math.floor(offset / this.#rowHeight)
      if (this.#currentRange[0] + rowOffset < 0) rowOffset = this.#currentRange[0] * -1
      if (this.#currentRange[1] + rowOffset > log.getTimestamps().length - 1) rowOffset = log.getTimestamps().length - 1 - this.#currentRange[1]
      this.#currentRange[0] += rowOffset
      this.#currentRange[1] += rowOffset

      if (rowOffset < 0) {
        for (let i = 0; i < rowOffset * -1; i++) {
          this.#tableBody.removeChild(this.#tableBody.lastElementChild)
        }
        this.#fillRange([this.#currentRange[0], this.#currentRange[0] - rowOffset - 1], true)
      }
      if (rowOffset > 0) {
        for (let i = 0; i < rowOffset; i++) {
          this.#tableBody.removeChild(this.#tableBody.children[1])
        }
        this.#fillRange([this.#currentRange[1] - rowOffset + 1, this.#currentRange[1]], false)
      }
    }

    // Update based on selected & hovered times
    this.#updateHighlights()
    var placeholder = window.selection.selectedTime == null ? 0 : window.selection.selectedTime
    this.#input.placeholder = this.#formatTime(placeholder)
  }
}