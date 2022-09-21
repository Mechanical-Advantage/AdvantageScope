import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { degreesToRadians, inchesToMeters } from "../units";
import Visualizer from "./Visualizer";

export default class ThreeDimensionVisualizer implements Visualizer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private field: THREE.Object3D | null = null;
  private lastFieldTitle: string = "";
  private robot: THREE.Object3D | null = null;
  private lastRobotTitle: string = "";
  private lastRobotVisible: boolean = false;

  private command: any;

  constructor(content: HTMLElement, canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.scene = new THREE.Scene();

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 6, -12);
    this.camera.lookAt(0, 0.5, 0);

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
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(0, -10, 0);
      this.scene.add(light);
      this.scene.add(light.target);
    }

    // Render loop
    let periodic = () => {
      if (!content.hidden) this.renderFrame();
      window.requestAnimationFrame(periodic);
    };
    window.requestAnimationFrame(periodic);
  }

  render(command: any): number | null {
    this.command = command;
    return null;
  }

  renderFrame() {
    if (!this.command) return;
    let fieldTitle = this.command.options.field;
    let robotTitle = this.command.options.robot;
    let fieldConfig = window.frcData?.field3ds.find((fieldData) => fieldData.title == fieldTitle);
    let robotConfig = window.frcData?.robots.find((robotData) => robotData.title == robotTitle);

    // Add field
    if (fieldTitle != this.lastFieldTitle) {
      this.lastFieldTitle = fieldTitle;
      if (this.field) {
        this.scene.remove(this.field);
      }
      if (fieldConfig) {
        const loader = new GLTFLoader();
        loader.load(fieldConfig.path, (gltf) => {
          this.field = gltf.scene;
          let rotation = new THREE.Quaternion();
          fieldConfig!.rotations.forEach((offsetRotation) => {
            rotation = rotation.premultiply(
              new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(offsetRotation[0], offsetRotation[2], -offsetRotation[1]),
                degreesToRadians(offsetRotation[3])
              )
            );
          });
          this.field.rotation.setFromQuaternion(rotation);
          this.scene.add(this.field);
        });
      }
    }

    // Add robot
    if (robotTitle != this.lastRobotTitle && robotConfig) {
      this.lastRobotTitle = robotTitle;
      if (this.robot && this.lastRobotVisible) {
        this.scene.remove(this.robot);
      }
      this.robot = null;

      const loader = new GLTFLoader();
      loader.load(robotConfig.path, (gltf) => {
        this.robot = gltf.scene;
        if (this.lastRobotVisible) {
          this.scene.add(this.robot);
        }
      });
    }

    // Set robot position
    let robotPose: Pose3d | null = this.command.poses.robot;
    if (this.robot) {
      let robotVisible = fieldConfig != undefined && robotConfig != undefined && robotPose != null;
      if (robotVisible) {
        fieldConfig = fieldConfig!;
        robotConfig = robotConfig!;
        robotPose = robotPose!;

        if (!this.lastRobotVisible) {
          this.scene.add(this.robot);
        }

        let position = [-robotConfig.position[0], robotConfig.position[2], robotConfig.position[1]];
        let rotation = new THREE.Quaternion();
        [
          ...robotConfig.rotations.map((rotation) => [
            rotation[0],
            rotation[1],
            rotation[2],
            degreesToRadians(rotation[3])
          ]),
          robotPose.rotation
        ].forEach((offsetRotation) => {
          // Apply rotation offset
          rotation = rotation.premultiply(
            new THREE.Quaternion().setFromAxisAngle(
              new THREE.Vector3(offsetRotation[0], offsetRotation[2], -offsetRotation[1]),
              offsetRotation[3]
            )
          );

          // Rotate position offset
          let positionQuaternion = new THREE.Quaternion(position[0], position[1], position[2]);
          let rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(offsetRotation[0], offsetRotation[2], -offsetRotation[1]),
            offsetRotation[3]
          );
          let output = new THREE.Quaternion()
            .copy(rotationQuaternion)
            .multiply(new THREE.Quaternion().copy(positionQuaternion))
            .multiply(new THREE.Quaternion().copy(rotationQuaternion).invert());
          position = [output.x, output.y, output.z];
        });
        this.robot.rotation.setFromQuaternion(rotation);

        position[0] -= robotPose.position[0];
        position[1] += robotPose.position[2];
        position[2] += robotPose.position[1];
        position[0] += inchesToMeters(fieldConfig.widthInches!) / 2;
        position[2] -= inchesToMeters(fieldConfig.heightInches!) / 2;
        this.robot.position.set(position[0], position[1], position[2]);
      } else if (this.lastRobotVisible) {
        this.scene.remove(this.robot);
      }
      this.lastRobotVisible = robotVisible;
    }

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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.render(this.scene, this.camera);
  }
}

export interface Pose3d {
  position: [number, number, number];
  rotation: [number, number, number, number];
}
