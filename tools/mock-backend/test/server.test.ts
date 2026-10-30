// Integration tests over real HTTP + WebSocket (Node's built-in WebSocket client).
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ServerOp } from "../src/contract.ts";
import { startServer } from "../src/server.ts";
import { P, START_NS } from "./helpers.ts";

class Client {
  ws: WebSocket;
  msgs: ServerOp[] = [];
  private waiters: (() => void)[] = [];
  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onmessage = (ev) => {
      this.msgs.push(JSON.parse(String(ev.data)));
      this.waiters.splice(0).forEach((w) => w());
    };
  }
  open(): Promise<void> {
    return new Promise((res, rej) => {
      this.ws.onopen = () => res();
      this.ws.onerror = (e) => rej(e);
    });
  }
  send(op: object) {
    this.ws.send(JSON.stringify(op));
  }
  async until(pred: (m: ServerOp[]) => boolean, timeoutMs = 3000): Promise<void> {
    const end = Date.now() + timeoutMs;
    while (!pred(this.msgs)) {
      if (Date.now() > end) throw new Error("timeout");
      await new Promise<void>((r) => {
        this.waiters.push(r);
        setTimeout(r, 50);
      });
    }
  }
  close(): Promise<void> {
    return new Promise((res) => {
      this.ws.onclose = () => res();
      this.ws.close();
    });
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

test("HTTP catalogue + history; reconnect yields a fresh snapshot and no data until re-subscribe", async () => {
  const h = await startServer({ port: 0, host: "127.0.0.1", startTimeNs: START_NS });
  try {
    const base = `http://127.0.0.1:${h.port}`;
    const cat = await (await fetch(`${base}/api/v1/catalogue`)).json();
    assert.equal(cat.api_version, 1);
    assert.equal(cat.signals.length, h.backend.catalogue.size);

    await sleep(300);
    const hist = await fetch(`${base}/api/v1/history?path=${encodeURIComponent(`${P}/driver/throttle`)}&max_points=10`);
    assert.equal(hist.status, 200);
    const hb = await hist.json();
    assert.ok(hb.samples.length > 0 && hb.samples.length <= 10);
    assert.equal(typeof hb.samples[0].t_ns, "string");
    assert.equal((await fetch(`${base}/api/v1/history?path=nope`)).status, 404);
    assert.equal((await fetch(`${base}/api/v1/history?path=${P}/driver/throttle&from_ns=1.5`)).status, 400);

    const url = `ws://127.0.0.1:${h.port}/api/v1/live`;
    const c1 = new Client(url);
    await c1.open();
    c1.send({ op: "hello", api_version: 1 });
    c1.send({ op: "subscribe", subscription_id: "g", paths: [`${P}/driver/throttle`], max_rate_hz: 20 });
    await c1.until((m) => m.some((o) => o.op === "samples"));
    await c1.close();

    const c2 = new Client(url);
    await c2.open();
    c2.send({ op: "hello", api_version: 1 });
    await c2.until((m) => m.filter((o) => o.op === "availability").length >= cat.signals.length);
    await sleep(200);
    assert.equal(c2.msgs[0].op, "catalogue_snapshot");
    assert.equal((c2.msgs[0] as any).catalogue_epoch, cat.catalogue_epoch);
    assert.ok(c2.msgs.slice(1, 1 + cat.signals.length).every((o) => o.op === "availability"));
    assert.equal(c2.msgs.filter((o) => o.op === "samples").length, 0, "subscriptions are not durable across sockets");
    c2.send({ op: "subscribe", subscription_id: "g", paths: [`${P}/driver/throttle`] });
    await c2.until((m) => m.some((o) => o.op === "samples"));
    await c2.close();
  } finally {
    await h.close();
  }
});

test("--no-history -> 501 not_implemented", async () => {
  const h = await startServer({ port: 0, host: "127.0.0.1", history: false });
  try {
    const r = await fetch(`http://127.0.0.1:${h.port}/api/v1/history?path=${P}/driver/throttle`);
    assert.equal(r.status, 501);
    assert.equal((await r.json()).error, "not_implemented");
  } finally {
    await h.close();
  }
});

test("sim endpoints: pause freezes sim time, reset jumps back with new stream ids", async () => {
  const h = await startServer({ port: 0, host: "127.0.0.1", simClock: true });
  try {
    const base = `http://127.0.0.1:${h.port}/api/v1/sim`;
    await sleep(300);
    const s0 = await (await fetch(`${base}/pause`, { method: "POST" })).json();
    assert.equal(s0.state, "paused");
    await sleep(200);
    const s1 = await (await fetch(`${base}/status`)).json();
    assert.equal(s1.sim_time_ns, s0.sim_time_ns);
    assert.ok(BigInt(s1.sim_time_ns) > 0n);
    await fetch(`${base}/resume`, { method: "POST" });
    await sleep(200);
    const s2 = await (await fetch(`${base}/status`)).json();
    assert.ok(BigInt(s2.sim_time_ns) > BigInt(s1.sim_time_ns));
    const s3 = await (await fetch(`${base}/reset`, { method: "POST" })).json();
    assert.ok(BigInt(s3.sim_time_ns) < BigInt(s2.sim_time_ns));
    assert.equal(s3.reset_count, 1);
    assert.notEqual(s3.stream_ids["control-can"], s2.stream_ids["control-can"]);
    assert.equal((await fetch(`${base}/pause`)).status, 405);
  } finally {
    await h.close();
  }
});
