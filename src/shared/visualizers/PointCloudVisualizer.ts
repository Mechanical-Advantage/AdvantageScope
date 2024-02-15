import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { clampValue } from "../util";
import Visualizer from "./Visualizer";

export default class PointCloudVisualizer implements Visualizer {
  private LOWER_POWER_MAX_FPS = 30;
  private MAX_ORBIT_FOV = 160;
  private MIN_ORBIT_FOV = 10;

  private stopped = false;
  private mode: "cinematic" | "standard" | "low-power";
  private content: HTMLElement;
  private canvas: HTMLCanvasElement;
  private annotationsDiv: HTMLElement;
  private alert: HTMLElement;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  private lastPoints: THREE.Points | null = null;

  private command: any;
  private shouldRender = false;
  private orbitFov = 50;
  private lastFrameTime = 0;
  private lastWidth: number | null = 0;
  private lastHeight: number | null = 0;
  private lastDevicePixelRatio: number | null = null;
  private lastIsDark: boolean | null = null;
  private lastAspectRatio: number | null = null;

  constructor(
    mode: "cinematic" | "standard" | "low-power",
    content: HTMLElement,
    canvas: HTMLCanvasElement,
    annotationsDiv: HTMLElement,
    alert: HTMLElement
  ) {
    this.mode = mode;
    this.content = content;
    this.canvas = canvas;
    this.annotationsDiv = annotationsDiv;
    this.alert = alert;
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      powerPreference: mode === "cinematic" ? "high-performance" : mode === "low-power" ? "low-power" : "default"
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = mode === "cinematic";
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();

    // Change camera menu
    let startPx: [number, number] | null = null;
    canvas.addEventListener("contextmenu", (event) => {
      startPx = [event.x, event.y];
    });
    canvas.addEventListener("mouseup", (event) => {
      if (startPx && event.x === startPx[0] && event.y === startPx[1]) {
        if (!this.command) return;
        // let robotTitle = this.command.options.robot;
        // let robotConfig = window.assets?.robots.find((robotData) => robotData.name === robotTitle);
        // if (robotConfig === undefined) return;
        // // window.sendMainMessage("ask-3d-camera", {
        // //   options: robotConfig.cameras.map((camera) => camera.name),
        // //   selectedIndex: this.cameraIndex >= robotConfig.cameras.length ? -1 : this.cameraIndex,
        // //   fov: this.orbitFov
        // // });
      }
      startPx = null;
    });

    // Create camera
    {
      const aspect = 2;
      const near = 0.15;
      const far = 1000;
      this.camera = new THREE.PerspectiveCamera(this.orbitFov, aspect, near, far);
    }

    // Create controls
    {
      this.controls = new OrbitControls(this.camera, canvas);
      this.controls.maxDistance = 250;
      this.controls.enabled = true;
      this.controls.update();
    }

    // Reset camera and controls
    this.resetCamera();

    // Render when camera is moved
    this.controls.addEventListener("change", () => {
      console.log("point cloud visualizer orbit callback.");
      this.shouldRender = true;
    });

    // Render loop
    let periodic = () => {
      if (this.stopped) return;
      this.renderFrame();
      window.requestAnimationFrame(periodic);
    };
    window.requestAnimationFrame(periodic);
  }

  saveState() {
    return {
      orbitFov: this.orbitFov,
      cameraPosition: [this.camera.position.x, this.camera.position.y, this.camera.position.z],
      cameraTarget: [this.controls.target.x, this.controls.target.y, this.controls.target.z]
    };
  }

  restoreState(state: any): void {
    this.orbitFov = state.orbitFov;
    this.camera.position.set(state.cameraPosition[0], state.cameraPosition[1], state.cameraPosition[2]);
    this.controls.target.set(state.cameraTarget[0], state.cameraTarget[1], state.cameraTarget[2]);
    this.controls.update();
    this.shouldRender = true;
  }

