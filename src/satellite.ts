import { AdvantageScopeAssets } from "./shared/AdvantageScopeAssets";
import NamedMessage from "./shared/NamedMessage";
import Preferences from "./shared/Preferences";
import TabType, { getTabIcon } from "./shared/TabType";
import { htmlEncode } from "./shared/util";
import JoysticksVisualizer from "./shared/visualizers/JoysticksVisualizer";
import MechanismVisualizer from "./shared/visualizers/MechanismVisualizer";
import OdometryVisualizer from "./shared/visualizers/OdometryVisualizer";
import PointsVisualizer from "./shared/visualizers/PointsVisualizer";
import SwerveVisualizer from "./shared/visualizers/SwerveVisualizer";
import ThreeDimensionVisualizer from "./shared/visualizers/ThreeDimensionVisualizer";
import ThreeDimensionVisualizerSwitching from "./shared/visualizers/ThreeDimensionVisualizerSwitching";
import VideoVisualizer from "./shared/visualizers/VideoVisualizer";
import PointCloudVisualizer from "./shared/visualizers/PointCloudVisualizer";
import PointCloudVisualizerSwitching from "./shared/visualizers/PointCloudVisualizerSwitching"
import Visualizer from "./shared/visualizers/Visualizer";

const MAX_ASPECT_RATIO = 5;
const SAVE_PERIOD_MS = 250;

declare global {
  interface Window {
    assets: AdvantageScopeAssets | null;
    preferences: Preferences | null;
    isBattery: boolean;
    sendMainMessage: (name: string, data?: any) => void;
  }
}

window.isBattery = false;

let visualizer: Visualizer | null = null;
let type: TabType | null = null;
let title: string | null = null;
let messagePort: MessagePort | null = null;
let lastAspectRatio: number | null = null;
let lastCommand: any = null;

/** Updates the current visualizer based on the type. */
function updateVisualizer() {
  if (type === null) return;

  // Update visible elements
  (document.getElementById("odometry") as HTMLElement).hidden = type !== TabType.Odometry;
  (document.getElementById("threeDimension") as HTMLElement).hidden = type !== TabType.ThreeDimension;
  (document.getElementById("pointClouds") as HTMLElement).hidden = type !== TabType.PointClouds;
  (document.getElementById("video") as HTMLElement).hidden = type !== TabType.Video;
  (document.getElementById("joysticks") as HTMLElement).hidden = type !== TabType.Joysticks;
  (document.getElementById("swerve") as HTMLElement).hidden = type !== TabType.Swerve;
  (document.getElementById("mechanism") as HTMLElement).hidden = type !== TabType.Mechanism;
  (document.getElementById("points") as HTMLElement).hidden = type !== TabType.Points;

  // Create visualizer
  switch (type) {
    case TabType.Odometry:
      visualizer = new OdometryVisualizer(
        document.getElementById("odometryCanvasContainer") as HTMLElement,
        document.getElementById("odometryHeatmapContainer") as HTMLElement
      );
      break;
    case TabType.ThreeDimension:
      visualizer = new ThreeDimensionVisualizerSwitching(
        document.body,
        document.getElementById("threeDimensionCanvas") as HTMLCanvasElement,
        document.getElementById("threeDimensionAnnotations") as HTMLElement,
        document.getElementById("threeDimensionAlert") as HTMLElement
      );
      break;
    case TabType.PointClouds:
      visualizer = new PointCloudVisualizerSwitching(
        document.body,
        document.getElementById("pointCloudsCanvas") as HTMLCanvasElement,
        document.getElementById("pointCloudsAnnotations") as HTMLElement,
        document.getElementById("pointCloudsAlert") as HTMLElement
      );
      break;
    case TabType.Video:
      visualizer = new VideoVisualizer(document.getElementsByClassName("video-image")[0] as HTMLImageElement);
      break;
    case TabType.Joysticks:
      visualizer = new JoysticksVisualizer(document.getElementById("joysticksCanvas") as HTMLCanvasElement);
      break;
    case TabType.Swerve:
      visualizer = new SwerveVisualizer(document.getElementsByClassName("swerve-canvas-container")[0] as HTMLElement);
      break;
    case TabType.Mechanism:
      visualizer = new MechanismVisualizer(
        document.getElementsByClassName("mechanism-svg-container")[0] as HTMLElement
      );
      break;
    case TabType.Points:
      visualizer = new PointsVisualizer(
        document.getElementsByClassName("points-background-container")[0] as HTMLElement
      );
      break;
  }
}

window.sendMainMessage = (name: string, data?: any) => {
  if (messagePort !== null) {
    let message: NamedMessage = { name: name, data: data };
    messagePort.postMessage(message);
  }
};

window.addEventListener("message", (event) => {
  if (event.source === window && event.data === "port") {
    messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      let message: NamedMessage = event.data;
      switch (message.name) {
        case "set-assets":
          window.assets = message.data;
          break;

        case "set-preferences":
          window.preferences = message.data;
          break;

        case "set-battery":
          window.isBattery = message.data;
          break;

        case "set-type":
          type = message.data;
          updateVisualizer();
          break;

        case "restore-state":
          type = message.data.type;
          updateVisualizer();
          visualizer?.restoreState(message.data.visualizer);
          break;

        case "render":
          // Update title
          let titleElement = document.getElementsByTagName("title")[0] as HTMLElement;
          let newTitle = message.data.title;
          if (newTitle !== title) {
            titleElement.innerHTML =
              (type ? getTabIcon(type) + " " : "") + htmlEncode(newTitle) + " &mdash; AdvantageScope";
            title = newTitle;
          }

          // Render frame
          lastCommand = message.data.command;
          if (visualizer) {
            let aspectRatio = visualizer.render(message.data.command);
            processAspectRatio(aspectRatio);
          }
          break;

        case "set-3d-camera":
          if (type === TabType.ThreeDimension) {
            (visualizer as ThreeDimensionVisualizer).set3DCamera(message.data);
          }
          if (type === TabType.PointClouds) {
            (visualizer as PointCloudVisualizer).set3DCamera(message.data);
          }
          break;

        case "edit-fov":
          if (type === TabType.ThreeDimension) {
            (visualizer as ThreeDimensionVisualizer).setFov(message.data);
          }
          if (type === TabType.PointClouds) {
            (visualizer as PointCloudVisualizer).setFov(message.data);
          }
          break;

        default:
          console.warn("Unknown message from main process", message);
          break;
      }
    };
  }
});

window.addEventListener("resize", () => {
  if (visualizer === null || lastCommand === null) {
    return;
  }
  let aspectRatio = visualizer.render(lastCommand);
  if (aspectRatio) processAspectRatio(aspectRatio);
});

function processAspectRatio(aspectRatio: number | null) {
  if (aspectRatio !== lastAspectRatio) {
    lastAspectRatio = aspectRatio;
    if (aspectRatio !== null) {
      if (aspectRatio > MAX_ASPECT_RATIO) aspectRatio = MAX_ASPECT_RATIO;
      if (aspectRatio < 1 / MAX_ASPECT_RATIO) aspectRatio = 1 / MAX_ASPECT_RATIO;
    }
    window.sendMainMessage("set-aspect-ratio", aspectRatio);
  }
}

setInterval(() => {
  window.sendMainMessage("save-state", { type: type, visualizer: visualizer?.saveState() });
}, SAVE_PERIOD_MS);
