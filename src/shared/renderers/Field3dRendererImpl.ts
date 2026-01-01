// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import CameraControls from "camera-controls";
import * as THREE from "three";
import WorkerManager from "../../hub/WorkerManager";
import { AdvantageScopeAssets, BuiltIn3dFields, Config3dField, CoordinateSystem } from "../AdvantageScopeAssets";
import { Rotation3d, rotationSequenceToQuaternion } from "../geometry";
import { Units } from "../units";
import { checkArrayType, clampValue } from "../util";
import {
  Field3dRendererCommand,
  Field3dRendererCommand_AnyObj,
  Field3dRendererCommand_RobotObj
} from "./Field3dRenderer";
import TabRenderer from "./TabRenderer";
import makeAxesField from "./field3d/AxesField";
import makeEvergreenField from "./field3d/EvergreenField";
import ObjectManager from "./field3d/ObjectManager";
import AprilTagManager from "./field3d/objectManagers/AprilTagManager";
import AxesManager from "./field3d/objectManagers/AxesManager";
import ConeManager from "./field3d/objectManagers/ConeManager";
import GamePieceManager from "./field3d/objectManagers/GamePieceManager";
import HeatmapManager from "./field3d/objectManagers/HeatmapManager";
import RobotManager from "./field3d/objectManagers/RobotManager";
import TrajectoryManager from "./field3d/objectManagers/TrajectoryManager";

