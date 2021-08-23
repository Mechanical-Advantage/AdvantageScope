// Controls rendering of line graphs
export class LineGraphController {
  #legendItemTemplate = null

  #colors = ["#EBC542", "#80588E", "#E48B32", "#AACAEE", "#AF2437", "#C0B487", "#858584", "#3B875A", "#D993AA", "#2B66A2", "#EB987E", "#5D4F92", "#EBAA3B", "#A64B6B", "#DBD345", "#7E331F", "#96B637", "#5F4528", "#D36134", "#2E3B28"]

  #legends = {
    left: {
      fields: [],
      element: null,
      dragTarget: null,
      types: ["Integer", "Double", "Byte"]
    },
    discrete: {
      fields: [],
      element: null,
      dragTarget: null,
      types: ["Boolean", "BooleanArray", "Integer", "IntegerArray", "Double", "DoubleArray", "String", "StringArray", "Byte", "ByteArray"]
    },
    right: {
      fields: [],
      element: null,
      dragTarget: null,
      types: ["Integer", "Double", "Byte"]
    }
  }

  constructor(content) {
    this.#legendItemTemplate = content.getElementsByClassName("legend-item-template")[0].firstElementChild
    this.#legends.left.element = content.getElementsByClassName("legend-left")[0]
    this.#legends.discrete.element = content.getElementsByClassName("legend-discrete")[0]
    this.#legends.right.element = content.getElementsByClassName("legend-right")[0]
    this.#legends.left.dragTarget = content.getElementsByClassName("legend-left")[1]
    this.#legends.discrete.dragTarget = content.getElementsByClassName("legend-discrete")[1]
    this.#legends.right.dragTarget = content.getElementsByClassName("legend-right")[1]

    window.addEventListener("drag-update", (event) => { this.#handleDrag(event) })
    window.addEventListener("drag-stop", (event) => { this.#handleDrag(event) })
  }

  // Handles dragging events (moving and stopping)
  #handleDrag(event) {

    Object.keys(this.#legends).forEach((key) => {
      var legend = this.#legends[key]
      var rect = legend.element.getBoundingClientRect()
      var active = legend.types.includes(log.getFieldInfo(event.detail.data).type) && event.detail.x > rect.left && event.detail.x < rect.right && event.detail.y > rect.top && event.detail.y < rect.bottom

      if (event.type == "drag-update") {
        legend.dragTarget.hidden = !active
      } else {
        legend.dragTarget.hidden = true
        if (active) this.addField(key, event.detail.data)
      }
    })
  }

  // Adds a new field to the specified legend
  addField(legend, field) {
    // Get color
    var usedColors = []
    Object.keys(this.#legends).forEach((key) => {
      this.#legends[key].fields.forEach((x) => {
        usedColors.push(x.color)
      })
    })
    var availableColors = this.#colors.filter((color) => !usedColors.includes(color))
    if (availableColors.length == 0) {
      var color = this.#colors[Math.floor(Math.random() * this.#colors.length)]
    } else {
      var color = availableColors[0]
    }

    // Create element
    var item = this.#legendItemTemplate.cloneNode(true)
    item.getElementsByClassName("legend-key")[0].innerText = log.getFieldInfo(field).displayKey
    item.getElementsByClassName("legend-splotch")[0].style.fill = color
    item.getElementsByClassName("legend-edit")[0].addEventListener("click", () => {
      var index = Array.from(item.parentElement.children).indexOf(item) - 1
      item.parentElement.removeChild(item)
      this.#legends[legend].fields.splice(index, 1)
    })

    // Add field
    this.#legends[legend].fields.push({
      id: field,
      color: color
    })
    this.#legends[legend].element.appendChild(item)
  }

  // Called every 15ms by the tab controller
  periodic() { }
}