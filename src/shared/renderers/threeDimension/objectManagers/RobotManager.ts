import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import WorkerManager from "../../../../hub/WorkerManager";
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
  private loadingStart: () => void;
  private loadingEnd: () => void;

  private meshes: ResizableInstancedMesh[] = [];
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
  }

  setResolution(resolution: THREE.Vector2) {
    super.setResolution(resolution);
    this.visionLines.forEach((line) => (line.material.resolution = resolution));
  }

  newAssets() {
    this.hasNewAssets = true;
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

          result.forEach((sceneMeshJSONs) => {
            let sceneMeshes: THREE.Mesh[] = sceneMeshJSONs.map((json) => loader.parse(json) as THREE.Mesh);
            if (object.type === "ghost") {
              sceneMeshes.forEach((mesh) => {
                if (!Array.isArray(mesh.material)) {
                  mesh.material.dispose();
                }
                mesh.material = this.ghostMaterial;
              });
            }
            this.meshes.push(new ResizableInstancedMesh(this.root, sceneMeshes));
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
  }
}
