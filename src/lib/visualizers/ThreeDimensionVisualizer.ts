import * as THREE from "three";
import { Quaternion } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Config3d_Rotation } from "../FRCData";
import { degreesToRadians, inchesToMeters } from "../util";
import Visualizer from "./Visualizer";

export default class ThreeDimensionVisualizer implements Visualizer {
  private EFFICIENCY_MAX_FPS = 15;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private wpilibCoordinateGroup: THREE.Group;
  private wpilibFieldCoordinateGroup: THREE.Group;
  private field: THREE.Object3D | null = null;
  private robot: THREE.Object3D | null = null;
  private greenCones: THREE.Object3D[] = [];
  private blueCones: THREE.Object3D[] = [];
  private yellowCones: THREE.Object3D[] = [];

  private command: any;
  private efficiencyFrameTimeout: NodeJS.Timeout | null = null;
  private lastFrameTime = 0;
  private lastPrefsMode = "";
  private lastFrcDataString: string = "";
  private lastFieldTitle: string = "";
  private lastRobotTitle: string = "";
  private lastRobotVisible: boolean = false;

  private coneTextureGreen: THREE.Texture;
  private coneTextureGreenBase: THREE.Texture;
  private coneTextureBlue: THREE.Texture;
  private coneTextureBlueBase: THREE.Texture;
  private coneTextureYellow: THREE.Texture;
  private coneTextureYellowBase: THREE.Texture;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.scene = new THREE.Scene();

    // Create coordinate groups
    this.wpilibCoordinateGroup = new THREE.Group();
    this.scene.add(this.wpilibCoordinateGroup);
    this.wpilibCoordinateGroup.rotateX(Math.PI / 2);
    this.wpilibCoordinateGroup.rotateY(Math.PI);
    this.wpilibFieldCoordinateGroup = new THREE.Group();
    this.wpilibCoordinateGroup.add(this.wpilibFieldCoordinateGroup);

