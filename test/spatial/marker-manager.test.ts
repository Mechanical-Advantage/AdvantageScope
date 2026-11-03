// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import * as THREE from "three";
import CloudManager from "../../src/shared/renderers/field3d/objectManagers/CloudManager";
import MarkerManager from "../../src/shared/renderers/field3d/objectManagers/MarkerManager";
import { identity } from "../../src/shared/spatial/Transform";

test("marker primitive updates reuse geometry and materials and preserve cone stripe", () => {
  const root = new THREE.Group();
  const manager = new MarkerManager(root, new THREE.Color(), 0, "standard", () => {});
  const object = {
    type: "marker" as const,
    frameTransform: identity(),
    marker: {
      type: 3,
      shape: "cone",
      pose: identity(),
      scale: { x: 1, y: 2, z: 3 },
      color: { r: 1, g: 0, b: 0, a: 1 }
    }
  };
  manager.setObjectData(object);
  const mesh = root.children[0].children[0] as THREE.Mesh;
  const geometry = mesh.geometry;
  const material = mesh.material;
  object.marker.pose.translation = [4, 5, 6];
  object.marker.color.a = 0.5;
  manager.setObjectData(object);
  assert.equal(root.children[0].children[0], mesh);
  assert.equal(mesh.geometry, geometry);
  assert.equal(mesh.material, material);
  assert.deepEqual(mesh.position.toArray(), [4, 5, 6]);
  assert.equal(mesh.children.length, 1);
  assert.equal((mesh.material as THREE.MeshPhongMaterial).opacity, 0.5);
  manager.dispose();
  assert.equal(root.children.length, 0);
});

test("cloud updates preserve shader and buffers while updating uniforms and scan data", () => {
  const old = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { devicePixelRatio: 2 } });
  const root = new THREE.Group();
  const manager = new CloudManager(root, new THREE.Color(), 0, "standard", () => {});
  try {
    const object = {
      type: "cloud" as const,
      positions: new Float32Array([1, 2, 3]),
      values: new Float32Array([4]),
      colors: null,
      min: 0,
      max: 10,
      transform: identity(),
      size: 3,
      map: "viridis"
    };
    manager.setObjectData(object);
    const points = root.children[0] as THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
    const attribute = points.geometry.getAttribute("position");
    const material = points.material;
    manager.setObjectData(object);
    assert.equal(points.geometry.getAttribute("position"), attribute);
    object.positions = new Float32Array([5, 6, 7]);
    object.size = 4;
    object.map = "turbo";
    manager.setObjectData(object);
    assert.equal(points.material, material);
    assert.equal(points.geometry.getAttribute("position"), attribute);
    assert.deepEqual(Array.from(attribute.array), [5, 6, 7]);
    assert.equal(material.uniforms.pointSize.value, 8);
    assert.equal(material.uniforms.turbo.value, true);
    object.positions = new Float32Array([1, 2, 3, 4, 5, 6]);
    object.values = new Float32Array([1, 2]);
    manager.setObjectData(object);
    assert.equal(points.geometry.getAttribute("pointColor").count, 2);
    assert.equal(points.material, material);
  } finally {
    manager.dispose();
    if (old) Object.defineProperty(globalThis, "window", old);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
