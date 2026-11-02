# Developing mur-voir

mur-voir is an Electron + TypeScript app (with a browser "Lite" build). Tested with Node 26 / npm 11 on macOS; any recent Node LTS should also work.

## Install

```bash
npm install
```

`postinstall` runs three small steps:

- `installElectron.mjs`: makes sure the Electron binary is extracted into `node_modules/electron/dist`.
- `getLicenses.mjs`: collects third-party licences for the About/Licenses window.
- `bundleLiteAssets.mjs`: copies `bundledAssets/` into the Lite build.

### Gotchas

- **npm 11 blocks dependency install scripts.** Dependency scripts only run if they are listed in `allowScripts` in `package.json`. Electron, lzma-native and protobufjs are approved there. To review new packages, run `npm install-scripts ls`, then `npm install-scripts approve <pkg>` or `npm install-scripts deny <pkg>`.
- **Electron extraction.** On Node 26, Electron's own `install.js` can exit without extracting the zip, because `extract-zip` never resolves. `installElectron.mjs` works around this: it fetches the zip through `@electron/get` (using the shared cache in `~/Library/Caches/electron`) and unpacks it with `ditto` (macOS), `unzip` (Linux) or `tar` (Windows). To repair a broken install, run `node installElectron.mjs`.
- **`ELECTRON_RUN_AS_NODE` must be unset.** Some shells set it, for example terminals embedded in Electron-based editors and agents. If it is set, `electron` starts as plain Node and the app fails with errors like `Cannot read properties of undefined (reading 'whenReady')`. Run `unset ELECTRON_RUN_AS_NODE` first.
- **Emscripten is optional.** The WPILOG indexer uses `bundles/wpilogIndexer.wasm` if one was built with `npm run wasm:compile` (requires Emscripten 4.0.12). Otherwise it falls back to a pure-JS port of the same code (`src/hub/dataSources/wpilog/indexer/wpilogIndexer.ts`). `wasm:compile` prints a warning and exits cleanly when `emcc` is missing.

## Compile and type-check

```bash
npm run compile     # bundles into bundles/
npm run typecheck   # tsc --noEmit
npm run watch       # rebuild on change
```

## Run Electron

```bash
unset ELECTRON_RUN_AS_NODE
npm start                                   # or: npx electron bundles/main.js
npx electron bundles/main.js path/to/log.wpilog --user-data-dir=/tmp/mur-voir-dev
```

Pass `--user-data-dir` to get a throwaway profile (preferences, window state and layouts are stored there).

### Driving the app from Playwright

Use `_electron` from `playwright`:

1. Remove `ELECTRON_RUN_AS_NODE` from the environment you pass in.
2. Point `executablePath` at `node_modules/electron/dist/Electron.app/Contents/MacOS/Electron`.
3. Pass `bundles/main.js` and `--user-data-dir=<temp dir>` as args.

The hub window is the one whose URL ends in `hub.html`.

## Build and deploy Lite (web)

Build on a development machine (Node and npm required):

```bash
npm install
npm run lite-build
npm run lite-serve -- --port 5808 --backend http://127.0.0.1:8090
```

Open `http://<base-station-host>:5808/` from a pit browser. The Node server binds to
all interfaces, serves the bundled assets and proxies `/api/` HTTP and WebSocket
requests to the MUR backend. The MUR connection dialog defaults to the page's
own origin, so remote browsers connect to the base station rather than their own
localhost. The address is editable: `http://base:8090/prefix` uses
`/prefix/api/v1/...`, for a reverse proxy deployment. Serve at the origin root.
For HTTPS, terminate TLS at a reverse proxy with WebSocket upgrades enabled;
ROS and MQTT addresses must then use WSS.