export default class Field3dRendererImpl implements TabRenderer {
  private LOWER_POWER_MAX_FPS = 30;
  private MAX_ORBIT_FOV = 160;
  private MIN_ORBIT_FOV = 10;
  private ORBIT_FIELD_FRC_DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0);
  private ORBIT_FIELD_FTC_DEFAULT_TARGET = new THREE.Vector3(0, 0.2, 0);
  private ORBIT_ROBOT_FRC_DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0);
  private ORBIT_ROBOT_FTC_DEFAULT_TARGET = new THREE.Vector3(0, 0.25, 0);
  private ORBIT_FIELD_FRC_DEFAULT_POSITION = new THREE.Vector3(0, 6, -12);
  private ORBIT_FIELD_FTC_DEFAULT_POSITION = new THREE.Vector3(0, 2, -4);
  private ORBIT_ROBOT_FRC_DEFAULT_POSITION = new THREE.Vector3(2, 1, 1);
  private ORBIT_ROBOT_FTC_DEFAULT_POSITION = new THREE.Vector3(1, 0.5, 0.5);
  private DS_CAMERA_HEIGHT = Units.convert(62, "inches", "meters"); // https://www.ergocenter.ncsu.edu/wp-content/uploads/sites/18/2017/09/Anthropometric-Summary-Data-Tables.pdf
  private DS_CAMERA_OFFSET_FRC = 1.5; // Distance away from the glass
  private DS_CAMERA_TARGET_FTC = new THREE.Vector3(0, -0.2, 0);
  private CONTROLS_MIN_DISTANCE_FRC = 1;
  private CONTROLS_MIN_DISTANCE_FTC = 0.5;
  private MATERIAL_SPECULAR: THREE.Color = new THREE.Color(0x666666); // Overridden if not cinematic
  private MATERIAL_SHININESS: number = 100; // Overridden if not cinematic
  private SPOT_LIGHT_POSITIONS_FRC = [
    [0, 1, 8, 0, -2, 0],
    [6, -3, 8, 6, 2, 0],
    [-6, -3, 8, -6, 2, 0]
  ] as const;
  private SPOT_LIGHT_POSITIONS_FTC = [
    [0, 0, 4, 0, 0, 0],
    [2, -1.5, 4, 0, 1, 0],
    [-2, 1.5, 4, 0, -1, 0]
  ] as const;
  private SPOT_LIGHT_INTENSITY_FRC = 150;
  private SPOT_LIGHT_INTENSITY_FTC = 30;
  private WPILIB_ROTATION = rotationSequenceToQuaternion([
    {
      axis: "x",
      degrees: -90
    },
    {
      axis: "y",
      degrees: 180
    }
  ]);
  private CAMERA_ROTATION = rotationSequenceToQuaternion([
    {
      axis: "z",
      degrees: -90
    },
    {
      axis: "y",
      degrees: -90
    }
  ]);

  private shouldResetCamera = true;
  private mode: "cinematic" | "standard" | "low-power";
  private canvas: HTMLCanvasElement;
  private canvasContainer: HTMLElement;
  private alert: HTMLElement;
  private spinner: HTMLElement;

  private clock = new THREE.Clock();
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: CameraControls;
  private wpilibCoordinateGroup: THREE.Group; // Rotated to match WPILib coordinates
  private wpilibFieldCoordinateGroup: THREE.Group; // Field coordinates using the selected coordinate system
  private field: THREE.Object3D | null = null;
  private fieldStagedPieces: THREE.Object3D | null = null;
  private fieldPieces: { [key: string]: THREE.Mesh } = {};
  private primaryRobotGroup: THREE.Group;
  private fixedCameraObj: THREE.Object3D;
  private fixedCameraOverrideObj: THREE.Object3D;
  private dsCameraGroup: THREE.Group;
  private dsCameraObj: THREE.Object3D;
  private spotLights: THREE.SpotLight[] = [];

  private objectManagers: {
    type: Field3dRendererCommand_AnyObj["type"];
    manager: ObjectManager<Field3dRendererCommand_AnyObj>;
    active: boolean;
  }[] = [];

  private shouldRender = false;
  private cameraIndex: CameraIndex = CameraIndexEnum.OrbitField;
  private orbitFov = 50;
  private primaryRobotModel = "";
  private resolutionVector = new THREE.Vector2();
  private fieldConfigCache: Config3dField | null = null;
  private robotLoadingCount = 0;
  private shouldLoadNewField = false;
  private isFieldLoading = false;
  private aspectRatio: number | null = null;
  private lastCameraIndex = -1;
  private lastAutoDriverStation = -1;
  private lastFrameTime = 0;
  private lastWidth: number | null = 0;
  private lastHeight: number | null = 0;
  private lastDevicePixelRatio: number | null = null;
  private lastIsDark: boolean | null = null;
  private lastCommandString: string = "";
  private lastAssets: AdvantageScopeAssets | null = null;
  private lastFieldId: string = "";
  private lastIsFTC: boolean | null = null;
  private lastCoordinateSystem: CoordinateSystem | null = null;
  private keysPressed: Set<string> = new Set();

  static {
    CameraControls.install({ THREE: THREE });
  }

  constructor(
    mode: "cinematic" | "standard" | "low-power",
    useAA: boolean,
    canvas: HTMLCanvasElement,
    canvasContainer: HTMLElement,
    alert: HTMLElement,
    spinner: HTMLElement
  ) {
    this.mode = mode;
    this.canvas = canvas;
    this.canvasContainer = canvasContainer;
    this.alert = alert;
    this.spinner = spinner;
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      powerPreference: mode === "cinematic" ? "high-performance" : mode === "low-power" ? "low-power" : "default",
      antialias: useAA
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
    canvas.addEventListener("mousedown", (event) => {
      if (event.button === 2) {
        // Right-click
        startPx = [event.clientX, event.clientY];
      }
    });
    canvas.addEventListener("mouseup", (event) => {
      if (startPx && event.clientX === startPx[0] && event.clientY === startPx[1]) {
        let robotConfig = window.assets?.robots.find((robotData) => robotData.name === this.primaryRobotModel);
        let cameraList = robotConfig === undefined ? [] : robotConfig.cameras.map((camera) => camera.name);
        window.sendMainMessage("ask-3d-camera", {
          options: cameraList,
          position: [event.clientX, event.clientY],
          selectedIndex: this.cameraIndex >= cameraList.length ? CameraIndexEnum.OrbitField : this.cameraIndex,
          fov: this.orbitFov,
          isFTC: this.fieldConfigCache !== null && this.fieldConfigCache.isFTC
        });
      }
      startPx = null;
    });

    // Create coordinate groups
    this.wpilibCoordinateGroup = new THREE.Group();
    this.scene.add(this.wpilibCoordinateGroup);
    this.wpilibCoordinateGroup.rotation.setFromQuaternion(this.WPILIB_ROTATION);
    this.wpilibFieldCoordinateGroup = new THREE.Group();
    this.wpilibCoordinateGroup.add(this.wpilibFieldCoordinateGroup);

    // Create camera
    {
      const aspect = 2;
      const near = 0.15;
      const far = 1000;
      this.camera = new THREE.PerspectiveCamera(this.orbitFov, aspect, near, far);
    }

    // Create controls
    {
      this.controls = new CameraControls(this.camera, canvas);
      this.controls.minDistance = this.CONTROLS_MIN_DISTANCE_FRC;
      this.controls.maxDistance = Infinity;
      this.controls.smoothTime = 0.1;
      this.controls.draggingSmoothTime = 0.1;
      this.controls.infinityDolly = true;
      this.controls.dollySpeed = 0.25;
    }

    // Add lights
    {
      const light = new THREE.HemisphereLight(0xffffff, 0x444444, mode === "cinematic" ? 0.5 : 2);
      this.scene.add(light);
    }
    if (mode !== "cinematic") {
      const light = new THREE.PointLight(0xffffff, 0.5);
      light.position.set(0, 0, 10);
      this.wpilibCoordinateGroup.add(light);
    } else {
      this.SPOT_LIGHT_POSITIONS_FRC.forEach(([x, y, z, targetX, targetY, targetZ]) => {
        const light = new THREE.SpotLight(0xffffff, this.SPOT_LIGHT_INTENSITY_FRC, 0, 50 * (Math.PI / 180), 0.2, 2);
        light.position.set(x, y, z);
        light.target.position.set(targetX, targetY, targetZ);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.bias = -0.0001;
        this.wpilibCoordinateGroup.add(light, light.target);
        this.spotLights.push(light);
      });
      {
        const light = new THREE.PointLight(0xff0000, 60);
        light.position.set(-4.5, 0, 5);
        this.wpilibCoordinateGroup.add(light);
      }
      {
        const light = new THREE.PointLight(0x0000ff, 60);
        light.position.set(4.5, 0, 5);
        this.wpilibCoordinateGroup.add(light);
      }
    }

    // Create fixed camera objects
    {
      this.fixedCameraObj = new THREE.Object3D();
      this.primaryRobotGroup = new THREE.Group().add(this.fixedCameraObj);
      this.primaryRobotGroup.visible = false;
      this.fixedCameraOverrideObj = new THREE.Object3D();
      this.fixedCameraOverrideObj.visible = false;
      this.wpilibFieldCoordinateGroup.add(this.primaryRobotGroup, this.fixedCameraOverrideObj);
    }

    // Create DS camera object
    {
      this.dsCameraObj = new THREE.Object3D();
      this.dsCameraObj.position.set(-this.DS_CAMERA_OFFSET_FRC, 0.0, this.DS_CAMERA_HEIGHT);
      this.dsCameraGroup = new THREE.Group().add(this.dsCameraObj);
      this.wpilibCoordinateGroup.add(this.dsCameraGroup);
    }

    // Create key bindings
    window.addEventListener("keydown", (event) => {
      if (window.platform === "darwin" ? event.metaKey : event.ctrlKey) return;
      if (event.target !== document.body && event.target !== window) return;
      if (canvasContainer.clientHeight === 0) return;
      this.keysPressed.add(event.code);
    });
    window.addEventListener("keyup", (event) => {
      if (event.target !== document.body && event.target !== window) return;
      this.keysPressed.delete(event.code);
    });
  }

  saveState(): unknown {
    let position = this.controls.getPosition(new THREE.Vector3());
    let target = this.controls.getTarget(new THREE.Vector3());
    return {
      cameraIndex: this.cameraIndex,
      orbitFov: this.orbitFov,
      cameraPosition: [position.x, position.y, position.z],
      cameraTarget: [target.x, target.y, target.z]
    };
  }

  restoreState(state: unknown) {
    if (state === null || typeof state !== "object") return;
    if ("cameraIndex" in state && typeof state.cameraIndex === "number") {
      this.cameraIndex = state.cameraIndex;
    }
    if ("orbitFov" in state && typeof state.orbitFov === "number") {
      this.orbitFov = state.orbitFov;
    }
    if (
      "cameraPosition" in state &&
      checkArrayType(state.cameraPosition, "number") &&
      (state.cameraPosition as number[]).length === 3 &&
      !(state.cameraPosition as number[]).every((x) => x === 0) &&
      "cameraTarget" in state &&
      checkArrayType(state.cameraTarget, "number") &&
      (state.cameraTarget as number[]).length === 3 &&
      !(state.cameraTarget as number[]).every((x) => x === 0)
    ) {
      this.controls.setLookAt(
        ...(state.cameraPosition as [number, number, number]),
        ...(state.cameraTarget as [number, number, number])
      );
      this.shouldResetCamera = false;
    } else {
      this.shouldResetCamera = true;
    }
    this.lastCameraIndex = this.cameraIndex; // Don't reset camera position
    this.shouldRender = true;
  }

  /** Switches the selected camera. */
  set3DCamera(index: number) {
    this.cameraIndex = index;
    this.shouldRender = true;
  }

  /** Updates the orbit FOV. */
  setFov(fov: number) {
    this.orbitFov = clampValue(fov, this.MIN_ORBIT_FOV, this.MAX_ORBIT_FOV);
    this.shouldRender = true;
  }

  stop() {}

  /** Resets the camera position and controls target. */
  private resetCamera(command: Field3dRendererCommand, isFTC: boolean, animate = true) {
    this.controls.minDistance = isFTC ? this.CONTROLS_MIN_DISTANCE_FTC : this.CONTROLS_MIN_DISTANCE_FRC;
    if (this.cameraIndex === -1) {
      // Orbit field
      if (isFTC) {
        this.controls.setLookAt(
          this.ORBIT_FIELD_FTC_DEFAULT_POSITION.x,
          this.ORBIT_FIELD_FTC_DEFAULT_POSITION.y,
          this.ORBIT_FIELD_FTC_DEFAULT_POSITION.z,
          this.ORBIT_FIELD_FTC_DEFAULT_TARGET.x,
          this.ORBIT_FIELD_FTC_DEFAULT_TARGET.y,
          this.ORBIT_FIELD_FTC_DEFAULT_TARGET.z,
          animate
        );
      } else {
        this.controls.setLookAt(
          this.ORBIT_FIELD_FRC_DEFAULT_POSITION.x,
          this.ORBIT_FIELD_FRC_DEFAULT_POSITION.y,
          this.ORBIT_FIELD_FRC_DEFAULT_POSITION.z,
          this.ORBIT_FIELD_FRC_DEFAULT_TARGET.x,
          this.ORBIT_FIELD_FRC_DEFAULT_TARGET.y,
          this.ORBIT_FIELD_FRC_DEFAULT_TARGET.z,
          animate
        );
      }
    } else if (this.cameraIndex === -2) {
      // Orbit robot
      if (isFTC) {
        this.controls.setLookAt(
          this.ORBIT_ROBOT_FTC_DEFAULT_POSITION.x,
          this.ORBIT_ROBOT_FTC_DEFAULT_POSITION.y,
          this.ORBIT_ROBOT_FTC_DEFAULT_POSITION.z,
          this.ORBIT_ROBOT_FTC_DEFAULT_TARGET.x,
          this.ORBIT_ROBOT_FTC_DEFAULT_TARGET.y,
          this.ORBIT_ROBOT_FTC_DEFAULT_TARGET.z,
          animate
        );
      } else {
        this.controls.setLookAt(
          this.ORBIT_ROBOT_FRC_DEFAULT_POSITION.x,
          this.ORBIT_ROBOT_FRC_DEFAULT_POSITION.y,
          this.ORBIT_ROBOT_FRC_DEFAULT_POSITION.z,
          this.ORBIT_ROBOT_FRC_DEFAULT_TARGET.x,
          this.ORBIT_ROBOT_FRC_DEFAULT_TARGET.y,
          this.ORBIT_ROBOT_FRC_DEFAULT_TARGET.z,
          animate
        );
      }
    } else {
      // Driver Station
      let fieldConfig = this.getFieldConfig(command);
      if (fieldConfig !== null) {
        let driverStation = -1;
        if (this.cameraIndex < -3) {
          driverStation = -4 - this.cameraIndex;
        } else {
          driverStation = command.autoDriverStation;
        }
        if (driverStation >= 0 && driverStation < fieldConfig.driverStations.length) {
          let position = fieldConfig.driverStations[driverStation];
          this.dsCameraGroup.position.set(position[0], position[1], 0);
          this.dsCameraGroup.rotation.set(0, 0, Math.atan2(-position[1], -position[0]));
          this.dsCameraObj.position.set(isFTC ? 0.0 : -this.DS_CAMERA_OFFSET_FRC, 0.0, this.DS_CAMERA_HEIGHT);
          let cameraPosition = this.dsCameraObj.getWorldPosition(new THREE.Vector3());
          let cameraTarget = isFTC ? this.DS_CAMERA_TARGET_FTC : this.ORBIT_FIELD_FRC_DEFAULT_TARGET;
          this.controls.setLookAt(
            cameraPosition.x,
            cameraPosition.y,
            cameraPosition.z,
            cameraTarget.x,
            cameraTarget.y,
            cameraTarget.z,
            animate
          );
        }
      }
    }
  }

  private getFieldConfig(command: Field3dRendererCommand): Config3dField | null {
    if (window.assets === null) return null;
    let fieldConfig = [...window.assets.field3ds, ...BuiltIn3dFields].find(
      (fieldData) => fieldData.id === command.field
    );
    if (fieldConfig === undefined) return null;
    return fieldConfig;
  }

  /** Make a new object manager for the provided type. */
  private makeObjectManager(type: Field3dRendererCommand_AnyObj["type"]): ObjectManager<Field3dRendererCommand_AnyObj> {
    let args = [
      this.wpilibFieldCoordinateGroup,
      this.MATERIAL_SPECULAR,
      this.MATERIAL_SHININESS,
      this.mode,
      false,
      () => (this.shouldRender = true)
    ] as const;
    let manager: ObjectManager<Field3dRendererCommand_AnyObj>;
    switch (type) {
      case "robot":
      case "ghost":
        manager = new RobotManager(
          ...args,
          () => this.robotLoadingCount++,
          () => this.robotLoadingCount--
        );
        break;
      case "gamePiece":
        manager = new GamePieceManager(...args, this.fieldPieces);
        break;
      case "trajectory":
        manager = new TrajectoryManager(...args);
        break;
      case "heatmap":
        manager = new HeatmapManager(
          this.wpilibCoordinateGroup,
          this.MATERIAL_SPECULAR,
          this.MATERIAL_SHININESS,
          this.mode,
          false,
          () => (this.shouldRender = true),
          () => this.fieldConfigCache
        );
        break;
      case "aprilTag":
        manager = new AprilTagManager(...args);
        break;
      case "aprilTagBuiltIn":
        // Built-in AprilTags are unaffected by the selected coordinate system
        manager = new AprilTagManager(
          this.wpilibCoordinateGroup,
          this.MATERIAL_SPECULAR,
          this.MATERIAL_SHININESS,
          this.mode,
          false,
          () => (this.shouldRender = true)
        );
        break;
      case "axes":
        manager = new AxesManager(...args);
        break;
      case "cone":
        manager = new ConeManager(...args);
        break;
    }
    manager.setResolution(this.resolutionVector);
    return manager;
  }

  getAspectRatio(): number | null {
    return this.aspectRatio;
  }

  render(command: Field3dRendererCommand): void {
    // Update controls
    let delta = this.clock.getDelta();
    let controlsUpdated = false;
    if (this.keysPressed.has("KeyW")) {
      if (this.controls.distance <= this.controls.minDistance) {
        this.controls.dollyInFixed(5 * delta, false);
      } else {
        this.controls.dolly(5 * delta, false);
      }
      this.controls.update(0);
      controlsUpdated = true;
    }
    if (this.keysPressed.has("KeyS")) {
      this.controls.dolly(-5 * delta, false);
      this.controls.update(0);
      controlsUpdated = true;
    }
    if (this.keysPressed.has("KeyA")) {
      this.controls.truck(-5 * delta, 0, false);
      this.controls.update(0);
      controlsUpdated = true;
    }
    if (this.keysPressed.has("KeyD")) {
      this.controls.truck(5 * delta, 0, false);
      this.controls.update(0);
      controlsUpdated = true;
    }
    if (this.keysPressed.has("KeyQ")) {
      this.controls.elevate(-5 * delta, false);
      this.controls.update(0);
      controlsUpdated = true;
    }
    if (this.keysPressed.has("KeyE")) {
      this.controls.elevate(5 * delta, false);
      this.controls.update(0);
      controlsUpdated = true;
    }
    let rotate = (x: number, y: number) => {
      let reference = new THREE.Object3D();
      this.scene.add(reference);
      reference.position.copy(this.camera.position);
      reference.rotation.copy(this.camera.rotation);
      reference.rotateY(x);
      if (
        this.controls.polarAngle + y > this.controls.minPolarAngle + 0.2 &&
        this.controls.polarAngle + y < this.controls.maxPolarAngle - 0.2
      ) {
        reference.rotateX(y);
      }
      reference.translateZ(-this.controls.distance);
      this.controls.setTarget(reference.position.x, reference.position.y, reference.position.z, false);
      this.scene.remove(reference);
      this.controls.update(0);
      controlsUpdated = true;
    };
    if (this.keysPressed.has("KeyI")) {
      rotate(0, 2.5 * delta);
    }
    if (this.keysPressed.has("KeyK")) {
      rotate(0, -2.5 * delta);
    }
    if (this.keysPressed.has("KeyJ")) {
      rotate(2.5 * delta, 0);
    }
    if (this.keysPressed.has("KeyL")) {
      rotate(-2.5 * delta, 0);
    }
    controlsUpdated = this.controls.update(delta) || controlsUpdated;

    // Check for new parameters
    let commandString = JSON.stringify(command);
    let assetsString = JSON.stringify(window.assets);
    let isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let newAssets = assetsString !== JSON.stringify(this.lastAssets);
    let newFieldAssets = JSON.stringify(window.assets?.field3ds) !== JSON.stringify(this.lastAssets?.field3ds);
    let newRobotAssets = JSON.stringify(window.assets?.robots) !== JSON.stringify(this.lastAssets?.robots);

    if (
      this.renderer.domElement.clientWidth !== this.lastWidth ||
      this.renderer.domElement.clientHeight !== this.lastHeight ||
      window.devicePixelRatio !== this.lastDevicePixelRatio ||
      isDark !== this.lastIsDark ||
      command.field !== this.lastFieldId ||
      commandString !== this.lastCommandString ||
      newAssets ||
      controlsUpdated
    ) {
      this.lastWidth = this.renderer.domElement.clientWidth;
      this.lastHeight = this.renderer.domElement.clientHeight;
      this.lastDevicePixelRatio = window.devicePixelRatio;
      this.lastIsDark = isDark;
      this.lastCommandString = commandString;
      this.lastAssets = window.assets;
      this.shouldRender = true;
    }

    // Exit if not visible
    if (this.canvas.getBoundingClientRect().width === 0) {
      return; // Continue trying to render
    }

    // Limit FPS in low power mode
    let now = new Date().getTime();
    if (this.mode === "low-power" && now - this.lastFrameTime < 1000 / this.LOWER_POWER_MAX_FPS) {
      return; // Continue trying to render
    }

    // Update field if currently axes and coordinate system changes
    if (
      command.coordinateSystem !== this.lastCoordinateSystem &&
      this.lastCoordinateSystem !== null &&
      (command.field === "FRC:Axes" || command.field === "FTC:Axes")
    ) {
      this.shouldLoadNewField = true;
      this.shouldRender = true;
    }
    this.lastCoordinateSystem = command.coordinateSystem;

    // Check if rendering should continue
    if (!this.shouldRender) {
      return;
    }
    this.lastFrameTime = now;
    this.shouldRender = false;

    // Get field config
    let fieldId = command.field;
    let fieldConfigTmp = this.getFieldConfig(command);
    this.fieldConfigCache = fieldConfigTmp;
    if (fieldConfigTmp === null) return;
    let fieldConfig = fieldConfigTmp;

    // Reset camera on first render
    if (this.shouldResetCamera) {
      this.resetCamera(command, fieldConfig.isFTC);
      this.shouldResetCamera = false;
    }

    // Update field coordinates
    switch (command.coordinateSystem) {
      case "wall-alliance":
        this.wpilibFieldCoordinateGroup.setRotationFromAxisAngle(
          new THREE.Vector3(0, 0, 1),
          command.isRedAlliance ? 0 : Math.PI
        );
        this.wpilibFieldCoordinateGroup.position.set(
          Units.convert(fieldConfig.widthInches / 2, "inches", "meters") * (command.isRedAlliance ? -1.0 : 1.0),
          Units.convert(fieldConfig.heightInches / 2, "inches", "meters") * (command.isRedAlliance ? -1.0 : 1.0),
          0
        );
        break;
      case "wall-blue":
        this.wpilibFieldCoordinateGroup.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
        this.wpilibFieldCoordinateGroup.position.set(
          Units.convert(fieldConfig.widthInches / 2, "inches", "meters"),
          Units.convert(fieldConfig.heightInches / 2, "inches", "meters"),
          0
        );
        break;
      case "center-rotated":
        this.wpilibFieldCoordinateGroup.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
        this.wpilibFieldCoordinateGroup.position.set(0, 0, 0);
        break;
      case "center-red":
        this.wpilibFieldCoordinateGroup.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), 0);
        this.wpilibFieldCoordinateGroup.position.set(0, 0, 0);
        break;
    }

    // Update field
    if (fieldId !== this.lastFieldId || newFieldAssets) {
      this.shouldLoadNewField = true;
      this.lastFieldId = fieldId;

      // Reset camera if switching between FRC and FTC, or if using DS camera
      if ((fieldConfig.isFTC !== this.lastIsFTC && this.lastIsFTC !== null) || this.cameraIndex < -2) {
        this.resetCamera(command, fieldConfig.isFTC);
      }

      // Reset spot light positions in cinematic mode
      if (this.mode === "cinematic" && fieldConfig.isFTC !== this.lastIsFTC) {
        (fieldConfig.isFTC ? this.SPOT_LIGHT_POSITIONS_FTC : this.SPOT_LIGHT_POSITIONS_FRC).forEach(
          ([x, y, z, targetX, targetY, targetZ], index) => {
            const light = this.spotLights[index];
            light.position.set(x, y, z);
            light.target.position.set(targetX, targetY, targetZ);
            light.intensity = fieldConfig.isFTC ? this.SPOT_LIGHT_INTENSITY_FTC : this.SPOT_LIGHT_INTENSITY_FRC;
          }
        );
      }
      this.lastIsFTC = fieldConfig.isFTC;
    }
    if (this.shouldLoadNewField && !this.isFieldLoading) {
      this.shouldLoadNewField = false;

      // Remove old field
      if (this.field) {
        this.wpilibCoordinateGroup.remove(this.field);
        disposeObject(this.field);
      }
      if (this.fieldStagedPieces) {
        this.wpilibCoordinateGroup.remove(this.fieldStagedPieces);
        disposeObject(this.fieldStagedPieces);
      }

      // Insert new field
      let newFieldPieces: typeof this.fieldPieces = {};
      let newFieldReady = () => {
        // Add new field
        if (this.field) {
          this.wpilibCoordinateGroup.add(this.field);
          if (this.fieldStagedPieces !== null) this.wpilibCoordinateGroup.add(this.fieldStagedPieces);
        }

        // Reset game piece objects
        this.objectManagers.filter((entry) => entry.type === "gamePiece").forEach((entry) => entry.manager.dispose());
        this.objectManagers = this.objectManagers.filter((entry) => entry.type !== "gamePiece");
        Object.values(this.fieldPieces).forEach((mesh) => {
          disposeObject(mesh);
        });
        this.fieldPieces = newFieldPieces;

        // Render new frame
        this.shouldRender = true;
      };

      // Load new field
      if (fieldId === "FRC:Evergreen" || fieldId === "FTC:Evergreen") {
        this.isFieldLoading = false;
        this.field = makeEvergreenField(this.MATERIAL_SPECULAR, this.MATERIAL_SHININESS, fieldId === "FTC:Evergreen");
        this.fieldStagedPieces = new THREE.Object3D();
        newFieldReady();
      } else if (fieldId === "FRC:Axes" || fieldId === "FTC:Axes") {
        this.isFieldLoading = false;
        this.field = makeAxesField(
          this.MATERIAL_SPECULAR,
          this.MATERIAL_SHININESS,
          command.coordinateSystem,
          fieldId === "FTC:Axes"
        );
        this.fieldStagedPieces = new THREE.Object3D();
        newFieldReady();
      } else {
        this.isFieldLoading = true;
        WorkerManager.request("../bundles/shared$loadField.js", {
          fieldConfig: fieldConfig,
          mode: this.mode,
          materialSpecular: this.MATERIAL_SPECULAR.toArray(),
          materialShininess: this.MATERIAL_SHININESS
        }).then((result) => {
          const loader = new THREE.ObjectLoader();
          this.field = loader.parse(result.field);
          this.fieldStagedPieces = loader.parse(result.fieldStagedPieces);
          Object.entries(result.fieldPieces).forEach(([name, meshData]) => {
            newFieldPieces[name] = loader.parse(meshData) as THREE.Mesh;
          });
          newFieldReady();
          this.isFieldLoading = false;
        });
      }
    }

    // Update primary robot
    let robotObjects = command.objects.filter((object) => object.type === "robot") as Field3dRendererCommand_RobotObj[];
    this.primaryRobotGroup.visible = false;
    if (robotObjects.length > 0) {
      this.primaryRobotModel = robotObjects[0].model;
      if (robotObjects[0].poses.length > 0) {
        let pose = robotObjects[0].poses[0].pose;
        this.primaryRobotGroup.position.set(...pose.translation);
        this.primaryRobotGroup.rotation.setFromQuaternion(rotation3dToQuaternion(pose.rotation));
        this.primaryRobotGroup.visible = true;
      }
    }

    // Update camera override
    this.fixedCameraOverrideObj.visible = command.cameraOverride !== null;
    if (command.cameraOverride !== null) {
      let pose = command.cameraOverride.pose;
      this.fixedCameraOverrideObj.position.set(...pose.translation);
      this.fixedCameraOverrideObj.rotation.setFromQuaternion(
        rotation3dToQuaternion(pose.rotation).multiply(this.CAMERA_ROTATION)
      );
    }

    // Update staged game pieces
    if (this.fieldStagedPieces !== null) {
      this.fieldStagedPieces.visible = command.objects.every((object) => object.type !== "gamePiece");
    }

    // Update object managers
    this.objectManagers.forEach((entry) => (entry.active = false));
    command.objects.forEach((object) => {
      let entry = this.objectManagers.find(
        (entry) =>
          !entry.active &&
          entry.type === object.type &&
          ((object.type !== "robot" && object.type !== "ghost") ||
            object.model === (entry.manager as RobotManager).getModel())
      );
      if (entry === undefined) {
        entry = this.objectManagers.find((entry) => !entry.active && entry.type === object.type);
      }
      if (entry === undefined) {
        entry = {
          type: object.type,
          manager: this.makeObjectManager(object.type),
          active: true
        };
        this.objectManagers.push(entry);
      } else {
        entry.active = true;
      }
      if (newRobotAssets && (entry.type === "robot" || entry.type === "ghost")) {
        (entry.manager as RobotManager).newAssets();
      }
      if (entry.type === "heatmap") {
        (entry.manager as HeatmapManager).setIsRedAlliance(command.isRedAlliance);
      }
      entry.manager.setObjectData(object);
    });
    this.objectManagers.forEach((entry) => {
      if (!entry.active && (entry.type === "robot" || entry.type === "ghost")) {
        let model = (entry.manager as RobotManager).getModel();
        if (command.allRobotModels.includes(model)) {
          entry.active = true;
          entry.manager.setObjectData({
            type: entry.type as "robot" | "ghost",
            model: model,
            color: "#000000",
            poses: [],
            components: [],
            mechanisms: { xz: null, yz: null },
            visionTargets: [],
            swerveStates: []
          });
        }
      }
    });
    this.objectManagers
      .filter((entry) => !entry.active)
      .forEach((entry) => {
        entry.manager.dispose();
      });
    this.objectManagers = this.objectManagers.filter((entry) => entry.active);

    // Set camera for fixed views
    {
      // Reset camera index if invalid
      let robotConfig = window.assets?.robots.find((robotData) => robotData.name === this.primaryRobotModel);
      if (robotConfig !== undefined && this.cameraIndex >= robotConfig.cameras.length)
        this.cameraIndex = CameraIndexEnum.OrbitField;

      // Update camera controls
      let orbitalCamera =
        this.cameraIndex === CameraIndexEnum.OrbitField || this.cameraIndex === CameraIndexEnum.OrbitRobot;
      let dsCamera = this.cameraIndex < CameraIndexEnum.OrbitRobot;
      if (orbitalCamera !== this.controls.enabled) {
        this.controls.enabled = orbitalCamera;
      }

      // Update container and camera based on mode
      let fov = this.orbitFov;
      this.aspectRatio = null;
      if (orbitalCamera || dsCamera) {
        this.canvas.classList.remove("fixed");
        this.canvasContainer.classList.remove("fixed");
        this.canvas.style.width = "";
        this.canvas.style.height = "";

        // Record camera position in current coordinate frame
        let cameraRefPosition = new THREE.Object3D();
        let cameraRefTarget = new THREE.Object3D();
        if (this.cameraIndex !== this.lastCameraIndex) {
          this.wpilibCoordinateGroup.add(cameraRefPosition, cameraRefTarget);
          cameraRefPosition.position.copy(
            this.wpilibCoordinateGroup.worldToLocal(this.controls.getPosition(new THREE.Vector3()))
          );
          cameraRefTarget.position.copy(
            this.wpilibCoordinateGroup.worldToLocal(this.controls.getTarget(new THREE.Vector3()))
          );
        }

        // Reset location
        if (this.cameraIndex === CameraIndexEnum.OrbitField || dsCamera) {
          // Reset to default origin
          this.wpilibCoordinateGroup.position.set(0, 0, 0);
          this.wpilibCoordinateGroup.rotation.setFromQuaternion(this.WPILIB_ROTATION);
        } else if (this.primaryRobotGroup.visible) {
          // Shift based on robot location
          this.wpilibCoordinateGroup.position.set(0, 0, 0);
          this.wpilibCoordinateGroup.rotation.setFromQuaternion(new THREE.Quaternion());
          let position = this.primaryRobotGroup.getWorldPosition(new THREE.Vector3());
          let rotation = this.primaryRobotGroup
            .getWorldQuaternion(new THREE.Quaternion())
            .multiply(this.WPILIB_ROTATION);
          position.negate();
          rotation.invert();
          this.wpilibCoordinateGroup.position.copy(position.clone().applyQuaternion(rotation));
          this.wpilibCoordinateGroup.rotation.setFromQuaternion(rotation);
        }

        // Switch camera position to new coordinate frame without animation
        if (this.cameraIndex !== this.lastCameraIndex) {
          let newPosition = cameraRefPosition.getWorldPosition(new THREE.Vector3());
          let newTarget = cameraRefTarget.getWorldPosition(new THREE.Vector3());
          this.controls.setLookAt(newPosition.x, newPosition.y, newPosition.z, newTarget.x, newTarget.y, newTarget.z);
          this.controls.update(0);
        }

        // Reset coordinate frame with animation
        if (
          this.cameraIndex !== this.lastCameraIndex ||
          (this.cameraIndex === CameraIndexEnum.DSAuto && this.lastAutoDriverStation !== command.autoDriverStation)
        ) {
          this.resetCamera(command, fieldConfig.isFTC, this.lastCameraIndex < 0);
        }
      } else {
        this.canvas.classList.add("fixed");
        this.canvasContainer.classList.add("fixed");

        // Get fixed aspect ratio and FOV
        let cameraConfig = robotConfig === undefined ? undefined : robotConfig.cameras[this.cameraIndex];
        let aspectRatio = cameraConfig === undefined ? 4 / 3 : cameraConfig.resolution[0] / cameraConfig.resolution[1];
        if (cameraConfig !== undefined) fov = cameraConfig.fov / aspectRatio;
        this.aspectRatio = aspectRatio;
        let parentAspectRatio = this.canvas.parentElement
          ? this.canvas.parentElement.clientWidth / this.canvas.parentElement.clientHeight
          : aspectRatio;
        if (aspectRatio > parentAspectRatio) {
          this.canvas.style.width = "100%";
          this.canvas.style.height = ((parentAspectRatio / aspectRatio) * 100).toString() + "%";
        } else {
          this.canvas.style.width = ((aspectRatio / parentAspectRatio) * 100).toString() + "%";
          this.canvas.style.height = "100%";
        }

        // Update camera position
        let referenceObj: THREE.Object3D | null = null;
        if (this.fixedCameraOverrideObj.visible) {
          referenceObj = this.fixedCameraOverrideObj;
        } else if (this.primaryRobotGroup.visible && cameraConfig !== undefined) {
          this.fixedCameraObj.position.set(...cameraConfig.position);
          this.fixedCameraObj.rotation.setFromQuaternion(
            rotationSequenceToQuaternion(cameraConfig.rotations).multiply(this.CAMERA_ROTATION)
          );
          referenceObj = this.fixedCameraObj;
        }
        if (referenceObj) {
          this.camera.position.copy(referenceObj.getWorldPosition(new THREE.Vector3()));
          this.camera.quaternion.copy(referenceObj.getWorldQuaternion(new THREE.Quaternion()));
        }
      }

      // Update camera alert
      if (this.cameraIndex === CameraIndexEnum.OrbitRobot) {
        this.alert.hidden = this.primaryRobotGroup.visible;
        this.alert.innerHTML = 'Robot pose not available</br>for camera "Orbit Robot".';
      } else if (this.cameraIndex === CameraIndexEnum.DSAuto) {
        this.alert.hidden = command.autoDriverStation >= 0;
        this.alert.innerHTML = "Driver Station position</br>not available.";
      } else if (this.cameraIndex === CameraIndexEnum.OrbitField || dsCamera) {
        this.alert.hidden = true;
      } else {
        this.alert.hidden = this.primaryRobotGroup.visible || this.fixedCameraOverrideObj.visible;
        this.alert.innerHTML =
          'Robot pose not available</br>for camera "' +
          (robotConfig ? robotConfig.cameras[this.cameraIndex].name : "???") +
          '".';
      }

      // Update camera FOV
      if (fov !== this.camera.fov) {
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
      }

      this.lastCameraIndex = this.cameraIndex;
      this.lastAutoDriverStation = command.autoDriverStation;
    }

    // Update spinner
    if (this.robotLoadingCount > 0 || this.isFieldLoading) {
      this.spinner.classList.add("visible");
      this.spinner.classList.add("animating");
    } else if (this.spinner.classList.contains("visible")) {
      this.spinner.classList.remove("visible");
      window.setTimeout(() => this.spinner.classList.remove("animating"), 250);
    }

    // Render new frame
    const devicePixelRatio = window.devicePixelRatio * (this.mode === "low-power" ? 0.75 : 1);
    const clientWidth = this.canvas.clientWidth;
    const clientHeight = this.canvas.clientHeight;
    if (
      this.canvas.width / devicePixelRatio !== clientWidth ||
      this.canvas.height / devicePixelRatio !== clientHeight
    ) {
      this.renderer.setSize(clientWidth, clientHeight, false);
      this.camera.aspect = clientWidth / clientHeight;
      this.camera.updateProjectionMatrix();
      this.resolutionVector.set(clientWidth, clientHeight);
      this.objectManagers.forEach((entry) => {
        entry.manager.setResolution(this.resolutionVector);
      });
    }
    this.scene.background = isDark ? new THREE.Color("#222222") : new THREE.Color("#ffffff");
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.render(this.scene, this.camera);
  }
}

type CameraIndex = number | CameraIndexEnum;
enum CameraIndexEnum {
  OrbitField = -1,
  OrbitRobot = -2,
  DSAuto = -3,
  DSB1 = -4,
  DSB2 = -5,
  DSB3 = -6,
  DSR1 = -7,
  DSR2 = -8,
  DSR3 = -9
}

/** Disposes of all materials and geometries in object. */
export function disposeObject(object: THREE.Object3D) {
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

export function rotation3dToQuaternion(input: Rotation3d): THREE.Quaternion {
  return new THREE.Quaternion(input[1], input[2], input[3], input[0]);
}

export function quaternionToRotation3d(input: THREE.Quaternion): Rotation3d {
  return [input.w, input.x, input.y, input.z];
}
