// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

const ts = createRequire(process.cwd() + "/package.json")("typescript");

function load(headless = true) {
  const calls: unknown[][] = [];
  class BrowserWindow {
    show() {
      throw new Error("native show");
    }
    showInactive() {
      throw new Error("native showInactive");
    }
    hide() {}
    isVisible() {
      return false;
    }
  }
  class Menu {
    items = [{ label: "Edit" }, { label: "Remove" }];
    popup() {
      throw new Error("native popup");
    }
  }
  const electron = {
    BrowserWindow,
    Menu,
    app: { on() {}, setActivationPolicy() {} },
    dialog: {} as any,
    nativeTheme: {},
    shell: {}
  };
  const source = fs.readFileSync("src/main/electron/headless.ts", "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(compiled, {
    exports: {},
    require: () => electron,
    process: { env: { MURVOIR_HEADLESS: headless ? "1" : "0" }, platform: "darwin" },
    console: { log: (...args: unknown[]) => calls.push(args) }
  });
  return { ...electron, calls };
}

test("headless menus log their labels without opening a native popup", () => {
  const { Menu, calls } = load();
  new Menu().popup();
  assert.match(calls.flat().join(" "), /\[headless\] suppressed menu.*Edit.*Remove/);
});

test("normal runs keep native menu popups", () => {
  const { Menu } = load(false);
  assert.throws(() => new Menu().popup(), /native popup/);
});

test("headless visibility follows show, showInactive and hide for each window", () => {
  const { BrowserWindow } = load();
  const satellite = new BrowserWindow();
  const other = new BrowserWindow();
  assert.equal(satellite.isVisible(), false);
  satellite.show();
  assert.equal(satellite.isVisible(), true);
  assert.equal(other.isVisible(), false);
  satellite.hide();
  assert.equal(satellite.isVisible(), false);
  satellite.showInactive();
  assert.equal(satellite.isVisible(), true);
});

test("normal runs keep native window visibility and show methods", () => {
  const { BrowserWindow } = load(false);
  const window = new BrowserWindow();
  assert.equal(window.isVisible(), false);
  assert.throws(() => window.show(), /native show/);
  assert.throws(() => window.showInactive(), /native showInactive/);
});