For a Linux/Raspberry Pi deployment, copy `lite/static/` (dereference its `www`
symlink, e.g. `cp -RL lite/static staging/lite/static`) and
`tools/lite-serve/main.mjs` preserving that directory structure. Run the Node
server with a recent Node LTS; it needs no npm packages at runtime. The mock and
build dependencies are development-only. The server has no host filesystem log
browser or asset upload endpoint; logs and URDF folders are selected locally.

The existing Python server is also supported:

```bash
cd lite
python3 -m pip install -r requirements.txt
python3 lite_server.py
```

It serves on port 5808. Enter the MUR backend address explicitly, or put both
behind a reverse proxy routing `/api/` to the backend; Python does not proxy it.
The optional `--enable-file-access` enables the original base-station log browser
and asset ZIP uploads. Use File → Browse Base Station Logs for that flow.

File → Open Log uses the browser file picker. Select CSV, candump `.log`, MCAP,
JSONL, WPILOG or RLOG; select companion `.dbc`, `<stem>.json`,
`<stem>.markers.csv` and `<file>.enums.json` alongside the log when needed.
Without custom DBCs, CAN decoding uses the bundled mur-msgs set. File → Export
Layout downloads desktop-compatible JSON; Import Layout restores its first hub.
Preferences and the current layout persist in this browser's local storage.
The 3D tab's Load URDF folder uses Chromium's directory picker and embeds local
meshes in layouts; expand xacro first.

```bash
npm run lite-smoke                 # builds, starts isolated servers and Chromium
npm run lite-smoke -- --skip-build # reuse the last Lite build
```

Install Chromium with `npx playwright install chromium` if it is not cached.
The smoke script is separate from `npm test`; it checks same-host MUR HTTP/WS,
a live value, graph, health strip, layout download/upload and CSV import, then
closes its browser and servers. Override `LITE_SMOKE_PORT` and
`LITE_SMOKE_MOCK_PORT` if its defaults (15808 and 18091) are occupied.

## Package the desktop app

```bash
npm run fast-build   # unpacked app in dist/
npm run build        # installers
```

The builds are unsigned unless signing credentials are configured.

## Live sources

All live sources are registered once, in `src/hub/dataSources/LiveSourceRegistry.ts`, as `{id, name, defaultAddress, liteCompatible, create()}`.

- The hub creates sources from the registry.
- The hub sends the serializable list (`set-live-sources`) to the Electron and Lite main processes, which build the File → Live Source menus from it.
- The `liveMode` preference stores the selected ID. Unknown IDs fall back to the first registered source.

Registered sources: NT4, **MQTT direct (debug)** and **MUR Telemetry** (`mur`, default `http://localhost:8090`, spec 01 §5).

File → Connect… (`Cmd/Ctrl+K`) opens an in-page dialog (source, address, recent servers stored in the `liveRecent` preference). The title-bar status pill shows backend, car and sim state; its popover has sim pause/resume/reset when the backend has `/api/v1/sim/status`.

### MUR live source (`src/hub/dataSources/mur/`)

- `MURSource.ts`: WebSocket/HTTP client. One subscription (`mur-voir-active`) holds the active tab + sidebar fields and is replaced when that set changes (`max_rate_hz` 50, `include_latest`). History is fetched when a field becomes active in a tab; a `501` is shown as "history unavailable".
- `MURLogAdapter.ts`: the only place MUR types map to Log fields (`pose3` → Pose3d, `trajectory` → Pose3d[], `cone_array` → Translation3d[] with a `class` child, `enum` → label string; unit into metadata).
- `MURTime.ts`: BigInt session-relative seconds; `unsynchronised` samples use receive time (scaled onto the sim clock in sim mode) and are flagged.
- `MURDedup.ts`: `(path, stream_id, seq)` dedup with a bounded window.
- `MURSegments.ts`: a sim reset (or a clock rewind / new stream in sim mode) starts a new **run**. Each run retains its Log for the connection lifetime; the status popover selects past runs or returns to live. Incoming samples continue buffering into the current run. Late samples from retired streams are dropped. The live discard preference trims only the current run.

