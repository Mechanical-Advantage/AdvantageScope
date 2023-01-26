import * as THREE from "three";
import { MeshStandardMaterial } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Config3dField, Config3dRobot, Config3d_Rotation } from "../FRCData";
import { AprilTag, Pose3d, rotation3dToQuaternion } from "../geometry";
import { MechanismState } from "../log/LogUtil";
import { convert } from "../units";
import Visualizer from "./Visualizer";

export default class ThreeDimensionVisualizer implements Visualizer {
  private EFFICIENCY_MAX_FPS = 15;
  private ORBIT_FOV = 50;
  private ORBIT_FIELD_DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0);
  private ORBIT_AXES_DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);
  private ORBIT_ROBOT_DEFAULT_TARGET = new THREE.Vector3(0, 0.5, 0);
  private ORBIT_FIELD_DEFAULT_POSITION = new THREE.Vector3(0, 6, -12);
  private ORBIT_AXES_DEFAULT_POSITION = new THREE.Vector3(2, 2, -4);
  private ORBIT_ROBOT_DEFAULT_POSITION = new THREE.Vector3(2, 1, 1);
  private AXES_FIELD_LENGTH = convert(54, "feet", "meters");
  private AXES_FIELD_WIDTH = convert(27, "feet", "meters");
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

  private content: HTMLElement;
  private canvas: HTMLCanvasElement;
  private alert: HTMLElement;
  private alertCamera: HTMLElement;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private wpilibCoordinateGroup: THREE.Group; // Rotated to match WPILib coordinates
  private wpilibFieldCoordinateGroup: THREE.Group; // Field coordinates (origin at driver stations and flipped based on alliance)
  private fixedCameraGroup: THREE.Group;
  private fixedCameraObj: THREE.Object3D;
  private fixedCameraOverrideObj: THREE.Object3D;

  private axesTemplate: THREE.Object3D;
  private field: THREE.Object3D | null = null;
  private robotSet: ObjectSet;
  private ghostSet: ObjectSet;
  private ghostMaterial: THREE.Material;
  private aprilTagSets: Map<number | null, ObjectSet> = new Map();
  private trajectories: THREE.Line[] = [];
  private visionTargets: THREE.Line[] = [];
  private axesSet: ObjectSet;
  private coneBlueFrontSet: ObjectSet;
  private coneBlueCenterSet: ObjectSet;
  private coneBlueBackSet: ObjectSet;
  private coneYellowFrontSet: ObjectSet;
  private coneYellowCenterSet: ObjectSet;
  private coneYellowBackSet: ObjectSet;

  private command: any;
  private shouldRender = false;
  private cameraIndex = -1;
  private lastCameraIndex = -1;
  private lastFrameTime = 0;
  private lastWidth: number | null = 0;
  private lastHeight: number | null = 0;
  private lastDevicePixelRatio: number | null = null;
  private lastIsDark: boolean | null = null;
  private lastAspectRatio: number | null = null;
  private lastPrefsMode = "";
  private lastIsBattery = false;
  private lastFrcDataString: string = "";
  private lastFieldTitle: string = "";
  private lastRobotTitle: string = "";

  constructor(content: HTMLElement, canvas: HTMLCanvasElement, alert: HTMLElement) {
    this.content = content;
    this.canvas = canvas;
    this.alert = alert;
    this.alertCamera = alert.getElementsByTagName("span")[0];
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.scene = new THREE.Scene();

    // Change camera menu
    let startPx: [number, number] | null = null;
    canvas.addEventListener("contextmenu", (event) => {
      startPx = [event.x, event.y];
    });
    canvas.addEventListener("mouseup", (event) => {
      if (startPx && event.x == startPx[0] && event.y == startPx[1]) {
        if (!this.command) return;
        let robotTitle = this.command.options.robot;
        let robotConfig = window.frcData?.robots.find((robotData) => robotData.title === robotTitle);
        if (robotConfig == undefined) return;
        window.sendMainMessage("ask-3d-camera", {
          options: robotConfig.cameras.map((camera) => camera.name),
          selectedIndex: this.cameraIndex >= robotConfig.cameras.length ? -1 : this.cameraIndex
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
      const fov = this.ORBIT_FOV;
      const aspect = 2;
      const near = 0.1;
      const far = 100;
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    }

    // Create controls
    {
      this.controls = new OrbitControls(this.camera, canvas);
      this.controls.maxDistance = 30;
      this.controls.enabled = true;
      this.controls.update();
    }

    // Reset camera and controls
    this.resetCamera();

    // Add lights
    {
      const skyColor = 0xffffff;
      const groundColor = 0x444444;
      const intensity = 0.5;
      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
      this.scene.add(light);
    }
    {
      const color = 0xffffff;
      const intensity = 0.2;
      const light = new THREE.PointLight(color, intensity);
      light.position.set(0, 0, 10);
      this.wpilibCoordinateGroup.add(light);
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
      this.ghostSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.axesSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneBlueFrontSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneBlueCenterSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneBlueBackSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneYellowFrontSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneYellowCenterSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      this.coneYellowBackSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
    }

    // Create axes template
    {
      this.axesTemplate = new THREE.Object3D();
      const radius = 0.02;

      const center = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 8, 4),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
      );
      this.axesTemplate.add(center);

      const xAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 1),
        new THREE.MeshPhongMaterial({ color: 0xff0000 })
      );
      xAxis.position.set(0.5, 0.0, 0.0);
      xAxis.rotateZ(Math.PI / 2);
      this.axesTemplate.add(xAxis);

      const yAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 1),
        new THREE.MeshPhongMaterial({ color: 0x00ff00 })
      );
      yAxis.position.set(0.0, 0.5, 0.0);
      this.axesTemplate.add(yAxis);

      const zAxis = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 1),
        new THREE.MeshPhongMaterial({ color: 0x2020ff })
      );
      zAxis.position.set(0.0, 0.0, 0.5);
      zAxis.rotateX(Math.PI / 2);
      this.axesTemplate.add(zAxis);

      let poseAxes = this.axesTemplate.clone(true);
      poseAxes.scale.set(0.25, 0.25, 0.25);
      this.axesSet.setSource(poseAxes);
    }

    // Create cone models
    const loader = new THREE.TextureLoader();
    {
      let coneTextureBlue = loader.load("../www/textures/cone-blue.png");
      let coneTextureBlueBase = loader.load("../www/textures/cone-blue-base.png");
      coneTextureBlue.offset.set(0.25, 0);

      let coneMesh = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 16, 32), [
        new THREE.MeshPhongMaterial({
          map: coneTextureBlue
        }),
        new THREE.MeshPhongMaterial(),
        new THREE.MeshPhongMaterial({
          map: coneTextureBlueBase
        })
      ]);
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
      let coneTextureYellow = loader.load("../www/textures/cone-yellow.png");
      let coneTextureYellowBase = loader.load("../www/textures/cone-yellow-base.png");
      coneTextureYellow.offset.set(0.25, 0);

      let coneMesh = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 16, 32), [
        new THREE.MeshPhongMaterial({
          map: coneTextureYellow
        }),
        new THREE.MeshPhongMaterial(),
        new THREE.MeshPhongMaterial({
          map: coneTextureYellowBase
        })
      ]);
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

    // Create AprilTag models
    [null, ...Array(30).keys()].forEach((id) => {
      let aprilTagTexture = loader.load("../www/textures/apriltag/" + (id === null ? "smile" : id.toString()) + ".png");
      aprilTagTexture.minFilter = THREE.NearestFilter;
      aprilTagTexture.magFilter = THREE.NearestFilter;
      let whiteMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
      let mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, convert(8, "inches", "meters"), convert(8, "inches", "meters")),
        [
          new THREE.MeshPhongMaterial({ map: aprilTagTexture }),
          whiteMaterial,
          whiteMaterial,
          whiteMaterial,
          whiteMaterial,
          whiteMaterial
        ]
      );
      mesh.rotateX(Math.PI / 2);
      let objectSet = new ObjectSet(this.wpilibFieldCoordinateGroup);
      objectSet.setSource(new THREE.Group().add(mesh));
      this.aprilTagSets.set(id, objectSet);
    });

    // Define ghost material
    {
      let material = new THREE.MeshPhongMaterial();
      material.color = new THREE.Color("#00ff00");
      material.transparent = true;
      material.opacity = 0.35;
      this.ghostMaterial = material;
    }

    // Render when camera is moved
    this.controls.addEventListener("change", () => (this.shouldRender = true));

    // Render loop
    let periodic = () => {
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

  render(command: any): number | null {
    if (JSON.stringify(command) != JSON.stringify(this.command)) {
      this.shouldRender = true;
    }
    this.command = command;
    return this.lastAspectRatio;
  }

  /** Resets the camera position and controls target. */
  private resetCamera() {
    if (this.cameraIndex == -1) {
      if (this.command && this.command.options.field == "Axes") {
        this.camera.position.copy(this.ORBIT_AXES_DEFAULT_POSITION);
        this.controls.target.copy(this.ORBIT_AXES_DEFAULT_TARGET);
      } else {
        this.camera.position.copy(this.ORBIT_FIELD_DEFAULT_POSITION);
        this.controls.target.copy(this.ORBIT_FIELD_DEFAULT_TARGET);
      }
    } else if (this.cameraIndex == -2) {
      this.camera.position.copy(this.ORBIT_ROBOT_DEFAULT_POSITION);
      this.controls.target.copy(this.ORBIT_ROBOT_DEFAULT_TARGET);
    }
    this.controls.update();
  }

  private renderFrame() {
    // Check for new render mode
    if (window.preferences) {
      if (window.preferences.threeDimensionMode != this.lastPrefsMode || window.isBattery != this.lastIsBattery) {
        this.shouldRender = true;
        this.lastPrefsMode = window.preferences.threeDimensionMode;
        this.lastIsBattery = window.isBattery;
      }
    }

    // Check for new size, device pixel ratio, or theme
    let isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (
      this.renderer.domElement.clientWidth != this.lastWidth ||
      this.renderer.domElement.clientHeight != this.lastHeight ||
      window.devicePixelRatio != this.lastDevicePixelRatio ||
      isDark != this.lastIsDark
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

    // Limit FPS in efficiency mode
    let isEfficiency =
      window.preferences?.threeDimensionMode == "efficiency" ||
      (window.preferences?.threeDimensionMode == "auto" && window.isBattery);
    let now = new Date().getTime();
    if (isEfficiency && now - this.lastFrameTime < 1000 / this.EFFICIENCY_MAX_FPS) {
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
    if (fieldTitle == "Axes") {
      fieldConfig = {
        title: "",
        path: "",
        rotations: [],
        widthInches: 0.0,
        heightInches: 0.0
      };
    } else {
      let fieldConfigTmp = window.frcData?.field3ds.find((fieldData) => fieldData.title === fieldTitle);
      if (fieldConfigTmp == undefined) return;
      fieldConfig = fieldConfigTmp;
    }
    {
      let robotConfigTmp = window.frcData?.robots.find((robotData) => robotData.title === robotTitle);
      if (robotConfigTmp == undefined) return;
      robotConfig = robotConfigTmp;
    }

    // Check for new FRC data
    let frcDataString = JSON.stringify(window.frcData);
    let newFrcData = frcDataString != this.lastFrcDataString;
    if (newFrcData) this.lastFrcDataString = frcDataString;

    // Update field
    if (fieldTitle != this.lastFieldTitle) {
      this.lastFieldTitle = fieldTitle;
      if (this.field) {
        this.wpilibCoordinateGroup.remove(this.field);
      }
      if (fieldTitle == "Axes") {
        // Add to scene
        let axes = this.axesTemplate.clone(true);
        let outline = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(),
            new THREE.Vector3(this.AXES_FIELD_LENGTH, 0, 0),
            new THREE.Vector3(this.AXES_FIELD_LENGTH, this.AXES_FIELD_WIDTH, 0),
            new THREE.Vector3(0, this.AXES_FIELD_WIDTH, 0),
            new THREE.Vector3()
          ]),
          new THREE.LineBasicMaterial({ color: 0x444444 })
        );
        axes.add(outline);
        this.field = axes;
        this.wpilibCoordinateGroup.add(this.field);

        // Render new frame
        this.shouldRender = true;
      } else {
        const loader = new GLTFLoader();
        loader.load(fieldConfig.path, (gltf) => {
          if (fieldConfig == undefined) return;

          // Add to scene
          this.field = gltf.scene;
          this.field.traverse((node: any) => {
            let mesh = node as THREE.Mesh; // Traverse function returns Object3d or Mesh
            if (mesh.isMesh && mesh.material instanceof MeshStandardMaterial) {
              let material = mesh.material as MeshStandardMaterial;
              material.metalness = 0;
              material.roughness = 1;
            }
          });
          this.field.rotation.setFromQuaternion(getQuaternionFromRotSeq(fieldConfig.rotations));
          this.wpilibCoordinateGroup.add(this.field);

          // Render new frame
          this.shouldRender = true;
        });
      }
      this.resetCamera();
    }

    // Update robot
    if (robotTitle != this.lastRobotTitle || newFrcData) {
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
        if (robotConfig == undefined) return;

        // Update model materials and set up groups
        let robotGroup = new THREE.Group();
        let ghostGroup = new THREE.Group();
        gltfScenes.forEach((originalScene, index) => {
          originalScene.traverse((node: any) => {
            // Adjust materials
            let mesh = node as THREE.Mesh; // Traverse function returns Object3d or Mesh
            if (mesh.isMesh && mesh.material instanceof MeshStandardMaterial) {
              let material = mesh.material as MeshStandardMaterial;
              material.metalness = 0;
              material.roughness = 1;
            }
          });
          let ghostScene = originalScene.clone(true);
          ghostScene.traverse((node: any) => {
            let mesh = node as THREE.Mesh; // Traverse function returns Object3d or Mesh
            if (mesh.isMesh) {
              mesh.material = this.ghostMaterial;
            }
          });

          // Set up groups
          [true, false].forEach((isOriginal) => {
            let scene = isOriginal ? originalScene : ghostScene;
            if (index == 0) {
              // Root model, set position and add directly
              if (isOriginal) {
                robotGroup.add(scene);
              } else {
                ghostGroup.add(scene);
              }
              scene.rotation.setFromQuaternion(getQuaternionFromRotSeq(robotConfig.rotations));
              scene.position.set(...robotConfig.position);
            } else {
              // Component model, add name and store in group
              let componentGroup = new THREE.Group();
              componentGroup.name = "AdvantageScope_Component" + (index - 1).toString();
              componentGroup.add(scene);
              if (isOriginal) {
                robotGroup.add(componentGroup);
              } else {
                ghostGroup.add(componentGroup);
              }
            }
          });
        });

        // Add mechanism roots
        let robotMechanismRoot = new THREE.Object3D();
        let ghostMechanismRoot = new THREE.Object3D();
        robotMechanismRoot.name = "AdvantageScope_MechanismRoot";
        ghostMechanismRoot.name = "AdvantageScope_MechanismRoot";
        robotGroup.add(robotMechanismRoot);
        ghostGroup.add(ghostMechanismRoot);

        // Update robot sets
        this.robotSet.setSource(robotGroup);
        this.ghostSet.setSource(ghostGroup);

        // Render new frame
        this.shouldRender = true;
      });
    }

    // Update field coordinates
    if (fieldConfig) {
      let isBlue = this.command.options.alliance == "blue";
      this.wpilibFieldCoordinateGroup.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), isBlue ? 0 : Math.PI);
      this.wpilibFieldCoordinateGroup.position.set(
        convert(fieldConfig.widthInches / 2, "inches", "meters") * (isBlue ? -1 : 1),
        convert(fieldConfig.heightInches / 2, "inches", "meters") * (isBlue ? -1 : 1),
        0
      );
    }

    // Update robot poses
    this.robotSet.setPoses(this.command.poses.robot.slice(0, 7)); // Max of 6 poses
    this.ghostSet.setPoses(this.command.poses.ghost.slice(0, 7)); // Max of 6 poses

    // Update robot components
    if (robotConfig && robotConfig.components.length > 0) {
      [true, false].forEach((isOriginal) => {
        (isOriginal ? this.robotSet : this.ghostSet).getChildren().forEach((childRobot) => {
          for (let i = 0; i < robotConfig.components.length; i++) {
            let componentGroup = childRobot.getObjectByName("AdvantageScope_Component" + i.toString());
            let componentModel = componentGroup?.children[0];

            // Use component data or reset to default position
            if (
              i < (isOriginal ? this.command.poses.componentRobot.length : this.command.poses.componentGhost.length)
            ) {
              let componentPose = (
                isOriginal ? this.command.poses.componentRobot[i] : this.command.poses.componentGhost[i]
              ) as Pose3d;

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
    [true, false].forEach((isOriginal) => {
      (isOriginal ? this.robotSet : this.ghostSet).getChildren().forEach((childRobot) => {
        let mechanismRoot = childRobot.getObjectByName("AdvantageScope_MechanismRoot")!;
        let state: MechanismState | null = isOriginal
          ? this.command.poses.mechanismRobot
          : this.command.poses.mechanismGhost;

        if (state === null) {
          // No mechanism data, remove all children
          while (mechanismRoot.children.length > 0) {
            mechanismRoot.remove(mechanismRoot.children[0]);
          }
        } else {
          // Remove extra children
          while (mechanismRoot.children.length > state.lines.length) {
            mechanismRoot.remove(mechanismRoot.children[0]);
          }

          // Add new children
          while (mechanismRoot.children.length < state.lines.length) {
            const lineObject = new THREE.Mesh(
              new THREE.BoxGeometry(0.0, 0.0, 0.0),
              isOriginal ? new THREE.MeshPhongMaterial() : this.ghostMaterial
            );
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
            lineObject.geometry = new THREE.BoxGeometry(length, line.weight * 0.01, line.weight * 0.01);
            if (isOriginal) {
              lineObject.material.color = new THREE.Color(line.color);
            }
          }
        }
      });
    });

    // Update AprilTag poses
    let aprilTags: AprilTag[] = this.command.poses.aprilTag;
    [null, ...Array(30).keys()].forEach((id) => {
      this.aprilTagSets.get(id)?.setPoses(aprilTags.filter((tag) => tag.id === id).map((tag) => tag.pose));
    });

    // Update vision target lines
    if (this.command.poses.robot.length == 0) {
      // Remove all lines
      while (this.visionTargets.length > 0) {
        this.wpilibFieldCoordinateGroup.remove(this.visionTargets[0]);
        this.visionTargets.shift();
      }
    } else {
      let material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      while (this.visionTargets.length > this.command.poses.visionTarget.length) {
        // Remove extra lines
        this.wpilibFieldCoordinateGroup.remove(this.visionTargets[0]);
        this.visionTargets.shift();
      }
      while (this.visionTargets.length < this.command.poses.visionTarget.length) {
        // Add new lines
        let line = new THREE.Line(new THREE.BufferGeometry(), material);
        this.visionTargets.push(line);
        this.wpilibFieldCoordinateGroup.add(line);
      }
      for (let i = 0; i < this.visionTargets.length; i++) {
        // Update poses
        this.visionTargets[i].geometry.setFromPoints([
          new THREE.Vector3(...this.command.poses.robot[0].translation).add(new THREE.Vector3(0, 0, 0.75)),
          new THREE.Vector3(...this.command.poses.visionTarget[i].translation)
        ]);
      }
    }

    // Update trajectories
    {
      while (this.trajectories.length > this.command.poses.trajectory.length) {
        // Remove extra lines
        this.wpilibFieldCoordinateGroup.remove(this.trajectories[0]);
        this.trajectories.shift();
      }
      while (this.trajectories.length < this.command.poses.trajectory.length) {
        // Add new lines
        let line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffa500 }));
        this.trajectories.push(line);
        this.wpilibFieldCoordinateGroup.add(line);
      }
      for (let i = 0; i < this.trajectories.length; i++) {
        // Update poses
        this.trajectories[i].geometry.setFromPoints(
          this.command.poses.trajectory[i].map((pose: Pose3d) => new THREE.Vector3(...pose.translation))
        );
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

    // Set camera for fixed views
    {
      // Reset camera index if invalid
      if (this.cameraIndex >= robotConfig.cameras.length) this.cameraIndex = -1;

      // Update camera controls
      let orbitalCamera = this.cameraIndex < 0;
      if (orbitalCamera != this.controls.enabled) {
        this.controls.enabled = orbitalCamera;
        this.controls.update();
      }

      // Update container and camera based on mode
      let fov = this.ORBIT_FOV;
      this.lastAspectRatio = null;
      if (orbitalCamera) {
        this.canvas.classList.remove("fixed");
        this.canvas.style.aspectRatio = "";
        if (this.cameraIndex == -1) {
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
        if (this.cameraIndex != this.lastCameraIndex) {
          this.resetCamera();
        }
      } else {
        this.canvas.classList.add("fixed");
        let aspectRatio = 16 / 9;
        if (robotConfig) {
          // Get fixed aspect ratio and FOV
          let cameraConfig = robotConfig.cameras[this.cameraIndex];
          aspectRatio = cameraConfig.resolution[0] / cameraConfig.resolution[1];
          this.lastAspectRatio = aspectRatio;
          fov = (cameraConfig.fov * aspectRatio) / 2;
          this.canvas.style.aspectRatio = aspectRatio.toString();

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
      if (this.cameraIndex == -2) {
        this.alert.hidden = this.command.poses.robot.length > 0;
        this.alertCamera.innerText = "Orbit Robot";
      } else if (this.cameraIndex == -1) {
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
      if (fov != this.camera.fov) {
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
      }

      this.lastCameraIndex = this.cameraIndex;
    }

    // Render new frame
    const devicePixelRatio = isEfficiency ? 1 : window.devicePixelRatio;
    const canvas = this.renderer.domElement;
    const clientWidth = canvas.clientWidth;
    const clientHeight = canvas.clientHeight;
    if (canvas.width / devicePixelRatio != clientWidth || canvas.height / devicePixelRatio != clientHeight) {
      this.renderer.setSize(clientWidth, clientHeight, false);
      this.camera.aspect = clientWidth / clientHeight;
      this.camera.updateProjectionMatrix();
    }
    this.scene.background = isDark ? new THREE.Color("#222222") : new THREE.Color("#ffffff");
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.render(this.scene, this.camera);
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
    this.source = newSource;

    // Remove all children
    while (this.children.length > 0) {
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
    if (rotation.axis == "x") axis.setX(1);
    if (rotation.axis == "y") axis.setY(1);
    if (rotation.axis == "z") axis.setZ(1);
    quaternion.premultiply(
      new THREE.Quaternion().setFromAxisAngle(axis, convert(rotation.degrees, "degrees", "radians"))
    );
  });
  return quaternion;
}
