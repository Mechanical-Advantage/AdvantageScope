// Controls rendering of tables
export class TableController {
  #content = null
  #noDataAlert = null
  #headerTemplate = null
  #tableContainer = null
  #tableBody = null
  #dragHighlight = null

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
    window.addEventListener("drag-update", (event) => this.#handleDrag(event))
    window.addEventListener("drag-stop", (event) => this.#handleDrag(event))
    if (log) this.reset()

    var input = content.getElementsByClassName("data-table-jump-input")[0]
    var jump = () => {
      if (input.value == "") return

      // Find index
      var target = log.getTimestamps().findIndex(value => Math.round(value * 1000) / 1000 > Number(input.value))
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
    input.addEventListener("keydown", event => { if (event.code == "Enter") jump() })
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
        this.#fields.splice(selected, 0, event.detail.data.id)
        this.#updateFields()
      }
    }
  }

  // Called by tab controller when log changes
  reset() {
    this.#noDataAlert.hidden = true
    this.#tableContainer.hidden = false

    this.#currentRange = [0, log.getTimestamps().length < 1000 ? log.getTimestamps().length - 1 : 999]
    this.#fields = []
    this.#updateFields()
    this.#tableContainer.scrollTop = 0
  }

  // Called by tab controller when side bar size changes
  sideBarResize() { }

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
      var text = log.getFieldInfo(field).displayKey
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

  // Adds rows on the top or bottom in the specified range
  #fillRange(range, top) {
    // Get data
    var dataLookup = {}
    var typeLookup = {}
    this.#fields.forEach(field => {
      var data = log.getDataInRange(field, log.getTimestamps()[range[0]], log.getTimestamps()[range[1]], 0)
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
      dataLookup[field] = fullData
      typeLookup[field] = log.getFieldInfo(field).type
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

      // Add timestamp
      var timestampCell = document.createElement("td")
      row.appendChild(timestampCell)
      var timestamp = log.getTimestamps()[i]
      var seconds = Math.floor(timestamp)
      var milliseconds = Math.round((timestamp - seconds) * 1000)
      if (milliseconds > 999) {
        seconds += 1
        milliseconds -= 1000
      }
      timestampCell.innerText = seconds.toString() + "." + milliseconds.toString().padStart(3, "0")

      // Add data
      this.#fields.forEach(field => {
        var dataCell = document.createElement("td")
        row.appendChild(dataCell)
        var value = dataLookup[field][i - range[0]]
        if (typeLookup[field] == "Byte") {
          var text = "0x" + (value & 0xff).toString(16).padStart(2, "0")
        } else if (typeLookup[field] == "ByteArray") {
          var hexArray = value.map(byte => {
            "0x" + (byte & 0xff).toString(16).padStart(2, "0")
          })
          var text = "[" + hexArray.toString() + "]"
        } else {
          var text = JSON.stringify(value)
        }
        dataCell.innerText = text
      })
    }
  }

  // Called every 15ms by the tab controller
  periodic() {
    if (log == null) return

    var adjusted = false
    if (this.#tableContainer.scrollTop < this.#scrollMargin && this.#currentRange[0] > 0) {
      adjusted = true
      var offset = this.#tableContainer.scrollTop - this.#scrollMargin
    }
    if (this.#tableContainer.scrollHeight - this.#tableContainer.clientHeight - this.#tableContainer.scrollTop < this.#scrollMargin && this.#currentRange[1] < log.getTimestamps().length - 1) {
      adjusted = true
      var offset = this.#scrollMargin - (this.#tableContainer.scrollHeight - this.#tableContainer.clientHeight - this.#tableContainer.scrollTop)
    }

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
  }
}