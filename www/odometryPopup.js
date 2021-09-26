import { OdometryRenderer } from "./modules/odometryRenderer.mjs"

var canvas = document.getElementById("odometryCanvas")
var renderer = new OdometryRenderer(canvas)
window.addEventListener("render", event => {
  renderer.render(event.detail)
})