    // Create camera
    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 6, -12);
    this.camera.lookAt(0, 0.5, 0);

    // Create controls
    const controls = new OrbitControls(this.camera, canvas);
    controls.target.set(0, 0.5, 0);
    controls.maxDistance = 30;
    controls.update();

    // Add lights
    {
      const skyColor = 0xffffff;
      const groundColor = 0x000000;
      const intensity = 0.5;
      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
      this.scene.add(light);
    }
    {
      const color = 0xffffff;
      const intensity = 0.2;
      const light = new THREE.PointLight(color, intensity);
      light.position.set(-12, 10, -12);
      this.scene.add(light);
    }
    {
      const color = 0xffffff;
      const intensity = 0.2;
      const light = new THREE.PointLight(color, intensity);
      light.position.set(0, -10, 0);
      this.scene.add(light);
    }

    // Load cone textures
    const loader = new THREE.TextureLoader();
    this.coneTextureGreen = loader.load("../www/textures/cone-green.png");
    this.coneTextureBlue = loader.load("../www/textures/cone-blue.png");
    this.coneTextureYellow = loader.load("../www/textures/cone-yellow.png");
    this.coneTextureGreen.offset.set(0.25, 0);
    this.coneTextureBlue.offset.set(0.25, 0);
    this.coneTextureYellow.offset.set(0.25, 0);
    this.coneTextureGreenBase = loader.load("../www/textures/cone-green-base.png");
    this.coneTextureBlueBase = loader.load("../www/textures/cone-blue-base.png");
    this.coneTextureYellowBase = loader.load("../www/textures/cone-yellow-base.png");

    // Render when camera is moved or window is resized
    controls.addEventListener("change", () => this.renderFrame());
    window.addEventListener("resize", () => this.renderFrame());
  }

  render(command: any): number | null {
    let shouldRender =
      JSON.stringify(command) != JSON.stringify(this.command) ||
      window.preferences?.threeDimensionMode != this.lastPrefsMode;
    if (window.preferences) {
      this.lastPrefsMode = window.preferences.threeDimensionMode;
    }
    this.command = command;
    if (shouldRender) this.renderFrame(); // Render on new data
    return null;
  }

  renderFrame() {
    if (!this.command) return;

    // Limit FPS based on selected mode
    let now = new Date().getTime();
    if (this.efficiencyFrameTimeout) clearTimeout(this.efficiencyFrameTimeout);
    if (
      window.preferences?.threeDimensionMode == "efficiency" &&
      now - this.lastFrameTime < 1000 / this.EFFICIENCY_MAX_FPS
    ) {
      // Render a frame after this method stops getting called (ensures that the last frame is accurate)
      this.efficiencyFrameTimeout = setTimeout(() => this.renderFrame(), 1000 / this.EFFICIENCY_MAX_FPS);
      return;
    }
    this.lastFrameTime = now;

    // Get config
    let fieldTitle = this.command.options.field;
    let robotTitle = this.command.options.robot;
    let fieldConfig = window.frcData?.field3ds.find((fieldData) => fieldData.title === fieldTitle);
    let robotConfig = window.frcData?.robots.find((robotData) => robotData.title === robotTitle);
    if (fieldConfig == undefined || robotConfig == undefined) return;

    // Check for new FRC data
    let frcDataString = JSON.stringify(window.frcData);
    let newFrcData = frcDataString != this.lastFrcDataString;
    if (newFrcData) this.lastFrcDataString = frcDataString;

    // Add field
    if (fieldTitle != this.lastFieldTitle) {
      this.lastFieldTitle = fieldTitle;
      if (this.field) {
        this.wpilibCoordinateGroup.remove(this.field);
      }
      const loader = new GLTFLoader();
      loader.load(fieldConfig.path, (gltf) => {
        if (fieldConfig == undefined) return;

        // Add to scene
        this.field = gltf.scene;
        this.field.rotation.setFromQuaternion(this.getQuaternionFromRotSeq(fieldConfig.rotations));
        this.wpilibCoordinateGroup.add(this.field);

        // Render new frame
        this.renderFrame();
      });
    }

    // Add robot
    if (robotTitle != this.lastRobotTitle || newFrcData) {
      this.lastRobotTitle = robotTitle;
      if (this.robot && this.lastRobotVisible) {
        this.wpilibFieldCoordinateGroup.remove(this.robot);
      }
      this.robot = null;

      const loader = new GLTFLoader();
      loader.load(robotConfig.path, (gltf) => {
        if (robotConfig == undefined) return;

        // Set position and rotation
        let robotModel = gltf.scene;
        robotModel.rotation.setFromQuaternion(this.getQuaternionFromRotSeq(robotConfig.rotations));
        robotModel.position.set(...robotConfig.position);

        // Create group and add to scene
        this.robot = new THREE.Group().add(robotModel);
        if (this.lastRobotVisible) {
          this.wpilibFieldCoordinateGroup.add(this.robot);
        }

        // Render new frame
        this.renderFrame();
      });
    }

    // Update field coordinates
    if (fieldConfig) {
      let isBlue = this.command.options.alliance == "blue";
      this.wpilibFieldCoordinateGroup.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), isBlue ? 0 : Math.PI);
      this.wpilibFieldCoordinateGroup.position.set(
        inchesToMeters(fieldConfig.widthInches / 2) * (isBlue ? -1 : 1),
        inchesToMeters(fieldConfig.heightInches / 2) * (isBlue ? -1 : 1),
        0
      );
    }

    // Set robot position
    if (this.robot) {
      let robotPose: Pose3d | null = this.command.poses.robot;
      if (robotPose != null) {
        if (!this.lastRobotVisible) {
          this.wpilibFieldCoordinateGroup.add(this.robot);
        }

        // Set position and rotation
        this.robot.position.set(...robotPose.position);
        this.robot.rotation.setFromQuaternion(
          new Quaternion(robotPose.rotation[1], robotPose.rotation[2], robotPose.rotation[3], robotPose.rotation[0])
        );
      } else if (this.lastRobotVisible) {
        // Robot is no longer visible, remove
        this.wpilibFieldCoordinateGroup.remove(this.robot);
      }
      this.lastRobotVisible = robotPose != null;
    }

    // Function to update a set of cones
    let updateCones = (
      poseData: Pose3d[],
      objectArray: THREE.Object3D[],
      texture: THREE.Texture,
      textureBase: THREE.Texture
    ) => {
      // Remove extra cones
      while (poseData.length < objectArray.length) {
        let cone = objectArray.pop();
        if (cone) this.wpilibFieldCoordinateGroup.remove(cone);
      }

      // Add new cones
      while (poseData.length > objectArray.length) {
        let cone = new THREE.Group();
        let coneMesh = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 16, 32), [
          new THREE.MeshPhongMaterial({
            map: texture
          }),
          new THREE.MeshPhongMaterial(),
          new THREE.MeshPhongMaterial({
            map: textureBase
          })
        ]);
        coneMesh.rotateY(-Math.PI / 2);
        coneMesh.rotateX(-Math.PI / 2);
        cone.add(coneMesh);
        objectArray.push(cone);
        this.wpilibFieldCoordinateGroup.add(cone);
      }

      // Set cone poses
      poseData.forEach((pose, index) => {
        if (!fieldConfig) return;
        let cone = objectArray[index];
        cone.position.set(...pose.position);
        cone.rotation.setFromQuaternion(
          new Quaternion(pose.rotation[1], pose.rotation[2], pose.rotation[3], pose.rotation[0])
        );
      });
    };

    // Update all sets of cones
    updateCones(this.command.poses.green, this.greenCones, this.coneTextureGreen, this.coneTextureGreenBase);
    updateCones(this.command.poses.blue, this.blueCones, this.coneTextureBlue, this.coneTextureBlueBase);
    updateCones(this.command.poses.yellow, this.yellowCones, this.coneTextureYellow, this.coneTextureYellowBase);

    // Render new frame
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width != width || canvas.height != height) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    this.scene.background = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? new THREE.Color("#222222")
      : new THREE.Color("#ffffff");
    this.renderer.setPixelRatio(window.preferences?.threeDimensionMode == "efficiency" ? 1 : window.devicePixelRatio);
    this.renderer.render(this.scene, this.camera);
  }

  /** Converts a rotation sequence to a quaternion. */
  private getQuaternionFromRotSeq(rotations: Config3d_Rotation[]): THREE.Quaternion {
    let quaternion = new THREE.Quaternion();
    rotations.forEach((rotation) => {
      let axis = new THREE.Vector3(0, 0, 0);
      if (rotation.axis == "x") axis.setX(1);
      if (rotation.axis == "y") axis.setY(1);
      if (rotation.axis == "z") axis.setZ(1);
      quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, degreesToRadians(rotation.degrees)));
    });
    return quaternion;
  }
}

export interface Pose3d {
  position: [number, number, number]; // X, Y, Z
  rotation: [number, number, number, number]; // W, X, Y, Z
}