Unit tests for the pure modules: `npm test` (`tools/run-tests.mjs` bundles `test/**/*.test.ts` with rolldown and runs node:test; `npm test -- csv` filters by path).

## Formatting and licence headers

```bash
npm run format
npm run check-format
```

Files inherited from upstream keep their original Littleton Robotics header. New mur-voir files carry the MUR header: see `file-header-config.json` and `file-header.txt`.

## File importers

Historical importers are workers in `src/hub/dataSources/` registered in `HistoricalDataSource.WORKER_NAMES`. Each one indexes the file once, then decodes fields only when the hub requests them (`ImporterUtil.runLazyWorker`). `.log` files are sniffed: candump `-L` text goes to `candumpWorker`, anything else to the Road Runner worker.

| Format                                                                                    | Worker                 | Field paths                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSV (wide or long, `,` `;` tab, quoted, BOM, `name [unit]`/`name (unit)`/MoTeC units row) | `csv/csvWorker.ts`     | the column name; dotted names (`Car.Data.Motor.MotorRPM`) become tree paths (`Car/Data/Motor/MotorRPM`); file info is under `Metadata`                                                                                                              |
| candump `-L` + DBCs                                                                       | `can/candumpWorker.ts` | `<NODE>/<Signal>` (NODE = transmitter on the DBC `BO_` line); enum signals hold the label, with the number at `<NODE>/<Signal>/raw`; `CAN/Unknown/0x<ID>`, `CAN/<iface>/ErrorFrame`, `Markers`, `Metadata/Run` (`.json` sidecar), `Metadata/Import` |
| MCAP (ros2msg/cdr, protobuf, json; zstd/LZ4 chunks)                                       | `mcap/mcapWorker.ts`   | `<topic>` (raw message bytes, `structuredType` = ROS type) plus decoded children; ROS enum fields hold the constant name, with the number at `/raw`; `<topic>/pose3d` (Pose3d) and `<topic>/poses3d` (Pose3d[]) for pose and path types             |
| Base-station JSONL                                                                        | `jsonl/jsonlWorker.ts` | the same `<NODE>/<Signal>` paths as candump for `can<bus>.<Msg>.<Sig>`; other signals are dotted names turned into tree paths                                                                                                                       |

- **CAN decoding.** The merged DBC set is decoded by ID, so the bench naming (`can1` = Control) and the radio naming (`can0` = Control) give the same paths. The DBCs are bundled from mur-msgs (`src/hub/dataSources/can/dbc/SOURCE.txt` records the commit), or come from the DBC folder set in Preferences. No-data sentinels become `NaN`, which the line graph draws as a gap: the `0xFFFF (6553.5) = invalid` values named in DBC comments, plus all-ones (or max-positive) raw values that fall outside the signal's declared range.
- **MCAP time.** Each message uses its `header.stamp` if it has a non-zero one; otherwise its log time. `PointCloud2`, `Image`, `CompressedImage`, `LaserScan` and `OccupancyGrid` are kept as raw CDR only, and their `.msg` definition is stored in the field metadata. Arrays are capped at 64 items.
- **Tests.** Run `npm test`. It bundles `test/**/*.test.ts` with rolldown and runs them with `node --test`.

### MDF4 / MF4 recordings

`.mf4` and `.mdf` use `mf4/mf4Worker.ts` in desktop and Lite. The parser validates block bounds and linked lists, indexes fixed-size records (sorted or interleaved record IDs), and decodes requested fields only. DT, DL, HL and zlib DZ storage, including transposed DZ, are supported. Channels include endian-aware integers, floats, strings and byte arrays, master time, units from CC/TX/MD, and identity, linear, rational, interpolated/nearest/range tables and enum conversions. Unsupported MDF 3.x files produce an explicit error; export them as MDF4 first. Algebraic/text-to-value conversions, variable-length records, external data and newer compression codecs are unsupported and should be exported to fixed-record MDF4/zlib.

