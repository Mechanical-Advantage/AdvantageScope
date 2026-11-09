// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// HTTP + WebSocket front end for the mock backend (spec 01 §5).

import http from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import type { HttpError } from "../../../src/shared/mur/contract.ts";
import { MockBackend, type BackendOptions } from "./backend.ts";
import { Session, type SessionOptions } from "./session.ts";

export const MAX_HISTORY_POINTS = 20_000;
export const DEFAULT_HISTORY_POINTS = 2000;

export interface ServerHandle {
  backend: MockBackend;
  server: http.Server;
  port: number;
  close(): Promise<void>;
}

const NS_RE = /^-?\d{1,20}$/;

function json(res: http.ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "no-store"
  });
  res.end(text);
}

function err(res: http.ServerResponse, status: number, error: string, message: string): void {
  const body: HttpError = { error, message };
  json(res, status, body);
}

export function handleHttp(backend: MockBackend, req: http.IncomingMessage, res: http.ServerResponse): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  const path = url.pathname.replace(/\/+$/, "");
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type"
    });
    return void res.end();
  }

  if (path === "/api/v1/catalogue") {
    if (req.method !== "GET") return err(res, 405, "method_not_allowed", "Use GET");
    return json(res, 200, backend.snapshot());
  }

  if (path === "/api/v1/history") {
    if (req.method !== "GET") return err(res, 405, "method_not_allowed", "Use GET");
    if (!backend.opts.history)
      return err(res, 501, "not_implemented", "History is disabled on this server (--no-history)");
    const p = url.searchParams.get("path");
    if (!p) return err(res, 400, "bad_request", "Missing 'path'");
    const fromS = url.searchParams.get("from_ns");
    const toS = url.searchParams.get("to_ns");
    const mpS = url.searchParams.get("max_points");
    if ((fromS !== null && !NS_RE.test(fromS)) || (toS !== null && !NS_RE.test(toS))) {
      return err(res, 400, "bad_request", "from_ns/to_ns must be decimal integer strings");
    }
    let maxPoints = DEFAULT_HISTORY_POINTS;
    if (mpS !== null) {
      maxPoints = Number(mpS);
      if (!Number.isInteger(maxPoints) || maxPoints < 1)
        return err(res, 400, "bad_request", "max_points must be a positive integer");
      maxPoints = Math.min(maxPoints, MAX_HISTORY_POINTS);
    }
    const from = fromS === null ? null : BigInt(fromS);
    const to = toS === null ? null : BigInt(toS);
    if (from !== null && to !== null && from > to) return err(res, 400, "bad_request", "from_ns must be <= to_ns");
    const result = backend.queryHistory(p, from, to, maxPoints, url.searchParams.get("stream_id") ?? undefined);
    if (!result) return err(res, 404, "unknown_signal", `Unknown path: ${p}`);
    return json(res, 200, result);
  }

  if (path === "" || path === "/api" || path === "/api/v1") {
    return json(res, 200, {
      name: "mur-voir mock telemetry backend",
      api_version: 1,
      endpoints: ["GET /api/v1/catalogue", "GET /api/v1/history", "WS /api/v1/live"]
    });
  }
  return err(res, 404, "not_found", `No route for ${req.method} ${url.pathname}`);
}

export async function startServer(
  opts: Partial<BackendOptions> & { port?: number; host?: string; quiet?: boolean },
  sessionOpts: Partial<SessionOptions> = {}
): Promise<ServerHandle> {
  const backend = new MockBackend(opts);
  const server = http.createServer((req, res) => handleHttp(backend, req, res));
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1 << 20 });

  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname.replace(/\/+$/, "") !== "/api/v1/live") {
      socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
      return socket.destroy();
    }
    wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
      const session = new Session(
        backend,
        {
          send: (t) => {
            if (ws.readyState === ws.OPEN) ws.send(t);
          },
          bufferedAmount: () => ws.bufferedAmount
        },
        sessionOpts
      );
      ws.on("message", (data, isBinary) => {
        if (isBinary) return;
        session.handle(data.toString());
      });
      ws.on("close", () => session.close());
      ws.on("error", () => session.close());
    });
  });

  backend.start();
  await new Promise<void>((resolve) => server.listen(opts.port ?? 8090, opts.host ?? "0.0.0.0", resolve));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : opts.port ?? 8090;
  return {
    backend,
    server,
    port,
    close: async () => {
      backend.stop();
      for (const c of wss.clients) c.terminate();
      wss.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  };
}
