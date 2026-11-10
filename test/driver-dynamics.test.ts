// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import CarDynamicsController from "../src/hub/controllers/CarDynamicsController";
import CarDynamicsController_Config from "../src/hub/controllers/CarDynamicsController_Config";
import { numberPreview } from "../src/hub/controllers/DbcFields";
import DriverInputsController from "../src/hub/controllers/DriverInputsController";
import { formatNumericPreview } from "../src/shared/display/NumericPreview";
import Log from "../src/shared/log/Log";
import CarDynamicsRenderer from "../src/shared/renderers/CarDynamicsRenderer";
import DriverInputsRenderer from "../src/shared/renderers/DriverInputsRenderer";
import { SourceListState } from "../src/shared/SourceListConfig";

function controller() {
  const log = new Log();
  (globalThis as any).window = { log, selection: { getRenderTime: () => 2 } };
  const controller = Object.create(CarDynamicsController.prototype) as any;
  let sources: SourceListState = [];
  Object.assign(controller, {
    UUID: "test",
    sourceList: { getState: () => sources, setState: (state: SourceListState) => (sources = state) },
    orientation: 1,
    MAX_SPEED: { value: "100" },
    DAMPER_RANGE: { value: "50" },
    WHEEL_RADIUS: { value: "0.203" },
    STEERING_RATIO: { value: "3.827" },
    SIZE_X: { value: "2" },
    SIZE_Y: { value: "3" }
  });
  const put = (signal: string, value: number) => {
    const slots: Record<string, string> = {
      DASH_SteeringAngle: "steering",
      DASH_SpeedFL: "speedFL",
      DASH_SpeedFR: "speedFR",
      SBG_FRONT_AccelX: "accelX",
      SBG_FRONT_AccelY: "accelY",
      SBG_FRONT_GyroZ: "yawRate"
    };
    if (slots[signal] && !sources.some((s) => s.logKey === signal))
      sources.push({ type: slots[signal], logKey: signal, logType: "Number", visible: true, options: {} });
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
  assert.deepEqual(c.getCommand().moduleVelocities[0].values, [
    { velocity: 0.4, angle: null },
    { velocity: null, angle: null }
  ]);
  assert.equal(c.getCommand().accel, null);
  put("DASH_SteeringAngle", 90);

  assert.deepEqual(c.getCommand().moduleVelocities[0].values, [
    { velocity: 0.4, angle: ((90 / 3.827) * Math.PI) / 180 },
    { velocity: null, angle: ((90 / 3.827) * Math.PI) / 180 }
  ]);
  put("SBG_FRONT_AccelY", 4);
  assert.notEqual(c.getCommand().accel, null);
  c.sourceList.getState = () => [{ type: "accelY", logKey: "SBG_FRONT_AccelY", visible: false }];
  assert.equal(c.getCommand().accel, null);
});

for (const steering of ["unassigned", "hidden"]) {
  test(`wheel speed draws a forward arrow without a direction wedge when steering is ${steering}`, () => {
    const { controller: c, put } = controller();
    put("DASH_SpeedFL", 50);
    if (steering === "hidden") {
      put("DASH_SteeringAngle", 90);
      c.sourceList.getState().find((s: any) => s.type === "steering").visible = false;
    }
    const command = c.getCommand();
    assert.deepEqual(command.moduleVelocities[0]?.values, [
      { velocity: 0.5, angle: null },
      { velocity: null, angle: null }
    ]);
    const { root, calls } = canvas();
    new CarDynamicsRenderer(root).render(command);
    assert.equal(calls.filter((call) => call.name === "fill").length, 0);
    assert.equal(calls.filter((call) => call.name === "stroke").length, 10);
    assert.ok(calls.some((call) => call.name === "lineTo" && call.args[0] === 210 && call.args[1] === 135));
  });
}

