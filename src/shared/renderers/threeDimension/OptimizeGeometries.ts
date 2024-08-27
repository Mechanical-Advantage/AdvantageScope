import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

export default function optimizeGeometries(
  object: THREE.Object3D,
  mode: "low-power" | "standard" | "cinematic",
  materialSpecular: THREE.Color,
  materialShininess: number
) {
  let normalGeometries: THREE.BufferGeometry[] = [];
  let transparentGeometries: THREE.BufferGeometry[] = [];
  let carpetGeometries: THREE.BufferGeometry[] = [];
  object.traverse((object) => {
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
          if (maxDistance < 0.08) return;
          break;
        case "standard":
          if (maxDistance < 0.04) return;
          break;
        case "cinematic":
          if (maxDistance < 0.02) return;
          break;
      }

      if (mesh.name.toLowerCase().includes("carpet")) {
        carpetGeometries.push(geometry);
      } else if (isTransparent) {
        transparentGeometries.push(geometry);
      } else {
        normalGeometries.push(geometry);
      }
    }
  });

  let group = new THREE.Group();
  if (normalGeometries.length > 0) {
    let normalMesh = new THREE.Mesh(
      BufferGeometryUtils.mergeGeometries(normalGeometries, false),
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
    group.add(normalMesh);
  }
  if (transparentGeometries.length > 0) {
    let transparentMesh = new THREE.Mesh(
      BufferGeometryUtils.mergeGeometries(transparentGeometries, false),
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
    group.add(transparentMesh);
  }
  if (carpetGeometries.length > 0) {
    let carpetMesh = new THREE.Mesh(
      BufferGeometryUtils.mergeGeometries(carpetGeometries, false),
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
    group.add(carpetMesh);
  }
  return group;
}
