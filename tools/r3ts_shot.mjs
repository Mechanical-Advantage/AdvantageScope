// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
process.chdir(fileURLToPath(new URL("../", import.meta.url)));
const OUT = "/Users/jasper/code/telemetry-dashboard/research/mur-voir/screenshots/";
const kids = [];
const sp = (c, a) => {
  const k = spawn(c, a, { stdio: "ignore" });
  kids.push(k);
  return k;
};
const ready = async (u) => {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(u)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(u);
};
let browser;
try {
  sp(process.execPath, [
    "tools/mock-backend/src/main.ts",
    "--port",
    "18191",
    "--seed",
    "1",
    "--stale-test",
    "--sim-clock",
    "--lap-counter"
  ]);
  await ready("http://127.0.0.1:18191/api/v1/catalogue");
  sp(process.execPath, ["tools/lite-serve/main.mjs", "--port", "15909", "--backend", "http://127.0.0.1:18191"]);
  await ready("http://127.0.0.1:15909");
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  await page.goto("http://127.0.0.1:15909");
  const hub = page.frameLocator(".hub-frame");
  await hub.locator(".connect-source").waitFor({ state: "attached" });
  await hub.locator("body").press("Control+k");
  await hub.locator(".connect-source").selectOption("mur");
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + "r3ts_connect_dialog.png" });
  await hub.locator(".connect-confirm").click();
  await hub.locator(".connect-dialog-backdrop").waitFor({ state: "hidden" });
  const frame = page.frames().find((f) => f.url().endsWith("hub.html"));
  await frame.evaluate(() => window.messagePort.onmessage({ data: { name: "trackside-layout" } }));
  await hub.locator(".health-strip").waitFor({ state: "visible" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: OUT + "r3ts_lite_wrapped_menu.png" });
  await page.setViewportSize({ width: 810, height: 800 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + "r3ts_lite_narrow.png" });
  await page.setViewportSize({ width: 1100, height: 800 });
  // Latched fault
  const key = await frame.evaluate(() => window.log.getFieldKeys().find((k) => /motor.?temp/i.test(k)));
  await frame.evaluate((key) => {
    window.healthStrip.state.tiles.push({
      path: key,
      label: "Test fault",
      direction: "high",
      critical: 0,
      latch: true
    });
    window.healthStrip.render();
  }, key);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: OUT + "r3ts_latched_fault.png" });
  await frame.evaluate(() => {
    window.healthStrip.state.tiles = window.healthStrip.state.tiles.filter((t) => t.label !== "Test fault");
    window.healthStrip.latched.clear();
    window.healthStrip.render();
  });
  kids[0].kill();
  await page.waitForTimeout(14000);
  await page.screenshot({ path: OUT + "r3ts_data_lost.png" });
  await hub.locator(".live-pill").click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + "r3ts_popover_pill_lost.png" });
} finally {
  await browser?.close();
  kids.forEach((k) => k.kill());
}