Decoded channels use `<acquisition name or source>/<channel>` (a numbered group when unnamed). Enum labels have a numeric `/raw` child. `CAN_DataFrame` compositions are indexed into the **same candump importer**, using bundled DBC paths, multiplexing, enum labels and no-data sentinels. A Preferences DBC folder also applies on desktop. CAN remote/error groups are currently skipped. Multipart Wireless-telem files open individually; automatic concatenation and manifest/DBC snapshot discovery are not implemented. Their timestamps retain the shared run-relative time, so no per-part timestamp rebasing occurs.

Fixtures under `test/fixtures/mf4/` are below 3 KB each. Regenerate with `python tools/mf4/generate.py` in an environment containing `asammdf` and `numpy` (for example, create `refs/venvs/mf4` with `python3 -m venv`, then install those packages). The generator independently reads back the unsorted fixture with asammdf. Tests check physical values/timestamps against its output, endian/bit fields, conversions, enums, CAN sentinels and compression variants.

Validation on the supplied Wireless-telem run: all three parts opened (31,605 / 31,689 / 17,232 records, 387 CAN fields each). The decoded live MF4's **80 channels / 2,242 samples and timestamps matched asammdf exactly**.

### MCAP decompression performance

`mcap/Compression.ts` uses embedded WASM `zstddec` (MIT and BSD-3-Clause), with `fzstd` if WASM initialization is unavailable, and `lz4js` (ISC) for LZ4 frames. The worker retains a 512 MB bounded decompressed cache. `McapIndexedReader.readMessages({topics})` uses chunk/channel message indexes before decompression; an integration test proves an unrelated topic's LZ4 chunk is skipped.

On `refs/foxglove-sample-data/mur_fsae_synthetic.mcap` (80 MB, 101 chunks), cold `/vehicle/state` first-field delivery in Electron went from **3.54 s to 1.27 s** (indexing + decode + worker serialization; excludes disk IO and drawing). The decode phase alone was **3.46 s to 1.18 s**. A Node indexed-reader benchmark over all 2,001 messages went from **6.87 s to 0.73 s**. Timings vary with machine load and are not a CI assertion. Reproduce the reader comparison from the worktree with:

```bash
node tools/mcap/benchmark.mjs /path/to/mur_fsae_synthetic.mcap
```

### Channel display profiles

All scalar readouts use `src/shared/display/ChannelProfile.ts`. Double-click a numeric value in the sidebar to override its display unit or decimal places; blank precision and Automatic unit restore the defaults. Overrides are saved in layout `channelProfiles`, keyed by canonical slash-separated field paths, and survive source replacement.

CSV imports match bundled DBC metadata by message/signal suffix or unambiguous signal name. A sibling `<file>.enums.json` can override labels, for example `{"ECU_Status.ECU_ECUState":{"0":"Init","1":"Standby"}}`. Keys may also be complete CSV names or bare signal names. Samples stay numeric; labels and engineering conversions are applied when displaying values.

### MQTT direct debug source

`src/hub/dataSources/mqtt/` uses the mqtt.js browser bundle over `ws://` / `wss://` in Electron and Lite. Connect accepts a broker URL, optional session-only username/password, topic filter (default `mur/#`), mapping and raw-CAN timestamp option. Credentials cannot be embedded in URLs and are never saved to preferences, recent servers or layout JSON. Mapping settings are saved per broker in `mqttConnections` preferences. Re-enter credentials after restarting. A Lite page served over HTTPS needs a `wss://` broker.

