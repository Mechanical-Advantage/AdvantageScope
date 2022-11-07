import * as THREE from "three";
import LoggableType from "../../shared/log/LoggableType";
import TabType from "../../shared/TabType";
import ThreeDimensionVisualizer, { Pose3d } from "../../shared/visualizers/ThreeDimensionVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class ThreeDimensionController extends TimelineVizController {
  private FIELD: HTMLInputElement;
  private ALLIANCE: HTMLInputElement;
  private FIELD_SOURCE_LINK: HTMLInputElement;
  private ROBOT: HTMLInputElement;
  private ROBOT_SOURCE_LINK: HTMLInputElement;

  private lastOptions: { [id: string]: any } | null = null;

  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.ThreeDimension,
      [
        // Robot
        {
          element: configBody.children[1].children[0] as HTMLElement,
          type: LoggableType.NumberArray
        },

        // Green cones
        {
          element: configBody.children[2].children[0] as HTMLElement,
          type: LoggableType.NumberArray
        },

        // Blue cones
        {
          element: configBody.children[1].children[1] as HTMLElement,
          type: LoggableType.NumberArray
        },

        // Yellow cones
        {
          element: configBody.children[2].children[1] as HTMLElement,
          type: LoggableType.NumberArray
        }
      ],
      new ThreeDimensionVisualizer(
        content,
        content.getElementsByClassName("three-dimension-canvas")[0] as HTMLCanvasElement,
        content.getElementsByClassName("three-dimension-alert")[0] as HTMLElement
      )
    );

    // Get option inputs
    this.FIELD = configBody.children[1].children[2].children[1] as HTMLInputElement;
    this.ALLIANCE = configBody.children[1].children[2].children[2] as HTMLInputElement;
    this.FIELD_SOURCE_LINK = configBody.children[1].children[2].children[3] as HTMLInputElement;
    this.ROBOT = configBody.children[2].children[2].children[1] as HTMLInputElement;
    this.ROBOT_SOURCE_LINK = configBody.children[2].children[2].children[2] as HTMLInputElement;

    // Bind source links
    this.FIELD.addEventListener("change", () => {
      let fieldConfig = window.frcData?.field3ds.find((game) => game.title == this.FIELD.value);
      this.FIELD_SOURCE_LINK.hidden = fieldConfig != undefined && fieldConfig.sourceUrl == undefined;
    });
    this.FIELD_SOURCE_LINK.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.frcData?.field3ds.find((field) => field.title == this.FIELD.value)?.sourceUrl
      );
    });
    this.ROBOT.addEventListener("change", () => {
      let config = window.frcData?.robots.find((game) => game.title == this.ROBOT.value);
      this.ROBOT_SOURCE_LINK.hidden = config != undefined && config.sourceUrl == undefined;
    });
    this.ROBOT_SOURCE_LINK.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.frcData?.robots.find((robot) => robot.title == this.ROBOT.value)?.sourceUrl
      );
    });
  }

  get options(): { [id: string]: any } {
    return {
      field: this.FIELD.value,
      alliance: this.ALLIANCE.value,
      robot: this.ROBOT.value
    };
  }

  set options(options: { [id: string]: any }) {
    this.lastOptions = options;
    this.FIELD.value = options.field;
    this.ALLIANCE.value = options.alliance;
    this.ROBOT.value = options.robot;

    // Set whether source links are hidden
    let fieldConfig = window.frcData?.field3ds.find((game) => game.title == this.FIELD.value);
    this.FIELD_SOURCE_LINK.hidden = fieldConfig != undefined && fieldConfig.sourceUrl == undefined;
    let robotConfig = window.frcData?.robots.find((game) => game.title == this.ROBOT.value);
    this.ROBOT_SOURCE_LINK.hidden = robotConfig != undefined && robotConfig.sourceUrl == undefined;
  }

  /** Switches the selected camera for the main visualizer. */
  set3DCamera(index: number) {
    (this.visualizer as ThreeDimensionVisualizer).set3DCamera(index);
  }

  getCommand(time: number) {
    let fields = this.getFields();

    // Add field and robot options
    if (this.FIELD.children.length == 0 && this.ROBOT.children.length == 0 && window.frcData) {
      window.frcData.field3ds.forEach((game) => {
        let option = document.createElement("option");
        option.innerText = game.title;
        this.FIELD.appendChild(option);
      });
      window.frcData.robots.forEach((robot) => {
        let option = document.createElement("option");
        option.innerText = robot.title;
        this.ROBOT.appendChild(option);
      });
      if (this.lastOptions) this.options = this.lastOptions;
    }

    // Get robot pose
    let robotPose: Pose3d | null = null;
    if (fields[0] != null) {
      let logData = window.log.getNumberArray(fields[0], time, time);
      if (logData && logData.timestamps[0] <= time) {
        if (logData.values[0].length == 3) {
          let quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), logData.values[0][2]);
          robotPose = {
            position: [logData.values[0][0], logData.values[0][1], 0],
            rotation: [quaternion.w, quaternion.x, quaternion.y, quaternion.z]
          };
        } else if (logData.values[0].length == 7) {
          robotPose = {
            position: [logData.values[0][0], logData.values[0][1], logData.values[0][2]],
            rotation: [logData.values[0][3], logData.values[0][4], logData.values[0][5], logData.values[0][6]]
          };
        }
      }
    }

    // Read data for cones
    let getConeData = (key: string | null): Pose3d[] => {
      if (key != null) {
        let logData = window.log.getNumberArray(key, time, time);
        if (logData && logData.timestamps[0] <= time && logData.values[0].length % 7 == 0) {
          let poses: Pose3d[] = [];
          let rawPoseData = logData.values[0];
          for (let i = 0; i < rawPoseData.length; i += 7) {
            poses.push({
              position: [rawPoseData[i], rawPoseData[i + 1], rawPoseData[i + 2]],
              rotation: [rawPoseData[i + 3], rawPoseData[i + 4], rawPoseData[i + 5], rawPoseData[i + 6]]
            });
          }
          return poses;
        }
      }
      return [];
    };

    // Package command data
    return {
      poses: {
        robot: robotPose,
        green: getConeData(fields[1]),
        blue: getConeData(fields[2]),
        yellow: getConeData(fields[3])
      },
      options: this.options
    };
  }
}
