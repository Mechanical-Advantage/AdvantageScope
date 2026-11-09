import { strict as assert } from "node:assert";
import { test } from "node:test";
import CarDynamicsController from "../src/hub/controllers/CarDynamicsController";
import { CarDynamicsDefaults } from "../src/hub/controllers/CarDynamicsController_Config";
import { DbcSlotFields } from "../src/hub/controllers/DbcFields";
import Log from "../src/shared/log/Log";
import CarDynamicsRenderer from "../src/shared/renderers/CarDynamicsRenderer";

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
    STEERING_RATIO: { value: "10" },
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
    { velocity: 0.4, angle: Math.PI / 20 },
    { velocity: null, angle: Math.PI / 20 }
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