- JSON per signal: `<prefix>/<NODE>/<Signal>` and `{ "t": <Unix seconds or nanoseconds>, "v": <scalar> }`, or a bare number.
- JSON object: `<prefix>/<NODE>` and `{ "t": ..., "Signal": <scalar>, ... }`.
- The literal topic-filter prefix before the first wildcard is stripped. With an exact filter, its parent is stripped. ASCII uses explicit `name=value` paths, one per line.
- Raw CAN: `id(u32 BE) | dlc(u8) | data[8]`, optionally preceded by `timestamp(u64 BE ns)`. Standard IDs are at most 0x7FF; larger IDs or SocketCAN bit 31 select extended IDs. Bundled DBC paths, labels, enum `/raw` fields and sentinels match candump. Remote/error frames are ignored; unknown data frames remain raw under `CAN/Unknown`.
- Use decimal strings for exact nanoseconds; numeric JSON timestamps may have already lost precision. Missing/invalid timestamps use the existing receive-time helper and unsynchronised warning. ASCII and bare numbers are always unsynchronised.
- Field discovery is dynamic. Matching canonical DBC paths receive channel metadata. Incompatible type changes are ignored to protect existing history. The debug source subscribes to the whole filter, has no history endpoint, and retains received data across reconnects with exponential backoff (0.5–30 s). Freshness is receive-based: stale after 1 s, offline after 5 s or broker loss.

Run `npm run mqtt-mock`; see `tools/mqtt-mock/README.md` for filters for all four modes. `npm test -- mqtt` tests payloads and bundled CAN decoding.

## Shared 3D spatial view

The 3D tab uses the same `SpatialLayers` controller and renderer for MUR live data,
Foxglove ROS 2 live data and MCAP recordings. Drag whole typed topics into **Layers**.
Pose topics render the URDF car with a ten-second trail; Path/trajectory topics render
lines; MUR cone arrays and ROS MarkerArray topics render geometry. Each layer reports
its frame and sample time, or a visible missing/unknown/extrapolated-frame error.

- **Environment:** MUR Grid, Track or None. **Load metric track…** accepts CSV
  `x,y,z,class` cones or GeoJSON Point/LineString geometry in local metres (not WGS84
  longitude/latitude). The imported track is stored with the layout.
- **Fixed frame:** choose a known TF frame from the dropdown; **Tree** shows parent/child links and transform ages. **Frame axes**
  overlays the tree. TF, JointState and robot-description topics are subscribed while
  the 3D tab is active; other ROS topics follow the active fields.
- **Load URDF folder…:** choose a folder containing an expanded `.urdf` and local meshes.
  URDF origins, continuous/revolute/prismatic joints, limits and mimic joints drive
  kinematics. JointState positions and available TF link poses animate it. STL, OBJ,
  DAE, GLB and glTF are supported; missing meshes show an error. Xacro must be expanded
  before loading. The built-in MUR car is used by default because the MURA reference
  robot is xacro based. `/robot_description` is a fallback; an explicitly loaded folder
  takes precedence. Mesh data is embedded in saved layouts, which can make them large.
- **PointCloud2:** CDR stays binary in Log and is decoded in a worker. Layer options
  choose intensity/z/rgb, viridis/turbo, point size and retained scan count (1–20).
  Retained scans resolve TF at acquisition time; a rewind or new Log clears the cache.
  Cloud transfer to satellites currently uses the existing structured-clone channel.

### ROS mock and Foxglove live source

```bash
node tools/mock-ros.mjs
# Optional port override and deterministic rewind every 20 simulated seconds:
ROS_MOCK_PORT=18765 ROS_MOCK_RESET=1 node tools/mock-ros.mjs
```

Connect with **ROS 2 (Foxglove)** to `ws://localhost:8765` (or the overridden port).
The protocol is `foxglove.websocket.v1`, using CDR ROS 2 messages. The mock publishes
`/clock`, `/tf`, `/tf_static`, `/vehicle/pose`, `/planning/path`, `/perception/cones`
and `/lidar/points`. The server Time operation drives the cursor; clock rewinds
replace Log and reset selection, TF, markers and cloud retention together.

To compare recordings, open `refs/foxglove-sample-data/mur_fsae_synthetic.mcap` and
add its typed pose, path, marker, TF and lidar topics to the same Layers list.

