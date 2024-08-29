import * as THREE from "three";
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
    let geometries = await getGeometries(object, mode, enableSimplification);

    let normalMesh: THREE.Mesh | null = null;
    let transparentMesh: THREE.Mesh | null = null;
    let carpetMesh: THREE.Mesh | null = null;
    if (geometries.normal.length > 0) {
      let geometry = await mergeGeometries(geometries.normal, false);
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
      let geometry = await mergeGeometries(geometries.transparent, false);
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
      let geometry = await mergeGeometries(geometries.carpet, false);
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

async function getGeometries(
  object: THREE.Object3D,
  mode: "low-power" | "standard" | "cinematic",
  enableSimplification = true
): Promise<{ normal: THREE.BufferGeometry[]; transparent: THREE.BufferGeometry[]; carpet: THREE.BufferGeometry[] }> {
  return new Promise((resolve, reject) => {
    let normal: THREE.BufferGeometry[] = [];
    let transparent: THREE.BufferGeometry[] = [];
    let carpet: THREE.BufferGeometry[] = [];

    let totalCount = 0;
    let processedCount = 0;
    object.traverse((object) => {
      totalCount++;

      window.requestIdleCallback(() => {
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
        processedCount++;
        if (processedCount === totalCount) {
          resolve({
            normal: normal,
            transparent: transparent,
            carpet: carpet
          });
        }
      });
    });
  });
}

// CODE BELOW COPIED FROM THREEJS, ADAPTED TO RUN ASYNCHRONOUSLY
// (JAVASCRIPT SOURCE WITH NO TYPES)

/**
 * @param  {Array<BufferGeometry>} geometries
 * @param  {Boolean} useGroups
 * @return {BufferGeometry}
 */
async function mergeGeometries(geometries: THREE.BufferGeometry[], useGroups = false): Promise<THREE.BufferGeometry> {
  return new Promise(async (resolve, reject) => {
    const isIndexed = geometries[0].index !== null;

    const attributesUsed = new Set(Object.keys(geometries[0].attributes));
    const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));

    const attributes: any = {};
    const morphAttributes: any = {};

    const morphTargetsRelative = geometries[0].morphTargetsRelative;

    const mergedGeometry = new THREE.BufferGeometry();

    let offset = 0;

    for (let i = 0; i < geometries.length; ++i) {
      const geometry = geometries[i];
      let attributesCount = 0;

      // ensure that all geometries are indexed, or none

      if (isIndexed !== (geometry.index !== null)) {
        console.error(
          "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
            i +
            ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."
        );
        reject();
      }

      // gather attributes, exit early if they're different

      for (const name in geometry.attributes) {
        if (!attributesUsed.has(name)) {
          console.error(
            "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
              i +
              '. All geometries must have compatible attributes; make sure "' +
              name +
              '" attribute exists among all geometries, or in none of them.'
          );
          reject();
        }

        if (attributes[name] === undefined) attributes[name] = [];

        attributes[name].push(geometry.attributes[name]);

        attributesCount++;
      }

      // ensure geometries have the same number of attributes

      if (attributesCount !== attributesUsed.size) {
        console.error(
          "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
            i +
            ". Make sure all geometries have the same number of attributes."
        );
        reject();
      }

      // gather morph attributes, exit early if they're different

      if (morphTargetsRelative !== geometry.morphTargetsRelative) {
        console.error(
          "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
            i +
            ". .morphTargetsRelative must be consistent throughout all geometries."
        );
        reject();
      }

      for (const name in geometry.morphAttributes) {
        if (!morphAttributesUsed.has(name)) {
          console.error(
            "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
              i +
              ".  .morphAttributes must be consistent throughout all geometries."
          );
          reject();
        }

        if (morphAttributes[name] === undefined) morphAttributes[name] = [];

        morphAttributes[name].push(geometry.morphAttributes[name]);
      }

      if (useGroups) {
        let count;

        if (isIndexed) {
          count = geometry.index!.count;
        } else if (geometry.attributes.position !== undefined) {
          count = geometry.attributes.position.count;
        } else {
          console.error(
            "THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " +
              i +
              ". The geometry must have either an index or a position attribute"
          );
          reject();
        }

        mergedGeometry.addGroup(offset, count!, i);

        offset += count!;
      }
    }

    // merge indices

    if (isIndexed) {
      let indexOffset = 0;
      const mergedIndex = [];

      let deadline: IdleDeadline | null = null;
      for (let i = 0; i < geometries.length; ++i) {
        if (deadline === null || deadline.timeRemaining() < 3) {
          deadline = await new Promise<IdleDeadline>((resolve) => window.requestIdleCallback(resolve));
        }

        const index = geometries[i].index;

        for (let j = 0; j < index!.count; ++j) {
          mergedIndex.push(index!.getX(j) + indexOffset);
        }

        indexOffset += geometries[i].attributes.position.count;
      }

      mergedGeometry.setIndex(mergedIndex);
    }

    // merge attributes

    let deadline: IdleDeadline | null = null;
    for (const name in attributes) {
      if (deadline === null || deadline.timeRemaining() < 3) {
        deadline = await new Promise<IdleDeadline>((resolve) => window.requestIdleCallback(resolve));
      }

      const mergedAttribute = mergeAttributes(attributes[name]);

      if (!mergedAttribute) {
        console.error(
          "THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + name + " attribute."
        );
        reject();
      }

      mergedGeometry.setAttribute(name, mergedAttribute!);
    }

    // merge morph attributes

    for (const name in morphAttributes) {
      const numMorphTargets = morphAttributes[name][0].length;

      if (numMorphTargets === 0) break;

      mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
      mergedGeometry.morphAttributes[name] = [];

      for (let i = 0; i < numMorphTargets; ++i) {
        const morphAttributesToMerge = [];

        for (let j = 0; j < morphAttributes[name].length; ++j) {
          morphAttributesToMerge.push(morphAttributes[name][j][i]);
        }

        const mergedMorphAttribute = mergeAttributes(morphAttributesToMerge);

        if (!mergedMorphAttribute) {
          console.error(
            "THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " +
              name +
              " morphAttribute."
          );
          reject();
        }

        mergedGeometry.morphAttributes[name].push(mergedMorphAttribute!);
      }
    }

    resolve(mergedGeometry);
  });
}

