// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Config3dField } from "../../../AdvantageScopeAssets";
import { rotationSequenceToQuaternion } from "../../../geometry";
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

        stagedPieces.rotation.setFromQuaternion(rotationSequenceToQuaternion(fieldConfig.rotations));
        stagedPieces.position.set(...fieldConfig.position);
        let fieldStagedPiecesMeshes = await optimizeGeometries(
          stagedPieces,
          mode,
          materialSpecular,
          materialShininess,
          false,
          fieldConfig.isFTC
        );
        fieldStagedPieces = new THREE.Group();
        if (fieldStagedPiecesMeshes.normal.length > 0) fieldStagedPieces.add(fieldStagedPiecesMeshes.normal[0]);
        if (fieldStagedPiecesMeshes.transparent.length > 0)
          fieldStagedPieces.add(fieldStagedPiecesMeshes.transparent[0]);
        if (fieldStagedPiecesMeshes.carpet.length > 0) fieldStagedPieces.add(fieldStagedPiecesMeshes.carpet[0]);

        scene.rotation.setFromQuaternion(rotationSequenceToQuaternion(fieldConfig.rotations));
        scene.position.set(...fieldConfig.position);
        let fieldMeshes = await optimizeGeometries(
          scene,
          mode,
          materialSpecular,
          materialShininess,
          true,
          fieldConfig.isFTC,
          1
        );
        field = new THREE.Group();
        fieldMeshes.carpet.forEach((mesh) => {
          mesh.name = "carpet";
        });
        [...fieldMeshes.normal, ...fieldMeshes.transparent, ...fieldMeshes.carpet].forEach((mesh) => field.add(mesh));
      } else {
        let gamePieceConfig = fieldConfig.gamePieces[index - 1];
        scene.rotation.setFromQuaternion(rotationSequenceToQuaternion(gamePieceConfig.rotations));
        scene.position.set(...gamePieceConfig.position);
        let meshes = (
          await optimizeGeometries(scene, mode, materialSpecular, materialShininess, false, fieldConfig.isFTC)
        ).normal;
        if (meshes.length > 0) {
          fieldPieces[gamePieceConfig.name] = meshes[0];
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