Spatial regression tests live in `test/spatial/`. The backend's own suite is separate:
`node --test tools/mock-backend/test/*.test.ts`.

### Trackside health

View → Toggle Health Strip pins configurable readouts above every tab, saved in layout `healthStrip`. Defaults match canonical MUR live paths and bundled DBC names. Drag a scalar field onto the strip or use Add tile; ⋯ / right-click opens label, display unit/precision, direction, warn/critical, fault and latch settings. Limits use displayed engineering units. Defaults are illustrative; configure them for the car. Unsupported/missing signals remain unknown. IMD is the mock's available accumulator fault indicator; it is not a complete BMS fault word.

WARN/CRIT use text and backgrounds. Live freshness and age come from LiveStatus, including backend loss. UNKNOWN never holds a plausible numeric value; a latched fault retains its text alongside UNKNOWN until acknowledged. Click the readout to acknowledge; an active fault immediately re-latches. Latches reset on source/run replacement and are not persisted. File readouts follow the shared cursor and request lazy fields through Tabs.getActiveFields.

View → Trackside Layout adds or updates Speed/RPM and Torque graph tabs while preserving other tabs, enables the strip, sets a following 30-second window, and enlarges legend values. LIVE/REVIEW uses Selection.lock/unlock and reflects timeline actions. Speed/RPM use separate axes; torque command/actual share the torque tab because the existing graph supports only two numeric axes. If applied before signals arrive, the preset fills unresolved axes when the catalogue arrives; axes edited in the meantime are preserved. Saved profiles, tiles and graph settings persist normally; the timeline follow window is applied by the preset action.

Traces use the stock AdvantageScope line: 1px solid unless the user picks a bolder size for a field.

Install the mock's own dependencies with `npm install --prefix tools/mock-backend` first. Health verification mock: `npm run mock-backend -- --port 8090 --seed 1 --stale-test --stale-source ennoid-bms --sim-clock --lap-counter --fault-demo`. The fault pulse runs at 10–20 seconds and recovers; BMS-source silence begins at 30 seconds. Pure threshold, latch and canonical matching tests live in `test/health-strip.test.ts`.

## Lap analysis

Track Map and Laps share `LapService`; dragging a numeric channel selects map colour or table metrics.
Lap setup accepts canonical field paths, event mode, wheel radius/ratio, minimum lap time, manual
markers and sector fractions. Place sector gates or an autocross finish at the cursor, then drag
endpoints on Track Map. Start gates can be regenerated automatically. Laps chooses reference and
overlays; the Line Graph axis selector switches between log time, lap time and distance (with ΔT
on the right axis). Layout state stores field paths and lap setup. Timeline bands use the same laps.

`src/shared/laps/LapEngine.ts` is pure and tested by `npm test -- laps`. It implements ENU gate
intersections, interpolated crossings, direction/rearm checks, counter/beacon priority, manual and
distance fallbacks, sectors/bests, 75 m acceleration runs, skidpad yaw labels, point-to-point finish
gates and endurance stop-based stints. Distance uses front-wheel speed, motor speed and GPS in that
order, rescales complete laps to reference length, and produces a 1 m grid. Derived channels append
between updates and rebuild after gate/reference edits. Analysis currently recomputes the loaded
sample set at most twice per second; it is not a bounded incremental lap detector. Large live
histories may need a retained-tail analyzer. Skidpad requires the operator to place the centre gate;
endurance driver changes use a standstill longer than 60 seconds, not a driver identity signal.

### Real Marple recording verification (31 October 2026)

