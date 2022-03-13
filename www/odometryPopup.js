import { OdometryRenderer } from "./modules/odometryRenderer.mjs";

var canvas = document.getElementById("odometryCanvas");
var renderer = new OdometryRenderer(canvas, true);
var lastAspectRatio = null;
var lastCommand = null;

window.addEventListener("render", (event) => {
  lastCommand = event.detail;
  var aspectRatio = renderer.render(event.detail);
  processAspectRatio(aspectRatio);
});

window.addEventListener("resize", () => {
  var aspectRatio = renderer.render(lastCommand);
  processAspectRatio(aspectRatio);
});

function processAspectRatio(aspectRatio) {
  if (aspectRatio && aspectRatio != lastAspectRatio) {
    lastAspectRatio = aspectRatio;
    window.dispatchEvent(
      new CustomEvent("set-aspect-ratio", {
        detail: aspectRatio
      })
    );
  }
}
