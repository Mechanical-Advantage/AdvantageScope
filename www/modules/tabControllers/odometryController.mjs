// Controls rendering of odometry graphs
export class OdometryController {
  #content = null

  constructor(content) {
    this.#content = content
  }

  // Called by tab controller when log changes
  reset() { }

  // Called by tab controller when side bar size changes
  sideBarResize() { }

  // Called every 15ms by the tab controller
  periodic() { }
}