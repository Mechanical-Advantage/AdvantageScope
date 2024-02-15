import * as THREE from "three";
import { MeshStandardMaterial } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Config3d_Rotation } from "../AdvantageScopeAssets";
import { convert } from "../units";
import { clampValue, zfill } from "../util";
import Visualizer from "./Visualizer";

export default class PointCloudVisualizer implements Visualizer {
  private LOWER_POWER_MAX_FPS = 30;
  private MAX_ORBIT_FOV = 160;
  private MIN_ORBIT_FOV = 10;
  // private ORBIT_FIELD_DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0);
  // private ORBIT_AXES_DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);
  // private ORBIT_ROBOT_DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0);
  // private ORBIT_FIELD_DEFAULT_POSITION = new THREE.Vector3(0, 6, -12);
  // private ORBIT_AXES_DEFAULT_POSITION = new THREE.Vector3(2, 2, -4);
  // private ORBIT_ROBOT_DEFAULT_POSITION = new THREE.Vector3(2, 1, 1);
  private MATERIAL_SPECULAR: THREE.Color | undefined = new THREE.Color(0x666666); // Overridden if not cinematic
  private MATERIAL_SHININESS: number | undefined = 100; // Overridden if not cinematic
  // private WPILIB_ROTATION = getQuaternionFromRotSeq([
  //   {
  //     axis: "x",
  //     degrees: -90
  //   },
  //   {
  //     axis: "y",
  //     degrees: 180
  //   }
  // ]);
  // private CAMERA_ROTATION = getQuaternionFromRotSeq([
  //   {
  //     axis: "z",
  //     degrees: -90
  //   },
  //   {
  //     axis: "y",
  //     degrees: -90
  //   }
  // ]);

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
  // private wpilibCoordinateGroup: THREE.Group; // Rotated to match WPILib coordinates
  // private wpilibFieldCoordinateGroup: THREE.Group; // Field coordinates (origin at driver stations and flipped based on alliance)
  // private wpilibZebraCoordinateGroup: THREE.Group; // Field coordinates (origin at red driver stations)
  // private fixedCameraGroup: THREE.Group;
  // private fixedCameraObj: THREE.Object3D;
  // private fixedCameraOverrideObj: THREE.Object3D;
  // private dsCameraGroup: THREE.Group;
  // private dsCameraObj: THREE.Object3D;

  // objects (points) here

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
    if (mode !== "cinematic") {
      this.MATERIAL_SPECULAR = new THREE.Color(0x000000);
      this.MATERIAL_SHININESS = 0;
    }

    // Change camera menu
    let startPx: [number, number] | null = null;
    canvas.addEventListener("contextmenu", (event) => {
      startPx = [event.x, event.y];
    });
    canvas.addEventListener("mouseup", (event) => {
      if (startPx && event.x === startPx[0] && event.y === startPx[1]) {
        if (!this.command) return;
        let robotTitle = this.command.options.robot;
        let robotConfig = window.assets?.robots.find((robotData) => robotData.name === robotTitle);
        if (robotConfig === undefined) return;
        // window.sendMainMessage("ask-3d-camera", {
        //   options: robotConfig.cameras.map((camera) => camera.name),
        //   selectedIndex: this.cameraIndex >= robotConfig.cameras.length ? -1 : this.cameraIndex,
        //   fov: this.orbitFov
        // });
      }
      startPx = null;
    });

    // Create coordinate groups
    // this.wpilibCoordinateGroup = new THREE.Group();
    // this.scene.add(this.wpilibCoordinateGroup);
    // this.wpilibCoordinateGroup.rotation.setFromQuaternion(this.WPILIB_ROTATION);
    // this.wpilibFieldCoordinateGroup = new THREE.Group();
    // this.wpilibCoordinateGroup.add(this.wpilibFieldCoordinateGroup);
    // this.wpilibZebraCoordinateGroup = new THREE.Group();
    // this.wpilibCoordinateGroup.add(this.wpilibZebraCoordinateGroup);

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

