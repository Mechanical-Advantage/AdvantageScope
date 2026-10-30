import assert from "node:assert/strict";
import { test } from "node:test";
import { CHURN, STALE_TEST } from "../src/backend.ts";
import type { AvailabilityOp, CatalogueRemoveOp, CatalogueUpsertOp, SimStatusOp } from "../src/contract.ts";
import { sampleKey } from "../src/contract.ts";
import { HistoryBuffer } from "../src/history.ts";
import { Track } from "../src/track.ts";
import { Harness, P, samplesOf } from "./helpers.ts";

const SPEED = `${P}/dynamics/vehicle_speed`;
const THROTTLE = `${P}/driver/throttle`;
const STEER = `${P}/driver/steering_angle`;

test("track closes and is about 1 km", () => {
  const t = new Track();
  assert.ok(t.closureError < 1e-6, `closure ${t.closureError}`);
  assert.ok(t.length > 900 && t.length < 1100, `length ${t.length}`);
});

test("hello: snapshot first, then availability for every signal, before any samples", () => {
  const h = new Harness();
  h.run(50);
  h.send({ op: "hello", api_version: 1 });
  const ops = h.take();
  assert.equal(ops[0].op, "catalogue_snapshot");
  const snap = ops[0] as any;
  assert.equal(snap.api_version, 1);
  assert.equal(snap.revision, snap.signals.length);
  const avail = ops.slice(1) as AvailabilityOp[];
  assert.deepEqual(avail.map((a) => a.path).sort(), snap.signals.map((s: any) => s.path).sort());
  assert.ok(avail.every((a) => a.op === "availability"));
  const n = snap.signals.length;
  assert.ok(n >= 40 && n <= 80, `${n} signals`);
});

test("seq: starts at 0 and is +1 per (path, stream_id); drop-rate leaves gaps, never repeats", () => {
  const h = new Harness({ dropRate: 0.2, seed: 3 });
  h.send({ op: "hello", api_version: 1 });
  h.send({ op: "subscribe", subscription_id: "a", paths: [SPEED, THROTTLE] });
  h.run(300);
  const got = samplesOf(h.take(), "a");
  for (const path of [SPEED, THROTTLE]) {
    const seqs = got.filter((s) => s.path === path).map((s) => s.seq);
    assert.ok(seqs.length > 0);
    for (let i = 1; i < seqs.length; i++) assert.ok(seqs[i] > seqs[i - 1], "strictly increasing");
    const gaps = seqs.slice(1).filter((s, i) => s - seqs[i] > 1).length;
    assert.ok(gaps > 0, "drop-rate should create gaps");
  }
  const clean = new Harness({ seed: 3 });
  clean.send({ op: "hello", api_version: 1 });
  clean.send({ op: "subscribe", subscription_id: "a", paths: [THROTTLE] });
  clean.run(100);
  const seqs = samplesOf(clean.take()).map((s) => s.seq);
  assert.equal(seqs[0], 0);
  seqs.forEach((s, i) => assert.equal(s, i));
});

test("--duplicate: each (path, stream_id, seq) arrives twice (rf + cellular) with identical t_ns/value; history once", () => {
  const h = new Harness({ duplicate: true });
  h.send({ op: "hello", api_version: 1 });
  h.send({ op: "subscribe", subscription_id: "a", paths: [STEER] });
  h.run(100);
  const got = samplesOf(h.take(), "a");
  const byKey = new Map<string, typeof got>();
  for (const s of got) byKey.set(sampleKey(s), [...(byKey.get(sampleKey(s)) ?? []), s]);
  assert.ok(byKey.size >= 99);
  for (const copies of byKey.values()) {
    assert.equal(copies.length, 2);
    assert.deepEqual(copies.map((c) => c.ingress_link).sort(), ["cellular", "rf"]);
    assert.equal(copies[0].t_ns, copies[1].t_ns);
    assert.deepEqual(copies[0].value, copies[1].value);
  }
  const hist = h.backend.queryHistory(STEER, null, null, 100000)!;
  assert.equal(new Set(hist.samples.map((s) => s.seq)).size, hist.samples.length);
});

