import LoggableType from "../../shared/log/LoggableType";
import TabType from "../../shared/TabType";
import PointsVisualizer from "../../shared/visualizers/PointsVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class PointsController extends TimelineVizController {
  private WIDTH: HTMLInputElement;
  private HEIGHT: HTMLInputElement;
  private GROUP: HTMLInputElement;
  private POINT_SHAPE: HTMLInputElement;
  private POINT_SIZE: HTMLInputElement;

  constructor(content: HTMLElement) {
    let configBody = content.getElementsByClassName("timeline-viz-config")[0].firstElementChild as HTMLElement;
    super(
      content,
      TabType.Points,
      [
        // X
        {
          element: configBody.children[1].firstElementChild as HTMLElement,
          types: [LoggableType.NumberArray]
        },

        // Y
        {
          element: configBody.children[2].firstElementChild as HTMLElement,
          types: [LoggableType.NumberArray]
        }
      ],
      [],
      new PointsVisualizer(content.getElementsByClassName("points-background-container")[0] as HTMLElement)
    );

    // Get option inputs
    this.WIDTH = configBody.children[1].children[1].children[1] as HTMLInputElement;
    this.HEIGHT = configBody.children[1].children[1].children[3] as HTMLInputElement;
    this.GROUP = configBody.children[2].children[1].children[1] as HTMLInputElement;
    this.POINT_SHAPE = configBody.children[1].children[2].children[1] as HTMLInputElement;
    this.POINT_SIZE = configBody.children[2].children[2].children[1] as HTMLInputElement;

    // Enforce range
    [this.WIDTH, this.HEIGHT, this.GROUP].forEach((input, index) => {
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
      group: Number(this.GROUP.value),
      pointShape: this.POINT_SHAPE.value,
      pointSize: this.POINT_SIZE.value
    };
  }

  set options(options: { [id: string]: any }) {
    this.WIDTH.value = options.width;
    this.HEIGHT.value = options.height;
    this.GROUP.value = options.group;
    this.POINT_SHAPE.value = options.pointShape;
    this.POINT_SIZE.value = options.pointSize;
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

    if (fields[0] !== null) {
      let xDataTemp = window.log.getNumberArray(fields[0].key, time, time);
      if (xDataTemp && xDataTemp.timestamps[0] <= time) {
        xData = xDataTemp.values[0];
      }
    }
    if (fields[1] !== null) {
      let yDataTemp = window.log.getNumberArray(fields[1].key, time, time);
      if (yDataTemp && yDataTemp.timestamps[0] <= time) {
        yData = yDataTemp.values[0];
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
