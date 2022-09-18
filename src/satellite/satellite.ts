import NamedMessage from "../lib/NamedMessage";
import TabType from "../lib/TabType";
import OdometryVisualizer from "../lib/visualizers/OdometryVisualizer";
import PointsVisualizer from "../lib/visualizers/PointsVisualizer";
import VideoVisualizer from "../lib/visualizers/VideoVisualizer";
import Visualizer from "../lib/visualizers/Visualizer";

const MAX_ASPECT_RATIO = 5;

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
        case "set-type":
          type = message.data;
          (document.getElementById("odometry") as HTMLElement).hidden = type != TabType.Odometry;
          (document.getElementById("points") as HTMLElement).hidden = type != TabType.Points;
          (document.getElementById("video") as HTMLElement).hidden = type != TabType.Video;
          switch (type) {
            case TabType.Odometry:
              document.getElementsByTagName("title")[0].innerHTML = "Odometry &mdash; Advantage Scope";
              visualizer = new OdometryVisualizer(document.getElementById("odometryCanvas") as HTMLCanvasElement);
              break;
            case TabType.Points:
              document.getElementsByTagName("title")[0].innerHTML = "Points &mdash; Advantage Scope";
              visualizer = new PointsVisualizer(
                document.getElementsByClassName("points-background-container")[0] as HTMLElement
              );
              break;
            case TabType.Video:
              document.getElementsByTagName("title")[0].innerHTML = "Video &mdash; Advantage Scope";
              visualizer = new VideoVisualizer(document.getElementsByClassName("video-image")[0] as HTMLImageElement);
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
