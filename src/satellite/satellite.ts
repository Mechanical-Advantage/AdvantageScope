import { FRCData } from "../lib/FRCData";
import NamedMessage from "../lib/NamedMessage";
import TabType from "../lib/TabType";
import JoysticksVisualizer from "../lib/visualizers/JoysticksVisualizer";
import OdometryVisualizer from "../lib/visualizers/OdometryVisualizer";
import PointsVisualizer from "../lib/visualizers/PointsVisualizer";
import ThreeDimensionVisualizer from "../lib/visualizers/ThreeDimensionVisualizer";
import VideoVisualizer from "../lib/visualizers/VideoVisualizer";
import Visualizer from "../lib/visualizers/Visualizer";

const MAX_ASPECT_RATIO = 5;

declare global {
  interface Window {
    frcData: FRCData | null;
  }
}

let visualizer: Visualizer | null = null;
let type: TabType | null = null;
let messagePort: MessagePort | null = null;
let lastAspectRatio: number | null = null;
let lastCommand: any = null;

window.addEventListener("message", (event) => {
  if (event.source == window && event.data == "port") {
    messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      let message: NamedMessage = event.data;
      switch (message.name) {
        case "set-frc-data":
          window.frcData = message.data;
          break;

        case "set-type":
          type = message.data;
          (document.getElementById("odometry") as HTMLElement).hidden = type != TabType.Odometry;
          (document.getElementById("threeDimension") as HTMLElement).hidden = type != TabType.ThreeDimension;
          (document.getElementById("video") as HTMLElement).hidden = type != TabType.Video;
          (document.getElementById("points") as HTMLElement).hidden = type != TabType.Points;
          (document.getElementById("joysticks") as HTMLElement).hidden = type != TabType.Joysticks;
          let title = document.getElementsByTagName("title")[0] as HTMLElement;
          switch (type) {
            case TabType.Odometry:
              title.innerHTML = "Odometry &mdash; Advantage Scope";
              visualizer = new OdometryVisualizer(document.getElementById("odometryCanvas") as HTMLCanvasElement);
              break;
            case TabType.ThreeDimension:
              title.innerHTML = "3D Field &mdash; Advantage Scope";
              visualizer = new ThreeDimensionVisualizer(
                document.body,
                document.getElementById("threeDimensionCanvas") as HTMLCanvasElement
              );
              break;
            case TabType.Video:
              title.innerHTML = "Video &mdash; Advantage Scope";
              visualizer = new VideoVisualizer(document.getElementsByClassName("video-image")[0] as HTMLImageElement);
              break;
            case TabType.Points:
              title.innerHTML = "Points &mdash; Advantage Scope";
              visualizer = new PointsVisualizer(
                document.getElementsByClassName("points-background-container")[0] as HTMLElement
              );
              break;
            case TabType.Joysticks:
              title.innerHTML = "Joysticks &mdash; Advantage Scope";
              visualizer = new JoysticksVisualizer(document.getElementById("joysticksCanvas") as HTMLCanvasElement);
              break;
          }
          break;

        case "render":
          lastCommand = message.data;
          let aspectRatio = visualizer?.render(message.data);
          if (aspectRatio) processAspectRatio(aspectRatio);
          break;

        default:
          console.warn("Unknown message from main process", message);
          break;
      }
    };
  }
});

window.addEventListener("resize", () => {
  if (visualizer == null || lastCommand == null) {
    return;
  }
  let aspectRatio = visualizer.render(lastCommand);
  if (aspectRatio) processAspectRatio(aspectRatio);
});

function processAspectRatio(aspectRatio: number) {
  if (aspectRatio != lastAspectRatio) {
    lastAspectRatio = aspectRatio;
    if (aspectRatio > MAX_ASPECT_RATIO) aspectRatio = MAX_ASPECT_RATIO;
    if (aspectRatio < 1 / MAX_ASPECT_RATIO) aspectRatio = 1 / MAX_ASPECT_RATIO;
    messagePort?.postMessage(aspectRatio);
  }
}
