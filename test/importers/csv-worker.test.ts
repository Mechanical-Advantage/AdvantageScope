// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";

test("long CSV worker preserves CAN bus identity and raw steering jitter", async () => {
  const messages: any[] = [];
  const worker = { postMessage: (message: any) => messages.push(message), onmessage: undefined as any };
  Object.defineProperty(globalThis, "self", { value: worker, configurable: true });
  try {
    await import("../../src/hub/dataSources/csv/csvWorker");
    const csv =
      "time,signal,value,unit\n" +
      [
        "0,bus0.Dashboard_Dynamics.DASH_SteeringAngle,10,deg",
        "0,bus1.Dashboard_Dynamics.DASH_SteeringAngle,295.3,deg",
        "0.01,bus1.Dashboard_Dynamics.DASH_SteeringAngle,296.4,deg",
        "0.01,bus0.Dashboard_Dynamics.DASH_SteeringAngle,11,deg"
      ].join("\n");
    await worker.onmessage({ data: { type: "start", data: [new TextEncoder().encode(csv)] } });
    const keys = [0, 1].map((bus) => `bus${bus}/Dashboard_Dynamics/DASH_SteeringAngle`);
    const initial = messages.find((m) => m.type === "initial");
    keys.forEach((key) => assert.ok(initial.log.fields[key]));
    for (const key of keys) await worker.onmessage({ data: { type: "parseField", key } });
    await new Promise((resolve) => setTimeout(resolve, 20));
    const fields = messages.filter((m) => m.type === "fields").flatMap((m) => m.fields);
    assert.deepEqual(fields.find((f) => f.key === keys[0]).data.values, [10, 11]);
    assert.deepEqual(fields.find((f) => f.key === keys[1]).data.values, [295.3, 296.4]);
  } finally {
    Reflect.deleteProperty(globalThis, "self");
  }
});
