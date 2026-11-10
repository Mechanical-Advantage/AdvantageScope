// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Takes screenshots of the real Electron app without showing a window, taking focus or adding a Dock
// icon (see src/main/electron/headless.ts). Each run uses a fresh prefs and state folder, so runs are
// repeatable and never touch the copy of the app you use.

import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { _electron } from "playwright";

const HELP = `Usage: npm run screenshot -- [options]

  --out <dir>          output folder (default .screenshots)
  --name <name>        file name prefix (default "shot")
  --size <WxH>         window content size in CSS pixels (default 1600x1000)
  --scale <n>          device pixel ratio (default: the display's, 2 on Retina)
  --theme <t>          light, dark or system (default dark)
  --log <file>         open a log file
  --mock               start the mock backend (seed 1, lap counter) and connect live
  --mock-args=<args>   extra mock backend flags, e.g. --mock-args="--fault-demo --unsync"
                       (use "=", since the value starts with a dash)
  --layout trackside   add and select a Trackside tab
  --tab <index|title>  select a tab before capturing; repeat to capture several tabs
  --eval <js>          run JavaScript in the hub page before capturing (may await); repeatable.
                       A returned value prints as [eval] <json>
  --wait <ms>          settle time before each capture (default 1500)
  --satellites         also capture satellite windows
  --user-data <dir>    reuse a prefs and state folder instead of a fresh one
  --no-build           skip "npm run compile" (only when bundles/ is current)
  -h, --help

Prints one line per PNG written. Suppressed dialogs and renderer errors print as they happen.`;

const { values: opts } = parseArgs({
  options: {
    out: { type: "string", default: ".screenshots" },
    name: { type: "string", default: "shot" },
    size: { type: "string", default: "1600x1000" },
    scale: { type: "string" },
    theme: { type: "string", default: "dark" },
    log: { type: "string" },
    mock: { type: "boolean", default: false },
    "mock-args": { type: "string", default: "" },
    layout: { type: "string" },
    tab: { type: "string", multiple: true, default: [] },
    eval: { type: "string", multiple: true, default: [] },
    wait: { type: "string", default: "1500" },
    satellites: { type: "boolean", default: false },
    "user-data": { type: "string" },
    "no-build": { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false }
  }
});
if (opts.help) {
  console.log(HELP);
  process.exit(0);
}

const fail = (message) => {
  console.error("screenshot: " + message);
  process.exit(2);
};
const [width, height] = opts.size.split("x").map(Number);
if (!(width >= 800 && height >= 400)) fail("--size must be WxH, at least 800x400");
if (!["light", "dark", "system"].includes(opts.theme)) fail("--theme must be light, dark or system");
if (opts.layout && opts.layout !== "trackside") fail("--layout only supports trackside");
if (opts.log && !fs.existsSync(opts.log)) fail("no such log file: " + opts.log);
const wait = Number(opts.wait);

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
const outDir = path.resolve(opts.out);
fs.mkdirSync(outDir, { recursive: true });

if (!opts["no-build"]) {
  const build = spawnSync("npm", ["run", "compile"], { stdio: ["ignore", "ignore", "inherit"] });
  if (build.status !== 0) fail("npm run compile failed");
}

const userData = opts["user-data"]
  ? path.resolve(opts["user-data"])
  : fs.mkdtempSync(path.join(os.tmpdir(), "mur-voir-headless-"));
fs.mkdirSync(userData, { recursive: true });
const prefsFile = path.join(userData, "prefs.json");
const prefs = fs.existsSync(prefsFile) ? JSON.parse(fs.readFileSync(prefsFile, "utf8")) : {};
fs.writeFileSync(prefsFile, JSON.stringify({ ...prefs, theme: opts.theme }));

async function freePort() {
  const server = net.createServer().listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  server.close();
  return port;
}

async function waitForHttp(url) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("server did not start: " + url);
}

