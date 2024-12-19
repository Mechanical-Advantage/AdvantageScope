import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import {
  AdvantageScopeAssets,
  Config3dField,
  DEFAULT_DRIVER_STATIONS,
  STANDARD_FIELD_LENGTH,
  STANDARD_FIELD_WIDTH
} from "../shared/AdvantageScopeAssets";
import { XRCalibrationMode, XRSettings } from "../shared/XRSettings";
import {
  ThreeDimensionRendererCommand,
  ThreeDimensionRendererCommand_AnyObj
} from "../shared/renderers/ThreeDimensionRenderer";
import { disposeObject, getQuaternionFromRotSeq } from "../shared/renderers/ThreeDimensionRendererImpl";
import makeAxesField from "../shared/renderers/threeDimension/AxesField";
import makeEvergreenField from "../shared/renderers/threeDimension/EvergreenField";
import ObjectManager from "../shared/renderers/threeDimension/ObjectManager";
import optimizeGeometries from "../shared/renderers/threeDimension/OptimizeGeometries";
import AprilTagManager from "../shared/renderers/threeDimension/objectManagers/AprilTagManager";
import AxesManager from "../shared/renderers/threeDimension/objectManagers/AxesManager";
import ConeManager from "../shared/renderers/threeDimension/objectManagers/ConeManager";
import GamePieceManager from "../shared/renderers/threeDimension/objectManagers/GamePieceManager";
import HeatmapManager from "../shared/renderers/threeDimension/objectManagers/HeatmapManager";
import RobotManager from "../shared/renderers/threeDimension/objectManagers/RobotManager";
import TrajectoryManager from "../shared/renderers/threeDimension/objectManagers/TrajectoryManager";
import ZebraManager from "../shared/renderers/threeDimension/objectManagers/ZebraManager";
import { convert } from "../shared/units";
import { clampValue, wrapRadians } from "../shared/util";
import XRCamera from "./XRCamera";
import { RaycastResult, XRCameraState } from "./XRTypes";
import { sendHostMessage } from "./xrClient";

export default class XRRenderer {
  private MATERIAL_SPECULAR: THREE.Color = new THREE.Color(0x000000);
  private MATERIAL_SHININESS = 0;

  private canvas: HTMLCanvasElement;
  private spinner: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private flimPass: FilmPass;
  private lastFrameTime = 0;
  private resolution = new THREE.Vector2();

  private lastCalibrationMode: XRCalibrationMode | null = null;
  private lastInvalidRaycast = 0;
  private lastRaycastResult: RaycastResult = { isValid: false };

  private scene: THREE.Scene;
  private camera: XRCamera;
  private ambientLight: THREE.AmbientLight;
  private anchors: THREE.Object3D[] = [];
  private cursor: THREE.Object3D;
  private fieldRoot: THREE.Object3D;
  private fieldSizingReference: THREE.Object3D;
  private wpilibCoordinateGroup: THREE.Object3D;
  private wpilibFieldCoordinateGroup: THREE.Group; // Field coordinates (origin at driver stations and flipped based on alliance)
  private field: THREE.Object3D | null = null;
  private fieldCarpet: THREE.Object3D | null = null;
  private fieldStagedPieces: THREE.Object3D | null = null;
  private fieldPieces: { [key: string]: THREE.Mesh } = {};

  private objectManagers: {
    type: ThreeDimensionRendererCommand_AnyObj["type"];
    manager: ObjectManager<ThreeDimensionRendererCommand_AnyObj>;
    active: boolean;
  }[] = [];

  private primaryRobotModel = "";
  private fieldConfigCache: Config3dField | null = null;
  private robotLoadingCount = 0;
  private shouldLoadNewField = false;
  private isFieldLoading = false;
  private lastFieldTitle: string = "";
  private lastAssetsString: string = "";

