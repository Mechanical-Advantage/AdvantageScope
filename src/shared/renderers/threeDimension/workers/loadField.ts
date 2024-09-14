import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Config3dField } from "../../../AdvantageScopeAssets";
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

  const fieldConfig: Config3dField = payload.fieldConfig;
  const mode: "cinematic" | "standard" | "low-power" = payload.mode;
  const materialSpecular = new THREE.Color().fromArray(payload.materialSpecular);
  const materialShininess: number = payload.materialShininess;

  let field = new THREE.Object3D();
  let fieldStagedPieces = new THREE.Object3D();
  let fieldPieces: { [key: string]: THREE.Mesh } = {};

  const gltfLoader = new GLTFLoader();
  Promise.all([
    new Promise((resolve) => {
      gltfLoader.load(fieldConfig.path, resolve);
    }),
    ...fieldConfig.gamePieces.map(
      (_, index) =>
        new Promise((resolve) => {
          gltfLoader.load(fieldConfig.path.slice(0, -4) + "_" + index.toString() + ".glb", resolve);
        })
    )
  ]).then(async (gltfs) => {
    let gltfScenes = (gltfs as GLTF[]).map((gltf) => gltf.scene);
    if (fieldConfig === undefined) return;
    let loadCount = 0;
    gltfScenes.forEach(async (scene, index) => {
      // Add to scene
      if (index === 0) {
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

        stagedPieces.rotation.setFromQuaternion(getQuaternionFromRotSeq(fieldConfig.rotations));
        let fieldStagedPiecesMeshes = await optimizeGeometries(
          stagedPieces,
          mode,
          materialSpecular,
          materialShininess,
          false
        );
        fieldStagedPieces = new THREE.Group();
        if (fieldStagedPiecesMeshes.normal !== null) fieldStagedPieces.add(fieldStagedPiecesMeshes.normal);
        if (fieldStagedPiecesMeshes.transparent !== null) fieldStagedPieces.add(fieldStagedPiecesMeshes.transparent);
        if (fieldStagedPiecesMeshes.carpet !== null) fieldStagedPieces.add(fieldStagedPiecesMeshes.carpet);

        scene.rotation.setFromQuaternion(getQuaternionFromRotSeq(fieldConfig.rotations));
        let fieldMeshes = await optimizeGeometries(scene, mode, materialSpecular, materialShininess);
        field = new THREE.Group();
        if (fieldMeshes.normal !== null) field.add(fieldMeshes.normal);
        if (fieldMeshes.transparent !== null) field.add(fieldMeshes.transparent);
        if (fieldMeshes.carpet !== null) field.add(fieldMeshes.carpet);
      } else {
        let gamePieceConfig = fieldConfig.gamePieces[index - 1];
        scene.rotation.setFromQuaternion(getQuaternionFromRotSeq(gamePieceConfig.rotations));
        scene.position.set(...gamePieceConfig.position);
        let mesh = (await optimizeGeometries(scene, mode, materialSpecular, materialShininess, false)).normal;
        if (mesh !== null) {
          fieldPieces[gamePieceConfig.name] = mesh;
        }
      }

      if (++loadCount === gltfScenes.length) {
        let fieldSerialized = field.toJSON();
        let fieldStagedPiecesSerialized = fieldStagedPieces.toJSON();
        let fieldPiecesSerialized: { [key: string]: unknown } = {};
        Object.entries(fieldPieces).forEach(([name, mesh]) => {
          fieldPiecesSerialized[name] = mesh.toJSON();
        });
        let result = {
          field: fieldSerialized,
          fieldStagedPieces: fieldStagedPiecesSerialized,
          fieldPieces: fieldPiecesSerialized
        };
        let transfer = prepareTransfer(result);
        resolve(result, transfer);
      }
    });
  });
};
