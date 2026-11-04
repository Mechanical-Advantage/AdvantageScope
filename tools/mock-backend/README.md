# mur-voir mock telemetry backend

Wire types come from the pinned mur-msgs schema in `src/shared/mur/api/`. Its README
describes pin updates and drift checks.

This deterministic backend implements `specs/01-live-telemetry-interface.md` with an HTTP catalogue,
rolling history and a live WebSocket. A vehicle model laps a roughly 1 km circuit near Melton, VIC.
Track curvature determines speed, braking and acceleration. Seeded noise varies the sensor values.

Requires Node 22.18 or newer. Node runs the TypeScript directly. The `ws` dependency resolves from
this checkout's `node_modules`.

## Run

```sh
npm run mock-backend
npm run mock-backend -- --lap-counter --speed 5
node tools/mock-backend/src/main.ts --help
```

Connect the dashboard's MUR source to `http://localhost:8090`.

| Flag                       | Effect                                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `--port <n>`               | HTTP and WebSocket port, default 8090.                                                                                                       |
| `--host <address>`         | Bind address, default 0.0.0.0.                                                                                                               |
| `--seed <n>`               | Seed for values, noise and drops, default 1.                                                                                                 |
| `--speed <x>`              | Model seconds per wall second, default 1.                                                                                                    |
| `--start-time-ns <ns>`     | Fix the Unix start time and boot nonce for reproducible timestamps, stream IDs and catalogue epoch.                                          |
| `--lap-counter`            | Add `timing/lap_count` and `timing/last_lap_time` from a start/finish beacon.                                                                |
| `--drop-rate <f>`          | Drop this fraction of samples after consuming their sequence numbers.                                                                        |
| `--duplicate`              | Deliver each measurement over RF and cellular with the same dedup key and different receipt times. History stores it once.                   |
| `--fault-demo`             | Inject motor and cell temperature faults and an Earth Fault IMD enum from model seconds 10 to 20, then recover.                              |
| `--stale-test`             | Stop a source after 30 model seconds in each 60 second cycle. It becomes stale, then offline after four silent seconds, then returns online. |
| `--stale-source <source>`  | Source for the stale test, default `sbg-ins`.                                                                                                |
| `--catalogue-churn`        | Register a 10 Hz probe at second 10 of each 40 second cycle and remove it at second 30.                                                      |
| `--unsync`                 | Give one source a 1.734 second clock offset and 80 ppm drift, marked `unsynchronised`.                                                       |
| `--unsync-source <source>` | Source for the clock offset, default `ennoid-bms`.                                                                                           |
| `--no-history`             | Return HTTP 501 for history requests.                                                                                                        |
| `--history-seconds <n>`    | History retention in model seconds, default 360.                                                                                             |

Use `--speed 1` to keep model time aligned with wall time during live connection checks. With a fixed
start time and seed, the same ticks produce the same output. Without a fixed start time, each process
gets a new catalogue epoch and source stream IDs. All sample and receipt timestamps use Unix nanoseconds.
CAN sources have estimated time. GNSS and autonomy sources have synchronised time unless selected by
`--unsync`.

## Endpoints and subscriptions

- `GET /api/v1/catalogue` returns `{api_version, catalogue_epoch, revision, signals}`.
- `GET /api/v1/history?path=&from_ns=&to_ns=&max_points=&stream_id=` returns one stream in time order.
  The default window is the newest five minutes. `max_points` defaults to 2000 and is capped at 20000.
  Unknown paths return 404 and invalid bounds return 400.
- `WS /api/v1/live` accepts `hello`, `subscribe` and `unsubscribe`.

Send `{"op":"hello","api_version":1}` first. The server sends a catalogue snapshot followed by
availability for every signal. A repeated hello clears subscriptions. Reconnecting requires another
hello and new subscriptions.

A subscription ID replaces its previous path set atomically. `include_latest` sends cached values with
`initial: true`. `max_rate_hz` throttles each path and keeps the newest pending value. Unthrottled
subscriptions batch samples. Slow clients coalesce queued values per path to bound memory, so sequence
gaps are expected. Catalogue removal drops queued samples for that path. Revisions increase per change.

Deduplicate measurements by `(path, stream_id, seq)`. Each source has its own stream ID, and each path's
sequence starts at zero. Availability reports `online`, `stale` or `offline` with `last_seen_ns`.
HTTP errors have `error` and `message` fields. CORS allows all origins.

## Signals and history

Paths begin with `vehicles/mur27/`. Signals cover the inverter, accumulator, driver inputs, vehicle
dynamics, GNSS, ECU, PDU and gateway diagnostics. Units follow the contract, including K, Pa, rad,
rad/s, m and fractions. GNSS latitude and longitude use degrees. The autonomy signals are `pose3`,
`trajectory` and `cone_array` JSON values, with `frame_id` retained in their values.

The vehicle starts with TS active at second 2, becomes ready to drive at second 6 and drives from
second 7. The optional lap beacon reports crossings of the start/finish line.

History preserves spikes with min/max buckets for numeric values, state changes for enums and booleans,
and strided raw geometry. Strings return the newest values. Results are never averaged. Each response
selects the newest stream unless `stream_id` names another retained stream. Large int64 values use
decimal strings when they cannot fit safely in a JSON number.

`src/shared/mur/contract.ts` at the repository root exports the generated descriptors, samples,
history responses, client and server operations, plus `sampleKey()` and `parseInt64()`.
The runtime helpers have no external dependencies.

## Tests

Run from the repository root:

```sh
node --test tools/mock-backend/test/*.test.ts
npx tsc -p tools/mock-backend
```

The tests cover deterministic output, vehicle physics, sequence gaps, duplicates, atomic subscriptions,
latest values, throttling, backpressure, history downsampling and retention, catalogue churn,
availability, unsynchronised sources, lap counters and real-socket reconnects.