    // Add lights
    // {
    //   const light = new THREE.HemisphereLight(0xffffff, 0x444444, mode === "cinematic" ? 0.5 : 2);
    //   this.scene.add(light);
    // }
    // if (mode !== "cinematic") {
    //   const light = new THREE.PointLight(0xffffff, 0.5);
    //   light.position.set(0, 0, 10);
    //   this.wpilibCoordinateGroup.add(light);
    // } else {
    //   [
    //     [0, 1, 0, -2],
    //     [6, -3, 6, 2],
    //     [-6, -3, -6, 2]
    //   ].forEach(([x, y, targetX, targetY]) => {
    //     const light = new THREE.SpotLight(0xffffff, 150, 0, 50 * (Math.PI / 180), 0.2, 2);
    //     light.position.set(x, y, 8);
    //     light.target.position.set(targetX, targetY, 0);
    //     light.castShadow = true;
    //     light.shadow.mapSize.width = 2048;
    //     light.shadow.mapSize.height = 2048;
    //     light.shadow.bias = -0.0001;
    //     this.wpilibCoordinateGroup.add(light, light.target);
    //   });
    //   {
    //     const light = new THREE.PointLight(0xff0000, 60);
    //     light.position.set(4.5, 0, 5);
    //     this.wpilibCoordinateGroup.add(light);
    //   }
    //   {
    //     const light = new THREE.PointLight(0x0000ff, 60);
    //     light.position.set(-4.5, 0, 5);
    //     this.wpilibCoordinateGroup.add(light);
    //   }
    // }

    // Create fixed camera objects
    // {
    //   this.fixedCameraObj = new THREE.Object3D();
    //   this.fixedCameraGroup = new THREE.Group().add(this.fixedCameraObj);
    //   this.fixedCameraOverrideObj = new THREE.Object3D();
    //   this.wpilibFieldCoordinateGroup.add(this.fixedCameraGroup, this.fixedCameraOverrideObj);
    // }

    // // Create DS camera object
    // {
    //   this.dsCameraObj = new THREE.Object3D();
    //   this.dsCameraObj.position.set(-this.DS_CAMERA_OFFSET, 0.0, this.DS_CAMERA_HEIGHT);
    //   this.dsCameraGroup = new THREE.Group().add(this.dsCameraObj);
    //   this.wpilibCoordinateGroup.add(this.dsCameraGroup);
    // }

