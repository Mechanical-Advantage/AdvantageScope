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

## Build Lite (web)

```bash
ASCOPE_DISTRIBUTION=LITE npm run compile    # bundles into lite/static/bundles/
cd lite
pip install -r requirements.txt
python3 lite_server.py                      # serves http://localhost:5808
```

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

Registered sources: NT4 and **MUR Telemetry** (`mur`, default `http://localhost:8090`, spec 01 §5).

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
| MCAP (ros2msg/cdr, protobuf, json; zstd chunks)                                           | `mcap/mcapWorker.ts`   | `<topic>` (raw message bytes, `structuredType` = ROS type) plus decoded children; ROS enum fields hold the constant name, with the number at `/raw`; `<topic>/pose3d` (Pose3d) and `<topic>/poses3d` (Pose3d[]) for pose and path types             |
| Base-station JSONL                                                                        | `jsonl/jsonlWorker.ts` | the same `<NODE>/<Signal>` paths as candump for `can<bus>.<Msg>.<Sig>`; other signals are dotted names turned into tree paths                                                                                                                       |

- **CAN decoding.** The merged DBC set is decoded by ID, so the bench naming (`can1` = Control) and the radio naming (`can0` = Control) give the same paths. The DBCs are bundled from mur-msgs (`src/hub/dataSources/can/dbc/SOURCE.txt` records the commit), or come from the DBC folder set in Preferences. No-data sentinels become `NaN`, which the line graph draws as a gap: the `0xFFFF (6553.5) = invalid` values named in DBC comments, plus all-ones (or max-positive) raw values that fall outside the signal's declared range.
- **MCAP time.** Each message uses its `header.stamp` if it has a non-zero one; otherwise its log time. `PointCloud2`, `Image`, `CompressedImage`, `LaserScan` and `OccupancyGrid` are kept as raw CDR only, and their `.msg` definition is stored in the field metadata. Arrays are capped at 64 items.
- **Tests.** Run `npm test`. It bundles `test/**/*.test.ts` with rolldown and runs them with `node --test`.

### Channel display profiles

All scalar readouts use `src/shared/display/ChannelProfile.ts`. Double-click a numeric value in the sidebar to override its display unit or decimal places; blank precision and Automatic unit restore the defaults. Overrides are saved in layout `channelProfiles`, keyed by canonical slash-separated field paths, and survive source replacement.

CSV imports match bundled DBC metadata by message/signal suffix or unambiguous signal name. A sibling `<file>.enums.json` can override labels, for example `{"ECU_Status.ECU_ECUState":{"0":"Init","1":"Standby"}}`. Keys may also be complete CSV names or bare signal names. Samples stay numeric; labels and engineering conversions are applied when displaying values.
