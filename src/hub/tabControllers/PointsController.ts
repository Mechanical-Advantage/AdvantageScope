import LoggableType from "../../shared/log/LoggableType";
import { getOrDefault } from "../../shared/log/LogUtil";
import TabType from "../../shared/TabType";
import PointsVisualizer from "../../shared/visualizers/PointsVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class PointsController extends TimelineVizController {
  private WIDTH: HTMLInputElement;
  private HEIGHT: HTMLInputElement;
  private COORDINATES: HTMLInputElement;
  private ORIGIN: HTMLInputElement;
  private POINT_SHAPE: HTMLInputElement;
  private POINT_SIZE: HTMLInputElement;
  private GROUP_SIZE: HTMLInputElement;

  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.Points,
      [
        // Combined
        {
          element: configBody.children[1].firstElementChild as HTMLElement,
          types: [LoggableType.NumberArray, "Translation2d[]"]
        },

        // X
        {
          element: configBody.children[2].firstElementChild as HTMLElement,
          types: [LoggableType.NumberArray]
        },

        // Y
        {
          element: configBody.children[3].firstElementChild as HTMLElement,
          types: [LoggableType.NumberArray]
        }
      ],
      [],
      new PointsVisualizer(content.getElementsByClassName("points-background-container")[0] as HTMLElement)
    );

    // Get option inputs
    this.WIDTH = configBody.children[1].children[1].children[1] as HTMLInputElement;
    this.HEIGHT = configBody.children[1].children[1].children[3] as HTMLInputElement;
    this.COORDINATES = configBody.children[2].children[1].children[1] as HTMLInputElement;
    this.ORIGIN = configBody.children[3].children[1].children[1] as HTMLInputElement;
    this.POINT_SHAPE = configBody.children[1].children[2].children[1] as HTMLInputElement;
    this.POINT_SIZE = configBody.children[2].children[2].children[1] as HTMLInputElement;
    this.GROUP_SIZE = configBody.children[3].children[2].children[1] as HTMLInputElement;

    // Enforce number ranges
    [this.WIDTH, this.HEIGHT, this.GROUP_SIZE].forEach((input, index) => {
      input.addEventListener("change", () => {
        if (Number(input.value) % 1 !== 0) input.value = Math.round(Number(input.value)).toString();
        if (index === 2) {
          if (Number(input.value) < 0) input.value = "0";
        } else {
          if (Number(input.value) <= 0) input.value = "1";
        }
      });
    });
  }

  get options(): { [id: string]: any } {
    return {
      width: Number(this.WIDTH.value),
      height: Number(this.HEIGHT.value),
      coordinates: this.COORDINATES.value,
      origin: this.ORIGIN.value,
      pointShape: this.POINT_SHAPE.value,
      pointSize: this.POINT_SIZE.value,
      groupSize: Number(this.GROUP_SIZE.value)
    };
  }

  set options(options: { [id: string]: any }) {
    this.WIDTH.value = options.width;
    this.HEIGHT.value = options.height;
    this.COORDINATES.value = options.coordinates;
    this.ORIGIN.value = options.origin;
    this.POINT_SHAPE.value = options.pointShape;
    this.POINT_SIZE.value = options.pointSize;
    this.GROUP_SIZE.value = options.groupSize;
  }

  newAssets() {}

  getAdditionalActiveFields(): string[] {
    return [];
  }

  getCommand(time: number) {
    let fields = this.getFields();

    // Get current data
    let xData: number[] = [];
    let yData: number[] = [];

    // Get combined data
    if (fields[0] !== null) {
      switch (fields[0].sourceType) {
        case LoggableType.NumberArray:
          const value = getOrDefault(window.log, fields[0].key, LoggableType.NumberArray, time, []);
          if (value.length % 2 === 0) {
            for (let i = 0; i < value.length; i += 2) {
              xData.push(value[i]);
              yData.push(value[i + 1]);
            }
          }
          break;
        case "Translation2d[]":
          let length = getOrDefault(window.log, fields[0].key + "/length", LoggableType.Number, time, 0);
          for (let i = 0; i < length; i++) {
            const x = getOrDefault(
              window.log,
              fields[0].key + "/" + i.toString() + "/x",
              LoggableType.Number,
              time,
              null
            );
            const y = getOrDefault(
              window.log,
              fields[0].key + "/" + i.toString() + "/y",
              LoggableType.Number,
              time,
              null
            );
            if (x !== null && y !== null) {
              xData.push(x);
              yData.push(y);
            }
          }
          break;
      }
    }

    // Get component data
    if (fields[1] !== null && fields[2] !== null) {
      const xValue = getOrDefault(window.log, fields[1].key, LoggableType.NumberArray, time, []);
      const yValue = getOrDefault(window.log, fields[2].key, LoggableType.NumberArray, time, []);
      if (xValue.length === yValue.length) {
        xData = xData.concat(xValue);
        yData = yData.concat(yValue);
      }
    }

    // Package command data
    return {
      data: {
        x: xData,
        y: yData
      },
      options: this.options
    };
  }
}
