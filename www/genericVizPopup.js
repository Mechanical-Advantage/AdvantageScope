import { OdometryRenderer } from "./modules/odometryRenderer.mjs";
import { PointsRenderer } from "./modules/pointsRenderer.mjs";

const maxAspectRatio = 5;

var type = null;
var lastAspectRatio = null;
var lastCommand = null;

var odometryCanvas = null;
var odometryRenderer = null;

var pointsBackground = null;
var pointsRenderer = null;

window.addEventListener("set-type", (event) => {
  type = event.detail;
  document.getElementById("odometry").hidden = type != "odometry";
  document.getElementById("points").hidden = type != "points";
  switch (type) {
    case "odometry":
      document.getElementsByTagName("title")[0].innerHTML = "Odometry &mdash; Advantage Scope";
      odometryCanvas = document.getElementById("odometryCanvas");
      odometryRenderer = new OdometryRenderer(odometryCanvas);
      break;
    case "points":
      document.getElementsByTagName("title")[0].innerHTML = "Points &mdash; Advantage Scope";
      pointsBackground = document.getElementsByClassName("points-background-container")[0];
      pointsRenderer = new PointsRenderer(pointsBackground);
      break;
  }
});

window.addEventListener("render", (event) => {
  lastCommand = event.detail;
  switch (type) {
    case "odometry":
      var aspectRatio = odometryRenderer.render(event.detail);
      break;
    case "points":
      var aspectRatio = pointsRenderer.render(event.detail);
      break;
  }
  processAspectRatio(aspectRatio);
});

window.addEventListener("resize", () => {
  if (type == null || lastCommand == null) {
    return;
  }
  switch (type) {
    case "odometry":
      var aspectRatio = odometryRenderer.render(lastCommand);
      break;
    case "points":
      var aspectRatio = pointsRenderer.render(lastCommand);
      break;
  }
  processAspectRatio(aspectRatio);
});

function processAspectRatio(aspectRatio) {
  if (aspectRatio && aspectRatio != lastAspectRatio) {
    lastAspectRatio = aspectRatio;
    if (aspectRatio) {
      if (aspectRatio > maxAspectRatio) aspectRatio = maxAspectRatio;
      if (aspectRatio < 1 / maxAspectRatio) aspectRatio = 1 / maxAspectRatio;
      window.dispatchEvent(
        new CustomEvent("set-aspect-ratio", {
          detail: aspectRatio
        })
      );
    }
  }
}
