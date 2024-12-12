import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { clampValue } from "../shared/util";
import XRCamera from "./XRCamera";
import { XRCameraState } from "./XRTypes";

export default class XRRenderer {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private flimPass: FilmPass;
  private lastFrameTime = 0;

  private scene: THREE.Scene;
  private camera: XRCamera;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private boxObject: THREE.Mesh;

  constructor() {
    this.canvas = document.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new XRCamera();
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.flimPass = new FilmPass(1, false);
    this.composer.addPass(this.flimPass);
    this.composer.addPass(new OutputPass());
    this.lastFrameTime = new Date().getTime();

    this.ambientLight = new THREE.AmbientLight(0xd4d4d4);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(1, 1, 1);
    this.scene.add(this.ambientLight, this.directionalLight);

    this.boxObject = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      new THREE.MeshStandardMaterial({ color: "red" })
    );
    this.scene.add(this.boxObject);
  }

  render(cameraState: XRCameraState) {
    if (cameraState.raycast.isValid) {
      this.boxObject.position.set(
        cameraState.raycast.position[0],
        cameraState.raycast.position[1] + 0.05,
        cameraState.raycast.position[2]
      );
    }
    this.boxObject.visible = cameraState.raycast.isValid;

    // Update camera position, grain, and lighting
    this.camera.matrixWorldInverse.fromArray(cameraState.camera.worldInverse);
    this.camera.projectionMatrix.fromArray(cameraState.camera.projection);
    // @ts-expect-error
    this.flimPass.uniforms.intensity.value = cameraState.lighting.grain;
    this.ambientLight.intensity = cameraState.lighting.intensity * 0.8;
    this.ambientLight.color = this.temperatureToColor(cameraState.lighting.temperature);

    // Calculate effective device pixel ratio
    const frameWidthPx = cameraState.frameSize[0];
    const frameHeightPx = cameraState.frameSize[1];
    const viewWidthPx = this.canvas.parentElement!.clientWidth;
    const viewHeightPx = this.canvas.parentElement!.clientHeight;
    const viewWidthSubPx = viewWidthPx * window.devicePixelRatio;
    const viewHeightSubPx = viewHeightPx * window.devicePixelRatio;
    const isHorizontalCropped = frameWidthPx / frameHeightPx > viewWidthPx / viewHeightPx;
    const devicePixelRatio =
      (isHorizontalCropped ? frameHeightPx / viewHeightSubPx : frameWidthPx / viewWidthSubPx) * 1.5; // Running at a slightly higher resolution improves antialiasing

    // Render frame
    if (
      this.canvas.width / devicePixelRatio !== viewWidthPx ||
      this.canvas.height / devicePixelRatio !== viewHeightPx
    ) {
      this.renderer.setPixelRatio(devicePixelRatio);
      this.composer.setPixelRatio(devicePixelRatio);
      this.renderer.setSize(viewWidthPx, viewHeightPx, true);
      this.composer.setSize(viewWidthPx, viewHeightPx);
    }
    const now = new Date().getTime();
    this.composer.render((now - this.lastFrameTime) * 1e-3);
    this.lastFrameTime = now;
  }

  private temperatureToColor(temperature: number): THREE.Color {
    // https://github.com/brundagejoe/ColorTemperatureConverter
    let red, green, blue;
    temperature /= 100;
    if (temperature <= 66) {
      red = 255;
    } else {
      red = temperature - 60;
      red = 329.698727446 * Math.pow(red, -0.1332047592);
    }
    if (temperature <= 66) {
      green = temperature;
      green = 99.4708025861 * Math.log(green) - 161.1195681661;
    } else {
      green = temperature - 60;
      green = 288.1221695283 * Math.pow(green, -0.0755148492);
    }
    if (temperature >= 66) {
      blue = 255;
    } else {
      if (temperature <= 19) {
        blue = 0;
      } else {
        blue = temperature - 10;
        blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
      }
    }
    red = clampValue(red, 0, 255);
    green = clampValue(green, 0, 255);
    blue = clampValue(blue, 0, 255);
    return new THREE.Color(red / 255, green / 255, blue / 255);
  }
}