test("subscribe: same subscription_id replaces atomically; unknown paths -> ack + structured error", () => {
  const h = new Harness();
  h.send({ op: "hello", api_version: 1 });
  h.take();
  h.send({ op: "subscribe", subscription_id: "g", paths: [SPEED, `${P}/nope`] });
  let ops = h.take();
  assert.deepEqual(ops[0], { op: "subscription_ack", subscription_id: "g", accepted_paths: [SPEED] });
  assert.equal(ops[1].op, "error");
  assert.equal((ops[1] as any).code, "unknown_signal");
  assert.equal((ops[1] as any).subscription_id, "g");
  assert.deepEqual((ops[1] as any).paths, [`${P}/nope`]);

  h.run(50);
  // queue some SPEED samples, then replace before they are flushed
  h.backend.advance(2);
  h.send({ op: "subscribe", subscription_id: "g", paths: [THROTTLE] });
  h.run(50);
  ops = h.take();
  const ackIdx = ops.findIndex((o) => o.op === "subscription_ack");
  assert.ok(ackIdx >= 0);
  const after = samplesOf(ops.slice(ackIdx), "g");
  assert.ok(after.length > 0);
  assert.ok(
    after.every((s) => s.path === THROTTLE),
    "no old-path samples after replace ack"
  );

  h.send({ op: "unsubscribe", subscription_id: "g" });
  h.run(20);
  assert.equal(samplesOf(h.take()).length, 0);
  h.send({ op: "unsubscribe", subscription_id: "g" });
  assert.equal((h.take()[0] as any).code, "unknown_subscription");
});

test("include_latest: cached latest is sent immediately with initial: true", () => {
  const h = new Harness();
  h.run(20);
  h.send({ op: "hello", api_version: 1 });
  h.take();
  h.send({ op: "subscribe", subscription_id: "x", paths: [SPEED, THROTTLE], include_latest: true });
  const ops = h.take();
  assert.equal(ops[0].op, "subscription_ack");
  const init = ops[1] as any;
  assert.equal(init.op, "samples");
  assert.equal(init.initial, true);
  assert.deepEqual(init.samples.map((s: any) => s.path).sort(), [THROTTLE, SPEED].sort());
  assert.equal(init.samples.find((s: any) => s.path === THROTTLE).seq, h.backend.latest.get(THROTTLE)!.seq);
});

test("max_rate_hz: per-signal upper bound, newest sample wins", () => {
  const h = new Harness();
  h.send({ op: "hello", api_version: 1 });
  h.send({ op: "subscribe", subscription_id: "t", paths: [THROTTLE, SPEED], max_rate_hz: 10 });
  h.take();
  const deliveries: { seq: number; latestSeq: number; at: number; path: string }[] = [];
  for (let i = 0; i < 300; i++) {
    h.backend.advance(1);
    h.clockMs += 10;
    h.session.flush();
    for (const s of samplesOf(h.take(), "t")) {
      deliveries.push({ seq: s.seq, latestSeq: h.backend.latest.get(s.path)!.seq, at: h.clockMs, path: s.path });
    }
  }
  for (const path of [THROTTLE, SPEED]) {
    const d = deliveries.filter((x) => x.path === path);
    assert.ok(d.length >= 28 && d.length <= 31, `${path}: ${d.length} in 3 s`);
    for (let i = 1; i < d.length; i++) assert.ok(d[i].at - d[i - 1].at >= 100, "min interval");
    for (const x of d) assert.equal(x.seq, x.latestSeq, "newest wins");
  }
});

test("backpressure: slow client is coalesced to latest-per-path, never unbounded", () => {
  const h = new Harness({}, { maxQueue: 500 });
  h.send({ op: "hello", api_version: 1 });
  h.send({ op: "subscribe", subscription_id: "s", paths: [THROTTLE, STEER, SPEED] });
  h.take();
  h.buffered = 10 << 20; // socket is backed up
  h.run(1000);
  assert.equal(samplesOf(h.take()).length, 0);
  assert.ok(h.session.stats.coalesced > 2000);
  h.buffered = 0;
  h.clockMs += 100;
  h.session.flush();
  const got = samplesOf(h.take());
  assert.equal(got.length, 3, "only the newest per path after the stall");
  for (const s of got) assert.equal(s.seq, h.backend.latest.get(s.path)!.seq);
});

test("history: min/max downsampling keeps a one-sample spike", () => {
  const buf = new HistoryBuffer("float64", 20000);
  for (let i = 0; i < 10000; i++) {
    const v = i === 6789 ? 500 : i === 1234 ? -400 : Math.sin(i / 50);
    buf.push({
      path: "p",
      stream_id: "s1",
      seq: i,
      t_ns: String(1_000_000_000n + BigInt(i) * 10_000_000n),
      received_ns: "0",
      time_quality: "estimated",
      value: v
    });
  }
  const r = buf.query("p", 0n, 10n ** 19n, 100);
  assert.ok(r.samples.length <= 100);
  assert.equal(r.downsampled, true);
  const vals = r.samples.map((s) => s.value as number);
  assert.ok(vals.includes(500) && vals.includes(-400));
  const seqs = r.samples.map((s) => s.seq);
  assert.deepEqual(
    seqs,
    [...seqs].sort((a, b) => a - b),
    "time ordered"
  );
  const raw = buf.query("p", 0n, 10n ** 19n, 20000);
  assert.equal(raw.samples.length, 10000);
  assert.equal(raw.downsampled, false);
});

