import { SourceListItemState, SourceListState } from "../../shared/SourceListConfig";
import { grabPosesAuto, translation3dTo2d } from "../../shared/geometry";
import { getOrDefault } from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import { PointsRendererCommand } from "../../shared/renderers/PointsRenderer";
import { createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import PointsController_Config from "./PointsController_Config";
import TabController from "./TabController";

export default class PointsController implements TabController {
  UUID = createUUID();

  private WIDTH: HTMLInputElement;
  private HEIGHT: HTMLInputElement;
  private ORIENTATION: HTMLInputElement;
  private ORIGIN: HTMLInputElement;

  private sourceList: SourceList;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(root.firstElementChild as HTMLElement, PointsController_Config, []);
    let settings = root.getElementsByClassName("points-settings")[0] as HTMLElement;
    this.WIDTH = settings.getElementsByClassName("dimensions-width")[0] as HTMLInputElement;
    this.HEIGHT = settings.getElementsByClassName("dimensions-height")[0] as HTMLInputElement;
    this.ORIENTATION = settings.getElementsByClassName("orientation")[0] as HTMLInputElement;
    this.ORIGIN = settings.getElementsByClassName("origin")[0] as HTMLInputElement;

    // Enforce number ranges
    [this.WIDTH, this.HEIGHT].forEach((input, index) => {
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

  saveState(): unknown {
    return {
      sources: this.sourceList.getState(),
      width: Number(this.WIDTH.value),
      height: Number(this.HEIGHT.value),
      orientation: this.ORIENTATION.value,
      origin: this.ORIGIN.value
    };
  }

  restoreState(state: unknown): void {
    if (typeof state !== "object" || state === null) return;

    if ("sources" in state) {
      this.sourceList.setState(state.sources as SourceListState);
    }
    if ("width" in state && typeof state.width === "number") {
      this.WIDTH.value = state.width.toString();
    }
    if ("height" in state && typeof state.height === "number") {
      this.HEIGHT.value = state.height.toString();
    }
    if ("orientation" in state && typeof state.orientation === "string") {
      this.ORIENTATION.value = state.orientation.toString();
    }
    if ("origin" in state && typeof state.origin === "string") {
      this.ORIGIN.value = state.origin.toString();
    }
  }

  refresh(): void {
    this.sourceList.refresh();
  }

  newAssets(): void {}

  getActiveFields(): string[] {
    return this.sourceList.getActiveFields();
  }

  showTimeline(): boolean {
    return true;
  }

  getCommand(): PointsRendererCommand {
    let time = window.selection.getRenderTime();
    if (time === null) time = window.log.getTimestampRange()[1];

    let sets: PointsRendererCommand["sets"] = [];
    let sources = this.sourceList.getState(true);
    for (let i = 0; i < sources.length; i++) {
      let source = sources[i];
      let typeConfig = PointsController_Config.types.find((typeConfig) => typeConfig.key === source.type);
      if (typeConfig?.childOf !== undefined) continue; // This is a child, don't render

      // Find children
      let children: SourceListItemState[] = [];
      while (
        sources.length > i + 1 &&
        PointsController_Config.types.find((typeConfig) => typeConfig.key === sources[i + 1].type)?.childOf !==
          undefined
      ) {
        i++;
        children.push(sources[i]);
      }

      // Get options
      let shape: "plus" | "cross" | "circle" = "plus";
      if (source.type.startsWith("plus")) shape = "plus";
      if (source.type.startsWith("cross")) shape = "cross";
      if (source.type.startsWith("circle")) shape = "circle";
      let size: "small" | "medium" | "large" = "medium";
      if ("size" in source.options) {
        let sizeRaw = source.options.size;
        size = sizeRaw === "small" || sizeRaw === "medium" || sizeRaw === "large" ? sizeRaw : "medium";
      }
      let groupSize = 0;
      if ("groupSize" in source.options) {
        groupSize = Number(source.options.groupSize);
      }

      // Add data
      switch (source.type) {
        case "plus":
        case "cross":
        case "circle":
          let poses = grabPosesAuto(window.log, source.logKey, source.logType, time, this.UUID, "Translation2d");
          sets.push({
            points: poses.map((x) => translation3dTo2d(x.pose.translation)),
            shape: shape,
            size: size,
            groupSize: groupSize
          });
          break;

        case "plusSplit":
        case "crossSplit":
        case "circleSplit":
          let values: number[] = getOrDefault(window.log, source.logKey, LoggableType.NumberArray, time, [], this.UUID);
          let points: [number, number][];
          if (source.options.component === "x") {
            points = values.map((x) => [x, 0]);
          } else {
            points = values.map((y) => [0, y]);
          }
          sets.push({
            points: points,
            shape: shape,
            size: size,
            groupSize: groupSize
          });
          break;
      }

      // Add child components
      children.forEach((child) => {
        let points = sets[sets.length - 1].points;
        let values: number[] = getOrDefault(window.log, child.logKey, LoggableType.NumberArray, time!, [], this.UUID);
        values.forEach((value, index) => {
          if (index < points.length) {
            if (child.options.component === "x") {
              points[index][0] = value;
            } else {
              points[index][1] = value;
            }
          }
        });
      });
    }

    // Apply orientation and origin
    let dimensions: [number, number] = [Number(this.WIDTH.value), Number(this.HEIGHT.value)];
    sets.forEach((set) => {
      set.points.forEach((point) => {
        let newPoint: [number, number] = point;
        switch (this.ORIENTATION.value) {
          case "xr,yd":
            // Default, no changes
            break;
          case "xr,yu":
            newPoint = [newPoint[0], -newPoint[1]];
            break;
          case "xu,yl":
            newPoint = [-newPoint[1], -newPoint[0]];
            break;
        }
        switch (this.ORIGIN.value) {
          case "ul":
            // Default, no changes
            break;
          case "ur":
            newPoint = [newPoint[0] + dimensions[0], newPoint[1]];
            break;
          case "ll":
            newPoint = [newPoint[0], newPoint[1] + dimensions[1]];
            break;
          case "lr":
            newPoint = [newPoint[0] + dimensions[0], newPoint[1] + dimensions[1]];
            break;
          case "c":
            newPoint = [newPoint[0] + dimensions[0] / 2, newPoint[1] + dimensions[1] / 2];
            break;
        }
        point[0] = newPoint[0];
        point[1] = newPoint[1];
      });
    });

    sets.reverse();
    return {
      dimensions: dimensions,
      sets: sets
    };
  }
}