    // Render when camera is moved
    this.controls.addEventListener("change", () => (this.shouldRender = true));

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
    if (JSON.stringify(command) !== JSON.stringify(this.command)) {   // compare new command and previous command?
      // Also triggered if new assets counter changes
      this.shouldRender = true;
    }
    this.command = command;
    return this.lastAspectRatio;
  }

  stop() {
    this.stopped = true;
    this.controls.dispose();
    this.renderer.dispose();
    disposeObject(this.scene);
  }

  /** Resets the camera position and controls target. */
  private resetCamera() {
    if (this.command && this.command.options.field === "Axes") {
      // this.camera.position.copy(this.ORBIT_AXES_DEFAULT_POSITION);
      // this.controls.target.copy(this.ORBIT_AXES_DEFAULT_TARGET);
    } else {
      // this.camera.position.copy(this.ORBIT_FIELD_DEFAULT_POSITION);
      // this.controls.target.copy(this.ORBIT_FIELD_DEFAULT_TARGET);
    }
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
    if (!this.command) {
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

    // Check for new assets
    let assetsString = JSON.stringify(window.assets);
    // let newAssets = assetsString !== this.lastAssetsString;
    // if (newAssets) this.lastAssetsString = assetsString;

    // Set camera for fixed views
    // {
    //   // Reset camera index if invalid
    //   if (this.cameraIndex >= robotConfig.cameras.length) this.cameraIndex = -1;

    //   // Update camera controls
    //   let orbitalCamera = this.cameraIndex === -1 || this.cameraIndex === -2;
    //   let dsCamera = this.cameraIndex < -2;
    //   if (orbitalCamera !== this.controls.enabled) {
    //     this.controls.enabled = orbitalCamera;
    //     this.controls.update();
    //   }

    //   // Update container and camera based on mode
    //   let fov = this.orbitFov;
    //   this.lastAspectRatio = null;
    //   if (orbitalCamera || dsCamera) {
    //     this.canvas.classList.remove("fixed");
    //     this.annotationsDiv.classList.remove("fixed");
    //     this.canvas.style.width = "";
    //     this.canvas.style.height = "";
    //     this.annotationsDiv.style.width = "";
    //     this.annotationsDiv.style.height = "";
    //     if (this.cameraIndex === -1 || dsCamera) {
    //       // Reset to default origin
    //       this.wpilibCoordinateGroup.position.set(0, 0, 0);
    //       this.wpilibCoordinateGroup.rotation.setFromQuaternion(this.WPILIB_ROTATION);
    //     } else if (this.command.poses.robot.length > 0) {
    //       // Shift based on robot location
    //       this.wpilibCoordinateGroup.position.set(0, 0, 0);
    //       this.wpilibCoordinateGroup.rotation.setFromQuaternion(new THREE.Quaternion());
    //       let robotObj = this.robotSet.getChildren()[0];
    //       let position = robotObj.getWorldPosition(new THREE.Vector3());
    //       let rotation = robotObj.getWorldQuaternion(new THREE.Quaternion()).multiply(this.WPILIB_ROTATION);
    //       position.negate();
    //       rotation.invert();
    //       this.wpilibCoordinateGroup.position.copy(position.clone().applyQuaternion(rotation));
    //       this.wpilibCoordinateGroup.rotation.setFromQuaternion(rotation);
    //     }
    //     if (
    //       this.cameraIndex !== this.lastCameraIndex ||
    //       (this.cameraIndex === -3 && this.lastAutoDriverStation !== this.command.autoDriverStation)
    //     ) {
    //       this.resetCamera();
    //     }
    //   } else {
    //     this.canvas.classList.add("fixed");
    //     this.annotationsDiv.classList.add("fixed");
    //     let aspectRatio = 16 / 9;
    //     if (robotConfig) {
    //       // Get fixed aspect ratio and FOV
    //       let cameraConfig = robotConfig.cameras[this.cameraIndex];
    //       aspectRatio = cameraConfig.resolution[0] / cameraConfig.resolution[1];
    //       this.lastAspectRatio = aspectRatio;
    //       fov = cameraConfig.fov / aspectRatio;
    //       let parentAspectRatio = this.canvas.parentElement
    //         ? this.canvas.parentElement.clientWidth / this.canvas.parentElement.clientHeight
    //         : aspectRatio;
    //       if (aspectRatio > parentAspectRatio) {
    //         this.canvas.style.width = "100%";
    //         this.canvas.style.height = ((parentAspectRatio / aspectRatio) * 100).toString() + "%";
    //         this.annotationsDiv.style.width = "100%";
    //         this.annotationsDiv.style.height = ((parentAspectRatio / aspectRatio) * 100).toString() + "%";
    //       } else {
    //         this.canvas.style.width = ((aspectRatio / parentAspectRatio) * 100).toString() + "%";
    //         this.canvas.style.height = "100%";
    //         this.annotationsDiv.style.width = ((aspectRatio / parentAspectRatio) * 100).toString() + "%";
    //         this.annotationsDiv.style.height = "100%";
    //       }

    //       // Update camera position
    //       let referenceObj: THREE.Object3D | null = null;
    //       if (this.command.poses.cameraOverride.length > 0) {
    //         let cameraPose: Pose3d = this.command.poses.cameraOverride[0];
    //         this.fixedCameraOverrideObj.position.set(...cameraPose.translation);
    //         this.fixedCameraOverrideObj.rotation.setFromQuaternion(
    //           rotation3dToQuaternion(cameraPose.rotation).multiply(this.CAMERA_ROTATION)
    //         );
    //         referenceObj = this.fixedCameraOverrideObj;
    //       } else if (this.command.poses.robot.length > 0) {
    //         let robotPose: Pose3d = this.command.poses.robot[0];
    //         this.fixedCameraGroup.position.set(...robotPose.translation);
    //         this.fixedCameraGroup.rotation.setFromQuaternion(rotation3dToQuaternion(robotPose.rotation));
    //         this.fixedCameraObj.position.set(...cameraConfig.position);
    //         this.fixedCameraObj.rotation.setFromQuaternion(
    //           getQuaternionFromRotSeq(cameraConfig.rotations).multiply(this.CAMERA_ROTATION)
    //         );
    //         referenceObj = this.fixedCameraObj;
    //       }
    //       if (referenceObj) {
    //         this.camera.position.copy(referenceObj.getWorldPosition(new THREE.Vector3()));
    //         this.camera.rotation.setFromQuaternion(referenceObj.getWorldQuaternion(new THREE.Quaternion()));
    //       }
    //     }
    //   }

    //   // Update camera alert
    //   if (this.cameraIndex === -2) {
    //     this.alert.hidden = this.command.poses.robot.length > 0;
    //     this.alert.innerHTML = 'Robot pose not available</br>for camera "Orbit Robot".';
    //   } else if (this.cameraIndex === -3) {
    //     this.alert.hidden = this.command.autoDriverStation >= 0;
    //     this.alert.innerHTML = "Driver Station position</br>not available.";
    //   } else if (this.cameraIndex === -1 || dsCamera) {
    //     this.alert.hidden = true;
    //   } else {
    //     this.alert.hidden = this.command.poses.robot.length > 0 || this.command.poses.cameraOverride.length > 0;
    //     this.alert.innerHTML =
    //       'Robot pose not available</br>for camera "' +
    //       (robotConfig ? robotConfig.cameras[this.cameraIndex].name : "???") +
    //       '".';
    //   }

    //   // Update camera FOV
    //   if (fov !== this.camera.fov) {
    //     this.camera.fov = fov;
    //     this.camera.updateProjectionMatrix();
    //   }

    //   this.lastCameraIndex = this.cameraIndex;
    //   this.lastAutoDriverStation = this.command.autoDriverStation;
    // }

    // Render new frame
    const devicePixelRatio = window.devicePixelRatio * (this.mode === "low-power" ? 0.5 : 1);
    const canvas = this.renderer.domElement;
    const clientWidth = canvas.clientWidth;
    const clientHeight = canvas.clientHeight;
    if (canvas.width / devicePixelRatio !== clientWidth || canvas.height / devicePixelRatio !== clientHeight) {
      this.renderer.setSize(clientWidth, clientHeight, false);
      this.camera.aspect = clientWidth / clientHeight;
      this.camera.updateProjectionMatrix();
      const resolution = new THREE.Vector2(clientWidth, clientHeight);
    }
    this.scene.background = isDark ? new THREE.Color("#222222") : new THREE.Color("#ffffff");
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.render(this.scene, this.camera);
  }
}

/** Converts a rotation sequence to a quaternion. */
function getQuaternionFromRotSeq(rotations: Config3d_Rotation[]): THREE.Quaternion {
  let quaternion = new THREE.Quaternion();
  rotations.forEach((rotation) => {
    let axis = new THREE.Vector3(0, 0, 0);
    if (rotation.axis === "x") axis.setX(1);
    if (rotation.axis === "y") axis.setY(1);
    if (rotation.axis === "z") axis.setZ(1);
    quaternion.premultiply(
      new THREE.Quaternion().setFromAxisAngle(axis, convert(rotation.degrees, "degrees", "radians"))
    );
  });
  return quaternion;
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