test("history: enum keeps state changes; geometry is strided raw, never averaged", () => {
  const h = new Harness();
  h.run(1500);
  const vsm = h.backend.queryHistory(`${P}/powertrain/inverter/vsm_state`, null, null, 20)!;
  assert.deepEqual([...new Set(vsm.samples.map((s) => s.value))], [0, 1, 2, 3, 4, 5, 6]);
  const pose = h.backend.queryHistory(`${P}/autonomy/pose`, null, null, 10)!;
  assert.equal(pose.samples.length, 10);
  const all = h.backend.queryHistory(`${P}/autonomy/pose`, null, null, 100000)!;
  const allJson = new Set(all.samples.map((s) => JSON.stringify(s)));
  for (const s of pose.samples) assert.ok(allJson.has(JSON.stringify(s)));
});

test("history retains at least 5 minutes", () => {
  const h = new Harness({ seed: 2 });
  h.backend.advance(100 * 330);
  const r = h.backend.queryHistory(THROTTLE, 0n, 10n ** 19n, 20000)!;
  const t0 = BigInt(r.samples[0].t_ns);
  const t1 = BigInt(r.samples[r.samples.length - 1].t_ns);
  assert.ok(t1 - t0 >= 300_000_000_000n, `span ${(t1 - t0) / 1_000_000n} ms`);
});

test("catalogue churn: strictly increasing revisions, no samples after remove", () => {
  const h = new Harness({ catalogueChurn: true });
  h.send({ op: "hello", api_version: 1 });
  const snap = h.take()[0] as any;
  const churnPaths = [0, 1, 2].map((i) => `${P}/system/churn/probe_${i}`);
  // subscribe to all probe paths up front is impossible (unknown) -> subscribe after upsert
  let lastRev = snap.revision;
  const events: (CatalogueUpsertOp | CatalogueRemoveOp)[] = [];
  const removed = new Set<string>();
  const after: string[] = [];
  for (let i = 0; i < 100 * CHURN.period * 3; i++) {
    h.run(1);
    for (const op of h.take()) {
      if (op.op === "catalogue_upsert" || op.op === "catalogue_remove") {
        assert.equal(op.catalogue_epoch, snap.catalogue_epoch);
        assert.ok(op.revision > lastRev, "strictly increasing");
        assert.equal(op.revision, lastRev + 1);
        lastRev = op.revision;
        events.push(op);
        if (op.op === "catalogue_upsert") {
          removed.delete(op.signal.path);
          h.send({ op: "subscribe", subscription_id: "c", paths: [op.signal.path] });
        } else removed.add(op.path);
      } else if (op.op === "samples") {
        assert.ok(op.samples.every((s) => !s.path.includes("/churn/") || churnPaths.includes(s.path)));
        after.push(...op.samples.filter((s) => removed.has(s.path)).map((s) => s.path));
      }
    }
  }
  assert.equal(events.length, 6);
  assert.deepEqual(
    events.map((e) => e.op),
    [
      "catalogue_upsert",
      "catalogue_remove",
      "catalogue_upsert",
      "catalogue_remove",
      "catalogue_upsert",
      "catalogue_remove"
    ]
  );
  assert.deepEqual(after, []);
  assert.equal(h.backend.snapshot().revision, lastRev);
});

test("stale-test: source goes stale, then offline, then online again", () => {
  const h = new Harness({ staleTest: true, staleSource: "sbg-ins" });
  h.run(1);
  h.send({ op: "hello", api_version: 1 });
  h.take();
  const states: string[] = [];
  for (let i = 0; i < 100 * (STALE_TEST.period + 2); i++) {
    h.run(1);
    for (const op of h.take()) if (op.op === "availability" && op.path === `${P}/gps/latitude`) states.push(op.state);
  }
  assert.deepEqual(states, ["stale", "offline", "online"]);
});

