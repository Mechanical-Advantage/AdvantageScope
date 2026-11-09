import assert from "node:assert/strict";
import test from "node:test";
import LineGraphController from "../src/hub/controllers/LineGraphController";

test("legacy graph threshold and override keys are ignored while lap mode and sources load", () => {
  const controller = Object.create(LineGraphController.prototype) as any;
  const sources = [{ logKey: "speed", visible: true, type: "stepped", options: { color: "#fff" } }];
  let restored: unknown;
  controller.leftSourceList = { setState: (state: unknown) => (restored = state), getState: () => sources };
  controller.rightSourceList = controller.discreteSourceList = { getState: () => [] };
  controller.lapSelect = { value: "time" };
  controller.updateAxisLabels = () => {};
  controller.restoreState(
    JSON.parse(
      JSON.stringify({
        showThresholds: true,
        thresholds: [{ value: 50 }],
        overrides: { speed: { unit: "mph" } },
        channelProfiles: { speed: { precision: 9 } },
        lapMode: "lapTime",
        leftSources: sources
      })
    )
  );
  assert.deepEqual(restored, sources);
  assert.equal(controller.lapSelect.value, "lapTime");
  const saved = controller.saveState();
  assert.equal(saved.lapMode, "lapTime");
  for (const key of ["showThresholds", "thresholds", "overrides", "channelProfiles"]) {
    assert.equal(key in saved, false, key);
    assert.equal(Object.hasOwn(controller, key), false, key);
  }
});