The 231 MB long CSV was opened in Electron, not added to tests or git. Initial resumed run:
13.588 s launch-to-catalogue, 13.712 s launch-to-derived channels. A later run under concurrent
workspace build load took 32.996 s / 35.166 s respectively. These include Electron startup and
lazy parsing of lap inputs; they are not isolated importer benchmarks. A final clean launch
with the timestamp-union analysis took 7.646 s to catalogue and 15.704 s to derived channels.
The final paired-fix build measured 3.245 s / 3.246 s; its asserted map bounds were 29.45 m east
by 49.83 m north. Timing varies substantially with other builds running on this shared machine. No importer rewrite was
needed. Front GPS covers a short, non-returning trace (about 60 m); no complete GPS lap can be
inferred. Rear coordinates drift from approximately (48.87, 2.16) to (65.60, -33.03) and are unsuitable.

Steering investigation: the raw file contains 30,136 samples of
`bus1.Dashboard_Dynamics.DASH_SteeringAngle`, and no bus0 Dashboard_Dynamics signals. Raw range is
295.3–296.4 degrees, mean 295.825567, population standard deviation 0.289082 degrees, median sample
interval 10.001 ms. The jitter is already in the source, consistent with sensor/quantization noise
around a non-zero absolute reading. The CSV cannot establish a physical steering zero or whether
an upstream calibration offset is missing. No arbitrary zero correction is applied.
`columnNameToKey` changes dots to slashes and retains `bus0`/`bus1`; `indexLong` groups by the full
signal name. The worker-level test imports interleaved two-bus steering data and verifies separate
fields with unchanged values. Duplicate DBC definitions exist on both CAN networks, but this CSV
has only the bus1 message: the importer is not merging buses.

Screenshots are saved outside the worktree under `research/mur-voir/screenshots/` with `laps_`
prefix: real_track, real_table, mock_track, mock_table, distance_delta, lap_time, timeline, live.
For Electron automation, use the reference Playwright driver described above. `ws` is a declared
dev dependency for the mock backend. Use a spare port if 8090 is already occupied.

### ROS inspection tabs

Raw Messages expands the latest message at the shared cursor (arrays preview the first 64 entries).
Log shows `/rosout` with a minimum severity filter; click a row to move the cursor.
Image supports CDR `sensor_msgs/Image` (rgb8/bgr8/rgba8/bgra8/mono8, including row padding)
and `CompressedImage` formats supported by Chromium. Other pixel encodings show an explicit error.
Topic hover inspectors show source message totals where available; live totals count received messages,
and rates describe retained samples. QoS is shown only when supplied by the source.

### Radio JSONL bridge

`npm run radio-bridge -- --input /absolute/path/live.jsonl --port 1885` follows
Wireless-telem's base-station output and runs a localhost MQTT-over-WebSocket
broker. Connect with **MQTT direct (debug)**, `ws://127.0.0.1:1885`, topic filter
`mur/signal/#`, **JSON per signal**. See [the bridge README](tools/radio-bridge/README.md)
for replay, network binding and simulator commands. Tests: `npm test -- radio-bridge`.

## Missing numeric trace data

Stepped and smooth line graphs replace missing stretches with a 1px, 45%-alpha
straight bridge in the trace colour, dashed `[2, 3]`. Solid trace widths and raw
steps are unchanged. Points and discrete lanes retain stock behaviour.
`src/shared/TraceGaps.ts` detects time steps strictly greater than
`max(1 second, 10 × median period)` and NaN runs. Period statistics use the whole
field and are cached per log/field, updating when samples arrive. A median above
1 second means on-change data and retains the stock hold without bridges.
An unresumed stream stops at its last valid sample after the threshold, or when
MUR reports the field stale/offline; within the threshold it holds normally.
Lap time and distance overlays map and clip the same bridges to each lap.
Hover/cursor values retain their existing semantics.

Run `npm test -- trace-gaps` for detection, cadence caching, zoom, sentinels,
unresumed streams and lap-coordinate tests. For visual checks use the mock's
`--stale-test` (GPS source drops out from 30–60 seconds), or suspend/resume the
backend process while a live graph is following. Check the unresumed view, the
resumed dotted bridge and a zoom inside the gap. `npm run lite-smoke` exercises
the complete Lite build and live connection flow.
