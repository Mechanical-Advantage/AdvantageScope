import * as THREE from "three";
import ManualCamera from "./ManualCamera";
import { XRCameraState } from "./XRTypes";

export default class XRRenderer {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: ManualCamera;

  private boxObject: THREE.Object3D;

  constructor() {
    this.canvas = document.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true });
    this.scene = new THREE.Scene();
    this.camera = new ManualCamera();
    this.camera.position.set(-1, 0.5, 0.5);
    this.camera.lookAt(new THREE.Vector3());

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xaaaaaa));

    this.boxObject = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      new THREE.MeshStandardMaterial({ color: "red" })
    );
    this.scene.add(this.boxObject);
  }

  render(cameraState: XRCameraState) {
    // if (cameraState.hitTest.isValid) {
    //   this.boxObject.matrix.fromArray(cameraState.hitTest.transform);
    //   this.boxObject.updateMatrixWorld();
    //   this.boxObject.scale.set(0.3, 0.3, 0.3);
    // }

    // Update camera position
    this.camera.matrixWorldInverse.fromArray(cameraState.camera.worldInverse);
    this.camera.projectionMatrix.fromArray(cameraState.camera.projection);

    // Render frame
    const devicePixelRatio = window.devicePixelRatio;
    const clientWidth = this.canvas.parentElement!.clientWidth;
    const clientHeight = this.canvas.parentElement!.clientHeight;
    if (
      this.canvas.width / devicePixelRatio !== clientWidth ||
      this.canvas.height / devicePixelRatio !== clientHeight
    ) {
      this.renderer.setSize(clientWidth, clientHeight, false);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