function canvas() {
  (globalThis as any).Path2D = class {
    constructor(public path: string) {}
  };
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
    c.restoreState({ maxSpeed: invalid, steeringRatio: invalid, wheelRadius: invalid, sizeX: invalid, sizeY: invalid });
    driver.restoreState({ brakeScale: invalid });
    assert.equal(c.MAX_SPEED.value, "100");
    assert.equal(c.WHEEL_RADIUS.value, "0.203");
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

test("angular wheel speeds produce proportional arrows through the controller and renderer", () => {
  const { controller: c, put } = controller();
  put("DASH_SteeringAngle", 0);
  const log = (globalThis as any).window.log as Log;
  c.MAX_SPEED.value = "120";
  c.SIZE_Y.value = "2";
  c.WHEEL_RADIUS.value = "0.2";
  for (const [slot, value] of [
    ["FL", 63.2],
    ["FR", 69.8]
  ] as const) {
    const key = "wheel_speed_" + slot;
    log.putNumber(key, 1, value);
    log.setMetadataString(key, JSON.stringify({ unit: "rad/s" }));
  }
  c.sourceList.getState = () => [
    { type: "steering", logKey: "DASH_SteeringAngle", visible: true, options: {} },
    { type: "speedFL", logKey: "wheel_speed_FL", visible: true, options: {} },
    { type: "speedFR", logKey: "wheel_speed_FR", visible: true, options: {} }
  ];
  assert.equal(log.getUnit("wheel_speed_FL"), "radians/second");
  const command = c.getCommand();
  const { root, calls } = canvas();
  new CarDynamicsRenderer(root).render(command);
  assert.equal(calls.filter((call) => call.name === "stroke").length, 11, "both wheels draw a speed arrow");
  assert.ok(Math.abs(command.moduleVelocities[0].values[0].velocity! - (12.64 * 3.6) / 120) < 1e-12);
  assert.ok(Math.abs(command.moduleVelocities[0].values[1].velocity! - (13.96 * 3.6) / 120) < 1e-12);
  const lines = calls.filter((call) => call.name === "lineTo");
  for (const speed of [12.64, 13.96]) {
    const length = (600 * 0.25 * speed * 3.6) / 120;
    assert.ok(lines.some((line) => Math.abs(line.args[1] - (210 - 30 - length)) < 1e-9));
  }
});

for (const [unit, value] of [
  ["m/s", 12.64],
  ["km/h", 45.504],
  ["rpm", 603.5155442044711]
] as const) {
  test(`wheel speed in ${unit} normalizes to km/h`, () => {
    const { controller: c, put } = controller();
    put("DASH_SteeringAngle", 0);
    put("DASH_SpeedFL", value);
    (globalThis as any).window.log.setMetadataString(
      "DASH_SpeedFL",
      JSON.stringify({ dbcSignal: "DASH_SpeedFL", unit })
    );
    c.WHEEL_RADIUS.value = "0.2";
    assert.ok(Math.abs(c.getCommand().moduleVelocities[0].values[0].velocity - 0.45504) < 1e-9);
  });
}

test("wheel radius is saved and restored", () => {
  const { controller: c } = controller();
  c.restoreState({ wheelRadius: 0.2 });
  assert.equal(c.WHEEL_RADIUS.value, "0.2");
  assert.equal(c.saveState().wheelRadius, 0.2);
});

test("empty source lists stay empty even when matching DBC signals exist", () => {
  const { controller: c, put } = controller();
  put("DASH_SteeringAngle", 90);
  put("SBG_FRONT_GyroZ", 2);
  c.sourceList.setState([]);
  assert.deepEqual(c.getCommand().moduleVelocities, []);
  assert.deepEqual(c.getCommand().robotVelocities, []);
  assert.equal(c.getCommand().accel, null);
});

test("inverted sources map sensor back, right and down to vehicle forward, left and up", () => {
  const { controller: c, put } = controller();
  put("SBG_FRONT_AccelX", 2);
  put("SBG_FRONT_AccelY", 3);
  put("SBG_FRONT_GyroZ", 0.5);
  put("DASH_SteeringAngle", 30);
  c.sourceList.setState([
    { type: "accelX", logKey: "SBG_FRONT_AccelY", visible: true, options: { invert: "inverted" } },
    { type: "accelY", logKey: "SBG_FRONT_AccelX", visible: true, options: { invert: "inverted" } },
    { type: "yawRate", logKey: "SBG_FRONT_GyroZ", visible: true, options: { invert: "inverted" } },
    { type: "steering", logKey: "DASH_SteeringAngle", visible: true, options: { invert: "inverted" } }
  ]);
  const command = c.getCommand();
  assert.ok(Math.abs(command.accel.x + 3 / 9.80665 / 2) < 1e-9);
  assert.ok(Math.abs(command.accel.y + 2 / 9.80665 / 2) < 1e-9);
  assert.equal(command.robotVelocities[0].value.omega, -0.5);
  assert.ok(command.moduleVelocities[0].values[0].angle < 0);
  c.sourceList.getState().forEach((source: any) => (source.options.invert = "normal"));
  assert.equal(c.getCommand().robotVelocities[0].value.omega, 0.5);
  assert.ok(c.getCommand().accel.x > 0);
});

test("Invert survives controller saveState and restoreState", () => {
  const { controller: c, put } = controller();
  put("SBG_FRONT_GyroZ", 0.5);
  c.sourceList.getState()[0].options.invert = "inverted";
  const saved = JSON.parse(JSON.stringify(c.saveState()));
  c.sourceList.setState([]);
  c.restoreState(saved);
  assert.equal(c.sourceList.getState()[0].options.invert, "inverted");
  assert.equal(c.getCommand().robotVelocities[0].value.omega, -0.5);
  for (const slot of ["steering", "accelX", "accelY", "yawRate"]) {
    assert.deepEqual(
      CarDynamicsController_Config.types.find((t) => t.key === slot)!.options[0].values.map((v) => v.key),
      ["normal", "inverted"]
    );
  }
});

test("Driver Inputs steering Invert survives saveState and restoreState", () => {
  const { put } = controller();
  put("DASH_SteeringAngle", 30);
  const driver = Object.create(DriverInputsController.prototype) as any;
  let sources = [
    {
      type: "steering",
      logKey: "DASH_SteeringAngle",
      logType: "Number",
      visible: true,
      options: { invert: "inverted" }
    }
  ];
  Object.assign(driver, {
    UUID: "test",
    BRAKE_SCALE: { value: "1000" },
    sourceList: { getState: () => sources, setState: (state: any) => (sources = state) }
  });
  const saved = JSON.parse(JSON.stringify(driver.saveState()));
  sources = [];
  driver.restoreState(saved);
  assert.equal(driver.getCommand().steering, -30);
  assert.equal(driver.getCommand().throttle, null);
  assert.equal(driver.saveState().sources[0].options.invert, "inverted");
});

test("invalid setting changes use their own fallback values", () => {
  class Element extends EventTarget {
    value = "";
    style = {};
    classList = { add() {} };
    children: Element[] = [];
    replaceChildren() {
      this.children = [];
    }
    appendChild(child: Element) {
      this.children.push(child);
    }
  }
  const inputs = Object.fromEntries(
    ["damper-range", "max-speed", "wheel-radius", "steering-ratio", "size-x", "size-y", "brake-scale"].map((key) => [
      key,
      new Element()
    ])
  );
  const orientation = new Element();
  orientation.children = [new Element(), new Element()];
  const settings = {
    getElementsByClassName: (name: string) => [name === "orientation-switcher" ? orientation : inputs[name]]
  };
  const root = { firstElementChild: new Element(), getElementsByClassName: () => [settings] };
  const previousDocument = (globalThis as any).document;
  const previousWindow = (globalThis as any).window;
  (globalThis as any).document = { getElementById: () => null, createElement: () => new Element() };
  (globalThis as any).window = Object.assign(new EventTarget(), {
    requestAnimationFrame: () => 0,
    cancelAnimationFrame() {}
  });
  const car = new CarDynamicsController(root as any);
  const driver = new DriverInputsController(root as any);
  assert.equal((car as any).sourceList.getNumberPreview, numberPreview);
  assert.equal((driver as any).sourceList.getNumberPreview, numberPreview);
  try {
    inputs["damper-range"].value = "80";
    inputs["damper-range"].dispatchEvent(new Event("change"));
    for (const invalid of ["0", "-1", "", "NaN", "Infinity"]) {
      for (const input of Object.values(inputs)) {
        input.value = invalid;
        input.dispatchEvent(new Event("change"));
      }
      const saved = car.saveState() as any;
      assert.equal(saved.damperRange, 80);
      assert.equal(saved.steeringRatio, 3.827, `steering ratio after ${invalid}`);
      assert.equal(saved.wheelRadius, 0.203);
      assert.equal(saved.maxSpeed, 0.1);
      assert.equal(saved.sizeX, 0.1);
      assert.equal(saved.sizeY, 0.1);
      assert.equal((driver.saveState() as any).brakeScale, 1000);
    }
  } finally {
    car.dispose();
    driver.dispose();
    (globalThis as any).document = previousDocument;
    (globalThis as any).window = previousWindow;
  }
});

test("damper bars clamp to 50 mm and missing dampers draw no bar", () => {
  const { root, calls } = canvas();
  new CarDynamicsRenderer(root).render({
    rotation: Math.PI / 2,
    frameAspectRatio: 1,
    moduleVelocities: [],
    robotVelocities: [],
    accel: null,
    dampers: [25, 100, -5, null]
  });
  assert.equal(calls.filter((c) => c.name === "strokeRect").length, 3);
  assert.deepEqual(
    calls.filter((c) => c.name === "fillRect").map((c) => c.args.slice(2)),
    [
      [18, 36],
      [18, 72],
      [18, 0]
    ]
  );
});

test("the formula wheel rotates left for positive steering and retains its openings", () => {
  for (const steering of [30, -30]) {
    const { root, calls } = canvas();
    new DriverInputsRenderer(root).render({
      steering,
      throttle: null,
      brakeFront: null,
      brakeRear: null,
      brakeScale: 1000
    });
    assert.equal(calls.find((c) => c.name === "rotate")!.args[0], (-steering * Math.PI) / 180);
    const fill = calls.find((c) => c.name === "fill")!;
    assert.equal(fill.args[1], "evenodd");
    assert.ok(fill.args[0].path.includes("M -36 -55"));
    assert.ok(calls.some((c) => c.name === "fillText" && c.args[0] === steering.toFixed(1) + "°"));
  }
});

test("source previews use Line Graph precision and logged units before Invert", () => {
  const log = new Log();
  log.putNumber("steering", 1, 12.3456789);
  log.setMetadataString("steering", JSON.stringify({ unit: "deg" }));
  (globalThis as any).window = { log, selection: { getTimelineRange: () => [1, 3], getMode: () => 0 } };
  assert.equal(numberPreview("steering", 2), formatNumericPreview(12.3456789, "°"));
  assert.equal(numberPreview("missing", 2), null);
  assert.equal(numberPreview("steering", 0), null);
  assert.equal(formatNumericPreview(2, "rotation", true), "2 rotations");
});

test("source previews retain NaN and respect the graph timeline", () => {
  const log = new Log();
  log.putNumber("value", 1, 5);
  log.putNumber("value", 2, NaN);
  (globalThis as any).window = { log, selection: { getTimelineRange: () => [1, 3], getMode: () => 0 } };
  assert.equal(numberPreview("value", 2), "NaN");
  assert.equal(numberPreview("value", 4), null);
});

test("single-field previews use the graph display unit and enum labels", () => {
  const log = new Log();
  (globalThis as any).window = { log, selection: { getTimelineRange: () => [1, 3], getMode: () => 0 } };
  log.putNumber("angle", 1, 2);
  log.setMetadataString("angle", JSON.stringify({ unit: "rad" }));
  assert.equal(numberPreview("angle", 2), "2 rads");
  log.putNumber("enum", 1, 1);
  log.setMetadataString("enum", JSON.stringify({ enumLabels: { 1: "On" } }));
  assert.equal(numberPreview("enum", 2), "On");
});

test("damper range persists, rejects invalid restores and defaults old layouts to 50", () => {
  const { controller: c } = controller();
  c.restoreState({ damperRange: 80 });
  assert.equal(c.saveState().damperRange, 80);
  assert.equal(c.getCommand().damperRange, 80);
  for (const damperRange of [0, -1, NaN, Infinity, "90", null]) {
    c.restoreState({ damperRange });
    assert.equal(c.saveState().damperRange, 80);
  }
  c.restoreState({ maxSpeed: 120 });
  assert.equal(c.saveState().damperRange, 50);
});

test("the wheel silhouette centre stays fixed through full and multiple turns", () => {
  for (const steering of [0, 90, -90, 180, -180, 450, -450]) {
    const { root, calls } = canvas();
    new DriverInputsRenderer(root).render({
      steering,
      throttle: null,
      brakeFront: null,
      brakeRear: null,
      brakeScale: 1000
    });
    const fillIndex = calls.findIndex((c) => c.name === "fill");
    const transforms = calls.slice(0, fillIndex);
    const translations = transforms.filter((c) => c.name === "translate");
    const localOffset = translations[1]?.args ?? [0, 0];
    // The outer quadratic curves have bounds x = ±116.444444, y = -78..70.
    const centre = [localOffset[0], -4 + localOffset[1]];
    const angle = transforms.find((c) => c.name === "rotate")!.args[0];
    const x = centre[0] * Math.cos(angle) - centre[1] * Math.sin(angle);
    const y = centre[0] * Math.sin(angle) + centre[1] * Math.cos(angle);
    assert.ok(Math.abs(x) < 1e-9 && Math.abs(y) < 1e-9, `centre moved at ${steering} degrees`);
    assert.equal(angle, (-steering * Math.PI) / 180);
  }
});
