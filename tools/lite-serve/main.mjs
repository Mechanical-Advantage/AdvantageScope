// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { createReadStream } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../lite/static/", import.meta.url));
const option = (name, fallback) => process.argv[process.argv.indexOf(name) + 1] ?? fallback;
const port = process.argv.includes("--port") ? Number(option("--port", "5808")) : 5808;
const backend = new URL(process.argv.includes("--backend") ? option("--backend") : "http://127.0.0.1:8090");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png"
};

function proxy(req, res) {
  const upstream = http.request(
    new URL(req.url, backend),
    { method: req.method, headers: { ...req.headers, host: backend.host } },
    (reply) => {
      res.writeHead(reply.statusCode, reply.headers);
      reply.pipe(res);
    }
  );
  upstream.on("error", () => {
    res.writeHead(502);
    res.end("Backend unavailable");
  });
  req.pipe(upstream);
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname.startsWith("/api/")) return proxy(req, res);
    if (pathname === "/assets" || pathname === "/assets/") {
      const index = {};
      async function walk(dir, prefix = "") {
        for (const entry of await readdir(dir, { withFileTypes: true })) {
          if (entry.name.startsWith(".")) continue;
          const name = prefix + entry.name;
          if (entry.isDirectory()) await walk(path.join(dir, entry.name), name + "/");
          else
            index[name] =
              entry.name === "config.json" ? JSON.parse(await readFile(path.join(dir, entry.name), "utf8")) : null;
        }
      }
      await walk(path.join(root, "bundledAssets"));
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(index));
    }
    // Host filesystem browsing and asset writes are intentionally confined to the Python server.
    if (pathname === "/logs") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end("[]");
    }
    const relative = pathname.startsWith("/assets/")
      ? "bundledAssets/" + pathname.slice(8)
      : pathname.slice(1) || "index.html";
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root)) {
      res.writeHead(403);
      return res.end();
    }
    const info = await stat(filename);
    if (!info.isFile()) throw new Error("Not a file");
    res.writeHead(200, {
      "Content-Type": types[path.extname(filename)] ?? "application/octet-stream",
      "Content-Length": info.size
    });
    createReadStream(filename).pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
server.on("upgrade", (req, socket, head) => {
  if (!req.url.startsWith("/api/")) return socket.destroy();
  const upstream = http.request(new URL(req.url, backend), { headers: { ...req.headers, host: backend.host } });
  upstream.on("upgrade", (reply, peer, peerHead) => {
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n${Object.entries(reply.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\r\n")}\r\n\r\n`
    );
    if (peerHead.length) socket.write(peerHead);
    if (head.length) peer.write(head);
    socket.pipe(peer).pipe(socket);
    socket.on("error", () => peer.destroy());
    peer.on("error", () => socket.destroy());
    socket.on("close", () => peer.destroy());
  });
  upstream.on("error", () => socket.destroy());
  upstream.end();
});
server.listen(port, "0.0.0.0", () => console.log(`mur-voir Lite: http://localhost:${port} (MUR backend ${backend})`));
