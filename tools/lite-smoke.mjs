// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
const children = [];
let browser;
function start(command, args, options = {}) {
  const child = spawn(command, args, { stdio: "inherit", ...options });
  children.push(child);
  return child;
}
async function ready(url) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Server did not start: " + url);
}
try {
  if (!process.argv.includes("--skip-build")) {
    const build = start("npm", ["run", "lite-build"]);
    assert.equal((await once(build, "exit"))[0], 0, "Lite build failed");
  }
  const port = Number(process.env.LITE_SMOKE_PORT ?? 15808);
  const mockPort = Number(process.env.LITE_SMOKE_MOCK_PORT ?? 18091);
  start(process.execPath, [
    "tools/mock-backend/src/main.ts",
    "--port",
    String(mockPort),
    "--seed",
    "1",
    "--lap-counter"
  ]);
  await ready(`http://127.0.0.1:${mockPort}/api/v1/catalogue`);
  start(process.execPath, [
    "tools/lite-serve/main.mjs",
    "--port",
    String(port),
    "--backend",
    `http://127.0.0.1:${mockPort}`
  ]);
  await ready(`http://127.0.0.1:${port}`);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}`);
  const hub = page.frameLocator(".hub-frame");
  await hub.locator(".connect-source").waitFor({ state: "attached" });
  await hub.locator("body").press("Control+k");
  await hub.locator(".connect-source").selectOption("mur");
  assert.equal(await hub.locator(".connect-address").inputValue(), `http://127.0.0.1:${port}`);
  await hub.locator(".connect-confirm").click();
  await hub.locator(".connect-dialog-backdrop").waitFor({ state: "hidden" });
  const frame = page.frames().find((frame) => frame.url().endsWith("hub.html"));
  // Check that the live connection imports values.
  await frame
    .waitForFunction(() => {
      const key = window.log.getFieldKeys().find((key) => key.endsWith("/vehicle_speed"));
      return key && window.log.getNumber(key, -Infinity, Infinity)?.values.some(Number.isFinite);
    })
    .catch(async (error) => {
      console.error(await frame.evaluate(() => ({ keys: window.log.getFieldKeys(), text: document.body.innerText })));
      throw error;
    });
  assert.ok(await frame.evaluate(() => window.tabs.saveState().tabs.some((tab) => tab.type === 1)));
  if (process.env.LITE_SCREENSHOTS) await page.screenshot({ path: process.env.LITE_SCREENSHOTS + "/lite_mur.png" });

  await hub.getByText("File", { exact: true }).click();
  const downloading = page.waitForEvent("download");
  await page.getByText("Export Layout…", { exact: true }).click();
  const download = await downloading;
  const layoutPath = await download.path();
  await hub.getByText("File", { exact: true }).click();
  const layoutPicker = page.waitForEvent("filechooser");
  await page.getByText("Import Layout…", { exact: true }).click();
  await (await layoutPicker).setFiles(layoutPath);
  await page.waitForTimeout(500);
  assert.ok(await frame.evaluate(() => window.tabs.saveState().tabs.some((tab) => tab.type === 1)));

  const picking = page.waitForEvent("filechooser");
  await hub.locator("body").press("Control+Shift+o");
  const picker = await picking;
  await picker.setFiles({
    name: "smoke.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("time,Speed [m/s]\n0,1\n1,2\n2,3\n")
  });
  await frame.waitForFunction(() => window.log.getFieldKeys().some((key) => key.includes("Speed")));
  assert.deepEqual(errors, [], "Browser errors");
  console.log("Lite smoke passed: same-host MUR HTTP/WS, live value, graph, layout download/upload, CSV picker.");
} finally {
  await browser?.close();
  for (const child of children.reverse()) if (child.exitCode === null) child.kill("SIGTERM");
  await Promise.all(children.filter((child) => child.exitCode === null).map((child) => once(child, "exit")));
}
