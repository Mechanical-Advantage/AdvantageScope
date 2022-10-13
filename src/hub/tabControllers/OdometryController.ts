import LoggableType from "../../lib/log/LoggableType";
import TabType from "../../lib/TabType";
import { inchesToMeters, metersToInches } from "../../lib/util";
import OdometryVisualizer from "../../lib/visualizers/OdometryVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class OdometryController extends TimelineVizController {
  private GAME: HTMLInputElement;
  private GAME_SOURCE_LINK: HTMLElement;
  private UNIT_DISTANCE: HTMLInputElement;
  private UNIT_ROTATION: HTMLInputElement;
  private ORIGIN: HTMLInputElement;
  private SIZE: HTMLInputElement;
  private SIZE_TEXT: HTMLElement;
  private ALLIANCE: HTMLInputElement;
  private ORIENTATION: HTMLInputElement;

  private TRAIL_LENGTH_SECS = 5;
  private lastUnitDistance = "meters";
  private lastOptions: { [id: string]: any } | null = null;

  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.Odometry,
      [
        // Robot pose
        {
          element: configBody.children[1].firstElementChild as HTMLElement,
          type: LoggableType.NumberArray
        },

        // Ghost pose
        {
          element: configBody.children[2].firstElementChild as HTMLElement,
          type: LoggableType.NumberArray
        },

        // Vision target
        {
          element: configBody.children[3].firstElementChild as HTMLElement,
          type: LoggableType.NumberArray
        }
      ],
      new OdometryVisualizer(content.getElementsByClassName("odometry-canvas")[0] as HTMLCanvasElement)
    );

    // Get option inputs
    this.GAME = configBody.children[1].children[1].children[1] as HTMLInputElement;
    this.GAME_SOURCE_LINK = configBody.children[1].children[1].children[2] as HTMLElement;
    this.UNIT_DISTANCE = configBody.children[2].children[1].children[1] as HTMLInputElement;
    this.UNIT_ROTATION = configBody.children[2].children[1].children[2] as HTMLInputElement;
    this.ORIGIN = configBody.children[3].children[1].lastElementChild as HTMLInputElement;
    this.SIZE = configBody.children[1].lastElementChild?.children[1] as HTMLInputElement;
    this.SIZE_TEXT = configBody.children[1].lastElementChild?.lastElementChild as HTMLElement;
    this.ALLIANCE = configBody.children[2].lastElementChild?.lastElementChild as HTMLInputElement;
    this.ORIENTATION = configBody.children[3].lastElementChild?.lastElementChild as HTMLInputElement;

    // Unit conversion for distance
    this.UNIT_DISTANCE.addEventListener("change", () => {
      let newUnit = this.UNIT_DISTANCE.value;
      if (newUnit != this.lastUnitDistance) {
        let oldSize = Number(this.SIZE.value);
        if (newUnit == "meters") {
          this.SIZE.value = (Math.round(inchesToMeters(oldSize) * 1000) / 1000).toString();
          this.SIZE.step = "0.01";
        } else {
          this.SIZE.value = (Math.round(metersToInches(oldSize) * 100) / 100).toString();
          this.SIZE.step = "1";
        }
        this.SIZE_TEXT.innerText = newUnit;
        this.lastUnitDistance = newUnit;
      }
    });

    // Bind source button
    this.GAME_SOURCE_LINK.addEventListener("click", () => {
      window.sendMainMessage(
        "open-link",
        window.frcData?.field2ds.find((game) => game.title == this.GAME.value)?.sourceUrl
      );
    });

    // Enforce side length range
    this.SIZE.addEventListener("change", () => {
      if (Number(this.SIZE.value) < 0) this.SIZE.value = "0.1";
      if (Number(this.SIZE.value) == 0) this.SIZE.value = "0.1";
    });
  }

  get options(): { [id: string]: any } {
    return {
      game: this.GAME.value,
      unitDistance: this.UNIT_DISTANCE.value,
      unitRotation: this.UNIT_ROTATION.value,
      origin: this.ORIGIN.value,
      size: Number(this.SIZE.value),
      alliance: this.ALLIANCE.value,
      orientation: this.ORIENTATION.value
    };
  }

  set options(options: { [id: string]: any }) {
    this.lastOptions = options;
    this.GAME.value = options.game;
    this.UNIT_DISTANCE.value = options.unitDistance;
    this.UNIT_ROTATION.value = options.unitRotation;
    this.ORIGIN.value = options.origin;
    this.SIZE.value = options.size;
    this.SIZE_TEXT.innerText = options.unitDistance;
    this.lastUnitDistance = options.unitDistance;
    this.ALLIANCE.value = options.alliance;
    this.ORIENTATION.value = options.orientation;
  }

  getCommand(time: number) {
    let fields = this.getFields();

    // Add game options
    if (this.GAME.children.length == 0 && window.frcData) {
      window.frcData.field2ds.forEach((game) => {
        let option = document.createElement("option");
        option.innerText = game.title;
        this.GAME.appendChild(option);
      });
      if (this.lastOptions) this.options = this.lastOptions;
    }

    // Get vision coordinates
    let visionCoordinates: [number, number] | null = null;
    if (fields[2] != null) {
      let currentData = window.log.getNumberArray(fields[2], time, time);
      if (currentData && currentData.timestamps.length > 0) {
        let currentDataTimestamp = currentData.timestamps[0];
        let currentDataValue = currentData.values[0];
        if (currentDataTimestamp <= time && currentDataValue.length >= 2) {
          visionCoordinates = [currentDataValue[0], currentDataValue[1]];
        }
      }
    }

    // Read pose data based on field id
    let getPoseData = (key: string | null, includeTrail: boolean) => {
      if (key == null) {
        if (includeTrail) {
          return {
            pose: null,
            trail: []
          };
        } else {
          return null;
        }
      }

      let pose: [number, number, number] | null = null; // X, Y, Rotation
      let trail: ([number, number] | null)[] = [];

      // Get current pose
      let logData = window.log.getNumberArray(key, time, time);
      if (logData && logData.timestamps[0] <= time && logData.values[0].length == 3) {
        pose = [logData.values[0][0], logData.values[0][1], logData.values[0][2]];
      }

      // Get trail
      if (includeTrail) {
        let trailData = window.log.getNumberArray(key, time - this.TRAIL_LENGTH_SECS, time + this.TRAIL_LENGTH_SECS);
        if (trailData) {
          if (time - trailData.timestamps[0] > this.TRAIL_LENGTH_SECS) {
            trailData.timestamps.shift();
            trailData.values.shift();
          }
          if (trailData.timestamps[trailData.timestamps.length - 1] - time > this.TRAIL_LENGTH_SECS) {
            trailData.timestamps.pop();
            trailData.values.pop();
          }
          trail = trailData.values.map((value) => {
            if (value.length != 3) {
              return null;
            } else {
              return [value[0], value[1]];
            }
          });
        }

        // Return with trail
        return {
          pose: pose,
          trail: trail
        };
      } else {
        return pose;
      }
    };

    // Package command data
    return {
      pose: {
        robotPose: getPoseData(fields[0], true),
        ghostPose: getPoseData(fields[1], false),
        visionCoordinates: visionCoordinates
      },
      options: this.options
    };
  }
}
