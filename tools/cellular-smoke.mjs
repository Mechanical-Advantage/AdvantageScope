// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { _electron } from "playwright";
import { startServer } from "./mock-backend/src/server.ts";

const { values: opts } = parseArgs({
  options: {
    executable: { type: "string" },
    "soak-seconds": { type: "string", default: "0" },
    "retention-seconds": { type: "string", default: "1200" },
    out: { type: "string", default: ".screenshots/cellular" }
  }
});
const soakSeconds = Number(opts["soak-seconds"]);
const retentionSeconds = Number(opts["retention-seconds"]);
assert.ok(Number.isFinite(soakSeconds) && soakSeconds >= 0 && soakSeconds <= 3600);
assert.ok(Number.isFinite(retentionSeconds) && retentionSeconds >= 30);
process.chdir(fileURLToPath(new URL("../", import.meta.url)));
const out = path.resolve(opts.out);
fs.mkdirSync(out, { recursive: true });
const userData = fs.mkdtempSync(path.join(os.tmpdir(), "mur-cellular-"));
fs.writeFileSync(path.join(userData, "prefs.json"), JSON.stringify({ theme: "dark", liveDiscard: retentionSeconds }));
let backend;
let app;
const errors = [];
const sent = [];
const history = [];
try {
  backend = await startServer({
    port: 0,
    host: "127.0.0.1",
    quiet: true,
    lapCounter: true,
    duplicate: true,
    startTimeNs: BigInt(Date.now() - 310000) * 1000000n
  });
  backend.backend.advance(31000);
  const port = backend.port;
  const address = `http://127.0.0.1:${port}`;
  const env = { ...process.env, MURVOIR_HEADLESS: "1", MURVOIR_USER_DATA: userData };
  delete env.ELECTRON_RUN_AS_NODE;
  app = await _electron.launch({
    ...(opts.executable ? { executablePath: path.resolve(opts.executable) } : {}),
    args: [...(process.platform === "linux" ? ["--no-sandbox"] : []), ...(opts.executable ? [] : ["bundles/main.js"])],
    env
  });
  app.process().stdout.on("data", (data) => {
    for (const line of String(data).split("\n")) if (line.startsWith("[headless]")) errors.push(line);
  });
  app.process().stderr.on("data", (data) => fs.appendFileSync(path.join(out, "electron.log"), data));
  app.process().on("exit", (code, signal) => console.log(JSON.stringify({ appExit: { code, signal } })));
  app.on("window", (page) => page.on("pageerror", (error) => errors.push(error.message)));
  let hub;
  for (let attempt = 0; attempt < 200; attempt++) {
    hub = app.windows().find((page) => page.url().endsWith("/hub.html"));
    if (hub) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(hub, "The hub opens");
  hub.on("pageerror", (error) => errors.push(error.message));
  hub.setDefaultTimeout(20000);
  await hub.emulateMedia({ colorScheme: "dark" });
  await hub.waitForFunction(() => window.messagePort && window.preferences);
  await app.evaluate(({ BrowserWindow }) => {
    for (const window of BrowserWindow.getAllWindows())
      if (window.webContents.getURL().endsWith("/hub.html")) window.setContentSize(1400, 900);
  });
  const cdp = await hub.context().newCDPSession(hub);
  await cdp.send("Network.enable");
  cdp.on("Network.webSocketFrameSent", ({ response }) => {
    try {
      sent.push(JSON.parse(response.payloadData));
    } catch {}
  });
  hub.on("request", (request) => {
    if (request.url().includes("/api/v1/history?")) history.push(request.url());
  });
  const send = (name, data) =>
    hub.evaluate(([name, data]) => window.messagePort.onmessage({ data: { name, data } }), [name, data]);
  await send("show-connect-dialog");
  await hub.locator(".connect-source").selectOption("mur");
  await hub.locator(".connect-address").fill(address);
  await hub.locator(".connect-confirm").click();
  await hub.locator(".connect-dialog-backdrop").waitFor({ state: "hidden" });
  await hub.waitForFunction(() => window.liveStatus?.getLiveStatus().backend === "connected");
  const speed = "/vehicles/mur27/dynamics/vehicle_speed";
  await hub.evaluate((key) => {
    const tab = window.tabs.tabList.find((tab) => tab.type === 1);
    const state = tab.controller.saveState();
    state.leftSources = [
      { type: "stepped", logKey: key, logType: "Number", visible: true, options: { color: "#ee9d5b", size: "normal" } }
    ];
    tab.controller.restoreState(state);
    window.tabs.setSelected(window.tabs.tabList.indexOf(tab));
  }, speed);
  await hub.waitForFunction((key) => {
    const data = window.log.getNumber(key, -Infinity, Infinity);
    return data && data.timestamps.at(-1) - data.timestamps[0] >= 295;
  }, speed);
  assert.ok(sent.some((op) => op.op === "subscribe" && op.paths.includes(speed.slice(1))));
  assert.ok(history.some((url) => new URL(url).searchParams.get("path") === speed.slice(1)));

  // Stop the backend to exercise failed retries, then restart it on the same address with a new epoch.
  await backend.close();
  backend = undefined;
  await hub.waitForFunction(() => window.liveStatus?.getLiveStatus().backend !== "connected");
  await hub.waitForTimeout(2200);
  const before = await hub.evaluate((key) => window.log.getNumber(key, -Infinity, Infinity).timestamps.at(-1), speed);
  assert.equal(await hub.evaluate(() => document.querySelector(".connect-dialog-backdrop").hidden), true);
  const helloCount = sent.filter((op) => op.op === "hello").length;
  const historyCount = history.length;
  backend = await startServer({ port, host: "127.0.0.1", quiet: true, lapCounter: true, duplicate: true });
  await hub.waitForFunction(() => window.liveStatus?.getLiveStatus().backend === "connected");
  await hub.waitForFunction(
    ({ key, before }) => window.log.getNumber(key, -Infinity, Infinity)?.timestamps.at(-1) > before,
    { key: speed, before }
  );
  assert.ok(sent.filter((op) => op.op === "hello").length > helloCount, "Reconnect repeats hello");
  assert.ok(history.length > historyCount, "Reconnect refetches history");
  assert.ok(
    (await hub.evaluate(
      ({ key, before }) =>
        window.log.getNumber(key, -Infinity, Infinity).timestamps.find((time) => time > before) - before,
      { key: speed, before }
    )) > 1,
    "The outage remains a gap in the recorded timestamps"
  );
  assert.equal(
    await hub.evaluate((key) => {
      const timestamps = window.log.getNumber(key, -Infinity, Infinity).timestamps;
      return timestamps.length === new Set(timestamps).size;
    }, speed),
    true,
    "History, duplicate links and live data merge without duplicate points"
  );

  // Replacing and removing a graph must update actual wire subscriptions.
  await hub.evaluate(() => {
    window.tabs.tabList.find((tab) => tab.type === 1).controller.restoreState({ leftSources: [] });
    for (const tab of window.tabs.tabList.filter((tab) => tab.type === 13 || tab.type === 14))
      window.tabs.close(window.tabs.tabList.indexOf(tab));
  });
  await hub.waitForFunction((key) => !window.liveStatus.subscribedPaths.includes(key.slice(1)), speed);
  assert.ok(
    sent.some((op) => op.op === "unsubscribe" || (op.op === "subscribe" && !op.paths.includes(speed.slice(1))))
  );

  const tabs = await hub.evaluate((key) => {
    const find = (name) => window.log.getFieldKeys().find((key) => key.endsWith("/" + name));
    const source = (type, logKey) => ({ type, logKey, logType: "Number", visible: true, options: {} });
    window.tabs.addTab(15);
    const tile = window.tabs.tabList.find((tab) => tab.type === 15);
    tile.controller.restoreState({ sources: [{ ...source("tile", key), options: { showInGraph: "true" } }] });
    window.tabs.addTab(16);
    window.tabs.tabList
      .find((tab) => tab.type === 16)
      .controller.restoreState({
        sources: [source("steering", find("steering_angle")), source("throttle", find("throttle"))]
      });
    window.tabs.addTab(17);
    window.tabs.tabList
      .find((tab) => tab.type === 17)
      .controller.restoreState({
        sources: [source("steering", find("steering_angle")), source("speedFL", find("wheel_speed_fl"))]
      });
    window.tabs.addTab(13);
    window.tabs.tabList.find((tab) => tab.type === 13).controller.restoreState({ view: "split" });
    const state = window.tabs.saveState();
    window.tabs.restoreState(state);
    return window.tabs.saveState().tabs.map((tab) => tab.type);
  }, speed);
  for (const type of [13, 15, 16, 17]) assert.ok(tabs.includes(type), `Tab ${type} survives a saved layout`);
  for (const type of [13, 15, 16, 17]) {
    await hub.evaluate(
      (type) => window.tabs.setSelected(window.tabs.tabList.findIndex((tab) => tab.type === type)),
      type
    );
    await hub.waitForTimeout(600);
    await hub.screenshot({ path: path.join(out, `tab-${type}.png`) });
  }
  await hub.evaluate(() => {
    window.tabs.setSelected(window.tabs.tabList.findIndex((tab) => tab.type === 15));
    window.__releaseTasks = [];
    window.__releaseObserver = new PerformanceObserver((list) => {
      window.__releaseTasks.push(...list.getEntries().map((entry) => entry.duration));
    });
    window.__releaseObserver.observe({ type: "longtask" });
  });
  const measurements = [];
  for (let elapsed = 0; elapsed < soakSeconds; ) {
    const seconds = Math.min(30, soakSeconds - elapsed);
    await hub.waitForTimeout(seconds * 1000);
    elapsed += seconds;
    const row = await hub.evaluate(() => {
      const result = window.tabs.tabList.find((tab) => tab.type === 13).controller.getCommand().result;
      return {
        end: window.log.getTimestampRange()[1],
        start: window.log.getTimestampRange()[0],
        lapStart: result.samples[0]?.t,
        tasks: window.__releaseTasks.splice(0),
        backend: window.liveStatus.getLiveStatus().backend
      };
    });
    assert.equal(row.backend, "connected");
    if (row.lapStart !== undefined)
      assert.ok(row.lapStart >= row.start - 31, "Lap context stays bounded after retention");
    measurements.push({ elapsed, ...row });
    console.log(
      JSON.stringify({ elapsed, end: row.end, longTasks: row.tasks.length, maxTaskMs: Math.max(0, ...row.tasks) })
    );
  }
  if (soakSeconds >= 120) {
    const tail = measurements.filter((row) => row.elapsed > soakSeconds - 300);
    assert.ok(
      tail.reduce((count, row) => count + row.tasks.length, 0) <= Math.ceil(Math.min(300, soakSeconds) / 15),
      "Late-session long tasks stay bounded"
    );
    assert.ok(measurements.at(-1).end - measurements[0].end >= soakSeconds - 40, "The live timeline keeps advancing");
  }
  await hub.evaluate(() => {
    const graph = window.tabs.tabList.find((tab) => tab.type === 1);
    graph.controller.restoreState({ leftSources: [] });
    graph.controller.leftSourceList.addField("/vehicles/mur27/powertrain/inverter/motor_speed");
    window.tabs.setSelected(window.tabs.tabList.indexOf(graph));
    const source = graph.controller.saveState().leftSources[0];
    if (source?.dbcSignal !== "INV_MotorSpeedRPM") throw new Error("The live layout lacks DBC signal provenance");
  });
  await send("open-files", { files: [path.resolve("test/fixtures/mf4/bus.mf4")], merge: false });
  await hub.waitForFunction(() => {
    const graph = window.tabs.tabList.find((tab) => tab.type === 1);
    const source = graph.controller.saveState().leftSources[0];
    return (
      source?.logKey === "INVERTER/INV_MotorSpeedRPM" &&
      window.log.getNumber(source.logKey, -Infinity, Infinity)?.values.length === 4
    );
  });
  assert.deepEqual(
    await hub.evaluate(() => window.log.getNumber("INVERTER/INV_MotorSpeedRPM", -Infinity, Infinity).values),
    [1000, 2000, 3000, 4000],
    "The live layout resolves and decodes the closed MF4 without reassignment"
  );
  await hub.waitForTimeout(1200);
  const recordedRange = await hub.evaluate(() => ({
    timeline: window.selection.getTimelineRange(),
    live: window.selection.getCurrentLiveTime()
  }));
  assert.equal(recordedRange.live, null, "Opening a closed MF4 disconnects the live timeline clock");
  assert.ok(recordedRange.timeline[1] <= 10, "The recorded timeline fits the MF4 instead of the old live session");
  await hub.screenshot({ path: path.join(out, "mf4-layout.png") });
  assert.deepEqual(errors, [], "No renderer errors or suppressed dialogs");
  fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({ tabs, sent, history, measurements }, null, 2));
  console.log(
    "Cellular smoke passed: history, subscriptions, outage, restart, dedup, saved tabs and live-to-MF4 layout."
  );
} finally {
  await app?.close().catch(() => {});
  await backend?.close();
  fs.rmSync(userData, { recursive: true, force: true });
}
