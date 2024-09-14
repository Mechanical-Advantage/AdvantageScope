import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { disposeObject } from "../ThreeDimensionRendererImpl";

export default async function optimizeGeometries(
  object: THREE.Object3D,
  mode: "low-power" | "standard" | "cinematic",
  materialSpecular: THREE.Color,
  materialShininess: number,
  enableSimplification = true
): Promise<{
  normal: THREE.Mesh | null;
  transparent: THREE.Mesh | null;
  carpet: THREE.Mesh | null;
}> {
  return new Promise(async (resolve) => {
    let geometries = getGeometries(object, mode, enableSimplification);

    let normalMesh: THREE.Mesh | null = null;
    let transparentMesh: THREE.Mesh | null = null;
    let carpetMesh: THREE.Mesh | null = null;
    if (geometries.normal.length > 0) {
      let geometry = BufferGeometryUtils.mergeGeometries(geometries.normal, false);
      if (geometry !== null) {
        normalMesh = new THREE.Mesh(
          geometry,
          new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            specular: materialSpecular,
            shininess: materialShininess
          })
        );
        if (mode === "cinematic") {
          normalMesh.castShadow = true;
          normalMesh.receiveShadow = false;
        }
        normalMesh.name = "normal";
      }
    }
    if (geometries.transparent.length > 0) {
      let geometry = BufferGeometryUtils.mergeGeometries(geometries.transparent, false);
      if (geometry !== null) {
        transparentMesh = new THREE.Mesh(
          geometry,
          new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            specular: materialSpecular,
            shininess: materialShininess,
            transparent: true,
            opacity: 0.2
          })
        );
        if (mode === "cinematic") {
          transparentMesh.castShadow = true;
          transparentMesh.receiveShadow = false;
        }
        transparentMesh.name = "transparent";
      }
    }
    if (geometries.carpet.length > 0) {
      let geometry = BufferGeometryUtils.mergeGeometries(geometries.carpet, false);
      if (geometry !== null) {
        carpetMesh = new THREE.Mesh(
          geometry,
          new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            specular: materialSpecular,
            shininess: 0
          })
        );
        if (mode === "cinematic") {
          carpetMesh.castShadow = false;
          carpetMesh.receiveShadow = true;
        }
        carpetMesh.name = "carpet";
      }
    }

    disposeObject(object);
    resolve({
      normal: normalMesh,
      transparent: transparentMesh,
      carpet: carpetMesh
    });
  });
}

function getGeometries(
  object: THREE.Object3D,
  mode: "low-power" | "standard" | "cinematic",
  enableSimplification = true
): { normal: THREE.BufferGeometry[]; transparent: THREE.BufferGeometry[]; carpet: THREE.BufferGeometry[] } {
  let normal: THREE.BufferGeometry[] = [];
  let transparent: THREE.BufferGeometry[] = [];
  let carpet: THREE.BufferGeometry[] = [];

  let totalCount = 0;
  object.traverse((object) => {
    totalCount++;

    if (object.type === "Mesh") {
      let mesh = object as THREE.Mesh;
      let geometry = mesh.geometry.clone();
      mesh.updateWorldMatrix(true, false);
      geometry.applyMatrix4(mesh.matrixWorld);

      let isTransparent = false;
      if (!Array.isArray(mesh.material)) {
        isTransparent = mesh.material.transparent && mesh.material.opacity < 0.75;
        if ("color" in mesh.material) {
          let rgb = (mesh.material.color as THREE.Color).toArray().map((v) => v * 255);

          const numVerts = geometry.getAttribute("position").count;
          const itemSize = 3; // r, g, b
          const colors = new Uint8Array(itemSize * numVerts);

          colors.forEach((_, ndx) => {
            colors[ndx] = rgb[ndx % 3];
          });

          const normalized = true;
          const colorAttrib = new THREE.BufferAttribute(colors, itemSize, normalized);
          geometry.setAttribute("color", colorAttrib);
        }
      }

      let include = true;
      if (enableSimplification && !mesh.name.includes("NOSIMPLIFY")) {
        let vertices: THREE.Vector3[] = [];
        let center = new THREE.Vector3();
        for (let i = 0; i < geometry.attributes.position.count; i++) {
          let vertex = new THREE.Vector3(
            geometry.attributes.position.getX(i),
            geometry.attributes.position.getY(i),
            geometry.attributes.position.getZ(i)
          );
          vertices.push(vertex);
          center.add(vertex);
        }
        center.divideScalar(vertices.length);
        let maxDistance = vertices.reduce((prev, vertex) => {
          let dist = vertex.distanceTo(center);
          return dist > prev ? dist : prev;
        }, 0);
        switch (mode) {
          case "low-power":
            if (maxDistance < 0.08) include = false;
            break;
          case "standard":
            if (maxDistance < 0.04) include = false;
            break;
          case "cinematic":
            if (maxDistance < 0.02) include = false;
            break;
        }
      }

      if (include) {
        if (mesh.name.toLowerCase().includes("carpet")) {
          carpet.push(geometry);
        } else if (isTransparent) {
          transparent.push(geometry);
        } else {
          normal.push(geometry);
        }
      }
    }
  });

  return {
    normal: normal,
    transparent: transparent,
    carpet: carpet
  };
}