test("--unsync marks one source unsynchronised; others keep their quality", () => {
  const h = new Harness({ unsync: true });
  h.run(20);
  assert.equal(h.backend.latest.get(`${P}/accumulator/pack_voltage`)!.time_quality, "unsynchronised");
  assert.equal(h.backend.latest.get(THROTTLE)!.time_quality, "estimated");
  assert.equal(h.backend.latest.get(`${P}/gps/latitude`)!.time_quality, "synchronised");
});

test("lap counter only with --lap-counter; int64 > 2^53 is a decimal string", () => {
  assert.equal(new Harness().backend.catalogue.has(`${P}/timing/lap_count`), false);
  const h = new Harness({ lapCounter: true });
  assert.equal(h.backend.catalogue.get(`${P}/timing/lap_count`)!.type, "int64");
  h.run(100 * 60);
  assert.equal(h.backend.latest.get(`${P}/timing/lap_count`)!.value, 2);
  const lt = h.backend.latest.get(`${P}/timing/last_lap_time`)!.value as number;
  assert.ok(lt > 30 && lt < 60, `lap time ${lt}`);
  const utc = h.backend.latest.get(`${P}/gps/utc_time`)!.value;
  assert.equal(typeof utc, "string");
  assert.ok(BigInt(utc as string) > BigInt(Number.MAX_SAFE_INTEGER));
});

test("deterministic: same seed => identical samples; different seed differs", () => {
  const run = (seed: number) => {
    const h = new Harness({ seed, dropRate: 0.05 });
    h.send({ op: "hello", api_version: 1 });
    h.send({ op: "subscribe", subscription_id: "a", paths: [STEER, SPEED, `${P}/autonomy/cones`] });
    h.run(1200);
    return JSON.stringify(samplesOf(h.take()).map(({ received_ns, ...rest }) => rest));
  };
  assert.equal(run(5), run(5));
  assert.notEqual(run(5), run(6));
});

test("physics is coherent: ay = v^2 kappa, yaw = v kappa, no throttle while braking", () => {
  const h = new Harness();
  for (let i = 0; i < 100 * 60; i++) {
    h.backend.advance(1);
    const st = (h.backend as any).vehicle.state;
    assert.ok(Math.abs(st.ay - st.v * st.v * st.kappa) < 1e-9);
    assert.ok(Math.abs(st.yawRate - st.v * st.kappa) < 1e-9);
    assert.ok(!(st.throttle > 0.01 && st.brakeFront > 1e5), "throttle and brake together");
  }
});

test("sim clock: t_ns from 0; reset jumps back and changes stream_id; pause freezes", () => {
  const h = new Harness({ simClock: true });
  h.send({ op: "hello", api_version: 1 });
  const hello = h.take();
  const simHello = hello.find((o) => o.op === "sim_status") as SimStatusOp;
  assert.equal(simHello.clock_domain, "sim");
  assert.equal((hello[0] as any).clock_domain, "sim");
  h.send({ op: "subscribe", subscription_id: "a", paths: [THROTTLE] });
  h.run(500);
  const before = samplesOf(h.take());
  assert.equal(before[0].t_ns, "0");
  const oldStream = before[0].stream_id;
  const lastT = BigInt(before[before.length - 1].t_ns);
  assert.ok(lastT > 4_000_000_000n);

  h.backend.reset();
  h.run(10);
  const ops = h.take();
  const resetIdx = ops.findIndex((o) => o.op === "sim_status");
  assert.equal((ops[resetIdx] as SimStatusOp).reason, "reset");
  assert.equal((ops[resetIdx] as SimStatusOp).reset_count, 1);
  const afterReset = samplesOf(ops.slice(resetIdx));
  assert.ok(samplesOf(ops.slice(0, resetIdx)).every((s) => s.stream_id === oldStream));
  assert.ok(afterReset.length > 0);
  assert.ok(afterReset.every((s) => s.stream_id !== oldStream));
  assert.equal(afterReset[0].seq, 0);
  assert.ok(BigInt(afterReset[0].t_ns) < lastT, "time jumped backwards");
  // history defaults to the newest stream; the old one is still selectable
  assert.equal(h.backend.queryHistory(THROTTLE, null, null, 10000)!.stream_id, afterReset[0].stream_id);
  assert.ok(h.backend.queryHistory(THROTTLE, null, null, 10000, oldStream)!.samples.length >= 499);

  h.backend.pause();
  assert.equal((h.take().at(-1) as SimStatusOp).state, "paused");
  assert.equal(h.backend.simStatus().state, "paused");
  h.backend.resume();
  assert.equal(h.backend.simStatus().state, "running");
});
