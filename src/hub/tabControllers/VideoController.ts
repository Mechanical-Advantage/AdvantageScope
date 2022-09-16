import TabType from "../../lib/TabType";
import VideoVisualizer from "../../lib/visualizers/VideoVisualizer";
import TimelineVizController from "./TimelineVizController";

export default class VideoController extends TimelineVizController {
  constructor(content: HTMLElement) {
    super(content, TabType.Video, [], new VideoVisualizer());
  }

  get options(): { [id: string]: any } {
    return {};
  }

  set options(options: { [id: string]: any }) {}

  getCommand(time: number) {
    return null;
  }
}
