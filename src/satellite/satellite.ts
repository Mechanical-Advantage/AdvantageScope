import NamedMessage from "../lib/NamedMessage";
import TabType from "../lib/TabType";
import OdometryVisualizer from "../lib/visualizers/OdometryVisualizer";
import PointsVisualizer from "../lib/visualizers/PointsVisualizer";
import Visualizer from "../lib/visualizers/Visualizer";

const MAX_ASPECT_RATIO = 5;

var visualizer: Visualizer | null = null;
var type: TabType | null = null;
var messagePort: MessagePort | null = null;
var lastAspectRatio: number | null = null;
var lastCommand: any = null;

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
          }
          break;

        case "render":
          lastCommand = message.data;
          let aspectRatio = visualizer?.render(message.data);
          if (aspectRatio) processAspectRatio(aspectRatio);
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
