# Developing mur-voir

mur-voir uses Electron and TypeScript. Its Lite build runs in a browser.

## Install and run

Install Node.js and npm, then run:

```sh
npm install
npm run compile
unset ELECTRON_RUN_AS_NODE
npm start
```

The `postinstall` script runs `installElectron.mjs`, `getLicenses.mjs` and `bundleLiteAssets.mjs`. These extract Electron, collect dependency licences and copy bundled assets for Lite.

`compile` writes the app bundles to `bundles/`. Unset `ELECTRON_RUN_AS_NODE` so Electron launches the app.

## Check changes

```sh
npm run typecheck
npm test
npx prettier --check README.md DEVELOPING.md CONTRIBUTING.md
```

The test runner bundles `test/**/*.test.ts` and runs Node's test runner. Pass a path filter to select tests, for example `npm test -- laps`.

Files inherited from upstream keep their original Littleton Robotics header. New mur-voir files carry the MUR header: see `file-header-config.json` and `file-header.txt`.

## Run the mock backend

```sh
npm run mock-backend
```

Open File > Connect (Cmd/Ctrl+K), choose MUR Telemetry and enter `http://localhost:8090`.

For valid laps, start the backend with the lap counter at normal speed:

```sh
npm run mock-backend -- --lap-counter --speed 1
```

High speeds mark every lap invalid. Stop the backend with Ctrl+C.

## Connect live sources

File > Connect offers MUR Telemetry and MQTT direct (debug). The available sources come from `src/hub/dataSources/LiveSourceRegistry.ts`.

The window title shows `address (Searching)` while connecting, `address` while receiving data, `address (No car data)` when the backend is connected without fresh car data, and `address (Error)` after a connection error.

MUR Telemetry uses HTTP and WebSocket endpoints. MQTT uses a `ws://` or `wss://` broker URL. The MQTT prompt accepts a topic filter, mapping, optional username and password, and a raw CAN timestamp option. Credentials last for the session. Mapping settings persist per broker.

MQTT and the radio bridge remain available until `telemetry-api` carries real car data. See the [radio bridge instructions](tools/radio-bridge/README.md) and [MQTT debug publisher](tools/mqtt-mock/README.md).

## Open files

File > Open Log(s) opens MF4, candump with DBC, CSV, JSONL and WPILOG files. Import workers live in `src/hub/dataSources/`; `HistoricalDataSource.ts` selects the worker for each extension.

CAN decoding uses bundled mur-msgs DBCs unless you select a DBC folder in Preferences. Candump files use the `.log` extension. JSONL imports use the same CAN signal paths as candump.

## Use tabs and laps

The available tabs are Line Graph, Track Map, Laps, Table, Statistics, Console, Video, Points, Metadata and Documentation. Points plots data in 2D.

Track Map and Laps share lap setup. Use Laps to choose a reference lap and overlays. Line Graph offers log time, lap time and distance on its x axis. Missing stretches in numeric traces use a dotted bridge.

View > Toggle Tiles shows configurable readouts above the tabs. View > Trackside Layout adds Speed/RPM and Torque graphs and enables the strip.

## Build and serve Lite

```sh
npm run lite-build
npm run lite-serve -- --port 5808 --backend http://127.0.0.1:8090
```

Open `http://localhost:5808/`. The Node server serves the Lite build and proxies HTTP and WebSocket requests under `/api/` to the backend. MUR Telemetry defaults to the page's origin. Use `wss://` for MQTT when the page uses HTTPS.

The browser file picker opens logs locally. Preferences and the current layout persist in browser local storage.

Run the Lite smoke check with:

```sh
npm run lite-smoke
```

The smoke check builds Lite, starts isolated servers and Chromium, checks the connection and file flow, then closes them. Install its browser with `npx playwright install chromium` if needed.
