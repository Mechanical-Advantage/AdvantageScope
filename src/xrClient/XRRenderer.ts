import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { XRCalibrationMode, XRSettings } from "../shared/XRSettings";
import { ThreeDimensionRendererCommand } from "../shared/renderers/ThreeDimensionRenderer";
import { convert } from "../shared/units";
import { clampValue, wrapRadians } from "../shared/util";
import XRCamera from "./XRCamera";
import { RaycastResult, XRCameraState } from "./XRTypes";
import { sendHostMessage } from "./xrClient";

export default class XRRenderer {
  private FIELD_REF_X_SIZE = convert(54, "feet", "meters");
  private FIELD_REF_Y_SIZE = convert(27, "feet", "meters");

  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private flimPass: FilmPass;
  private lastFrameTime = 0;
  private resolution = new THREE.Vector2();

  private scene: THREE.Scene;
  private camera: XRCamera;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private anchors: THREE.Object3D[] = [];
  private cursor: THREE.Object3D;
  private fieldRoot: THREE.Object3D;
  private fieldCoordinateRoot: THREE.Object3D;
  private fieldSizingReference: THREE.Object3D;

  private lastCalibrationMode: XRCalibrationMode | null = null;
  private lastInvalidRaycast = 0;
  private lastRaycastResult: RaycastResult = { isValid: false };

  constructor() {
    this.canvas = document.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new XRCamera();
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.flimPass = new FilmPass(1, false);
    this.composer.addPass(this.flimPass);
    this.composer.addPass(new OutputPass());
    this.lastFrameTime = new Date().getTime();

    // Create lights
    this.ambientLight = new THREE.AmbientLight(0xd4d4d4);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(1, 1, 1);
    this.scene.add(this.ambientLight, this.directionalLight);

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

    // Create field root
    this.fieldRoot = new THREE.Group();
    this.scene.add(this.fieldRoot);
    this.fieldCoordinateRoot = new THREE.Group();
    this.fieldCoordinateRoot.rotateX(Math.PI / 2);
    this.fieldRoot.add(this.fieldCoordinateRoot);

    // Create field sizing reference
    this.fieldSizingReference = new THREE.Group();
    this.fieldCoordinateRoot.add(this.fieldSizingReference);
    let referenceCorners = [
      [-this.FIELD_REF_X_SIZE / 2, -this.FIELD_REF_Y_SIZE / 2],
      [-this.FIELD_REF_X_SIZE / 2, this.FIELD_REF_Y_SIZE / 2],
      [this.FIELD_REF_X_SIZE / 2, this.FIELD_REF_Y_SIZE / 2],
      [this.FIELD_REF_X_SIZE / 2, -this.FIELD_REF_Y_SIZE / 2]
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

  private updateFieldRootMiniature(blueReference: THREE.Vector3, redReference: THREE.Vector3) {
    this.fieldRoot.position.copy(blueReference.clone().add(redReference).divideScalar(2));
    let blueToRed = redReference.clone().sub(blueReference);
    let scale = blueToRed.length() / this.FIELD_REF_X_SIZE;
    this.fieldRoot.scale.set(scale, scale, scale);
    this.fieldRoot.rotation.set(0, Math.atan2(blueToRed.x, blueToRed.z) - Math.PI / 2, 0);
  }

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
        yShift = this.FIELD_REF_Y_SIZE / 2 - distance;
      } else {
        yShift = -this.FIELD_REF_Y_SIZE / 2 - distance;
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
      allianceReference1.x + Math.sin(yaw + Math.PI / 2) * (this.FIELD_REF_X_SIZE / 2) - Math.sin(yaw) * yShift;
    let centerZ =
      allianceReference1.z + Math.cos(yaw + Math.PI / 2) * (this.FIELD_REF_X_SIZE / 2) - Math.cos(yaw) * yShift;

    this.fieldRoot.position.set(centerX, height, centerZ);
    this.fieldRoot.rotation.set(0, yaw + (isRed ? Math.PI : 0), 0);
  }

  render(cameraState: XRCameraState, settings: XRSettings, command: ThreeDimensionRendererCommand) {
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

    // Update camera position, grain, and lighting
    this.camera.matrixWorldInverse.fromArray(cameraState.camera.worldInverse);
    this.camera.projectionMatrix.fromArray(cameraState.camera.projection);
    // @ts-expect-error
    this.flimPass.uniforms.intensity.value = cameraState.lighting.grain;
    this.ambientLight.intensity = cameraState.lighting.intensity * 0.8;
    this.ambientLight.color = this.temperatureToColor(cameraState.lighting.temperature);

    // Calculate effective device pixel ratio
    const frameWidthPx = cameraState.frameSize[0];
    const frameHeightPx = cameraState.frameSize[1];
    const viewWidthPx = this.canvas.parentElement!.clientWidth;
    const viewHeightPx = this.canvas.parentElement!.clientHeight;
    const viewWidthSubPx = viewWidthPx * window.devicePixelRatio;
    const viewHeightSubPx = viewHeightPx * window.devicePixelRatio;
    const isHorizontalCropped = frameWidthPx / frameHeightPx > viewWidthPx / viewHeightPx;
    const devicePixelRatio =
      (isHorizontalCropped ? frameHeightPx / viewHeightSubPx : frameWidthPx / viewWidthSubPx) * 1.5; // Running at a slightly higher resolution improves antialiasing

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
