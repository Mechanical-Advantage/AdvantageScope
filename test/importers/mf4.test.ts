// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { Channel, Conversion, MDF, convert, rawValue, sample, timestamp } from "../../src/hub/dataSources/mf4/MDF";
import { createMDFImporter } from "../../src/hub/dataSources/mf4/MDFImporter";

const fixture = (name: string) => new Uint8Array(fs.readFileSync("test/fixtures/mf4/" + name));
for (const compression of [0, 1, 2])
  test("asammdf decoded values, compression " + compression, () => {
    const m = new MDF(fixture("decoded-" + compression + ".mf4"));
    const expected = JSON.parse(fs.readFileSync("test/fixtures/mf4/expected.json", "utf8"));
    for (const name of ["Speed", "Signed"]) {
      const g = m.groups.find((g) => g.channels.some((c) => c.name === name))!;
      const c = g.channels.find((c) => c.name === name)!;
      assert.deepEqual(
        g.records.map((r) => sample(g, c, r)),
        expected[name].samples
      );
      assert.deepEqual(
        g.records.map((r) => timestamp(g, r)),
        expected[name].timestamps
      );
    }
    const importer = createMDFImporter();
    const log = importer.start([fixture("decoded-" + compression + ".mf4")]);
    importer.decode(["Vehicle/State"]);
    assert.deepEqual(log.getString("Vehicle/State", 0, 2)?.values, ["Idle", "Drive", "Idle"]);
  });

test("bus logging shares candump DBC decode", () => {
  const importer = createMDFImporter();
  const log = importer.start([fixture("bus.mf4")]);
  const key = "INVERTER/INV_MotorSpeedRPM";
  assert.ok(log.getFieldKeys().includes(key));
  assert.equal(log.getNumber(key, 0, 2)?.values.length, 0);
  importer.decode([key]);
  assert.deepEqual(log.getNumber(key, 0, 2)?.values, [1000, 2000, 3000, 4000]);
});

test("conversion functions", () => {
  const c = (type: number, values: number[], labels: string[] = []): Conversion => ({ type, values, labels, unit: "" });
  assert.equal(convert(2, c(1, [3, 4])), 11);
  assert.equal(convert(2, c(2, [1, 2, 3, 0, 0, 1])), 11);
  assert.equal(convert(5, c(4, [0, 10, 10, 30])), 20);
  assert.equal(convert(8, c(5, [0, 10, 10, 30])), 30);
  assert.equal(convert(4, c(6, [0, 5, 11, 99])), 11);
  assert.equal(convert(8, c(6, [0, 5, 11, 99])), 99);
  assert.equal(convert(1, c(7, [0, 1], ["Off", "On", "Other"])), "On");
  assert.equal(convert(3, c(8, [0, 5], ["Low", "Other"])), "Low");
  assert.throws(() => convert(1, c(3, [])), /Unsupported/);
});

test("unaligned signed integer endian decoding and malformed headers", () => {
  const m = new MDF(fixture("decoded-0.mf4"));
  const template = m.groups[0].channels[1];
  for (const type of [0, 1, 2, 3]) {
    const c: Channel = { ...template, type, bits: 12, bit: 3, offset: 0 };
    const bytes = type % 2 === 0 ? new Uint8Array([0xf8, 0x7f]) : new Uint8Array([0x7f, 0xf8]);
    assert.equal(rawValue(bytes, 0, c), type >= 2 ? -1 : 4095);
  }
  const bad = fixture("decoded-0.mf4");
  bad[8] = 51;
  assert.throws(() => new MDF(bad), /3.x/);
  assert.throws(() => new MDF(fixture("decoded-0.mf4").subarray(0, 100)), /Truncated/);
});
