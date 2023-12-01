import * as THREE from "three";
import { MeshStandardMaterial } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { Config3dField, Config3dRobot, Config3d_Rotation } from "../AdvantageScopeAssets";
import {
  APRIL_TAG_16H5_COUNT,
  APRIL_TAG_36H11_COUNT,
  AprilTag,
  Pose3d,
  Translation2d,
  rotation3dToQuaternion
} from "../geometry";
import { MechanismState } from "../log/LogUtil";
import { convert } from "../units";
import { clampValue, zfill } from "../util";
import Visualizer from "./Visualizer";

export default class ThreeDimensionVisualizer implements Visualizer {
  private LOWER_POWER_MAX_FPS = 30;
  private MAX_ORBIT_FOV = 160;
  private MIN_ORBIT_FOV = 10;
  private STANDARD_FIELD_LENGTH = convert(54, "feet", "meters");
  private STANDARD_FIELD_WIDTH = convert(27, "feet", "meters");
  private ORBIT_FIELD_DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0);
  private ORBIT_AXES_DEFAULT_TARGET = new THREE.Vector3(
    this.STANDARD_FIELD_LENGTH / 2,
    0,
    -this.STANDARD_FIELD_WIDTH / 2
  );
  private ORBIT_ROBOT_DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0);
  private ORBIT_FIELD_DEFAULT_POSITION = new THREE.Vector3(0, 6, -12);
  private ORBIT_AXES_DEFAULT_POSITION = new THREE.Vector3(
    2 + this.STANDARD_FIELD_LENGTH / 2,
    2,
    -4 - this.STANDARD_FIELD_WIDTH / 2
  );
  private ORBIT_ROBOT_DEFAULT_POSITION = new THREE.Vector3(2, 1, 1);
  private MATERIAL_SPECULAR: THREE.Color | undefined = new THREE.Color(0x666666); // Overridden if not cinematic
  private MATERIAL_SHININESS: number | undefined = 100; // Overridden if not cinematic
  private WPILIB_ROTATION = getQuaternionFromRotSeq([
    {
      axis: "x",
      degrees: -90
    },
    {
      axis: "y",
      degrees: 180
    }
  ]);
  private CAMERA_ROTATION = getQuaternionFromRotSeq([
    {
      axis: "z",
      degrees: -90
    },
    {
      axis: "y",
      degrees: -90
    }
  ]);

  private stopped = false;
  private mode: "cinematic" | "standard" | "low-power";
  private content: HTMLElement;
  private canvas: HTMLCanvasElement;
  private annotationsDiv: HTMLElement;
  private alert: HTMLElement;
  private alertCamera: HTMLElement;

  private renderer: THREE.WebGLRenderer;
  private cssRenderer: CSS2DRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private textureLoader: THREE.TextureLoader;
  private wpilibCoordinateGroup: THREE.Group; // Rotated to match WPILib coordinates
  private wpilibFieldCoordinateGroup: THREE.Group; // Field coordinates (origin at driver stations and flipped based on alliance)
  private wpilibZebraCoordinateGroup: THREE.Group; // Field coordinates (origin at red driver stations)
  private fixedCameraGroup: THREE.Group;
  private fixedCameraObj: THREE.Object3D;
  private fixedCameraOverrideObj: THREE.Object3D;

  private axesTemplate: THREE.Object3D;
  private field: THREE.Object3D | null = null;
  private robotSet: ObjectSet;
  private greenGhostSet: ObjectSet;
  private yellowGhostSet: ObjectSet;
  private greenGhostMaterial: THREE.Material;
  private yellowGhostMaterial: THREE.Material;
  private aprilTag36h11Sets: Map<number | null, ObjectSet> = new Map();
  private aprilTag16h5Sets: Map<number | null, ObjectSet> = new Map();
  private trajectories: Line2[] = [];
  private trajectoryLengths: number[] = [];
  private visionTargets: Line2[] = [];
  private axesSet: ObjectSet;
  private coneBlueFrontSet: ObjectSet;
  private coneBlueCenterSet: ObjectSet;
  private coneBlueBackSet: ObjectSet;
  private coneYellowFrontSet: ObjectSet;
  private coneYellowCenterSet: ObjectSet;
  private coneYellowBackSet: ObjectSet;
  private zebraMarkerBlueSet: ObjectSet;
  private zebraMarkerRedSet: ObjectSet;
  private zebraTeamLabels: { [key: string]: CSS2DObject } = {};
  private zebraGreenGhostSet: ObjectSet;
  private zebraYellowGhostSet: ObjectSet;

  private command: any;
  private shouldRender = false;
  private cameraIndex = -1;
  private orbitFov = 50;
  private lastCameraIndex = -1;
  private lastFrameTime = 0;
  private lastWidth: number | null = 0;
  private lastHeight: number | null = 0;
  private lastDevicePixelRatio: number | null = null;
  private lastIsDark: boolean | null = null;
  private lastAspectRatio: number | null = null;
  private lastAssetsString: string = "";
  private lastFieldTitle: string = "";
  private lastRobotTitle: string = "";

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
    this.alertCamera = alert.getElementsByTagName("span")[0];
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      powerPreference: mode === "cinematic" ? "high-performance" : mode === "low-power" ? "low-power" : "default"
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = mode === "cinematic";
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.cssRenderer = new CSS2DRenderer({ element: annotationsDiv });
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
        window.sendMainMessage("ask-3d-camera", {
          options: robotConfig.cameras.map((camera) => camera.name),
          selectedIndex: this.cameraIndex >= robotConfig.cameras.length ? -1 : this.cameraIndex,
          fov: this.orbitFov
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
    this.wpilibZebraCoordinateGroup = new THREE.Group();
    this.wpilibCoordinateGroup.add(this.wpilibZebraCoordinateGroup);

    // Create camera
    {
      const aspect = 2;
      const near = 0.1;
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
    {
      const light = new THREE.HemisphereLight(0xffffff, 0x444444, mode === "cinematic" ? 0.5 : 2);
      this.scene.add(light);
    }
    if (mode !== "cinematic") {
      const light = new THREE.PointLight(0xffffff, 0.5);
      light.position.set(0, 0, 10);
      this.wpilibCoordinateGroup.add(light);
    } else {
      [
        [0, 1, 0, -2],
        [6, -3, 6, 2],
        [-6, -3, -6, 2]
      ].forEach(([x, y, targetX, targetY]) => {
        const light = new THREE.SpotLight(0xffffff, 150, 0, 50 * (Math.PI / 180), 0.2, 2);
        light.position.set(x, y, 8);
        light.target.position.set(targetX, targetY, 0);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.bias = -0.0001;
        this.wpilibCoordinateGroup.add(light, light.target);
      });
      {
        const light = new THREE.PointLight(0xff0000, 60);
        light.position.set(4.5, 0, 5);
        this.wpilibCoordinateGroup.add(light);
      }
      {
        const light = new THREE.PointLight(0x0000ff, 60);
        light.position.set(-4.5, 0, 5);
        this.wpilibCoordinateGroup.add(light);
      }
    }

    // Create fixed camera objects
    {
      this.fixedCameraObj = new THREE.Object3D();
      this.fixedCameraGroup = new THREE.Group().add(this.fixedCameraObj);
      this.fixedCameraOverrideObj = new THREE.Object3D();
      this.wpilibFieldCoordinateGroup.add(this.fixedCameraGroup, this.fixedCameraOverrideObj);
    }

    // Set up object sets
    {
      this.robotSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.greenGhostSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.yellowGhostSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.axesSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneBlueFrontSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneBlueCenterSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneBlueBackSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneYellowFrontSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneYellowCenterSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneYellowBackSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.zebraMarkerBlueSet = new ObjectSet(this.wpilibZebraCoordinateGroup);
      this.zebraMarkerRedSet = new ObjectSet(this.wpilibZebraCoordinateGroup);
      this.zebraGreenGhostSet = new ObjectSet(this.wpilibZebraCoordinateGroup);
      this.zebraYellowGhostSet = new ObjectSet(this.wpilibZebraCoordinateGroup);
    }

    // Create axes template
    {
      this.axesTemplate = new THREE.Object3D();
      const radius = 0.02;

      const center = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 8, 4),
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        })
      );
      center.castShadow = true;
      center.receiveShadow = true;
      this.axesTemplate.add(center);

      const xAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 1, 8),
        new THREE.MeshPhongMaterial({
          color: 0xff0000,
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        })
      );
      xAxis.castShadow = true;
      xAxis.receiveShadow = true;
      xAxis.position.set(0.5, 0.0, 0.0);
      xAxis.rotateZ(Math.PI / 2);
      this.axesTemplate.add(xAxis);

      const yAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 1, 8),
        new THREE.MeshPhongMaterial({
          color: 0x00ff00,
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        })
      );
      yAxis.castShadow = true;
      yAxis.receiveShadow = true;
      yAxis.position.set(0.0, 0.5, 0.0);
      this.axesTemplate.add(yAxis);

      const zAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 1, 8),
        new THREE.MeshPhongMaterial({
          color: 0x2020ff,
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        })
      );
      zAxis.castShadow = true;
      zAxis.receiveShadow = true;
      zAxis.position.set(0.0, 0.0, 0.5);
      zAxis.rotateX(Math.PI / 2);
      this.axesTemplate.add(zAxis);

      let poseAxes = this.axesTemplate.clone(true);
      poseAxes.scale.set(0.25, 0.25, 0.25);
      this.axesSet.setSource(poseAxes);
    }

    // Create cone models
    this.textureLoader = new THREE.TextureLoader();
    {
      let coneTextureBlue = this.textureLoader.load("../www/textures/cone-blue.png");
      let coneTextureBlueBase = this.textureLoader.load("../www/textures/cone-blue-base.png");
      coneTextureBlue.offset.set(0.25, 0);

      let coneMesh = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 16, 32), [
        new THREE.MeshPhongMaterial({
          map: coneTextureBlue,
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        }),
        new THREE.MeshPhongMaterial({
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        }),
        new THREE.MeshPhongMaterial({
          map: coneTextureBlueBase,
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        })
      ]);
      coneMesh.castShadow = true;
      coneMesh.receiveShadow = true;
      coneMesh.rotateZ(-Math.PI / 2);
      coneMesh.rotateY(-Math.PI / 2);

      this.coneBlueCenterSet.setSource(new THREE.Group().add(coneMesh));
      let frontMesh = coneMesh.clone(true);
      frontMesh.position.set(-0.125, 0, 0);
      this.coneBlueFrontSet.setSource(new THREE.Group().add(frontMesh));
      let backMesh = coneMesh.clone(true);
      backMesh.position.set(0.125, 0, 0);
      this.coneBlueBackSet.setSource(new THREE.Group().add(backMesh));
    }
    {
      let coneTextureYellow = this.textureLoader.load("../www/textures/cone-yellow.png");
      let coneTextureYellowBase = this.textureLoader.load("../www/textures/cone-yellow-base.png");
      coneTextureYellow.offset.set(0.25, 0);

      let coneMesh = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 16, 32), [
        new THREE.MeshPhongMaterial({
          map: coneTextureYellow,
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        }),
        new THREE.MeshPhongMaterial({
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        }),
        new THREE.MeshPhongMaterial({
          map: coneTextureYellowBase,
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        })
      ]);
      coneMesh.castShadow = true;
      coneMesh.receiveShadow = true;
      coneMesh.rotateZ(-Math.PI / 2);
      coneMesh.rotateY(-Math.PI / 2);

      this.coneYellowCenterSet.setSource(new THREE.Group().add(coneMesh));
      let frontMesh = coneMesh.clone(true);
      frontMesh.position.set(-0.125, 0, 0);
      this.coneYellowFrontSet.setSource(new THREE.Group().add(frontMesh));
      let backMesh = coneMesh.clone(true);
      backMesh.position.set(0.125, 0, 0);
      this.coneYellowBackSet.setSource(new THREE.Group().add(backMesh));
    }

    // Create Zebra marker models
    {
      let blueMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 1),
        new THREE.MeshPhongMaterial({
          color: 0x0000ff,
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        })
      );
      blueMesh.castShadow = true;
      blueMesh.receiveShadow = true;
      blueMesh.rotateX(Math.PI / 2);
      blueMesh.position.set(0, 0, 0.5);
      this.zebraMarkerBlueSet.setSource(new THREE.Group().add(blueMesh));
      let redMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 1),
        new THREE.MeshPhongMaterial({
          color: 0xff0000,
          specular: this.MATERIAL_SPECULAR,
          shininess: this.MATERIAL_SHININESS
        })
      );
      redMesh.castShadow = true;
      redMesh.receiveShadow = true;
      redMesh.rotateX(Math.PI / 2);
      redMesh.position.set(0, 0, 0.5);
      this.zebraMarkerRedSet.setSource(new THREE.Group().add(redMesh));
    }

    // Define ghost materials
    this.greenGhostMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.35,
      specular: this.MATERIAL_SPECULAR,
      shininess: this.MATERIAL_SHININESS
    });
    this.yellowGhostMaterial = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.35,
      specular: this.MATERIAL_SPECULAR,
      shininess: this.MATERIAL_SHININESS
    });

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

  /** Returns the camera and target positions. */
  get cameraPositions(): [THREE.Vector3, THREE.Vector3] {
    return [this.camera.position.clone(), this.controls.target.clone()];
  }

  /** Sets the camera and target positions. */
  set cameraPositions(value: [THREE.Vector3, THREE.Vector3]) {
    this.camera.position.copy(value[0]);
    this.controls.target.copy(value[1]);
    this.controls.update();
    this.lastCameraIndex = this.cameraIndex; // Don't reset camera position
  }

  render(command: any): number | null {
    if (JSON.stringify(command) !== JSON.stringify(this.command)) {
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
    if (this.cameraIndex === -1) {
      if (this.command && this.command.options.field === "Axes") {
        this.camera.position.copy(this.ORBIT_AXES_DEFAULT_POSITION);
        this.controls.target.copy(this.ORBIT_AXES_DEFAULT_TARGET);
      } else {
        this.camera.position.copy(this.ORBIT_FIELD_DEFAULT_POSITION);
        this.controls.target.copy(this.ORBIT_FIELD_DEFAULT_TARGET);
      }
    } else if (this.cameraIndex === -2) {
      this.camera.position.copy(this.ORBIT_ROBOT_DEFAULT_POSITION);
      this.controls.target.copy(this.ORBIT_ROBOT_DEFAULT_TARGET);
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

    // Get config
    let fieldTitle = this.command.options.field;
    let robotTitle = this.command.options.robot;
    let fieldConfig: Config3dField;
    let robotConfig: Config3dRobot;
    if (fieldTitle === "Evergreen") {
      fieldConfig = {
        name: "Evergreen",
        path: "",
        rotations: [],
        widthInches: convert(this.STANDARD_FIELD_LENGTH, "meters", "inches"),
        heightInches: convert(this.STANDARD_FIELD_WIDTH, "meters", "inches")
      };
    } else if (fieldTitle === "Axes") {
      fieldConfig = {
        name: "Axes",
        path: "",
        rotations: [],
        widthInches: convert(this.STANDARD_FIELD_LENGTH, "meters", "inches"),
        heightInches: convert(this.STANDARD_FIELD_WIDTH, "meters", "inches")
      };
    } else {
      let fieldConfigTmp = window.assets?.field3ds.find((fieldData) => fieldData.name === fieldTitle);
      if (fieldConfigTmp === undefined) return;
      fieldConfig = fieldConfigTmp;
    }
    {
      let robotConfigTmp = window.assets?.robots.find((robotData) => robotData.name === robotTitle);
      if (robotConfigTmp === undefined) return;
      robotConfig = robotConfigTmp;
    }

    // Check for new assets
    let assetsString = JSON.stringify(window.assets);
    let newAssets = assetsString !== this.lastAssetsString;
    if (newAssets) this.lastAssetsString = assetsString;

    // Update field
    if (fieldTitle !== this.lastFieldTitle || newAssets) {
      if (this.field) {
        this.wpilibCoordinateGroup.remove(this.field);
        disposeObject(this.field);
      }
      if (fieldTitle === "Evergreen") {
        this.field = new THREE.Group();
        this.wpilibCoordinateGroup.add(this.field);

        // Floor
        let carpet = new THREE.Mesh(
          new THREE.PlaneGeometry(this.STANDARD_FIELD_LENGTH + 4, this.STANDARD_FIELD_WIDTH + 1),
          new THREE.MeshPhongMaterial({ color: 0x888888, side: THREE.DoubleSide })
        );
        carpet.name = "carpet";
        this.field.add(carpet);

        // Guardrails
        const guardrailHeight = convert(20, "inches", "meters");
        [-this.STANDARD_FIELD_WIDTH / 2, this.STANDARD_FIELD_WIDTH / 2].forEach((y) => {
          [0, guardrailHeight].forEach((z) => {
            let guardrail = new THREE.Mesh(
              new THREE.CylinderGeometry(0.02, 0.02, this.STANDARD_FIELD_LENGTH, 12),
              new THREE.MeshPhongMaterial({ color: 0xdddddd })
            );
            this.field!.add(guardrail);
            guardrail.rotateZ(Math.PI / 2);
            guardrail.position.set(0, y, z);
          });
          {
            let panel = new THREE.Mesh(
              new THREE.PlaneGeometry(this.STANDARD_FIELD_LENGTH, guardrailHeight),
              new THREE.MeshPhongMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                opacity: 0.25,
                transparent: true
              })
            );
            this.field!.add(panel);
            panel.rotateX(Math.PI / 2);
            panel.position.set(0, y, guardrailHeight / 2);
          }
          for (
            let x = -this.STANDARD_FIELD_LENGTH / 2;
            x < this.STANDARD_FIELD_LENGTH / 2;
            x += this.STANDARD_FIELD_LENGTH / 16
          ) {
            if (x === -this.STANDARD_FIELD_LENGTH / 2) continue;
            let guardrail = new THREE.Mesh(
              new THREE.CylinderGeometry(0.02, 0.02, guardrailHeight, 12),
              new THREE.MeshPhongMaterial({ color: 0xdddddd })
            );
            this.field!.add(guardrail);
            guardrail.rotateX(Math.PI / 2);
            guardrail.position.set(x, y, guardrailHeight / 2);
          }
        });

        // Alliance stations
        const allianceStationWidth = convert(69, "inches", "meters");
        const allianceStationHeight = convert(78, "inches", "meters");
        const allianceStationSolidHeight = convert(36.75, "inches", "meters");
        const allianceStationShelfDepth = convert(12.25, "inches", "meters");
        const fillerWidth = (this.STANDARD_FIELD_WIDTH - allianceStationWidth * 3) / 2;
        const blueColor = 0x6379a6;
        const redColor = 0xa66363;
        [-this.STANDARD_FIELD_LENGTH / 2, this.STANDARD_FIELD_LENGTH / 2].forEach((x) => {
          [0, allianceStationSolidHeight, allianceStationHeight].forEach((z) => {
            let guardrail = new THREE.Mesh(
              new THREE.CylinderGeometry(
                0.02,
                0.02,
                z === allianceStationSolidHeight ? allianceStationWidth * 3 : this.STANDARD_FIELD_WIDTH,
                12
              ),
              new THREE.MeshPhongMaterial({ color: 0xdddddd })
            );
            this.field!.add(guardrail);
            guardrail.position.set(x, 0, z);
          });
          [
            -this.STANDARD_FIELD_WIDTH / 2,
            allianceStationWidth * -1.5,
            allianceStationWidth * -0.5,
            allianceStationWidth * 0.5,
            allianceStationWidth * 1.5,
            this.STANDARD_FIELD_WIDTH / 2
          ].forEach((y) => {
            let guardrail = new THREE.Mesh(
              new THREE.CylinderGeometry(0.02, 0.02, allianceStationHeight, 12),
              new THREE.MeshPhongMaterial({ color: 0xdddddd })
            );
            this.field!.add(guardrail);
            guardrail.rotateX(Math.PI / 2);
            guardrail.position.set(x, y, allianceStationHeight / 2);
          });
          [-this.STANDARD_FIELD_WIDTH / 2 + fillerWidth / 2, this.STANDARD_FIELD_WIDTH / 2 - fillerWidth / 2].forEach(
            (y) => {
              let filler = new THREE.Mesh(
                new THREE.PlaneGeometry(allianceStationHeight, fillerWidth),
                new THREE.MeshPhongMaterial({ color: x < 0 ? blueColor : redColor, side: THREE.DoubleSide })
              );
              this.field!.add(filler);
              filler.rotateY(Math.PI / 2);
              filler.position.set(x, y, allianceStationHeight / 2);
            }
          );
          {
            let allianceWall = new THREE.Mesh(
              new THREE.PlaneGeometry(allianceStationSolidHeight, allianceStationWidth * 3),
              new THREE.MeshPhongMaterial({ color: x < 0 ? blueColor : redColor, side: THREE.DoubleSide })
            );
            this.field!.add(allianceWall);
            allianceWall.rotateY(Math.PI / 2);
            allianceWall.position.set(x, 0, allianceStationSolidHeight / 2);
          }
          {
            let allianceGlass = new THREE.Mesh(
              new THREE.PlaneGeometry(allianceStationHeight - allianceStationSolidHeight, allianceStationWidth * 3),
              new THREE.MeshPhongMaterial({
                color: x < 0 ? blueColor : redColor,
                side: THREE.DoubleSide,
                opacity: 0.25,
                transparent: true
              })
            );
            this.field!.add(allianceGlass);
            allianceGlass.rotateY(Math.PI / 2);
            allianceGlass.position.set(
              x,
              0,
              allianceStationSolidHeight + (allianceStationHeight - allianceStationSolidHeight) / 2
            );
          }
          {
            let allianceShelves = new THREE.Mesh(
              new THREE.PlaneGeometry(allianceStationShelfDepth, allianceStationWidth * 3),
              new THREE.MeshPhongMaterial({ color: x < 0 ? blueColor : redColor, side: THREE.DoubleSide })
            );
            this.field!.add(allianceShelves);
            allianceShelves.position.set(
              x + (allianceStationShelfDepth / 2) * (x > 0 ? 1 : -1),
              0,
              allianceStationSolidHeight
            );
          }
        });

        // Add lighting effects
        this.field.traverse((node: any) => {
          let mesh = node as THREE.Mesh; // Traverse function returns Object3d or Mesh
          let isCarpet = mesh.name === "carpet";
          if (mesh.isMesh && mesh.material instanceof THREE.MeshPhongMaterial) {
            if (!isCarpet && this.MATERIAL_SPECULAR !== undefined && this.MATERIAL_SHININESS !== undefined) {
              mesh.material.specular = this.MATERIAL_SPECULAR;
              mesh.material.shininess = this.MATERIAL_SHININESS;
            }
            mesh.castShadow = !isCarpet;
            mesh.receiveShadow = true;
          }
        });

        // Render new frame
        this.shouldRender = true;
      } else if (fieldTitle === "Axes") {
        // Add axes to scene
        this.field = new THREE.Group();
        this.wpilibCoordinateGroup.add(this.field);
        let axes = this.axesTemplate.clone(true);
        axes.position.set(-this.STANDARD_FIELD_LENGTH / 2, -this.STANDARD_FIELD_WIDTH / 2, 0);
        this.field.add(axes);
        let outline = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-this.STANDARD_FIELD_LENGTH / 2, -this.STANDARD_FIELD_WIDTH / 2, 0),
            new THREE.Vector3(this.STANDARD_FIELD_LENGTH / 2, -this.STANDARD_FIELD_WIDTH / 2, 0),
            new THREE.Vector3(this.STANDARD_FIELD_LENGTH / 2, this.STANDARD_FIELD_WIDTH / 2, 0),
            new THREE.Vector3(-this.STANDARD_FIELD_LENGTH / 2, this.STANDARD_FIELD_WIDTH / 2, 0),
            new THREE.Vector3(-this.STANDARD_FIELD_LENGTH / 2, -this.STANDARD_FIELD_WIDTH / 2, 0)
          ]),
          new THREE.LineBasicMaterial({ color: 0x444444 })
        );
        this.field.add(outline);

        // Render new frame
        this.shouldRender = true;
      } else {
        const loader = new GLTFLoader();
        loader.load(fieldConfig.path, (gltf) => {
          if (fieldConfig === undefined) return;

          // Add to scene
          this.field = gltf.scene;
          this.field.traverse((node: any) => {
            let mesh = node as THREE.Mesh; // Traverse function returns Object3d or Mesh
            if (mesh.isMesh && mesh.material instanceof MeshStandardMaterial) {
              if (this.mode === "cinematic") {
                // Cinematic, replace with MeshPhongMaterial
                let newMaterial = new THREE.MeshPhongMaterial({
                  color: mesh.material.color,
                  transparent: mesh.material.transparent,
                  opacity: mesh.material.opacity,
                  specular: this.MATERIAL_SPECULAR,
                  shininess: this.MATERIAL_SHININESS
                });
                if (mesh.name.toLowerCase().includes("carpet")) {
                  newMaterial.shininess = 0;
                  mesh.castShadow = false;
                  mesh.receiveShadow = true;
                } else {
                  mesh.castShadow = !mesh.material.transparent;
                  mesh.receiveShadow = !mesh.material.transparent;
                }
                mesh.material.dispose();
                mesh.material = newMaterial;
              } else {
                // Not cinematic, disable metalness and roughness
                mesh.material.metalness = 0;
                mesh.material.roughness = 1;
              }
            }
          });
          this.field.rotation.setFromQuaternion(getQuaternionFromRotSeq(fieldConfig.rotations));
          this.wpilibCoordinateGroup.add(this.field);

          // Render new frame
          this.shouldRender = true;
        });
      }

      // Reset camera if switching between axis and non-axis
      if ((fieldTitle === "Axes") !== (this.lastFieldTitle === "Axes")) {
        this.resetCamera();
      }
      this.lastFieldTitle = fieldTitle;
    }

    // Update robot
    if (robotTitle !== this.lastRobotTitle || newAssets) {
      this.lastRobotTitle = robotTitle;
      const loader = new GLTFLoader();
      Promise.all([
        new Promise((resolve) => {
          loader.load(robotConfig.path, resolve);
        }),
        ...robotConfig.components.map(
          (_, index) =>
            new Promise((resolve) => {
              loader.load(robotConfig.path.slice(0, -4) + "_" + index.toString() + ".glb", resolve);
            })
        )
      ]).then((gltfs) => {
        let gltfScenes = (gltfs as GLTF[]).map((gltf) => gltf.scene);
        if (robotConfig === undefined) return;

        // Update model materials and set up groups
        let robotGroup = new THREE.Group();
        let greenGhostGroup = new THREE.Group();
        let yellowGhostGroup = new THREE.Group();
        gltfScenes.forEach((originalScene, index) => {
          originalScene.traverse((node: any) => {
            // Adjust materials
            let mesh = node as THREE.Mesh; // Traverse function returns Object3d or Mesh
            if (mesh.isMesh && mesh.material instanceof MeshStandardMaterial) {
              if (this.mode === "cinematic") {
                // Cinematic, replace with MeshPhongMaterial
                let newMaterial = new THREE.MeshPhongMaterial({
                  color: mesh.material.color,
                  transparent: mesh.material.transparent,
                  opacity: mesh.material.opacity,
                  specular: this.MATERIAL_SPECULAR,
                  shininess: this.MATERIAL_SHININESS
                });
                mesh.material.dispose();
                mesh.material = newMaterial;
                mesh.castShadow = !mesh.material.transparent;
                mesh.receiveShadow = !mesh.material.transparent;
              } else {
                // Not cinematic, disable metalness and roughness
                mesh.material.metalness = 0;
                mesh.material.roughness = 1;
              }
            }
          });
          let greenGhostScene = originalScene.clone(true);
          let yellowGhostScene = originalScene.clone(true);
          greenGhostScene.traverse((node: any) => {
            let mesh = node as THREE.Mesh; // Traverse function returns Object3d or Mesh
            if (mesh.isMesh) {
              mesh.material = this.greenGhostMaterial.clone();
            }
          });
          yellowGhostScene.traverse((node: any) => {
            let mesh = node as THREE.Mesh; // Traverse function returns Object3d or Mesh
            if (mesh.isMesh) {
              mesh.material = this.yellowGhostMaterial.clone();
            }
          });
          let sceneList = [originalScene, greenGhostScene, yellowGhostScene];
          // Set up groups
          [0, 1, 2].forEach((i: number) => {
            let scene = sceneList[i];
            if (index === 0) {
              // Root model, set position and add directly
              if (i === 0) {
                robotGroup.add(scene);
              } else if (i === 1) {
                greenGhostGroup.add(scene);
              } else {
                yellowGhostGroup.add(scene);
              }
              scene.rotation.setFromQuaternion(getQuaternionFromRotSeq(robotConfig.rotations));
              scene.position.set(...robotConfig.position);
            } else {
              // Component model, add name and store in group
              let componentGroup = new THREE.Group();
              componentGroup.name = "AdvantageScope_Component" + (index - 1).toString();
              componentGroup.add(scene);
              if (i === 0) {
                robotGroup.add(componentGroup);
              } else if (i === 1) {
                greenGhostGroup.add(componentGroup);
              } else {
                yellowGhostGroup.add(componentGroup);
              }
            }
          });
        });

        // Add mechanism roots
        let robotMechanismRoot = new THREE.Group();
        let greenGhostMechanismRoot = new THREE.Group();
        let yellowGhostMechanismRoot = new THREE.Group();
        robotMechanismRoot.name = "AdvantageScope_MechanismRoot";
        greenGhostMechanismRoot.name = "AdvantageScope_MechanismRoot";
        yellowGhostMechanismRoot.name = "AdvantageScope_MechanismRoot";
        robotGroup.add(robotMechanismRoot);
        greenGhostGroup.add(greenGhostMechanismRoot);
        yellowGhostGroup.add(yellowGhostMechanismRoot);

        // Update robot sets
        this.robotSet.setSource(robotGroup);
        this.greenGhostSet.setSource(greenGhostGroup);
        this.yellowGhostSet.setSource(yellowGhostGroup);
        this.zebraGreenGhostSet.setSource(greenGhostGroup);
        this.zebraYellowGhostSet.setSource(yellowGhostGroup);

        // Render new frame
        this.shouldRender = true;
      });
    }

    // Update field coordinates
    if (fieldConfig) {
      let isBlue = !this.command.allianceRedOrigin;
      this.wpilibFieldCoordinateGroup.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), isBlue ? 0 : Math.PI);
      this.wpilibFieldCoordinateGroup.position.set(
        convert(fieldConfig.widthInches / 2, "inches", "meters") * (isBlue ? -1 : 1),
        convert(fieldConfig.heightInches / 2, "inches", "meters") * (isBlue ? -1 : 1),
        0
      );
      this.wpilibZebraCoordinateGroup.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
      if (fieldConfig.name === "Axes") {
        this.wpilibZebraCoordinateGroup.position.set(this.STANDARD_FIELD_LENGTH, this.STANDARD_FIELD_WIDTH, 0);
      } else {
        this.wpilibZebraCoordinateGroup.position.set(
          convert(fieldConfig.widthInches / 2, "inches", "meters"),
          convert(fieldConfig.heightInches / 2, "inches", "meters"),
          0
        );
      }
    }

    // Update robot poses (max of 6 poses each)
    this.robotSet.setPoses(this.command.poses.robot.slice(0, 7));
    this.greenGhostSet.setPoses(this.command.poses.greenGhost.slice(0, 7));
    this.yellowGhostSet.setPoses(this.command.poses.yellowGhost.slice(0, 7));
    this.zebraGreenGhostSet.setPoses(this.command.poses.zebraGreenGhost.slice(0, 7));
    this.zebraYellowGhostSet.setPoses(this.command.poses.zebraYellowGhost.slice(0, 7));

    // Update robot components
    if (robotConfig && robotConfig.components.length > 0) {
      (
        [
          [this.robotSet, this.command.poses.componentRobot],
          [this.greenGhostSet, this.command.poses.componentGreenGhost],
          [this.yellowGhostSet, this.command.poses.componentYellowGhost],
          [this.zebraGreenGhostSet, this.command.poses.componentGreenGhost],
          [this.zebraYellowGhostSet, this.command.poses.componentYellowGhost]
        ] as [ObjectSet, Pose3d[]][]
      ).forEach(([objectSet, poseData]) => {
        objectSet.getChildren().forEach((childRobot) => {
          for (let i = 0; i < robotConfig.components.length; i++) {
            let componentGroup = childRobot.getObjectByName("AdvantageScope_Component" + i.toString());
            if (componentGroup === undefined) continue;
            let componentModel = componentGroup?.children[0];

            // Use component data or reset to default position
            if (i < poseData.length) {
              let componentPose = poseData[i];

              // The group has the user's pose
              componentGroup?.rotation.setFromQuaternion(rotation3dToQuaternion(componentPose.rotation));
              componentGroup?.position.set(...componentPose.translation);

              // The model should use the component's zeroed pose offset
              componentModel?.rotation.setFromQuaternion(
                getQuaternionFromRotSeq(robotConfig.components[i].zeroedRotations)
              );
              componentModel?.position.set(...robotConfig.components[i].zeroedPosition);
            } else {
              // The group has the user's pose, reset to origin
              componentGroup?.rotation.set(0, 0, 0);
              componentGroup?.position.set(0, 0, 0);

              // The model should use the robot's default pose offset
              componentModel?.rotation.setFromQuaternion(getQuaternionFromRotSeq(robotConfig.rotations));
              componentModel?.position.set(...robotConfig.position);
            }
          }
        });
      });
    }

    // Update mechanisms
    (
      [
        [
          this.robotSet,
          this.command.poses.mechanismRobot,
          () =>
            new THREE.MeshPhongMaterial({
              specular: this.MATERIAL_SPECULAR,
              shininess: this.MATERIAL_SHININESS
            }),
          true
        ],
        [this.greenGhostSet, this.command.poses.mechanismGreenGhost, () => this.greenGhostMaterial.clone(), false],
        [this.yellowGhostSet, this.command.poses.mechanismYellowGhost, () => this.yellowGhostMaterial.clone(), false],
        [this.zebraGreenGhostSet, this.command.poses.mechanismGreenGhost, () => this.greenGhostMaterial.clone(), false],
        [
          this.zebraYellowGhostSet,
          this.command.poses.mechanismYellowGhost,
          () => this.yellowGhostMaterial.clone(),
          false
        ]
      ] as [ObjectSet, MechanismState | null, () => THREE.MeshPhongMaterial, boolean][]
    ).forEach(([objectSet, state, getMaterial, updateColors]) => {
      objectSet.getChildren().forEach((childRobot) => {
        let mechanismRoot = childRobot.getObjectByName("AdvantageScope_MechanismRoot");
        if (mechanismRoot === undefined) return;

        if (state === null) {
          // No mechanism data, remove all children
          while (mechanismRoot.children.length > 0) {
            // Dispose of old material
            (
              mechanismRoot.children[0].children[0] as THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhongMaterial>
            ).material.dispose();
            mechanismRoot.remove(mechanismRoot.children[0]);
          }
        } else {
          // Remove extra children
          while (mechanismRoot.children.length > state.lines.length) {
            // Dispose of old material
            (
              mechanismRoot.children[0].children[0] as THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhongMaterial>
            ).material.dispose();
            mechanismRoot.remove(mechanismRoot.children[0]);
          }

          // Add new children
          while (mechanismRoot.children.length < state.lines.length) {
            const lineObject = new THREE.Mesh(new THREE.BoxGeometry(0.0, 0.0, 0.0), getMaterial());
            lineObject.castShadow = true;
            lineObject.receiveShadow = true;
            const lineGroup = new THREE.Group().add(lineObject);
            mechanismRoot.add(lineGroup);
          }

          // Update children
          for (let i = 0; i < mechanismRoot.children.length; i++) {
            const line = state.lines[i];
            const lineGroup = mechanismRoot.children[i];
            const lineObject = lineGroup.children[0] as THREE.Mesh<THREE.BoxGeometry, THREE.MeshPhongMaterial>;

            const length = Math.hypot(line.end[1] - line.start[1], line.end[0] - line.start[0]);
            const angle = Math.atan2(line.end[1] - line.start[1], line.end[0] - line.start[0]);

            lineGroup.position.set(line.start[0] - state!.dimensions[0] / 2, 0.0, line.start[1]);
            lineGroup.rotation.set(0.0, -angle, 0.0);
            lineObject.position.set(length / 2, 0.0, 0.0);
            lineObject.geometry.dispose();
            lineObject.geometry = new THREE.BoxGeometry(length, line.weight * 0.01, line.weight * 0.01);
            if (updateColors) {
              lineObject.material.color = new THREE.Color(line.color);
            }
          }
        }
      });
    });

    // Update AprilTag poses
    let aprilTags36h11: AprilTag[] = this.command.poses.aprilTag36h11;
    let aprilTags16h5: AprilTag[] = this.command.poses.aprilTag16h5;
    [aprilTags36h11, aprilTags16h5].forEach((tags, index) => {
      let is36h11 = index === 0;
      let sets = is36h11 ? this.aprilTag36h11Sets : this.aprilTag16h5Sets;
      tags.forEach((tag) => {
        let id = tag.id;
        if (!sets.has(id)) {
          this.textureLoader.load(
            "../www/textures/apriltag-" +
              (is36h11 ? "36h11" : "16h5") +
              "/" +
              (id === null ? "smile" : zfill(id.toString(), 3)) +
              ".png",
            (texture) => {
              texture.minFilter = THREE.NearestFilter;
              texture.magFilter = THREE.NearestFilter;
              let whiteMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: this.MATERIAL_SPECULAR,
                shininess: this.MATERIAL_SHININESS
              });
              let size = convert(is36h11 ? 8.125 : 8, "inches", "meters");
              let mesh = new THREE.Mesh(new THREE.BoxGeometry(0.02, size, size), [
                new THREE.MeshPhongMaterial({
                  map: texture,
                  specular: this.MATERIAL_SPECULAR,
                  shininess: this.MATERIAL_SHININESS
                }),
                whiteMaterial,
                whiteMaterial,
                whiteMaterial,
                whiteMaterial,
                whiteMaterial
              ]);
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              mesh.rotateX(Math.PI / 2);
              let objectSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
              objectSet.setSource(new THREE.Group().add(mesh));
              if (is36h11) {
                sets.set(id, objectSet);
              } else {
                sets.set(id, objectSet);
              }
            }
          );
        }
      });
    });
    [null, ...Array(APRIL_TAG_36H11_COUNT).keys()].forEach((id) => {
      this.aprilTag36h11Sets.get(id)?.setPoses(aprilTags36h11.filter((tag) => tag.id === id).map((tag) => tag.pose));
    });
    [null, ...Array(APRIL_TAG_16H5_COUNT).keys()].forEach((id) => {
      this.aprilTag16h5Sets.get(id)?.setPoses(aprilTags16h5.filter((tag) => tag.id === id).map((tag) => tag.pose));
    });

    // Update vision target lines
    if (this.command.poses.robot.length === 0) {
      // Remove all lines
      while (this.visionTargets.length > 0) {
        this.wpilibFieldCoordinateGroup.remove(this.visionTargets[0]);
        this.visionTargets.shift();
      }
    } else {
      while (this.visionTargets.length > this.command.poses.visionTarget.length) {
        // Remove extra lines
        this.visionTargets[0].geometry.dispose();
        this.visionTargets[0].material.dispose();
        this.wpilibFieldCoordinateGroup.remove(this.visionTargets[0]);
        this.visionTargets.shift();
      }
      while (this.visionTargets.length < this.command.poses.visionTarget.length) {
        // Add new lines
        let line = new Line2(
          new LineGeometry(),
          new LineMaterial({
            color: 0x00ff00,
            linewidth: 1,
            resolution: new THREE.Vector2(this.canvas.clientWidth, this.canvas.clientHeight)
          })
        );
        this.visionTargets.push(line);
        this.wpilibFieldCoordinateGroup.add(line);
      }
      for (let i = 0; i < this.visionTargets.length; i++) {
        // Update poses
        this.visionTargets[i].geometry.setPositions([
          this.command.poses.robot[0].translation[0],
          this.command.poses.robot[0].translation[1],
          this.command.poses.robot[0].translation[2] + 0.75,
          this.command.poses.visionTarget[i].translation[0],
          this.command.poses.visionTarget[i].translation[1],
          this.command.poses.visionTarget[i].translation[2]
        ]);
        this.visionTargets[i].geometry.attributes.position.needsUpdate = true;
      }
    }

    // Update trajectories
    {
      while (this.trajectories.length > this.command.poses.trajectory.length) {
        // Remove extra lines
        this.trajectories[0].geometry.dispose();
        this.trajectories[0].material.dispose();
        this.wpilibFieldCoordinateGroup.remove(this.trajectories[0]);
        this.trajectories.shift();
        this.trajectoryLengths.shift();
      }
      while (this.trajectories.length < this.command.poses.trajectory.length) {
        // Add new lines
        let line = new Line2(
          new LineGeometry(),
          new LineMaterial({
            color: 0xffa500,
            linewidth: 2,
            resolution: new THREE.Vector2(this.canvas.clientWidth, this.canvas.clientHeight)
          })
        );
        this.trajectories.push(line);
        this.trajectoryLengths.push(0);
        this.wpilibFieldCoordinateGroup.add(line);
      }
      for (let i = 0; i < this.trajectories.length; i++) {
        // Update poses
        if (this.command.poses.trajectory[i].length > 0) {
          let positions: number[] = [];
          this.command.poses.trajectory[i].forEach((pose: Pose3d) => {
            positions = positions.concat(pose.translation);
          });
          if (positions.length !== this.trajectoryLengths[i]) {
            this.trajectories[i].geometry.dispose();
            this.trajectories[i].geometry = new LineGeometry();
            this.trajectoryLengths[i] = positions.length;
          }
          this.trajectories[i].geometry.setPositions(positions);
          this.trajectories[i].geometry.attributes.position.needsUpdate = true;
        }
      }
    }

    // Update axes and cones
    this.axesSet.setPoses(this.command.poses.axes);
    this.coneBlueFrontSet.setPoses(this.command.poses.coneBlueFront);
    this.coneBlueCenterSet.setPoses(this.command.poses.coneBlueCenter);
    this.coneBlueBackSet.setPoses(this.command.poses.coneBlueBack);
    this.coneYellowFrontSet.setPoses(this.command.poses.coneYellowFront);
    this.coneYellowCenterSet.setPoses(this.command.poses.coneYellowCenter);
    this.coneYellowBackSet.setPoses(this.command.poses.coneYellowBack);

    // Update Zebra markers
    let bluePoses = Object.values(this.command.poses.zebraMarker)
      .filter((x: any) => x.alliance === "blue")
      .map((x: any) => {
        return {
          translation: [x.translation[0], x.translation[1], 0],
          rotation: [0, 0, 0, 0]
        } as Pose3d;
      });
    let redPoses = Object.values(this.command.poses.zebraMarker)
      .filter((x: any) => x.alliance === "red")
      .map((x: any) => {
        return {
          translation: [x.translation[0], x.translation[1], 0],
          rotation: [0, 0, 0, 0]
        } as Pose3d;
      });
    this.zebraMarkerBlueSet.setPoses(bluePoses);
    this.zebraMarkerRedSet.setPoses(redPoses);

    // Update Zebra team labels
    (Object.keys(this.command.poses.zebraMarker) as string[]).forEach((team) => {
      if (!(team in this.zebraTeamLabels)) {
        let labelDiv = document.createElement("div");
        labelDiv.innerText = team;
        this.zebraTeamLabels[team] = new CSS2DObject(labelDiv);
      }
    });
    Object.entries(this.zebraTeamLabels).forEach(([team, object]) => {
      if (team in this.command.poses.zebraMarker) {
        this.wpilibZebraCoordinateGroup.add(object);
        let translation = this.command.poses.zebraMarker[team].translation as Translation2d;
        object.position.set(translation[0], translation[1], 1.25);
      } else {
        this.wpilibZebraCoordinateGroup.remove(object);
      }
    });

    // Set camera for fixed views
    {
      // Reset camera index if invalid
      if (this.cameraIndex >= robotConfig.cameras.length) this.cameraIndex = -1;

      // Update camera controls
      let orbitalCamera = this.cameraIndex < 0;
      if (orbitalCamera !== this.controls.enabled) {
        this.controls.enabled = orbitalCamera;
        this.controls.update();
      }

      // Update container and camera based on mode
      let fov = this.orbitFov;
      this.lastAspectRatio = null;
      if (orbitalCamera) {
        this.canvas.classList.remove("fixed");
        this.annotationsDiv.classList.remove("fixed");
        this.canvas.style.width = "";
        this.canvas.style.height = "";
        this.annotationsDiv.style.width = "";
        this.annotationsDiv.style.height = "";
        if (this.cameraIndex === -1) {
          // Reset to default origin
          this.wpilibCoordinateGroup.position.set(0, 0, 0);
          this.wpilibCoordinateGroup.rotation.setFromQuaternion(this.WPILIB_ROTATION);
        } else if (this.command.poses.robot.length > 0) {
          // Shift based on robot location
          this.wpilibCoordinateGroup.position.set(0, 0, 0);
          this.wpilibCoordinateGroup.rotation.setFromQuaternion(new THREE.Quaternion());
          let robotObj = this.robotSet.getChildren()[0];
          let position = robotObj.getWorldPosition(new THREE.Vector3());
          let rotation = robotObj.getWorldQuaternion(new THREE.Quaternion()).multiply(this.WPILIB_ROTATION);
          position.negate();
          rotation.invert();
          this.wpilibCoordinateGroup.position.copy(position.clone().applyQuaternion(rotation));
          this.wpilibCoordinateGroup.rotation.setFromQuaternion(rotation);
        }
        if (this.cameraIndex !== this.lastCameraIndex) {
          this.resetCamera();
        }
      } else {
        this.canvas.classList.add("fixed");
        this.annotationsDiv.classList.add("fixed");
        let aspectRatio = 16 / 9;
        if (robotConfig) {
          // Get fixed aspect ratio and FOV
          let cameraConfig = robotConfig.cameras[this.cameraIndex];
          aspectRatio = cameraConfig.resolution[0] / cameraConfig.resolution[1];
          this.lastAspectRatio = aspectRatio;
          fov = cameraConfig.fov / aspectRatio;
          let parentAspectRatio = this.canvas.parentElement
            ? this.canvas.parentElement.clientWidth / this.canvas.parentElement.clientHeight
            : aspectRatio;
          if (aspectRatio > parentAspectRatio) {
            this.canvas.style.width = "100%";
            this.canvas.style.height = ((parentAspectRatio / aspectRatio) * 100).toString() + "%";
            this.annotationsDiv.style.width = "100%";
            this.annotationsDiv.style.height = ((parentAspectRatio / aspectRatio) * 100).toString() + "%";
          } else {
            this.canvas.style.width = ((aspectRatio / parentAspectRatio) * 100).toString() + "%";
            this.canvas.style.height = "100%";
            this.annotationsDiv.style.width = ((aspectRatio / parentAspectRatio) * 100).toString() + "%";
            this.annotationsDiv.style.height = "100%";
          }

          // Update camera position
          let referenceObj: THREE.Object3D | null = null;
          if (this.command.poses.cameraOverride.length > 0) {
            let cameraPose: Pose3d = this.command.poses.cameraOverride[0];
            this.fixedCameraOverrideObj.position.set(...cameraPose.translation);
            this.fixedCameraOverrideObj.rotation.setFromQuaternion(
              rotation3dToQuaternion(cameraPose.rotation).multiply(this.CAMERA_ROTATION)
            );
            referenceObj = this.fixedCameraOverrideObj;
          } else if (this.command.poses.robot.length > 0) {
            let robotPose: Pose3d = this.command.poses.robot[0];
            this.fixedCameraGroup.position.set(...robotPose.translation);
            this.fixedCameraGroup.rotation.setFromQuaternion(rotation3dToQuaternion(robotPose.rotation));
            this.fixedCameraObj.position.set(...cameraConfig.position);
            this.fixedCameraObj.rotation.setFromQuaternion(
              getQuaternionFromRotSeq(cameraConfig.rotations).multiply(this.CAMERA_ROTATION)
            );
            referenceObj = this.fixedCameraObj;
          }
          if (referenceObj) {
            this.camera.position.copy(referenceObj.getWorldPosition(new THREE.Vector3()));
            this.camera.rotation.setFromQuaternion(referenceObj.getWorldQuaternion(new THREE.Quaternion()));
          }
        }
      }

      // Update camera alert
      if (this.cameraIndex === -2) {
        this.alert.hidden = this.command.poses.robot.length > 0;
        this.alertCamera.innerText = "Orbit Robot";
      } else if (this.cameraIndex === -1) {
        this.alert.hidden = true;
      } else {
        this.alert.hidden = this.command.poses.robot.length > 0 || this.command.poses.cameraOverride.length > 0;
        if (robotConfig) {
          this.alertCamera.innerText = robotConfig.cameras[this.cameraIndex].name;
        } else {
          this.alertCamera.innerText = "???";
        }
      }

      // Update camera FOV
      if (fov !== this.camera.fov) {
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
      }

      this.lastCameraIndex = this.cameraIndex;
    }

    // Render new frame
    const devicePixelRatio = window.devicePixelRatio * (this.mode === "low-power" ? 0.5 : 1);
    const canvas = this.renderer.domElement;
    const clientWidth = canvas.clientWidth;
    const clientHeight = canvas.clientHeight;
    if (canvas.width / devicePixelRatio !== clientWidth || canvas.height / devicePixelRatio !== clientHeight) {
      this.renderer.setSize(clientWidth, clientHeight, false);
      this.cssRenderer.setSize(clientWidth, clientHeight);
      this.camera.aspect = clientWidth / clientHeight;
      this.camera.updateProjectionMatrix();
      const resolution = new THREE.Vector2(clientWidth, clientHeight);
      this.trajectories.forEach((line) => {
        line.material.resolution = resolution;
      });
      this.visionTargets.forEach((line) => {
        line.material.resolution = resolution;
      });
    }
    this.scene.background = isDark ? new THREE.Color("#222222") : new THREE.Color("#ffffff");
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.render(this.scene, this.camera);
    this.cssRenderer.render(this.scene, this.camera);
  }
}