let mock;
let app;
try {
  let mockAddress;
  if (opts.mock) {
    const port = await freePort();
    const extra = opts["mock-args"].split(/\s+/).filter(Boolean);
    mock = spawn(
      process.execPath,
      ["tools/mock-backend/src/main.ts", "--port", String(port), "--host", "127.0.0.1", "--seed", "1"].concat(
        ["--lap-counter"],
        extra
      ),
      { stdio: ["ignore", "ignore", "inherit"] }
    );
    mockAddress = `http://127.0.0.1:${port}`;
    await waitForHttp(mockAddress + "/api/v1/catalogue");
  }

  const args = ["bundles/main.js"];
  if (opts.scale) args.unshift("--force-device-scale-factor=" + Number(opts.scale));
  if (opts.log) args.push(path.resolve(opts.log));
  app = await _electron.launch({
    args,
    env: { ...process.env, MURVOIR_HEADLESS: "1", MURVOIR_USER_DATA: userData }
  });
  app.process().stdout.on("data", (data) => {
    for (const line of String(data).split("\n")) if (line.startsWith("[headless]")) console.log(line);
  });

  // A hidden window never sees the macOS appearance, so its renderer always reports a light
  // prefers-color-scheme. Emulate the scheme the app resolved from the theme preference instead.
  const colorScheme = (await app.evaluate(({ app, nativeTheme }) =>
    app.whenReady().then(() => nativeTheme.shouldUseDarkColors)
  ))
    ? "dark"
    : "light";
  const watchPage = (page) => {
    page.on("pageerror", (error) => console.log(`[renderer error] ${error.message}`));
    if (!page.url().startsWith("devtools:")) page.emulateMedia({ colorScheme }).catch(() => {});
  };
  app.on("window", watchPage);
  app.windows().forEach(watchPage);

  const hubPage = async () => {
    for (let attempt = 0; attempt < 200; attempt++) {
      const page = app.windows().find((page) => page.url().endsWith("/hub.html"));
      if (page) return page;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("the hub window did not open");
  };
  const hub = await hubPage();
  hub.setDefaultTimeout(30000);
  await hub.waitForFunction(() => window.messagePort !== null && window.preferences);
  await app.evaluate(
    ({ BrowserWindow }, [width, height]) => {
      for (const window of BrowserWindow.getAllWindows()) {
        if (window.webContents.getURL().endsWith("/hub.html")) window.setContentSize(width, height);
      }
    },
    [width, height]
  );

  const send = (name, data) =>
    hub.evaluate(([name, data]) => window.messagePort.onmessage({ data: { name, data } }), [name, data]);

  if (opts.log) {
    await hub.waitForFunction(() => window.log.getFieldKeys().length > 0);
  }
  if (mockAddress) {
    await send("show-connect-dialog");
    await hub.locator(".connect-source").selectOption("mur");
    await hub.locator(".connect-address").fill(mockAddress);
    await hub.locator(".connect-confirm").click();
    await hub.locator(".connect-dialog-backdrop").waitFor({ state: "hidden" });
    await hub.waitForFunction(() =>
      window.log
        .getFieldKeys()
        .some((key) => window.log.getNumber(key, -Infinity, Infinity)?.values.some(Number.isFinite))
    );
  }
  // 15 is TabType.Trackside. addTab selects the new tab.
  if (opts.layout === "trackside") await hub.evaluate(() => window.tabs.addTab(15));
  for (const script of opts.eval) {
    const result = await hub.evaluate(`(async () => { ${script} })()`);
    if (result !== undefined) console.log("[eval] " + JSON.stringify(result));
  }

  const written = [];
  const capture = async (suffix) => {
    await hub.waitForTimeout(wait);
    const file = path.join(outDir, `${opts.name}${suffix}.png`);
    await hub.screenshot({ path: file });
    written.push(file);
    if (opts.satellites) {
      const satellites = app.windows().filter((page) => page.url().endsWith("/satellite.html"));
      for (const [index, page] of satellites.entries()) {
        const satelliteFile = path.join(outDir, `${opts.name}${suffix}-satellite-${index + 1}.png`);
        await page.screenshot({ path: satelliteFile });
        written.push(satelliteFile);
      }
    }
  };

  if (opts.tab.length === 0) {
    await capture("");
  } else {
    for (const tab of opts.tab) {
      const selected = await hub.evaluate((tab) => {
        // Tab bar labels are "<icon> <title>", and default tabs have no saved title, so read the labels.
        const titles = [...document.querySelectorAll(".tab-bar > .tab")].map((tab) =>
          tab.innerText.replace(/^\S+\s+/, "").trim()
        );
        const index = /^\d+$/.test(tab)
          ? Number(tab)
          : titles.findIndex((title) => title.toLowerCase().includes(tab.toLowerCase()));
        if (index < 0 || index >= titles.length) return { error: `no tab "${tab}". Tabs: ${titles.join(", ")}` };
        window.tabs.setSelected(index);
        return { title: titles[index] };
      }, tab);
      if (selected.error) throw new Error(selected.error);
      await capture("-" + selected.title.replace(/[^\w-]+/g, "_").replace(/^_|_$/g, ""));
    }
  }
  written.forEach((file) => console.log(file));
} catch (error) {
  console.error("screenshot: " + (error?.message ?? error));
  process.exitCode = 1;
} finally {
  await app?.close().catch(() => {});
  if (mock && mock.exitCode === null) {
    mock.kill("SIGTERM");
    await once(mock, "exit");
  }
  if (!opts["user-data"]) fs.rmSync(userData, { recursive: true, force: true });
}
