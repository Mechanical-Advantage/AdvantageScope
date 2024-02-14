// import {
//   APRIL_TAG_16H5_COUNT,
//   APRIL_TAG_36H11_COUNT,
//   AprilTag,
//   logReadNumberArrayToPose2dArray,
//   logReadNumberArrayToPose3dArray,
//   logReadPose2d,
//   logReadPose2dArray,
//   logReadPose3d,
//   logReadPose3dArray,
//   logReadTrajectoryToPose2dArray,
//   logReadTranslation2dArrayToPose2dArray,
//   logReadTranslation2dToPose2d,
//   logReadTranslation3dArrayToPose3dArray,
//   logReadTranslation3dToPose3d,
//   pose2dArrayTo3d,
//   pose2dTo3d,
//   Pose3d,
//   rotation2dTo3d,
//   rotation3dTo2d,
//   Translation2d
// } from "../../shared/geometry";
import LoggableType from "../../shared/log/LoggableType";
import TabType from "../../shared/TabType";
import { convert } from "../../shared/units";
import { cleanFloat, scaleValue } from "../../shared/util";
import PointCloudVisualizerSwitching from "../../shared/visualizers/PointCloudVisualizerSwitching";
import TimelineVizController from "./TimelineVizController";

export default class PointCloudController extends TimelineVizController {

  // private FIELD: HTMLSelectElement;
  // private ALLIANCE: HTMLSelectElement;
  // private FIELD_SOURCE_LINK: HTMLInputElement;
  // private ROBOT: HTMLSelectElement;
  // private ROBOT_SOURCE_LINK: HTMLInputElement;
  // private UNIT_DISTANCE: HTMLInputElement;
  // private UNIT_ROTATION: HTMLInputElement;

