// Controls rendering of odometry graphs
export class OdometryController {
  #content = null

  constructor(content) {
    this.#content = content
  }

  // Called every 15ms by the tab controller
  periodic() { }
}