  constructor() {
    this.canvas = document.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
    this.spinner = document.getElementsByClassName("spinner-cubes-container")[0] as HTMLElement;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    this.scene = new THREE.Scene();
    this.camera = new XRCamera();
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.flimPass = new FilmPass(1, false);
    this.composer.addPass(this.flimPass);
    this.composer.addPass(new OutputPass());
    this.lastFrameTime = new Date().getTime();

    // Create coordinate groups
    this.fieldRoot = new THREE.Group();
    this.scene.add(this.fieldRoot);
    this.wpilibCoordinateGroup = new THREE.Group();
    this.fieldRoot.add(this.wpilibCoordinateGroup);
    this.wpilibCoordinateGroup.rotateX(-Math.PI / 2);
    this.wpilibFieldCoordinateGroup = new THREE.Group();
    this.wpilibCoordinateGroup.add(this.wpilibFieldCoordinateGroup);

    // Add lights
    {
      this.ambientLight = new THREE.AmbientLight(0xd4d4d4);
      this.scene.add(this.ambientLight);
    }
    {
      const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
      this.scene.add(light);
    }

    // Create cursor
    this.cursor = new THREE.Group();
    this.scene.add(this.cursor);
    this.cursor.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.005, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshPhongMaterial({ color: "yellow" })
      )
    );
    this.cursor.add(
      new THREE.Mesh(
        new THREE.CircleGeometry(0.05, 64),
        new THREE.MeshPhongMaterial({ color: "yellow", transparent: true, opacity: 0.02, side: THREE.DoubleSide })
      ).rotateX(Math.PI / 2)
    );

    // Create field sizing reference
    this.fieldSizingReference = new THREE.Group();
    this.fieldRoot.add(this.fieldSizingReference);
    this.fieldSizingReference.rotateX(-Math.PI / 2);
    let referenceCorners = [
      [-STANDARD_FIELD_LENGTH / 2, -STANDARD_FIELD_WIDTH / 2],
      [-STANDARD_FIELD_LENGTH / 2, STANDARD_FIELD_WIDTH / 2],
      [STANDARD_FIELD_LENGTH / 2, STANDARD_FIELD_WIDTH / 2],
      [STANDARD_FIELD_LENGTH / 2, -STANDARD_FIELD_WIDTH / 2]
    ] as const;
    let referenceColors = ["blue", "white", "red", "white"] as const;
    for (let i = 0; i < 4; i++) {
      this.fieldSizingReference.add(
        new Line2(
          new LineGeometry().setPositions([
            referenceCorners[i][0],
            referenceCorners[i][1],
            0,
            referenceCorners[(i + 1) % 4][0],
            referenceCorners[(i + 1) % 4][1],
            0
          ]),
          new LineMaterial({
            linewidth: 3,
            resolution: this.resolution,
            color: referenceColors[i]
          })
        )
      );
    }
  }

  resetAnchors() {
    while (this.anchors.length > 0) {
      this.scene.remove(this.anchors.pop()!);
    }
  }

  userTap() {
    // Add a new anchor
    if (this.lastRaycastResult.isValid) {
      let anchor = new THREE.Object3D();
      anchor.position.set(...this.lastRaycastResult.position);
      this.scene.add(anchor);
      this.anchors.push(anchor);
    }
  }

  /** Updates the field position based on reference points. */
  private updateFieldRootMiniature(blueReference: THREE.Vector3, redReference: THREE.Vector3) {
    this.fieldRoot.position.copy(blueReference.clone().add(redReference).divideScalar(2));
    let blueToRed = redReference.clone().sub(blueReference);
    let scale = blueToRed.length() / STANDARD_FIELD_LENGTH;
    this.fieldRoot.scale.set(scale, scale, scale);
    this.fieldRoot.rotation.set(0, Math.atan2(blueToRed.x, blueToRed.z) - Math.PI / 2, 0);
  }

  /** Updates the field position based on reference points. */
  private updateFieldRootFullSize(
    isRed: boolean,
    allianceReference1: THREE.Vector3,
    allianceReference2: THREE.Vector3,
    wallReference?: THREE.Vector3
  ) {
    this.fieldRoot.scale.set(1, 1, 1);
    let height = allianceReference1.y;

    let yShift = 0;
    if (wallReference !== undefined) {
      const allianceReference2d = new THREE.Vector2(allianceReference1.z, allianceReference1.x);
      const wallReference2d = new THREE.Vector2(wallReference.z, wallReference.x);
      const allianceWallNormalized = new THREE.Vector2(allianceReference2.z, allianceReference2.x)
        .sub(allianceReference2d)
        .normalize();
      const distance = wallReference2d.clone().sub(allianceReference2d).dot(allianceWallNormalized);
      if (distance > 0) {
        yShift = STANDARD_FIELD_WIDTH / 2 - distance;
      } else {
        yShift = -STANDARD_FIELD_WIDTH / 2 - distance;
      }
    }

    let yaw = Math.atan2(allianceReference2.x - allianceReference1.x, allianceReference2.z - allianceReference1.z);
    if (wallReference !== undefined) {
      let yawToCursor = Math.atan2(wallReference.x - allianceReference1.x, wallReference.z - allianceReference1.z);
      let isFlipped = wrapRadians(yaw - yawToCursor) > 0;
      if (isFlipped) {
        yaw += Math.PI;
        yShift *= -1;
      }
    }
    let centerX =
      allianceReference1.x + Math.sin(yaw + Math.PI / 2) * (STANDARD_FIELD_LENGTH / 2) - Math.sin(yaw) * yShift;
    let centerZ =
      allianceReference1.z + Math.cos(yaw + Math.PI / 2) * (STANDARD_FIELD_LENGTH / 2) - Math.cos(yaw) * yShift;

    this.fieldRoot.position.set(centerX, height, centerZ);
    this.fieldRoot.rotation.set(0, yaw + (isRed ? Math.PI : 0), 0);
  }

  private getFieldConfig(
    command: ThreeDimensionRendererCommand,
    assets: AdvantageScopeAssets | null
  ): Config3dField | null {
    let fieldTitle = command.game;
    if (fieldTitle === "Evergreen") {
      return {
        name: "Evergreen",
        path: "",
        rotations: [],
        widthInches: convert(STANDARD_FIELD_LENGTH, "meters", "inches"),
        heightInches: convert(STANDARD_FIELD_WIDTH, "meters", "inches"),
        defaultOrigin: "auto",
        driverStations: DEFAULT_DRIVER_STATIONS,
        gamePieces: []
      };
    } else if (fieldTitle === "Axes") {
      return {
        name: "Axes",
        path: "",
        rotations: [],
        widthInches: convert(STANDARD_FIELD_LENGTH, "meters", "inches"),
        heightInches: convert(STANDARD_FIELD_WIDTH, "meters", "inches"),
        defaultOrigin: "blue",
        driverStations: DEFAULT_DRIVER_STATIONS,
        gamePieces: []
      };
    } else {
      let fieldConfig = assets?.field3ds.find((fieldData) => fieldData.name === fieldTitle);
      if (fieldConfig === undefined) return null;
      return fieldConfig;
    }
  }

  /** Make a new object manager for the provided type. */
  private makeObjectManager(
    type: ThreeDimensionRendererCommand_AnyObj["type"]
  ): ObjectManager<ThreeDimensionRendererCommand_AnyObj> {
    let args = [
      this.wpilibFieldCoordinateGroup,
      this.MATERIAL_SPECULAR,
      this.MATERIAL_SHININESS,
      "standard",
      () => {}
    ] as const;
    let manager: ObjectManager<ThreeDimensionRendererCommand_AnyObj>;
    switch (type) {
      case "robot":
      case "ghost":
        manager = new RobotManager(
          ...args,
          () => this.robotLoadingCount++,
          () => this.robotLoadingCount--,
          true
        );
        break;
      case "gamePiece":
        manager = new GamePieceManager(...args, this.fieldPieces);
        break;
      case "trajectory":
        manager = new TrajectoryManager(...args);
        break;
      case "heatmap":
        manager = new HeatmapManager(...args, () => this.fieldConfigCache);
        break;
      case "aprilTag":
        manager = new AprilTagManager(...args);
        break;
      case "axes":
        manager = new AxesManager(...args);
        break;
      case "cone":
        manager = new ConeManager(...args);
        break;
      case "zebra":
        manager = new ZebraManager(...args);
        break;
    }
    manager.setResolution(this.resolution);
    return manager;
  }

  /** Draws a new frame based on an updated camera position. */
  render(
    cameraState: XRCameraState,
    settings: XRSettings,
    command: ThreeDimensionRendererCommand,
    assets: AdvantageScopeAssets | null
  ) {
    // Reset anchors when changing calibration mode
    if (settings.calibration !== this.lastCalibrationMode) {
      this.lastCalibrationMode = settings.calibration;
      this.resetAnchors();
    }

    // Update raycast result
    this.lastRaycastResult = cameraState.raycast;
    if (!cameraState.raycast.isValid) {
      this.lastInvalidRaycast = new Date().getTime();
    }
    const raycastUnreliable = new Date().getTime() - this.lastInvalidRaycast < 500;

    // Update calibration
    let calibrationText = "";
    let isCalibrating = false;
    switch (settings.calibration) {
      case XRCalibrationMode.Miniature:
        isCalibrating = this.anchors.length < 2;
        switch (this.anchors.length) {
          case 0:
            calibrationText = "Tap to place the blue alliance wall.";
            this.fieldRoot.visible = false;
            break;
          case 1:
            calibrationText = "Tap to place the red alliance wall.";
            this.fieldRoot.visible = !raycastUnreliable;
            if (this.fieldRoot.visible && cameraState.raycast.isValid) {
              this.updateFieldRootMiniature(
                this.anchors[0].position,
                new THREE.Vector3(...cameraState.raycast.position)
              );
            }
            break;
          default:
            this.fieldRoot.visible = true;
            this.updateFieldRootMiniature(this.anchors[0].position, this.anchors[1].position);
            break;
        }
        break;

      case XRCalibrationMode.FullSizeBlue:
      case XRCalibrationMode.FullSizeRed:
        isCalibrating = this.anchors.length < 3;
        let colorText = settings.calibration === XRCalibrationMode.FullSizeBlue ? "blue" : "red";
        let isRed = settings.calibration === XRCalibrationMode.FullSizeRed;
        switch (this.anchors.length) {
          case 0:
            calibrationText = `Tap to select the base of the ${colorText} alliance wall.`;
            this.fieldRoot.visible = false;
            break;
          case 1:
            calibrationText = `Tap to select another point on the base of the ${colorText} alliance wall, at least 6 feet away from the previous point.`;
            this.fieldRoot.visible = !raycastUnreliable;
            if (this.fieldRoot.visible && cameraState.raycast.isValid) {
              let position1 = this.anchors[0].position;
              let position2 = new THREE.Vector3(...cameraState.raycast.position);
              this.fieldRoot.visible = position1.distanceTo(position2) > convert(6, "inches", "meters");
              if (this.fieldRoot.visible) {
                this.updateFieldRootFullSize(isRed, position1, position2);
              }
            }
            break;
          case 2:
            calibrationText = `Tap to select the base of one of the long field barriers.`;
            this.fieldRoot.visible = !raycastUnreliable;
            if (this.fieldRoot.visible && cameraState.raycast.isValid) {
              this.updateFieldRootFullSize(
                isRed,
                this.anchors[0].position,
                this.anchors[1].position,
                new THREE.Vector3(...cameraState.raycast.position)
              );
            }
            break;
          default:
            this.fieldRoot.visible = true;
            this.updateFieldRootFullSize(
              isRed,
              this.anchors[0].position,
              this.anchors[1].position,
              this.anchors[2].position
            );
            break;
        }
        break;
    }
    if (isCalibrating && raycastUnreliable) {
      calibrationText = "$TRACKING_WARNING"; // Special indicator to display warning about poor tracking
    }
    sendHostMessage("setCalibrationText", calibrationText);

    // Update cursor position
    this.cursor.visible = isCalibrating && !raycastUnreliable && cameraState.raycast.isValid;
    if (cameraState.raycast.isValid) {
      this.cursor.position.set(
        cameraState.raycast.position[0],
        cameraState.raycast.position[1],
        cameraState.raycast.position[2]
      );
    }

    // Update field visibility
    this.fieldSizingReference.visible = isCalibrating;
    this.wpilibCoordinateGroup.visible = !isCalibrating;

    // Get field config
    let fieldTitle = command.game;
    let fieldConfigTmp = this.getFieldConfig(command, assets);
    this.fieldConfigCache = fieldConfigTmp;
    if (fieldConfigTmp === null) return;
    let fieldConfig = fieldConfigTmp;

    // Update field coordinates
    if (fieldConfig) {
      let isBlue = command.origin === "blue";
      this.wpilibFieldCoordinateGroup.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), isBlue ? 0 : Math.PI);
      this.wpilibFieldCoordinateGroup.position.set(
        convert(fieldConfig.widthInches / 2, "inches", "meters") * (isBlue ? -1 : 1),
        convert(fieldConfig.heightInches / 2, "inches", "meters") * (isBlue ? -1 : 1),
        0
      );
    }

    // Update field
    let assetsString = JSON.stringify(assets);
    let newAssets = assetsString !== this.lastAssetsString;
    if (fieldTitle !== this.lastFieldTitle || newAssets) {
      this.shouldLoadNewField = true;
      this.lastFieldTitle = fieldTitle;
      this.lastAssetsString = assetsString;
    }
    if (this.shouldLoadNewField && !this.isFieldLoading) {
      this.shouldLoadNewField = false;

      // Remove old field
      if (this.field) {
        this.wpilibCoordinateGroup.remove(this.field);
        disposeObject(this.field);
      }
      if (this.fieldCarpet) {
        this.wpilibCoordinateGroup.remove(this.fieldCarpet);
        disposeObject(this.fieldCarpet);
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
          if (this.fieldCarpet !== null) this.wpilibCoordinateGroup.add(this.fieldCarpet);
          if (this.fieldStagedPieces !== null) this.wpilibCoordinateGroup.add(this.fieldStagedPieces);
        }

        // Reset game piece objects
        this.objectManagers.filter((entry) => entry.type === "gamePiece").forEach((entry) => entry.manager.dispose());
        this.objectManagers = this.objectManagers.filter((entry) => entry.type !== "gamePiece");
        Object.values(this.fieldPieces).forEach((mesh) => {
          disposeObject(mesh);
        });
        this.fieldPieces = newFieldPieces;
      };

      // Load new field
      if (fieldTitle === "Evergreen") {
        this.isFieldLoading = false;
        let fullField = makeEvergreenField(this.MATERIAL_SPECULAR, this.MATERIAL_SHININESS);
        let carpet = fullField.getObjectByName("carpet")!;
        carpet.removeFromParent();
        this.field = fullField;
        this.fieldCarpet = carpet;
        this.fieldStagedPieces = new THREE.Object3D();
        newFieldReady();
      } else if (fieldTitle === "Axes") {
        this.isFieldLoading = false;
        this.field = makeAxesField(this.MATERIAL_SPECULAR, this.MATERIAL_SHININESS);
        this.fieldCarpet = new THREE.Object3D();
        this.fieldStagedPieces = new THREE.Object3D();
        newFieldReady();
      } else {
        this.isFieldLoading = true;
        const loader = new GLTFLoader();
        const urlTransformer: (path: string) => string = (url) => "/asset?path=" + encodeURIComponent(url);
        Promise.all([
          new Promise((resolve) => {
            loader.load(urlTransformer(fieldConfig.path), resolve);
          }),
          ...fieldConfig.gamePieces.map(
            (_, index) =>
              new Promise((resolve) => {
                loader.load(urlTransformer(fieldConfig.path.slice(0, -4) + "_" + index.toString() + ".glb"), resolve);
              })
          )
        ]).then((gltfs) => {
          let gltfScenes = (gltfs as GLTF[]).map((gltf) => gltf.scene);
          if (fieldConfig === undefined) return;
          gltfScenes.forEach(async (scene, index) => {
            // Apply adjustments
            scene.traverse((node: any) => {
              let mesh = node as THREE.Mesh; // Traverse function returns Object3d or Mesh
              if (mesh.isMesh) {
                // Remove if too small
                let vertices: THREE.Vector3[] = [];
                let center = new THREE.Vector3();
                for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
                  let vertex = new THREE.Vector3(
                    mesh.geometry.attributes.position.getX(i),
                    mesh.geometry.attributes.position.getY(i),
                    mesh.geometry.attributes.position.getZ(i)
                  );
                  vertices.push(vertex);
                  center.add(vertex);
                }
                center.divideScalar(vertices.length);
                let maxRadius = vertices.reduce((prev, vertex) => {
                  let dist = vertex.distanceTo(center);
                  return dist > prev ? dist : prev;
                }, 0);
                if (maxRadius < 0.12) {
                  // Dispose mesh
                  mesh.visible = false;
                  mesh.geometry.dispose();
                  if (mesh.material instanceof THREE.MeshStandardMaterial) {
                    mesh.material.dispose();
                  }
                } else {
                  // Adjust material
                  if (mesh.material instanceof THREE.MeshStandardMaterial) {
                    mesh.material.metalness = 0;
                    mesh.material.roughness = 1;
                  }
                }
              }
            });

            // Add to scene
            if (index === 0) {
              // Separate staged pieces
              let stagedPieces = new THREE.Group();
              fieldConfig.gamePieces.forEach((gamePieceConfig) => {
                gamePieceConfig.stagedObjects.forEach((stagedName) => {
                  let stagedObject = scene.getObjectByName(stagedName);
                  if (stagedObject !== undefined) {
                    let rotation = stagedObject.getWorldQuaternion(new THREE.Quaternion());
                    let position = stagedObject.getWorldPosition(new THREE.Vector3());
                    stagedObject.removeFromParent();
                    stagedObject.rotation.setFromQuaternion(rotation);
                    stagedObject.position.copy(position);
                    stagedPieces.add(stagedObject);
                  }
                });
              });

              // Separate carpet
              let carpet = new THREE.Group();
              scene.traverse((object) => {
                if (object.name.toLowerCase().includes("carpet")) {
                  let rotation = object.getWorldQuaternion(new THREE.Quaternion());
                  let position = object.getWorldPosition(new THREE.Vector3());
                  let objectClone = object.clone(false);
                  object.visible = false;
                  objectClone.rotation.setFromQuaternion(rotation);
                  objectClone.position.copy(position);
                  carpet.add(objectClone);
                }
              });

              // Save components
              scene.rotation.setFromQuaternion(getQuaternionFromRotSeq(fieldConfig.rotations));
              carpet.rotation.setFromQuaternion(getQuaternionFromRotSeq(fieldConfig.rotations));
              stagedPieces.rotation.setFromQuaternion(getQuaternionFromRotSeq(fieldConfig.rotations));
              this.field = scene;
              this.fieldCarpet = carpet;
              this.fieldStagedPieces = stagedPieces;
            } else {
              let gamePieceConfig = fieldConfig.gamePieces[index - 1];
              scene.rotation.setFromQuaternion(getQuaternionFromRotSeq(gamePieceConfig.rotations));
              scene.position.set(...gamePieceConfig.position);
              let meshes = (
                await optimizeGeometries(scene, "standard", this.MATERIAL_SPECULAR, this.MATERIAL_SHININESS, false)
              ).normal;
              if (meshes.length > 0) {
                newFieldPieces[gamePieceConfig.name] = meshes[0];
              }
            }
          });
          newFieldReady();
          this.isFieldLoading = false;
        });
      }
    }

    // Update visible field elements
    if (this.field !== null) this.field.visible = settings.showField;
    if (this.fieldCarpet !== null) this.fieldCarpet.visible = settings.showCarpet;
    if (this.fieldStagedPieces !== null) {
      this.fieldStagedPieces.visible =
        settings.showField && command.objects.every((object) => object.type !== "gamePiece");
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
      if (newAssets && (entry.type === "robot" || entry.type === "ghost")) {
        let robotManager = entry.manager as RobotManager;
        robotManager.setAssetsOverride(assets);
        robotManager.newAssets();
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
            mechanism: null,
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

    // Update spinner
    if ((this.robotLoadingCount > 0 || this.isFieldLoading) && !isCalibrating) {
      this.spinner.classList.add("visible");
      this.spinner.classList.add("animating");
    } else if (this.spinner.classList.contains("visible")) {
      this.spinner.classList.remove("visible");
      window.setTimeout(() => this.spinner.classList.remove("animating"), 250);
    }

    // Update camera position, grain, and lighting
    this.camera.matrixWorldInverse.fromArray(cameraState.camera.worldInverse);
    this.camera.projectionMatrix.fromArray(cameraState.camera.projection);
    // @ts-expect-error
    this.flimPass.uniforms.intensity.value = cameraState.lighting.grain;
    this.ambientLight.intensity = cameraState.lighting.intensity * 0.8;
    this.ambientLight.color = this.temperatureToColor(cameraState.lighting.temperature);

    // Calculate effective device pixel ratio
    // const frameWidthPx = cameraState.frameSize[0];
    // const frameHeightPx = cameraState.frameSize[1];
    const viewWidthPx = this.canvas.parentElement!.clientWidth;
    const viewHeightPx = this.canvas.parentElement!.clientHeight;
    // const viewWidthSubPx = viewWidthPx * window.devicePixelRatio;
    // const viewHeightSubPx = viewHeightPx * window.devicePixelRatio;
    // const isHorizontalCropped = frameWidthPx / frameHeightPx > viewWidthPx / viewHeightPx;
    // const devicePixelRatio =
    //   (isHorizontalCropped ? frameHeightPx / viewHeightSubPx : frameWidthPx / viewWidthSubPx) * 1.5; // Running at a slightly higher resolution improves antialiasing
    const devicePixelRatio = window.devicePixelRatio;

    // Render frame
    if (
      this.canvas.width / devicePixelRatio !== viewWidthPx ||
      this.canvas.height / devicePixelRatio !== viewHeightPx
    ) {
      this.renderer.setPixelRatio(devicePixelRatio);
      this.composer.setPixelRatio(devicePixelRatio);
      this.renderer.setSize(viewWidthPx, viewHeightPx, true);
      this.composer.setSize(viewWidthPx, viewHeightPx);
      this.resolution.set(viewWidthPx, viewHeightPx);
    }
    const now = new Date().getTime();
    this.composer.render((now - this.lastFrameTime) * 1e-3);
    this.lastFrameTime = now;
  }

  private temperatureToColor(temperature: number): THREE.Color {
    // https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html
    let red, green, blue;
    temperature /= 100;
    if (temperature <= 66) {
      red = 255;
    } else {
      red = 329.698727446 * Math.pow(temperature - 60, -0.1332047592);
    }
    if (temperature <= 66) {
      green = 99.4708025861 * Math.log(temperature) - 161.1195681661;
    } else {
      green = 288.1221695283 * Math.pow(temperature - 60, -0.0755148492);
    }
    if (temperature >= 66) {
      blue = 255;
    } else {
      if (temperature <= 19) {
        blue = 0;
      } else {
        blue = 138.5177312231 * Math.log(temperature - 10) - 305.0447927307;
      }
    }
    red = clampValue(red, 0, 255);
    green = clampValue(green, 0, 255);
    blue = clampValue(blue, 0, 255);
    return new THREE.Color(red / 255, green / 255, blue / 255);
  }
}