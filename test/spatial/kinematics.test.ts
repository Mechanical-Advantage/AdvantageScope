// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { TFTree } from "../../src/shared/spatial/TFTree";
import { compose, identity, invert, quatFromRPY } from "../../src/shared/spatial/Transform";
import { computeLinkPoses, parseURDF } from "../../src/shared/spatial/URDF";

const xml = `<robot name="car"><link name="base"/><link name="wheel"/><joint name="wheel_joint" type="continuous"><parent link="base"/><child link="wheel"/><origin xyz="1 2 3"/><axis xyz="0 1 0"/></joint></robot>`;
test("URDF origins and JointState drive link poses", () => {
  const robot = parseURDF(xml);
  const result = computeLinkPoses(robot, { wheel_joint: Math.PI }, identity());
  assert.deepEqual(result.links.wheel.translation, [1, 2, 3]);
  assert.ok(Math.abs(result.links.wheel.rotation[2] - 1) < 1e-9);
  assert.equal(result.jointSources.wheel_joint, "joint_state");
  assert.equal(computeLinkPoses(robot, {}, identity()).jointSources.wheel_joint, "default");
});
test("malformed disconnected robots are rejected", () => {
  assert.throws(() => parseURDF(`<robot><link name="a"/><link name="b"/></robot>`));
  assert.throws(() => parseURDF(xml.replace('link="wheel"', 'link="missing"')));
});
test("rigid transform inverse preserves translated rotated points", () => {
  const t = { translation: [1, 2, 3] as [number, number, number], rotation: quatFromRPY(0.2, 0.4, 1) };
  const result = compose(t, invert(t));
  result.translation.forEach((v) => assert.ok(Math.abs(v) < 1e-9));
});
test("TF resolves interpolated chains, rejects cycles, reports missing and extrapolated frames", () => {
  const tree = new TFTree(0);
  tree.addTransform("map", "base", 0, identity());
  tree.addTransform("map", "base", 2, { ...identity(), translation: [2, 0, 0] });
  tree.addTransform("base", "lidar", 0, { ...identity(), translation: [0, 0, 1] }, true);
  const result = tree.lookup("map", "lidar", 1);
  assert.equal(result.status, "ok");
  if (result.status === "ok") assert.deepEqual(result.transform.translation, [1, 0, 1]);
  assert.equal(tree.lookup("map", "lidar", 3).status, "extrapolated");
  assert.equal(tree.lookup("map", "missing", 1).status, "unknown-frame");
  tree.addTransform("lidar", "map", 0, identity());
  assert.equal(tree.getParent("map"), null);
  tree.clear();
  assert.deepEqual(tree.getFrames(), []);
});
