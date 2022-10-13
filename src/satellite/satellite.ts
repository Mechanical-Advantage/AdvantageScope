import { FRCData } from "../lib/FRCData";
import NamedMessage from "../lib/NamedMessage";
import Preferences from "../lib/Preferences";
import TabType, { getTabTitle } from "../lib/TabType";
import JoysticksVisualizer from "../lib/visualizers/JoysticksVisualizer";
import OdometryVisualizer from "../lib/visualizers/OdometryVisualizer";
import PointsVisualizer from "../lib/visualizers/PointsVisualizer";
import SwerveVisualizer from "../lib/visualizers/SwerveVisualizer";
import ThreeDimensionVisualizer from "../lib/visualizers/ThreeDimensionVisualizer";
import VideoVisualizer from "../lib/visualizers/VideoVisualizer";
import Visualizer from "../lib/visualizers/Visualizer";

const MAX_ASPECT_RATIO = 5;

declare global {
  interface Window {
    frcData: FRCData | null;
    preferences: Preferences | null;
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

        case "set-preferences":
          window.preferences = message.data;
          break;

        case "set-type":
          type = message.data as TabType;

          // Update visible elements
          (document.getElementById("odometry") as HTMLElement).hidden = type != TabType.Odometry;
          (document.getElementById("threeDimension") as HTMLElement).hidden = type != TabType.ThreeDimension;
          (document.getElementById("video") as HTMLElement).hidden = type != TabType.Video;
          (document.getElementById("points") as HTMLElement).hidden = type != TabType.Points;
          (document.getElementById("joysticks") as HTMLElement).hidden = type != TabType.Joysticks;
          (document.getElementById("swerve") as HTMLElement).hidden = type != TabType.Swerve;

          // Update title
          let title = document.getElementsByTagName("title")[0] as HTMLElement;
          title.innerHTML = getTabTitle(type) + " &mdash; Advantage Scope";

          // Create visualizer
          switch (type) {
            case TabType.Odometry:
              visualizer = new OdometryVisualizer(document.getElementById("odometryCanvas") as HTMLCanvasElement);
              break;
            case TabType.ThreeDimension:
              visualizer = new ThreeDimensionVisualizer(
                document.getElementById("threeDimensionCanvas") as HTMLCanvasElement
              );
              break;
            case TabType.Video:
              visualizer = new VideoVisualizer(document.getElementsByClassName("video-image")[0] as HTMLImageElement);
              break;
            case TabType.Points:
              visualizer = new PointsVisualizer(
                document.getElementsByClassName("points-background-container")[0] as HTMLElement
              );
              break;
            case TabType.Joysticks:
              visualizer = new JoysticksVisualizer(document.getElementById("joysticksCanvas") as HTMLCanvasElement);
              break;
            case TabType.Swerve:
              visualizer = new SwerveVisualizer(
                document.getElementsByClassName("swerve-canvas-container")[0] as HTMLElement
              );
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
