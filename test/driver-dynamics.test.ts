// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import CarDynamicsController from "../src/hub/controllers/CarDynamicsController";
import { CarDynamicsDefaults } from "../src/hub/controllers/CarDynamicsController_Config";
import { DbcSlotFields } from "../src/hub/controllers/DbcFields";
import DriverInputsController from "../src/hub/controllers/DriverInputsController";
import Log from "../src/shared/log/Log";
import CarDynamicsRenderer from "../src/shared/renderers/CarDynamicsRenderer";
import DriverInputsRenderer from "../src/shared/renderers/DriverInputsRenderer";

function controller() {
  const log = new Log();
  (globalThis as any).window = { log, selection: { getRenderTime: () => 2 } };
  const controller = Object.create(CarDynamicsController.prototype) as any;
  Object.assign(controller, {
    UUID: "test",
    fields: new DbcSlotFields(CarDynamicsDefaults),
    sourceList: { getState: () => [] },
    orientation: 1,
    MAX_SPEED: { value: "100" },
    STEERING_RATIO: { value: "3.827" },
    SIZE_X: { value: "2" },
    SIZE_Y: { value: "3" }
  });
  const put = (signal: string, value: number) => {
    log.putNumber(signal, 1, value);
    log.setMetadataString(signal, JSON.stringify({ dbcSignal: signal }));
  };
  return { controller, put };
}

test("wheel direction requires steering, missing wheel speed stays null, and g dot requires both axes", () => {
  const { controller: c, put } = controller();
  put("DASH_SpeedFL", 40);
  put("DASH_SpeedFR", NaN);
  put("SBG_FRONT_AccelX", 3);
  assert.deepEqual(c.getCommand().moduleVelocities, []);
  assert.equal(c.getCommand().accel, null);
  put("DASH_SteeringAngle", 90);
  c.refresh = () => c.fields.refresh();
  c.refresh();
  assert.deepEqual(c.getCommand().moduleVelocities[0].values, [
    { velocity: 0.4, angle: ((90 / 3.827) * Math.PI) / 180 },
    { velocity: null, angle: ((90 / 3.827) * Math.PI) / 180 }
  ]);
  put("SBG_FRONT_AccelY", 4);
  c.refresh();
  assert.notEqual(c.getCommand().accel, null);
  c.sourceList.getState = () => [{ type: "accelY", logKey: "SBG_FRONT_AccelY", visible: false }];
  assert.equal(c.getCommand().accel, null);
});

function canvas() {
  const calls: { name: string; args: any[] }[] = [];
  const context = new Proxy({} as any, {
    get:
      (_, name: string) =>
      (...args: any[]) => {
        calls.push({ name, args });
      }
  });
  const canvas = { clientWidth: 600, clientHeight: 600, style: {}, getContext: () => context };
  const container = { clientWidth: 600, clientHeight: 600, firstElementChild: canvas };
  const root = { firstElementChild: container, getElementsByTagName: () => [canvas] };
  (globalThis as any).window = { matchMedia: () => ({ matches: false }), devicePixelRatio: 1 };
  return { root: root as any, calls, context };
}

test("a missing wheel speed draws its direction but no speed arrow", () => {
  const { root, calls } = canvas();
  new CarDynamicsRenderer(root).render({
    rotation: 0,
    frameAspectRatio: 1,
    moduleVelocities: [{ values: [{ angle: 0, velocity: null }], color: "red" }],
    robotVelocities: [],
    accel: null,
    dampers: []
  });
  assert.ok(calls.every((c) => c.args.every((v) => typeof v !== "number" || Number.isFinite(v))));
  assert.equal(calls.filter((c) => c.name === "stroke").length, 9);
  assert.equal(calls.filter((c) => c.name === "fill").length, 1);
});

test("restoring invalid scales and dimensions preserves the current defaults", () => {
  const { controller: c } = controller();
  const driver = Object.create(DriverInputsController.prototype) as any;
  driver.BRAKE_SCALE = { value: "1000" };
  for (const invalid of [0, -1, NaN, Infinity, -Infinity, "12", null]) {
    c.restoreState({ maxSpeed: invalid, steeringRatio: invalid, sizeX: invalid, sizeY: invalid });
    driver.restoreState({ brakeScale: invalid });
    assert.equal(c.MAX_SPEED.value, "100");
    assert.equal(c.STEERING_RATIO.value, "3.827");
    assert.equal(c.SIZE_X.value, "2");
    assert.equal(c.SIZE_Y.value, "3");
    assert.equal(driver.BRAKE_SCALE.value, "1000");
  }
  c.restoreState({ maxSpeed: 50, steeringRatio: 5, sizeX: 1, sizeY: 2 });
  driver.restoreState({ brakeScale: 1000 });
  assert.equal(c.getCommand().frameAspectRatio, 2);
  assert.equal(driver.BRAKE_SCALE.value, "1000");
});

for (const Renderer of [CarDynamicsRenderer, DriverInputsRenderer]) {
  test(`${Renderer.name} retries a frame after a canvas error`, () => {
    const { root } = canvas();
    const canvasElement = root.firstElementChild.firstElementChild;
    let attempts = 0;
    const original = canvasElement.getContext;
    const context = original();
    canvasElement.getContext = () =>
      new Proxy(context, {
        get: (target, name) =>
          name === "clearRect"
            ? () => {
                attempts++;
                if (attempts === 1) throw new Error("canvas failed once");
              }
            : target[name]
      });
    const renderer = new Renderer(root);
    const command: any =
      Renderer === CarDynamicsRenderer
        ? {
            rotation: 0,
            frameAspectRatio: 1,
            moduleVelocities: [],
            robotVelocities: [],
            accel: null,
            dampers: []
          }
        : { steering: null, throttle: null, brakeFront: null, brakeRear: null, brakeScale: 1000 };
    assert.throws(() => renderer.render(command), /canvas failed once/);
    renderer.render(command);
    assert.equal(attempts, 2);
    renderer.render(command);
    assert.equal(attempts, 2);
  });
}

for (const Renderer of [CarDynamicsRenderer, DriverInputsRenderer]) {
  test(`${Renderer.name} redraws A after B clears the canvas and fails`, () => {
    const { root, context } = canvas();
    let attempts = 0;
    let fail = false;
    const canvasElement = root.firstElementChild.firstElementChild;
    canvasElement.getContext = () =>
      new Proxy(context, {
        get: (target, name) =>
          name === "clearRect"
            ? () => {
                attempts++;
                if (fail) throw new Error("draw failed");
              }
            : target[name]
      });
    const renderer = new Renderer(root);
    const a: any =
      Renderer === CarDynamicsRenderer
        ? { rotation: 0, frameAspectRatio: 1, moduleVelocities: [], robotVelocities: [], accel: null, dampers: [] }
        : { steering: 0, throttle: 20, brakeFront: null, brakeRear: null, brakeScale: 1000 };
    renderer.render(a);
    fail = true;
    const b = Renderer === CarDynamicsRenderer ? { ...a, rotation: 1 } : { ...a, throttle: 30 };
    assert.throws(() => renderer.render(b), /draw failed/);
    fail = false;
    renderer.render(a);
    assert.equal(attempts, 3);
    renderer.render(a);
    assert.equal(attempts, 3);
  });
}
