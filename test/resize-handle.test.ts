// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { attachResizeHandle } from "../src/hub/ResizeHandle";

test("resize handles stop on blur or a move without the primary button", () => {
  const window = new EventTarget();
  const document = { body: { style: { cursor: "initial" } } };
  Object.assign(globalThis, { window, document });
  const handle = new EventTarget();
  let moves = 0;
  const active: boolean[] = [];
  attachResizeHandle(
    handle as HTMLElement,
    "col-resize",
    () => moves++,
    () => {},
    (value) => active.push(value)
  );
  const mouse = (target: EventTarget, type: string, buttons: number) =>
    target.dispatchEvent(Object.assign(new Event(type), { buttons }));
  mouse(handle, "mousedown", 1);
  mouse(window, "mousemove", 1);
  assert.equal(moves, 1);
  window.dispatchEvent(new Event("blur"));
  mouse(window, "mousemove", 0);
  assert.equal(moves, 1);
  assert.equal(document.body.style.cursor, "initial");
  mouse(handle, "mousedown", 1);
  mouse(window, "mousemove", 0);
  assert.equal(moves, 1);
  mouse(handle, "mousedown", 1);
  mouse(window, "mousemove", 1);
  mouse(window, "mouseup", 0);
  mouse(window, "mousemove", 1);
  assert.equal(moves, 2);
  assert.deepEqual(active, [true, false, true, false, true, false]);
});
