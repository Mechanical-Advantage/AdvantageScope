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

Only NT4 is registered for now.

## Formatting and licence headers

```bash
npm run format
npm run check-format
```

Files inherited from upstream keep their original Littleton Robotics header. New mur-voir files carry the MUR header: see `file-header-config.json` and `file-header.txt`.