/** Represents a set of cloned objects updated from an array of poses. */
class ObjectSet {
  private parent: THREE.Object3D;
  private source: THREE.Object3D = new THREE.Object3D();
  private children: THREE.Object3D[] = [];
  private poses: Pose3d[] = [];
  private displayedPoses = 0;

  constructor(parent: THREE.Object3D) {
    this.parent = parent;
  }

  /** Updates the source object, regenerating the clones based on the current poses. */
  setSource(newSource: THREE.Object3D) {
    disposeObject(this.source);
    this.source = newSource;

    // Remove all children
    while (this.children.length > 0) {
      disposeObject(this.children[0]);
      this.parent.remove(this.children[0]);
      this.children.shift();
    }
    this.displayedPoses = 0;

    // Recreate children
    this.setPoses(this.poses);
  }

  /** Updates the list of displayed poses, adding or removing children as necessary. */
  setPoses(poses: Pose3d[]) {
    this.poses = poses;

    // Clone new children
    while (this.children.length < poses.length) {
      this.children.push(this.source.clone(true));
    }

    // Remove extra children from parent
    while (this.displayedPoses > poses.length) {
      this.parent.remove(this.children[this.displayedPoses - 1]);
      this.displayedPoses -= 1;
    }

    // Add new children to parent
    while (this.displayedPoses < poses.length) {
      this.parent.add(this.children[this.displayedPoses]);
      this.displayedPoses += 1;
    }

    // Update poses
    for (let i = 0; i < this.poses.length; i++) {
      this.children[i].position.set(...poses[i].translation);
      this.children[i].rotation.setFromQuaternion(rotation3dToQuaternion(poses[i].rotation));
    }
  }

  /** Returns the set of cloned objects. */
  getChildren() {
    return [...this.children];
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
