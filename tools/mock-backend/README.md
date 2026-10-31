# mur-voir mock telemetry backend

A deterministic mock of the MUR base-station backend. It implements the dashboard-facing contract in
`specs/01-live-telemetry-interface.md` §5 (HTTP catalogue, HTTP history, live WebSocket), plus the
simulation-clock extensions from `specs/02-ros2-simulation-scope.md` §4/§6.

The data comes from a simulated **mur27** (M26-style FSAE EV) lapping a ~1 km circuit near Melton, VIC.
Speed follows track curvature, with braking before corners and a power limit; throttle and brake are
derived from the required force; motor speed comes from wheel speed through the 9:39 chain; `ay = v²κ`
and `yaw = vκ`; SoC drains from integrated pack current; temperatures rise. Lap times vary by about ±1 s.
Sensor noise comes from a seeded PRNG, so a given `--seed` always produces the same values.

Requires Node ≥ 22.18 (the TypeScript runs directly through Node's type stripping, with no build step).
The only runtime dependency is `ws`, which resolves from the app's `node_modules`.

## Run

```sh
npm run mock-backend                      # from app/: port 8090
npm run mock-backend -- --sim-clock --lap-counter --speed 5
node tools/mock-backend/src/main.ts --help
```

| Flag                    | Effect                                                                                                                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--port <n>`            | HTTP/WS port (default 8090)                                                                                                                                                                                                                                                           |
| `--seed <n>`            | PRNG seed (default 1). Same seed, same values, seqs and drops                                                                                                                                                                                                                         |
| `--speed <x>`           | simulation time multiplier                                                                                                                                                                                                                                                            |
| `--drop-rate <f>`       | fraction of samples lost on the link. The seq is still consumed, so the client sees gaps                                                                                                                                                                                              |
| `--duplicate`           | every live sample is delivered twice: `ingress_link: "rf"`, then `"cellular"` with a later `received_ns`. Same `(path, stream_id, seq)`, `t_ns` and value. History stores it once                                                                                                     |
| `--stale-test`          | 60 s cycle: the `--stale-source` (default `sbg-ins`, i.e. GPS + IMU) publishes for 30 s, then goes silent. Its signals go `stale` after `stale_after_ms`, `offline` 4 s later (producer known disconnected), and `online` again on resume. Same `stream_id` (link loss, not a reboot) |
| `--catalogue-churn`     | 40 s cycle: at +10 s, `catalogue_upsert` `vehicles/mur27/system/churn/probe_<n%3>` (10 Hz). At +30 s, `catalogue_remove` it                                                                                                                                                           |
| `--unsync`              | the `--unsync-source` (default `ennoid-bms`) gets `time_quality: "unsynchronised"`, plus a 1.734 s clock offset and 80 ppm drift                                                                                                                                                      |
| `--sim-clock`           | `t_ns` is sim time starting at 0 (`clock_domain: "sim"`). Enables the sim endpoints                                                                                                                                                                                                   |
| `--lap-counter`         | adds `timing/lap_count` (int64) and `timing/last_lap_time` (s) from a "beacon". Without it, laps must come from GPS                                                                                                                                                                   |
| `--no-history`          | `GET /api/v1/history` returns `501 {"error":"not_implemented"}`                                                                                                                                                                                                                       |
| `--history-seconds <n>` | rolling history length (default 360 s; at least 300 s is guaranteed by test)                                                                                                                                                                                                          |
| `--start-time-ns <ns>`  | fixes the Unix start time and boot nonce. Output is then reproducible down to `stream_id`/epoch                                                                                                                                                                                       |

## Endpoints

- `GET /api/v1/catalogue`: snapshot `{api_version, catalogue_epoch, revision, clock_domain, signals}`
- `GET /api/v1/history?path=&from_ns=&to_ns=&max_points=&stream_id=`
  - `max_points` defaults to 2000 and is capped at 20000.
  - The default window is the newest 5 min of the selected stream.
  - `404 unknown_signal` for an unknown path; `400 bad_request` for bad ns or max_points.
- `WS /api/v1/live`: `hello`, `subscribe`, `unsubscribe`
- `GET /api/v1/sim/status`, `POST /api/v1/sim/{pause,resume,reset}` (only with `--sim-clock`; otherwise `404`)

Every HTTP error body is `{"error": "<code>", "message": "..."}`. CORS is open (`*`).

## Signals (60, plus 2 with `--lap-counter`)

All paths are `vehicles/mur27/<group>/...`, in SI units at the boundary (K, Pa, rad, rad/s, m, fraction `1`).
Each signal has its own stream: `control-can` (inverter, ECU, pedals), `telemetry-can` (dash: steering, wheel
speeds, shocks, PDU), `ennoid-bms` (accumulator), `sbg-ins` (IMU/GPS), `autonomy`, `telemetry` (gateway),
and `lap-beacon`. Names, enums and rates follow the mur-msgs DBCs; the enum labels are copied from the DBC
value tables.

- **powertrain/inverter**: `motor_speed` (rad/s, 100 Hz), `torque_command`, `torque_feedback` (N\*m),
  `dc_bus_voltage`, `dc_bus_current`, `phase_current`, `dc_power`, `motor_temperature`,
  `module_temperature`, `coolant_temperature` (K, 10 Hz), `vsm_state` / `inverter_state` (enum),
  `enabled` (bool)
- **accumulator**: `pack_voltage`, `pack_current` (10 Hz), `state_of_charge`, `cell_voltage_min/max`,
  `temperature_max/min`, `discharge_current_limit`, `imd_state` (enum), `airs_closed` (bool) (1 Hz)
- **driver**: `throttle`, `brake_pressure_front/rear` (Pa), `steering_angle` (rad) (100 Hz)
- **dynamics**: `vehicle_speed` (50 Hz), `wheel_speed_fl/fr`, `rear_axle_speed`, `yaw_rate`,
  `accel_x/y`, `shock_fl/fr/rl/rr` (m) (100 Hz)
- **gps**: `latitude`, `longitude` (deg, float64), `altitude`, `heading` (rad, clockwise from north)
  (10 Hz), `ground_speed` (50 Hz), `solution_mode` (enum), `utc_time` (int64 ns, always a decimal string)
- **ecu**: `car_state` (enum: Init → Standby → Ready To Drive → Driving), `ts_active`, `ready_to_drive`
  (bool), `drive_mode` (enum), `torque_limit`
- **pdu**: `pump_duty`, `fan_duty`, `lv_battery_voltage`
- **system**: `cpu_load` (5 Hz, with occasional spikes), `can_frame_count` (int64 counter), `link_rssi`,
  `status/message` (string, event-driven: state changes, laps, test-mode events, plus a summary every 5 s)
- **autonomy** (`frame_id: "map"`; map is ENU with x = east, y = north, origin at the circuit):
  - `pose` (pose3, 20 Hz)
  - `planned_trajectory` (trajectory, 25 poses over 50 m ahead, 10 Hz)
  - `cones` (cone_array, 10 Hz): cones within 22 m in the forward field of view, with position noise that
    grows with distance and a `confidence` value. Blue cones are on the left, yellow on the right, and
    `orange_big` cones mark the start line; about 3 % are reported as `unknown`.

The start sequence repeats after every sim reset: TS active at 2 s, precharge, RTD at 6 s, then driving
from 7 s, starting on the grid 8 m before the start/finish line (s = 30 m on the main straight).

## Using the types

`src/contract.ts` has no runtime dependencies and uses only erasable syntax. It exports
`SignalDescriptor`, `TelemetrySample`, `HistoryResponse`, every client and server op (`ClientOp`,
`ServerOp`, `SubscribeOp`, `SamplesOp`, ...), `SimStatus`, and the helpers `sampleKey()` (the dedup key)
and `parseInt64()`.

## Tests

```sh
cd tools/mock-backend && node --test test/*.test.ts   # 21 tests
../../node_modules/.bin/tsc -p tools/mock-backend      # typecheck (from app/)
```

The tests cover:

- seq behaviour (starts at 0; +1 per `(path, stream_id)`; drop gaps; duplicates)
- subscribe replace semantics
- `include_latest`
- `max_rate_hz` (upper bound, newest wins)
- backpressure coalescing
- min/max downsampling that keeps spikes
- enum and geometry history
- at least 5 min of retention
- revision ordering under churn
- the stale → offline → online cycle
- unsync
- the lap counter flag and the int64 string encoding
- determinism
- physics invariants
- sim reset, pause and resume
- over a real socket: reconnect gives a fresh snapshot, `501` for `--no-history`, and the sim HTTP endpoints

## Transcript (real run)

`npm run mock-backend -- --port 18090 --seed 42`, then
`CLIP=0 node tools/mock-backend/scripts/client.ts ws://localhost:18090/api/v1/live 0.25 vehicles/mur27/dynamics/vehicle_speed vehicles/mur27/powertrain/inverter/vsm_state vehicles/mur27/nope`
(the client shortens the snapshot and availability burst):

```text
>> {"op":"hello","api_version":1}
<< {"op":"catalogue_snapshot","api_version":1,"catalogue_epoch":"epoch-8795f110","revision":60,"clock_domain":"unix","signals":"[60 descriptors]"}
   e.g. {"path":"vehicles/mur27/dynamics/vehicle_speed","type":"float64","schema_version":1,"unit":"m/s","description":"Vehicle speed from front wheel speeds (Dashboard_Speed)","source":"telemetry-can","nominal_rate_hz":50,"stale_after_ms":250,"display":{"label":"Vehicle Speed","preferred_chart":"line"},"tags":["vehicle-dynamics"],"writable":false,"min":0,"max":40}
<< {"op":"availability","path":"vehicles/mur27/powertrain/inverter/motor_speed","state":"online","last_seen_ns":"1793357988970000000"}
<< {"op":"availability","path":"vehicles/mur27/powertrain/inverter/torque_command","state":"online","last_seen_ns":"1793357988970000000"}
<< … (one availability event per catalogue signal)
>> {"op":"subscribe","subscription_id":"graph-main","paths":["vehicles/mur27/dynamics/vehicle_speed","vehicles/mur27/powertrain/inverter/vsm_state","vehicles/mur27/nope"],"max_rate_hz":10,"include_latest":true}
<< {"op":"subscription_ack","subscription_id":"graph-main","accepted_paths":["vehicles/mur27/dynamics/vehicle_speed","vehicles/mur27/powertrain/inverter/vsm_state"]}
<< {"op":"error","code":"unknown_signal","message":"Unknown path: vehicles/mur27/nope","subscription_id":"graph-main","paths":["vehicles/mur27/nope"]}
<< {"op":"samples","subscription_id":"graph-main","initial":true,"samples":[{"path":"vehicles/mur27/dynamics/vehicle_speed","stream_id":"telemetry-can-6daf3d","seq":1158,"t_ns":"1793357989160000000","received_ns":"1793357989188659102","time_quality":"estimated","ingress_link":"cellular","value":17.463},{"path":"vehicles/mur27/powertrain/inverter/vsm_state","stream_id":"control-can-c8a20a","seq":231,"t_ns":"1793357989100000000","received_ns":"1793357989129324060","time_quality":"estimated","ingress_link":"cellular","value":6}]}
<< {"op":"samples","subscription_id":"graph-main","initial":false,"samples":[{"path":"vehicles/mur27/dynamics/vehicle_speed","stream_id":"telemetry-can-6daf3d","seq":1163,"t_ns":"1793357989260000000","received_ns":"1793357989274826899","time_quality":"estimated","ingress_link":"cellular","value":17.365},{"path":"vehicles/mur27/powertrain/inverter/vsm_state","stream_id":"control-can-c8a20a","seq":232,"t_ns":"1793357989200000000","received_ns":"1793357989223513682","time_quality":"estimated","ingress_link":"cellular","value":6}]}
<< {"op":"samples","subscription_id":"graph-main","initial":false,"samples":[{"path":"vehicles/mur27/dynamics/vehicle_speed","stream_id":"telemetry-can-6daf3d","seq":1168,"t_ns":"1793357989360000000","received_ns":"1793357989369210683","time_quality":"estimated","ingress_link":"cellular","value":17.407},{"path":"vehicles/mur27/powertrain/inverter/vsm_state","stream_id":"control-can-c8a20a","seq":233,"t_ns":"1793357989300000000","received_ns":"1793357989332454587","time_quality":"estimated","ingress_link":"cellular","value":6}]}
```

## Contract decisions (the dashboard should match these)

Where spec 01 is silent or ambiguous, the mock does the following:

1. **Ordering after `hello`:** `catalogue_snapshot` → one `availability` per catalogue signal → (with
   `--sim-clock`) `sim_status`. Then live events. A second `hello` on the same socket clears subscriptions
   and resends everything.
2. **Never-seen signals** have `state: "offline"` and `last_seen_ns: null`. `last_seen_ns` is the `t_ns` of
   the newest sample, not its receive time.
3. **Availability events are global**: they go to every client that has sent `hello`, not just to
   subscribers.
4. **Subscribe with some unknown paths:** a `subscription_ack` listing only the accepted paths, then one
   `error` (`code: "unknown_signal"`, the `subscription_id`, and the extension field `paths`). Then, if
   `include_latest`, one `samples` message with `initial: true`. Duplicate paths are collapsed. Other error
   codes: `bad_request`, `hello_required`, `unsupported_api_version`, `unknown_op`, `unknown_subscription`
   (the last one for unsubscribing an unknown id). Unsubscribe sends no ack.
5. **Replace** drops anything queued for the old subscription. After its `subscription_ack`, only the new
   path set arrives under that id. `max_rate_hz` is optional; if it is absent, every sample is delivered,
   batched about every 25 ms.
6. **Throttling** is per `(subscription, path)` in wall time. There is at least `1/max_rate_hz` between
   deliveries, so the effective rate can be slightly lower. The newest pending sample wins.
7. **Backpressure:** when the socket has more than 1 MiB buffered, or a subscription has more than 20k
   queued samples, the queue is coalesced to the newest sample per path. Seq gaps are therefore normal.
8. **Catalogue removal** drops queued samples for that path. A subscription that names a removed path
   stays registered and resumes if the same path is upserted again. Revisions are global and +1 per
   upsert/remove; the snapshot revision equals the last event's revision.
9. **int64** is a JSON number when |v| ≤ 2^53−1, otherwise a decimal string (`gps/utc_time` is always a
   string). The descriptor type governs parsing.
10. **`--duplicate`** is deliberately not deduplicated on the live socket, so the client's dedup can be
    tested; history is deduplicated. Under throttling, copies naturally collapse.
11. **History:**
    - min/max buckets for `float64`/`int64`
    - state changes for `bool`/`enum`, falling back to min/max if there are still too many
    - `string`: the newest `max_points`, with `truncated: true`
    - geometry: evenly strided raw samples
    - Results are always in time order and never averaged.
    - Only one `stream_id` is returned per response: the newest, or `?stream_id=`. The response includes
      `stream_id`.
12. **Sim clock:**
    - `clock_domain: "sim"` appears on the snapshot and on every descriptor, and `t_ns` starts at 0.
    - `time_quality` is `synchronised` for everything except `--unsync`; `received_ns` stays real Unix
      time.
    - **Pause** stops samples. Availability does not go stale while paused, because staleness is measured
      in sim time.
    - **Reset** flushes queued pre-reset samples, then sends `sim_status` with `reason: "reset"`. After that:
      - every source gets a new `stream_id`;
      - `seq` restarts at 0 and `t_ns` jumps back to 0;
      - the latest-value cache is cleared, but the catalogue (epoch and revision) is unchanged.
    - The run after a reset is identical to the first run, apart from the stream ids.
13. **Time quality in Unix mode:** CAN sources are `estimated` (stamped by the gateway), `sbg-ins` and
    `autonomy` are `synchronised`, and every sample carries `ingress_link`.
14. **Extensions** (clients should ignore unknown fields and ops): `clock_domain`, `ros_msg_type`,
    `HistoryResponse.stream_id`, `ErrorOp.paths`, and the `sim_status` op.
15. **Units:** motor speed is `rad/s` (convert to rpm in the UI), temperatures are `K`, pressures `Pa`,
    fractions `"1"`, and lat/lon `deg`. The torque unit string is `N*m`.

## Optional binary lidar extension

Run `npm run mock-backend -- --sim-clock --point-cloud` to advertise
`vehicles/mur27/perception/points` as a binary PointCloud2 topic. The dashboard opens
`WS /api/v1/points` only while that layer is active. This is an optional mock extension,
not part of the spec-01 JSON sample contract. Without the flag, the endpoint is absent.

Each binary packet contains a four-byte little-endian JSON-header length, that many
UTF-8 header bytes, then interleaved little-endian float32 x/y/z/intensity values.
The header carries PointCloud2 layout/fields, `header.frame_id` (`map`), `t_ns` and
`run` (the simulation reset count). Scans contain 1,200 deterministic points at 10 Hz;
pausing stops them and reset updates the run identifier. The payload remains binary
through Log and the decode worker. Binary scan history is not offered over HTTP.
