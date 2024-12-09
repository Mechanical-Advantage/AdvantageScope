import XRRenderer from "./XRRenderer";
import { XRCameraState } from "./XRTypes";

let renderer: XRRenderer;

window.addEventListener("load", () => {
  renderer = new XRRenderer();
});

// @ts-expect-error
window.render = (cameraState: XRCameraState) => {
  renderer.render(cameraState);
};