  /** Updates the orbit FOV. */
  setFov(fov: number) {
    this.orbitFov = clampValue(fov, this.MIN_ORBIT_FOV, this.MAX_ORBIT_FOV);
    this.shouldRender = true;
  }

  render(command: any): number | null {

    if (
      (this.command === undefined && command.buffer?.length > 0) ||
      (this.command !== undefined && this.command.src_ts !== command.src_ts)
    ) {
      this.shouldRender = true;
    }
    this.command = command;
    return this.lastAspectRatio;
  }

  stop() {
    console.log("stop called!?");
    this.stopped = true;
    this.controls.dispose();
    this.renderer.dispose();
    disposeObject(this.scene);
  }

  /** Resets the camera position and controls target. */
  private resetCamera() {
    console.log("reset camera");
    this.camera.position.set(1, 1, 1);   // TODO: fill in with default position and target!
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private renderFrame() {
    // Check for new size, device pixel ratio, or theme
    let isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (
      this.renderer.domElement.clientWidth !== this.lastWidth ||
      this.renderer.domElement.clientHeight !== this.lastHeight ||
      window.devicePixelRatio !== this.lastDevicePixelRatio ||
      isDark !== this.lastIsDark
    ) {
      this.lastWidth = this.renderer.domElement.clientWidth;
      this.lastHeight = this.renderer.domElement.clientHeight;
      this.lastDevicePixelRatio = window.devicePixelRatio;
      this.lastIsDark = isDark;
      this.shouldRender = true;
    }

    // Exit if no command is set
    if (!this.command || !this.command.buffer || this.command.buffer.length < 3) {
      return; // Continue trying to render
    }
    // Exit if not visible
    if (this.content.hidden) {
      return; // Continue trying to render
    }

    // Limit FPS in low power mode
    let now = new Date().getTime();
    if (this.mode === "low-power" && now - this.lastFrameTime < 1000 / this.LOWER_POWER_MAX_FPS) {
      return; // Continue trying to render
    }
    // Check if rendering should continue
    if (!this.shouldRender) {
      return;
    }
    this.lastFrameTime = now;
    this.shouldRender = false;

    // Update container and camera based on mode
    let fov = this.orbitFov;
    // Update camera FOV
    if (fov !== this.camera.fov) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }

    // Create points objects
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',
      new THREE.InterleavedBufferAttribute(
        new THREE.InterleavedBuffer(this.command.buffer, 4),
        3, 0, false
      )
    );
    const material = new THREE.PointsMaterial({ size: 1, color: isDark ? 0xffffff : 0x222222 });   // https://threejs.org/docs/#api/en/materials/PointsMaterial
    const points = new THREE.Points(geometry, material);

    // Render new frame
    const devicePixelRatio = window.devicePixelRatio * (this.mode === "low-power" ? 0.5 : 1);
    const canvas = this.renderer.domElement;
    const clientWidth = canvas.clientWidth;
    const clientHeight = canvas.clientHeight;
    if (canvas.width / devicePixelRatio !== clientWidth || canvas.height / devicePixelRatio !== clientHeight) {
      this.renderer.setSize(clientWidth, clientHeight, false);
      this.camera.aspect = clientWidth / clientHeight;
      this.camera.updateProjectionMatrix();
      // const resolution = new THREE.Vector2(clientWidth, clientHeight);
    }
    this.scene.background = isDark ? new THREE.Color("#222222") : new THREE.Color("#ffffff");

    if (this.lastPoints != null) {
      this.scene.remove(this.lastPoints);
      this.lastPoints.geometry.dispose();
      this.lastPoints.clear();
    }
    this.scene.add(points);
    this.lastPoints = points;

    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.render(this.scene, this.camera);

    console.log("PointCloudVisualizer: render frame completed!");

  }


}

/** Disposes of all materials and geometries in object. */
function disposeObject(object: THREE.Object3D) {
  object.traverse((node) => {
    let mesh = node as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else {
        mesh.material.dispose();
      }
    }
  });
}
