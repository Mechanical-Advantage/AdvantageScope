import TabType from "../../lib/TabType";
import PointsVisualizer from "../../lib/visualizers/PointsVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class PointsController extends TimelineVizController {
  constructor(content: HTMLElement) {
    super(content, TabType.Points, [], new PointsVisualizer());
  }
  get options(): { [id: string]: any } {
    throw new Error("Method not implemented.");
  }
  set options(newOptions: { [id: string]: any }) {
    throw new Error("Method not implemented.");
  }
  getCommand(time: number) {
    throw new Error("Method not implemented.");
  }
}
