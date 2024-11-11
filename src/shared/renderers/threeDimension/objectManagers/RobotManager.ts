import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import WorkerManager from "../../../../hub/WorkerManager";
import { SwerveState } from "../../../geometry";
import { convert } from "../../../units";
import { transformPx } from "../../../util";
import {
  ThreeDimensionRendererCommand_GhostObj,
  ThreeDimensionRendererCommand_RobotObj
} from "../../ThreeDimensionRenderer";
import {
  getQuaternionFromRotSeq,
  quaternionToRotation3d,
  rotation3dToQuaternion
} from "../../ThreeDimensionRendererImpl";
import ObjectManager from "../ObjectManager";
import ResizableInstancedMesh from "../ResizableInstancedMesh";

export default class RobotManager extends ObjectManager<
  ThreeDimensionRendererCommand_RobotObj | ThreeDimensionRendererCommand_GhostObj
> {
  private SWERVE_CANVAS_PX = 2000;
  private SWERVE_CANVAS_METERS = 4;
  private SWERVE_BUMPER_OFFSET = 0.15;

  private loadingStart: () => void;
  private loadingEnd: () => void;

  private meshes: ResizableInstancedMesh[] = [];
  private dimensions: [number, number, number, number] = [0, 0, 0, 0]; // Distance to each side
  private ghostMaterial = new THREE.MeshPhongMaterial({
    transparent: true,
    opacity: 0.35,
    specular: this.materialSpecular,
    shininess: this.materialShininess
  });
  private visionLines: Line2[] = [];
  private mechanismLines: {
    mesh: ResizableInstancedMesh;
    geometry: THREE.BoxGeometry;
    scale: THREE.Vector3;
    translation: THREE.Vector3;
    material: THREE.MeshPhongMaterial;
  }[] = [];

  private swerveContainer = document.createElement("div");
  private swerveCanvas = document.createElement("canvas");
  private swerveTexture = new THREE.CanvasTexture(this.swerveCanvas);

  private loadingCounter = 0;
  private shouldLoadNewModel = false;
  private isLoading = false;
  private dummyConfigPose = new THREE.Object3D();
  private dummyUserPose = new THREE.Group().add(this.dummyConfigPose);
  private dummyRobotPose = new THREE.Group().add(this.dummyUserPose);
  private hasNewAssets = false;
  private lastModel = "";
  private lastColor = "";

  constructor(
    root: THREE.Object3D,
    materialSpecular: THREE.Color,
    materialShininess: number,
    mode: "low-power" | "standard" | "cinematic",
    requestRender: () => void,
    loadingStart: () => void,
    loadingEnd: () => void
  ) {
    super(root, materialSpecular, materialShininess, mode, requestRender);
    this.loadingStart = loadingStart;
    this.loadingEnd = loadingEnd;

    this.swerveContainer.hidden = true;
    this.swerveContainer.appendChild(this.swerveCanvas);
    this.swerveContainer.style.width = this.SWERVE_CANVAS_PX.toString() + "px";
    this.swerveContainer.style.height = this.SWERVE_CANVAS_PX.toString() + "px";
    this.swerveCanvas.width = this.SWERVE_CANVAS_PX;
    this.swerveCanvas.height = this.SWERVE_CANVAS_PX;
    document.body.appendChild(this.swerveContainer);
  }

  dispose(): void {
    this.meshes.forEach((mesh) => {
      mesh.dispose();
    });
    this.mechanismLines.forEach((entry) => {
      entry.mesh.dispose();
    });
    while (this.visionLines.length > 0) {
      this.visionLines[0].geometry.dispose();
      this.visionLines[0].material.dispose();
      this.root.remove(this.visionLines[0]);
      this.visionLines.shift();
    }
    this.swerveTexture.dispose();
  }

  setResolution(resolution: THREE.Vector2) {
    super.setResolution(resolution);
    this.visionLines.forEach((line) => (line.material.resolution = resolution));
  }

  newAssets() {
    this.hasNewAssets = true;
  }

  getModel(): string {
    return this.lastModel;
  }

  setObjectData(object: ThreeDimensionRendererCommand_RobotObj | ThreeDimensionRendererCommand_GhostObj): void {
    let robotConfig = window.assets?.robots.find((robotData) => robotData.name === object.model);

    // Load new robot model
    if (object.model !== this.lastModel || this.hasNewAssets) {
      this.shouldLoadNewModel = true;
      this.lastModel = object.model;
      this.hasNewAssets = false;
    }
    if (this.shouldLoadNewModel && !this.isLoading) {
      this.shouldLoadNewModel = false;
      this.meshes.forEach((mesh) => {
        mesh.dispose();
      });
      this.meshes = [];

      if (robotConfig !== undefined) {
        this.loadingCounter++;
        let loadingCounter = this.loadingCounter;
        this.loadingStart();
        if (this.isLoading) this.loadingEnd();
        this.isLoading = true;
        WorkerManager.request("../bundles/shared$loadRobot.js", {
          robotConfig: robotConfig!,
          mode: this.mode,
          materialSpecular: this.materialSpecular.toArray(),
          materialShininess: this.materialShininess
        }).then((result: THREE.MeshJSON[][]) => {
          if (loadingCounter !== this.loadingCounter) {
            // Model was switched, throw away the data :(
            return;
          }

          const loader = new THREE.ObjectLoader();
          this.meshes = [];
          this.dimensions = [0, 0, 0, 0];

          result.forEach((sceneMeshJSONs, index) => {
            // Load meshes
            let sceneMeshes: THREE.Mesh[] = sceneMeshJSONs.map((json) => loader.parse(json) as THREE.Mesh);
            sceneMeshes.forEach((mesh) => {
              if (index === 0) {
                mesh.geometry.computeBoundingBox();
                let box = mesh.geometry.boundingBox;
                if (box !== null) {
                  this.dimensions[0] = Math.max(this.dimensions[0], box.max.x);
                  this.dimensions[1] = Math.max(this.dimensions[1], box.max.y);
                  this.dimensions[2] = Math.max(this.dimensions[2], -box.min.x);
                  this.dimensions[3] = Math.max(this.dimensions[3], -box.min.y);
                }
              }

              if (object.type === "ghost") {
                if (!Array.isArray(mesh.material)) {
                  mesh.material.dispose();
                }
                mesh.material = this.ghostMaterial;
              }
            });

            // Add swerve mesh
            if (index === 0) {
              let swerveMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(this.SWERVE_CANVAS_METERS, this.SWERVE_CANVAS_METERS).translate(0, 0, 0.1),
                new THREE.MeshPhongMaterial({
                  map: this.swerveTexture,
                  transparent: true,
                  side: THREE.DoubleSide
                })
              );
              swerveMesh.renderOrder = 999;
              swerveMesh.material.depthTest = false;
              swerveMesh.material.transparent = true;
              sceneMeshes.push(swerveMesh);
            }

            let castShadow = new Array(sceneMeshes.length).fill(true);
            castShadow[castShadow.length - 1] = false;
            this.meshes.push(new ResizableInstancedMesh(this.root, sceneMeshes, castShadow));
          });

          this.requestRender();
          this.loadingEnd();
          this.isLoading = false;
        });
      }
    }

    // Update color
    if (object.type === "ghost" && object.color !== this.lastColor) {
      this.lastColor = object.color;
      this.ghostMaterial.color = new THREE.Color(object.color);
    }

    // Update primary model
    if (this.meshes.length > 0) {
      this.meshes[0].setPoses(object.poses.map((x) => x.pose));
    }

    // Update components
    for (let i = 1; i < this.meshes.length; i++) {
      this.meshes[i].setPoses(
        object.poses
          .map((x) => x.pose)
          .map((robotPose) => {
            this.dummyRobotPose.rotation.setFromQuaternion(rotation3dToQuaternion(robotPose.rotation));
            this.dummyRobotPose.position.set(...robotPose.translation);

            let userPose =
              i - 1 < object.components.length && robotConfig !== undefined ? object.components[i - 1].pose : null;
            if (userPose === null) {
              this.dummyUserPose.rotation.set(0, 0, 0);
              this.dummyUserPose.position.set(0, 0, 0);
            } else {
              this.dummyUserPose.rotation.setFromQuaternion(rotation3dToQuaternion(userPose.rotation));
              this.dummyUserPose.position.set(...userPose.translation);
            }

            let configRotations =
              userPose === null ? robotConfig!.rotations : robotConfig!.components[i - 1].zeroedRotations;
            let configPosition =
              userPose === null ? robotConfig!.position : robotConfig!.components[i - 1].zeroedPosition;
            this.dummyConfigPose.rotation.setFromQuaternion(getQuaternionFromRotSeq(configRotations));
            this.dummyConfigPose.position.set(...configPosition);

            return {
              translation: this.dummyConfigPose.getWorldPosition(new THREE.Vector3()).toArray(),
              rotation: quaternionToRotation3d(this.dummyConfigPose.getWorldQuaternion(new THREE.Quaternion()))
            };
          })
      );
    }

    // Update vision lines
    if (object.poses.length === 0) {
      // Remove all lines
      while (this.visionLines.length > 0) {
        this.root.remove(this.visionLines[0]);
        this.visionLines.shift();
      }
    } else {
      while (this.visionLines.length > object.visionTargets.length) {
        // Remove extra lines
        this.visionLines[0].geometry.dispose();
        this.visionLines[0].material.dispose();
        this.root.remove(this.visionLines[0]);
        this.visionLines.shift();
      }
      while (this.visionLines.length < object.visionTargets.length) {
        // Add new lines
        let line = new Line2(
          new LineGeometry(),
          new LineMaterial({
            linewidth: 1,
            resolution: this.resolution
          })
        );
        this.visionLines.push(line);
        this.root.add(line);
      }
      for (let i = 0; i < this.visionLines.length; i++) {
        // Update poses
        let translation = object.visionTargets[i].pose.translation;
        if (object.visionTargets[i].annotation.is2DSource) {
          // 2D targets shouldn't be rendered in the floor
          translation[2] = 0.5;
        }
        this.visionLines[i].geometry.setPositions([
          object.poses[0].pose.translation[0],
          object.poses[0].pose.translation[1],
          object.poses[0].pose.translation[2] + 0.5,
          translation[0],
          translation[1],
          translation[2]
        ]);
        this.visionLines[i].geometry.attributes.position.needsUpdate = true;
        let color = object.visionTargets[i].annotation.visionColor;
        if (color !== undefined) {
          this.visionLines[i].material.color = new THREE.Color(color);
        }
        let size = object.visionTargets[i].annotation.visionSize;
        if (size !== undefined) {
          this.visionLines[i].material.linewidth = size === "bold" ? 3 : 1;
        }
      }
    }

    // Update mechanism
    if (object.mechanism === null) {
      // No mechanism data, remove all meshes
      while (this.mechanismLines.length > 0) {
        this.mechanismLines[0].mesh.dispose(true, object.type === "robot"); // Ghost material is shared, don't dispose
        this.mechanismLines.shift();
      }
    } else {
      // Remove extra lines
      while (this.mechanismLines.length > object.mechanism.lines.length) {
        this.mechanismLines[0].mesh.dispose(true, object.type === "robot"); // Ghost material is shared, don't dispose
        this.mechanismLines.shift();
      }

      // Add new lines
      while (this.mechanismLines.length < object.mechanism.lines.length) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material =
          object.type === "ghost"
            ? this.ghostMaterial
            : new THREE.MeshPhongMaterial({ specular: this.materialSpecular, shininess: this.materialShininess });
        this.mechanismLines.push({
          mesh: new ResizableInstancedMesh(this.root, [{ geometry: geometry, material: material }]),
          geometry: geometry,
          scale: new THREE.Vector3(1, 1, 1),
          translation: new THREE.Vector3(),
          material: material
        });
      }

      // Update children
      for (let i = 0; i < object.mechanism.lines.length; i++) {
        const line = object.mechanism.lines[i];
        const meshEntry = this.mechanismLines[i];

        const length = Math.hypot(line.end[1] - line.start[1], line.end[0] - line.start[0]);
        const angle = Math.atan2(line.end[1] - line.start[1], line.end[0] - line.start[0]);

        // Update length
        const newScale = new THREE.Vector3(length, line.weight * 0.01, line.weight * 0.01);
        const newTranslation = new THREE.Vector3(length / 2, 0, 0);
        const scaleFactor = newScale.clone().divide(meshEntry.scale);
        const translationDelta = newTranslation.clone().sub(meshEntry.translation);
        meshEntry.scale = newScale;
        meshEntry.translation = newTranslation;
        if (!scaleFactor.equals(new THREE.Vector3(1, 1, 1))) {
          meshEntry.geometry.scale(scaleFactor.x, scaleFactor.y, scaleFactor.z);
          meshEntry.geometry.translate(translationDelta.x, translationDelta.y, translationDelta.z);
        }

        // Update color
        if (object.type !== "ghost") {
          meshEntry.material.color = new THREE.Color(line.color);
        }

        // Update pose
        meshEntry.mesh.setPoses(
          object.poses
            .map((x) => x.pose)
            .map((robotPose) => {
              this.dummyRobotPose.rotation.setFromQuaternion(rotation3dToQuaternion(robotPose.rotation));
              this.dummyRobotPose.position.set(...robotPose.translation);

              this.dummyUserPose.position.set(line.start[0] - object.mechanism!.dimensions[0] / 2, 0, line.start[1]);
              this.dummyUserPose.rotation.set(0, -angle, 0);

              return {
                translation: this.dummyUserPose.getWorldPosition(new THREE.Vector3()).toArray(),
                rotation: quaternionToRotation3d(this.dummyUserPose.getWorldQuaternion(new THREE.Quaternion()))
              };
            })
        );
      }
    }

    // Update swerve canvas
    let context = this.swerveCanvas.getContext("2d")!;
    context.clearRect(0, 0, this.SWERVE_CANVAS_PX, this.SWERVE_CANVAS_PX);
    const pxPerMeter = this.SWERVE_CANVAS_PX / this.SWERVE_CANVAS_METERS;
    const moduleX = (Math.min(this.dimensions[0], this.dimensions[2]) - this.SWERVE_BUMPER_OFFSET) * pxPerMeter;
    const moduleY = (Math.min(this.dimensions[1], this.dimensions[3]) - this.SWERVE_BUMPER_OFFSET) * pxPerMeter;
    const centerPx = [this.SWERVE_CANVAS_PX / 2, this.SWERVE_CANVAS_PX / 2];
    (
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1]
      ] as const
    ).forEach((cornerMultipliers, index) => {
      let moduleCenterPx = [
        centerPx[0] + moduleX * cornerMultipliers[0],
        centerPx[1] - moduleY * cornerMultipliers[1]
      ] as [number, number];

      // Draw module data
      let drawModuleData = (state: SwerveState, color: string) => {
        context.lineWidth = 0.03 * pxPerMeter;
        context.strokeStyle = color;
        context.lineCap = "round";
        context.lineJoin = "round";

        // Draw speed
        if (Math.abs(state.speed) <= 0.001) return;
        let vectorSpeed = state.speed / 5;
        let vectorRotation = state.angle;
        if (state.speed < 0) {
          vectorSpeed *= -1;
          vectorRotation += Math.PI;
        }
        if (vectorSpeed < 0.05) return;
        let vectorLength = pxPerMeter * convert(36, "inches", "meters") * vectorSpeed;
        let arrowBack = transformPx(moduleCenterPx, vectorRotation, [0, 0]);
        let arrowFront = transformPx(moduleCenterPx, vectorRotation, [vectorLength, 0]);
        let arrowLeft = transformPx(moduleCenterPx, vectorRotation, [
          vectorLength - pxPerMeter * 0.1,
          pxPerMeter * 0.1
        ]);
        let arrowRight = transformPx(moduleCenterPx, vectorRotation, [
          vectorLength - pxPerMeter * 0.1,
          pxPerMeter * -0.1
        ]);
        context.beginPath();
        context.moveTo(...arrowBack);
        context.lineTo(...arrowFront);
        context.moveTo(...arrowLeft);
        context.lineTo(...arrowFront);
        context.lineTo(...arrowRight);
        context.stroke();
      };
      object.swerveStates.forEach((set) => {
        if (index < set.values.length) {
          drawModuleData(set.values[index], set.color);
        }
      });
    });
    this.swerveTexture.needsUpdate = true;
  }
}
