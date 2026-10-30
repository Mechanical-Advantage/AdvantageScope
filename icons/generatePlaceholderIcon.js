// Copyright (c) 2026 Melbourne University Motorsport
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Generates the text-based placeholder app icons for mur-voir.
// Usage (from the repository root, with ELECTRON_RUN_AS_NODE unset):
//   npx electron icons/generatePlaceholderIcon.js

const { app, BrowserWindow } = require("electron");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SIZES = [16, 32, 64, 128, 256, 512, 1024];

const html = `<!doctype html><html><body><script>
window.renderIcon = (size) => {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const r = size * 0.22;
  const m = size * 0.06;
  ctx.beginPath();
  ctx.roundRect(m, m, size - 2 * m, size - 2 * m, r);
  ctx.fillStyle = "#0e2a47";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold " + size * 0.36 + "px Helvetica, Arial, sans-serif";
  ctx.fillText("MUR", size / 2, size * 0.42);
  ctx.fillStyle = "#f2b31c";
  ctx.font = "bold " + size * 0.17 + "px Helvetica, Arial, sans-serif";
  ctx.fillText("voir", size / 2, size * 0.7);
  return c.toDataURL("image/png").split(",")[1];
};
</script></body></html>`;

/** Builds an ICO file containing PNG-encoded images. */
function buildIco(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(([size, data], i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map(([, data]) => data)]);
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false });
  await win.loadURL("data:text/html;base64," + Buffer.from(html).toString("base64"));
  const pngs = {};
  for (const size of SIZES) {
    pngs[size] = Buffer.from(await win.webContents.executeJavaScript(`renderIcon(${size})`), "base64");
  }

  // Window icon, Lite icons
  fs.writeFileSync(path.join(ROOT, "icons", "window-icon.png"), pngs[512]);
  fs.writeFileSync(path.join(ROOT, "lite", "static", "icons", "apple-touch-icon.png"), pngs[1024]);
  fs.writeFileSync(path.join(ROOT, "lite", "static", "icons", "favicon.ico"), buildIco([[256, pngs[256]]]));

  // Linux icons
  const linuxDir = path.join(ROOT, "icons", "app", "app-icons-linux");
  fs.mkdirSync(linuxDir, { recursive: true });
  for (const size of [16, 32, 64, 128, 256, 512]) {
    fs.writeFileSync(path.join(linuxDir, `icon_${size}x${size}.png`), pngs[size]);
  }

  // Windows icon
  fs.writeFileSync(
    path.join(ROOT, "icons", "app", "app-icon.ico"),
    buildIco([16, 32, 64, 128, 256].map((size) => [size, pngs[size]]))
  );

  // macOS icon (requires iconutil)
  if (process.platform === "darwin") {
    const iconset = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "mur-voir-icon-")), "app-icon.iconset");
    fs.mkdirSync(iconset);
    for (const size of [16, 32, 128, 256, 512]) {
      fs.writeFileSync(path.join(iconset, `icon_${size}x${size}.png`), pngs[size]);
      fs.writeFileSync(path.join(iconset, `icon_${size}x${size}@2x.png`), pngs[size * 2]);
    }
    execFileSync("iconutil", ["-c", "icns", iconset, "-o", path.join(ROOT, "icons", "app", "app-icon.icns")]);
  }

  console.log("Generated placeholder icons.");
  app.quit();
});
