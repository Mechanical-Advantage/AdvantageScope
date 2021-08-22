// Controls rendering of tables
export class TableController {
  #content = null

  constructor(content) {
    this.#content = content
  }

  // Called every 15ms by the tab controller
  periodic() { }
}