/**
 * @param {Array<BufferAttribute>} attributes
 * @return {BufferAttribute}
 */
function mergeAttributes(attributes: THREE.BufferAttribute[]): THREE.BufferAttribute | null {
  let TypedArray: any;
  let itemSize;
  let normalized;
  let gpuType = -1;
  let arrayLength = 0;

  for (let i = 0; i < attributes.length; ++i) {
    const attribute = attributes[i];

    // if (attribute.isInterleavedBufferAttribute) {
    //   console.error(
    //     "THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."
    //   );
    //   return null;
    // }

    if (TypedArray === undefined) TypedArray = attribute.array.constructor;
    if (TypedArray !== attribute.array.constructor) {
      console.error(
        "THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."
      );
      return null;
    }

    if (itemSize === undefined) itemSize = attribute.itemSize;
    if (itemSize !== attribute.itemSize) {
      console.error(
        "THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."
      );
      return null;
    }

    if (normalized === undefined) normalized = attribute.normalized;
    if (normalized !== attribute.normalized) {
      console.error(
        "THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."
      );
      return null;
    }

    if (gpuType === -1) gpuType = attribute.gpuType;
    if (gpuType !== attribute.gpuType) {
      console.error(
        "THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."
      );
      return null;
    }

    arrayLength += attribute.array.length;
  }

  const array = new TypedArray(arrayLength);
  let offset = 0;

  for (let i = 0; i < attributes.length; ++i) {
    array.set(attributes[i].array, offset);

    offset += attributes[i].array.length;
  }

  const result = new THREE.BufferAttribute(array, itemSize!, normalized);
  if (gpuType !== undefined) {
    // @ts-ignore
    result.gpuType = gpuType;
  }

  return result;
}