  // private newAssetsCounter = 0;

  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.PointClouds,
      [
        {
          element: configBody.children[1].children[0] as HTMLElement,
          types: [ LoggableType.Raw, LoggableType.NumberArray ]
        }
      ],
      [ // use this array if we want to support multiple point clouds rendering at once (ie. different colors!?)
        // {
        //   element: configBody.children[1].children[0] as HTMLElement,
        //   types: [
        //     LoggableType.Raw,
        //     LoggableType.NumberArray,
        //     "Translation3d[]"
        //   ],
        //   options: []
        // }
      ],
      new PointCloudVisualizerSwitching(
        content,
        content.getElementsByClassName("point-clouds-canvas")[0] as HTMLCanvasElement,
        content.getElementsByClassName("point-clouds-annotations")[0] as HTMLElement,
        content.getElementsByClassName("point-clouds-alert")[0] as HTMLElement
      )
    );

    // Get option inputs
    // this.FIELD = configBody.children[1].children[2].children[1] as HTMLSelectElement;
    // this.ALLIANCE = configBody.children[1].children[2].children[2] as HTMLSelectElement;
    // this.FIELD_SOURCE_LINK = configBody.children[1].children[2].children[3] as HTMLInputElement;
    // this.ROBOT = configBody.children[2].children[0].children[1] as HTMLSelectElement;
    // this.ROBOT_SOURCE_LINK = configBody.children[2].children[0].children[2] as HTMLInputElement;
    // this.UNIT_DISTANCE = configBody.children[3].children[0].children[1] as HTMLInputElement;
    // this.UNIT_ROTATION = configBody.children[3].children[0].children[2] as HTMLInputElement;

    // Add initial set of options
    // this.resetFieldRobotOptions();

    // Bind source links
    // this.FIELD.addEventListener("change", () => this.updateFieldRobotDependentControls());
    // this.FIELD_SOURCE_LINK.addEventListener("click", () => {
    //   window.sendMainMessage(
    //     "open-link",
    //     window.assets?.field3ds.find((field) => field.name === this.FIELD.value)?.sourceUrl
    //   );
    // });
    // this.ROBOT.addEventListener("change", () => this.updateFieldRobotDependentControls(true));
    // this.ROBOT_SOURCE_LINK.addEventListener("click", () => {
    //   window.sendMainMessage(
    //     "open-link",
    //     window.assets?.robots.find((robot) => robot.name === this.ROBOT.value)?.sourceUrl
    //   );
    // });
  }

  /** Clears all options from the field and robot selectors then updates them with the latest options. */
  // private resetFieldRobotOptions() {
  //   let fieldChanged = false;
  //   {
  //     let value = this.FIELD.value;
  //     while (this.FIELD.firstChild) {
  //       this.FIELD.removeChild(this.FIELD.firstChild);
  //     }
  //     let options: string[] = [];
  //     if (window.assets !== null) {
  //       options = [...window.assets.field3ds.map((game) => game.name), "Evergreen", "Axes"];
  //       options.forEach((title) => {
  //         let option = document.createElement("option");
  //         option.innerText = title;
  //         this.FIELD.appendChild(option);
  //       });
  //     }
  //     if (options.includes(value)) {
  //       this.FIELD.value = value;
  //     } else {
  //       this.FIELD.value = options[0];
  //     }
  //     fieldChanged = this.FIELD.value !== value;
  //   }
  //   {
  //     let value = this.ROBOT.value;
  //     while (this.ROBOT.firstChild) {
  //       this.ROBOT.removeChild(this.ROBOT.firstChild);
  //     }
  //     let options: string[] = [];
  //     if (window.assets !== null) {
  //       options = window.assets.robots.map((robot) => robot.name);
  //       options.forEach((title) => {
  //         let option = document.createElement("option");
  //         option.innerText = title;
  //         this.ROBOT.appendChild(option);
  //       });
  //     }
  //     if (options.includes(value)) {
  //       this.ROBOT.value = value;
  //     } else {
  //       this.ROBOT.value = options[0];
  //     }
  //   }
  //   this.updateFieldRobotDependentControls(!fieldChanged);
  // }

  /** Updates the alliance chooser, source buttons, and game piece names based on the selected value. */
  // private updateFieldRobotDependentControls(skipAllianceReset = false) {
  //   let fieldConfig = window.assets?.field3ds.find((game) => game.name === this.FIELD.value);
  //   this.FIELD_SOURCE_LINK.hidden = fieldConfig === undefined || fieldConfig.sourceUrl === undefined;
  //   let robotConfig = window.assets?.robots.find((game) => game.name === this.ROBOT.value);
  //   this.ROBOT_SOURCE_LINK.hidden = robotConfig !== undefined && robotConfig.sourceUrl === undefined;

  //   if (this.FIELD.value === "Axes") this.ALLIANCE.value = "blue";
  //   this.ALLIANCE.hidden = this.FIELD.value === "Axes";
  //   if (fieldConfig !== undefined && !skipAllianceReset) {
  //     this.ALLIANCE.value = fieldConfig.defaultOrigin;
  //   }

  //   let aliases: { [key: string]: string | null } = {
  //     "Game Piece 0": null,
  //     "Game Piece 1": null,
  //     "Game Piece 2": null,
  //     "Game Piece 3": null,
  //     "Game Piece 4": null,
  //     "Game Piece 5": null
  //   };
  //   if (fieldConfig !== undefined) {
  //     fieldConfig.gamePieces.forEach((gamePiece, index) => {
  //       aliases["Game Piece " + index.toString()] = gamePiece.name;
  //     });
  //   }
  //   this.setListOptionAliases(aliases);
  // }

  get options(): { [id: string]: any } {
    return {
      // field: this.FIELD.value,
      // alliance: this.ALLIANCE.value,
      // robot: this.ROBOT.value,
      // unitDistance: this.UNIT_DISTANCE.value,
      // unitRotation: this.UNIT_ROTATION.value
    };
  }

  set options(options: { [id: string]: any }) {
    // this.resetFieldRobotOptions(); // Cannot set field and robot values without options
    // this.FIELD.value = options.field;
    // this.ALLIANCE.value = options.alliance;
    // this.ROBOT.value = options.robot;
    // this.UNIT_DISTANCE.value = options.unitDistance;
    // this.UNIT_ROTATION.value = options.unitRotation;
    // this.updateFieldRobotDependentControls(true);
  }

  newAssets() {
    // this.resetFieldRobotOptions();
    // this.newAssetsCounter++;
  }

  /** Switches the selected camera for the main visualizer. */
  set3DCamera(index: number) {
    (this.visualizer as PointCloudVisualizerSwitching).set3DCamera(index);
  }

  /** Switches the orbit FOV for the main visualizer. */
  setFov(fov: number) {
    (this.visualizer as PointCloudVisualizerSwitching).setFov(fov);
  }

  getAdditionalActiveFields(): string[] {
    // if (this.ALLIANCE.value === "auto") {
    //   return ALLIANCE_KEYS;
    // } else {
    //   return [];
    // }
    return [];
  }

  getCommand(time: number) {
    
  }
}
