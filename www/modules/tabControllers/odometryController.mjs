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

  // Called by the tab controller when the tab becomes visible
  show() { }

  // Called every 15ms by the tab controller
  periodic() { }
}