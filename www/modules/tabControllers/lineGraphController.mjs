// Controls rendering of line graphs
export class LineGraphController {
  #content = null

  constructor(content) {
    this.#content = content
  }

  // Called every 15ms by the tab controller
  periodic() { }
}