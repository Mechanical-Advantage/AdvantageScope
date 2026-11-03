// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { test } from "node:test";
import { CSVFile } from "../../src/hub/dataSources/csv/CSVFile";
import { decodeCSVText, readRow } from "../../src/hub/dataSources/csv/CSVParser";
import { compareCSV } from "./reference/compareCSV";

const csv =
  '\ufeffTime,Number,Text,Boolean,Empty,Array\r\n2,3,"hello, world",true,,"[1,2]"\r\n1,4,"hello\n雪 ""quoted""",false,,"[3,4]"\r\n1,,last,true,,\r\n0,8,end,false,,"[5,6]"';

test("byte reader matches string rows across UTF-8, UTF-16, quote and line boundaries", async () => {
  const bigEndian = Buffer.from("\ufeff" + csv.slice(1), "utf16le").swap16();
  for (const bytes of [
    new Uint8Array(bigEndian),
    new TextEncoder().encode(csv),
    new Uint8Array(Buffer.from("\ufeff" + csv.slice(1), "utf16le"))
  ]) {
    for (const chunkSize of [8, 16, 32]) {
      const file = new CSVFile(bytes.length, async (offset, length) => bytes.slice(offset, offset + length), chunkSize);
      await file.init();
      const text = decodeCSVText(bytes);
      let bytePos = file.bom,
        charPos = 0;
      while (bytePos < bytes.length) {
        const actual = await file.row(bytePos, ",");
        const expected = readRow(text, charPos, ",");
        assert.deepEqual(readRow(actual.text, 0, ",").fields, expected.fields);
        bytePos = actual.next;
        charPos = expected.next;
      }
      assert.ok(charPos >= text.length);
    }
  }
});

test("disk-backed lazy worker matches the frozen string loader", async () => {
  await compareCSV(csv);
});

test("unterminated quotes report a specific malformed CSV error", async () => {
  const bytes = new TextEncoder().encode('time,value\n0,"unfinished');
  const file = new CSVFile(bytes.length, async (offset, length) => bytes.slice(offset, offset + length), 8);
  await file.init();
  await assert.rejects(file.row(11, ","), /Malformed CSV: unterminated quoted field/);
});
