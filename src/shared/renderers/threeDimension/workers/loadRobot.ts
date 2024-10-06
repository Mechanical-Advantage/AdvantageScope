import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Config3dRobot } from "../../../AdvantageScopeAssets";
import { getQuaternionFromRotSeq } from "../../ThreeDimensionRendererImpl";
import optimizeGeometries from "../OptimizeGeometries";
import { prepareTransfer } from "./prepareTransfer";

self.onmessage = (event) => {
  // WORKER SETUP
  self.onmessage = null;
  let { id, payload } = event.data;
  function resolve(result: any, transfer: Transferable[]) {
    // @ts-expect-error
    self.postMessage({ id: id, payload: result }, transfer);
  }

  // MAIN LOGIC

  const robotConfig: Config3dRobot = payload.robotConfig;
  const mode: "cinematic" | "standard" | "low-power" = payload.mode;
  const materialSpecular = new THREE.Color().fromArray(payload.materialSpecular);
  const materialShininess: number = payload.materialShininess;

  let meshes: THREE.MeshJSON[][] = [];

  const gltfLoader = new GLTFLoader();
  Promise.all([
    new Promise((resolve) => {
      gltfLoader.load(robotConfig.path, resolve);
    }),
    ...robotConfig.components.map(
      (_, index) =>
        new Promise((resolve) => {
          gltfLoader.load(robotConfig.path.slice(0, -4) + "_" + index.toString() + ".glb", resolve);
        })
    )
  ]).then(async (gltfs) => {
    let gltfScenes = (gltfs as GLTF[]).map((gltf) => gltf.scene);
    for (let index = 0; index < gltfScenes.length; index++) {
      let scene = gltfScenes[index];
      if (index === 0) {
        scene.rotation.setFromQuaternion(getQuaternionFromRotSeq(robotConfig!.rotations));
        scene.position.set(...robotConfig!.position);
      }

      let optimized = await optimizeGeometries(scene, mode, materialSpecular, materialShininess);
      let sceneMeshes: THREE.Mesh[] = [];
      if (optimized.normal.length > 0) sceneMeshes.push(optimized.normal[0]);
      if (optimized.transparent.length > 0) sceneMeshes.push(optimized.transparent[0]);
      meshes.push(sceneMeshes.map((mesh) => mesh.toJSON()));
    }

    let transfer = prepareTransfer(meshes);
    resolve(meshes, transfer);
  });
};
