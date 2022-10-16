import LoggableType from "../../shared/log/LoggableType";
import TabType from "../../shared/TabType";
import { convert } from "../../shared/units";
import SwerveVisualizer, { NormalizedModuleState } from "../../shared/visualizers/SwerveVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class JoysticksController extends TimelineVizController {
  private MAX_SPEED: HTMLInputElement;
  private ROTATION_UNITS: HTMLInputElement;
  private ARRANGEMENT: HTMLInputElement;
  private SIZE_LEFT_RIGHT: HTMLInputElement;
  private SIZE_FRONT_BACK: HTMLInputElement;
  private FORWARD_DIRECTION: HTMLInputElement;

  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.Swerve,
      [
        // Status (red)
        {
          element: configBody.children[1].firstElementChild as HTMLElement,
          type: LoggableType.NumberArray
        },

        // Status (blue)
        {
          element: configBody.children[2].firstElementChild as HTMLElement,
          type: LoggableType.NumberArray
        },

        // Robot rotation
        {
          element: configBody.children[3].firstElementChild as HTMLElement,
          type: LoggableType.Number
        }
      ],
      new SwerveVisualizer(content.getElementsByClassName("swerve-canvas-container")[0] as HTMLElement)
    );

    // Get option inputs
    this.MAX_SPEED = configBody.children[1].children[1].children[1] as HTMLInputElement;
    this.ROTATION_UNITS = configBody.children[2].children[1].children[1] as HTMLInputElement;
    this.ARRANGEMENT = configBody.children[3].children[1].children[1] as HTMLInputElement;
    this.SIZE_LEFT_RIGHT = configBody.children[1].children[2].children[1] as HTMLInputElement;
    this.SIZE_FRONT_BACK = configBody.children[2].children[2].children[1] as HTMLInputElement;
    this.FORWARD_DIRECTION = configBody.children[3].children[2].children[1] as HTMLInputElement;

    // Enforce ranges
    this.MAX_SPEED.addEventListener("change", () => {
      if (Number(this.MAX_SPEED.value) <= 0) this.MAX_SPEED.value = "0.1";
    });
    this.SIZE_LEFT_RIGHT.addEventListener("change", () => {
      if (Number(this.SIZE_LEFT_RIGHT.value) <= 0) this.SIZE_LEFT_RIGHT.value = "0.1";
    });
    this.SIZE_FRONT_BACK.addEventListener("change", () => {
      if (Number(this.SIZE_FRONT_BACK.value) <= 0) this.SIZE_FRONT_BACK.value = "0.1";
    });
  }

  get options(): { [id: string]: any } {
    return {
      maxSpeed: Number(this.MAX_SPEED.value),
      rotationUnits: this.ROTATION_UNITS.value,
      arrangement: this.ARRANGEMENT.value,
      sizeLeftRight: Number(this.SIZE_LEFT_RIGHT.value),
      sizeFrontBack: Number(this.SIZE_FRONT_BACK.value),
      forwardDirection: this.FORWARD_DIRECTION.value
    };
  }

  set options(options: { [id: string]: any }) {
    this.MAX_SPEED.value = options.maxSpeed;
    this.ROTATION_UNITS.value = options.rotationUnits;
    this.ARRANGEMENT.value = options.arrangement;
    this.SIZE_LEFT_RIGHT.value = options.sizeLeftRight;
    this.SIZE_FRONT_BACK.value = options.sizeFrontBack;
    this.FORWARD_DIRECTION.value = options.forwardDirection;
  }

  getCommand(time: number) {
    let fields = this.getFields();

    // Get module states
    let getModuleStates = (isRed: boolean): NormalizedModuleState[] | null => {
      let key = fields[isRed ? 0 : 1];
      if (key != null) {
        let moduleData = window.log.getNumberArray(key, time, time);
        if (moduleData && moduleData.timestamps[0] <= time && moduleData.values[0].length == 8) {
          return this.ARRANGEMENT.value.split(",").map((stateIndex) => {
            let stateIndexNum = Number(stateIndex);
            let rotationValue = moduleData!.values[0][stateIndexNum * 2];
            let velocityValue = moduleData!.values[0][stateIndexNum * 2 + 1];
            let state: NormalizedModuleState = {
              rotation:
                this.ROTATION_UNITS.value == "radians" ? rotationValue : convert(rotationValue, "degrees", "radians"),
              normalizedVelocity: Math.min(Math.max(velocityValue / Number(this.MAX_SPEED.value), -1), 1)
            };
            return state;
          });
        }
      }
      return null;
    };

    // Get robot rotation
    let robotRotation = 0;
    switch (this.FORWARD_DIRECTION.value) {
      case "right":
        robotRotation = 0;
        break;
      case "up":
        robotRotation = Math.PI / 2;
        break;
      case "left":
        robotRotation = Math.PI;
        break;
      case "down":
        robotRotation = -Math.PI / 2;
        break;
    }
    if (fields[2] != null) {
      let robotRotationData = window.log.getNumber(fields[2], time, time);
      if (robotRotationData && robotRotationData.timestamps[0] <= time) {
        if (this.ROTATION_UNITS.value == "radians") {
          robotRotation += robotRotationData.values[0];
        } else {
          robotRotation += convert(robotRotationData.values[0], "degrees", "radians");
        }
      }
    }

    // Calculate frame aspect ratio
    let frameAspectRatio = Number(this.SIZE_LEFT_RIGHT.value) / Number(this.SIZE_FRONT_BACK.value);

    return {
      redStates: getModuleStates(true),
      blueStates: getModuleStates(false),
      robotRotation: robotRotation,
      frameAspectRatio: frameAspectRatio
    };
  }
}
