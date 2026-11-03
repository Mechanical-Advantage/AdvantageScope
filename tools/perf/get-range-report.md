# LogField range lookup

Replaced the four linear timestamp searches in `LogField.getRange` with binary searches. Removed the cached-search timestamp slices and callback allocations. The result still owns its outer timestamp/value arrays and contains exactly the same selected samples. UUID caching and startOffset behavior are unchanged, including negative cached indices left by empty fields and fractional offsets.

`putData` inserts out-of-order numeric timestamps at their ordered position and overwrites an existing timestamp. Adjacent equal values may be coalesced. `clearBeforeTime` preserves order and can create duplicate timestamps at the front. Serialized fields retain that ordering. The strict start search and inclusive end search deliberately differ: the last sample at/before start and the first sample at/after end reproduce the old sample-and-hold behavior, including duplicate boundary timestamps and the original end-sample inclusion.

`Log.getNumber` and the typed getters forward directly to the field without copying. The remaining `getRange` slices already cover only the returned range, not the whole history unless the query requests it. They cannot safely be shared: `LineGraphController` shifts, pops, splices, pushes and assigns returned timestamps/values. No caller files were changed. The existing generic `Log.getRange` forwarding behavior was retained.

Typed arrays were deferred. `getTimestamps` exposes `number[]`, all LogValueSet interfaces use mutable arrays, insertion and front-discard use splice, and `toSerialized`/`fromSerialized` expose/accept those same arrays. Worker import/export and historical field hand-offs consume this representation; merge maps timestamp offsets, and satellite commands are produced from the existing range results. Amortized typed storage would require capacity/length tracking plus compatible snapshots and changes to insertion/discard and serialization boundaries. That is substantially wider and riskier than the required lookup fix. None of those representations or hand-off paths changed here.

## Verification

- `npm test`: exit 0; **150 tests, 150 pass, 0 fail, 0 cancelled, 0 skipped** (783.114958 ms test-runner duration).
- The two added tests include 60,000 differential queries against a frozen copy of the old method, using 12 deterministic seeds, persistent/multiple/absent UUIDs, empty/single/duplicate timestamp fields, exact boundaries, before/after-history and reversed ranges, infinities, NaN query boundaries, negative/positive/fractional/infinite offsets, appends, same-time overwrites, out-of-order inserts and front-discards. Separate assertions cover sample-and-hold, mutable result isolation and structured-clone serialization followed by discard/append.
- `npm run compile`: exit 0; rolldown 1.0.2, 25.80 s.
- `npx prettier --write` on the changed TypeScript/JavaScript files; `git diff --check` passed.
- Live smoke: ran the compiled `bundles/main.js` with Electron 39 from the installed dependency, using the profiling harness's launch/connect helpers and a throwaway `--user-data-dir`. Started this worktree's mock backend on port 18291 with `--sim-clock --lap-counter`, connected MUR and applied Trackside Layout. Across six seconds: 62 fields, log end 6.54 → 12.56 s; visible 490×300 graph canvas content changed; health values changed (e.g. 92.0 → 91.1, 579.66 → 565.87, Ready To Drive → Driving). No captured renderer page errors. Shut down only the two processes started for this check.

Initial setup encountered a full disk (`ENOSPC`). Removed only the dependency copy and generated license copies created for this task, then used symlinks to the existing alpha-release dependencies/licenses. The first `fast-build` failed because this fresh worktree lacked generated `src/licenses.json`. After supplying that file, the compile and compiled-app smoke succeeded. A packaged distributable, satellite-window runtime, and separate worker round-trip runtime were not exercised; the smoke used the freshly compiled app with the development Electron executable.

## Benchmark

Run `node tools/perf/get-range-benchmark.mjs` from the repository root. This standalone script bundles into a temporary directory and is not part of the app bundle. Baseline is the frozen old method used by the differential test. Node v26.12.0, macOS arm64; each field has decimal timestamps at 50 Hz. Query is a single timestamp just beyond the latest sample (the live sample-and-hold case), returning one sample. Cached rows reuse a UUID. Old: 300 measured lookups; new: 100,000; both warmed up first. Timing is measured separately from allocation profiling. V8 heap sampling uses a 32,768-byte interval and includes objects collected by minor/major GC. Allocation figures are estimates, not retained heap or whole-app allocation rates.

| Samples | UUID cache | Old ns/lookup | New ns/lookup | Old sampled bytes/lookup | New sampled bytes/lookup |
| ------- | ---------- | ------------: | ------------: | -----------------------: | -----------------------: |
| 40,000  | No         |       730,180 |           380 |                1,279,357 |                      155 |
| 40,000  | Yes        |       847,573 |           492 |                1,266,029 |                      169 |
| 456,000 | No         |    12,092,157 |           682 |               14,577,564 |                      164 |
| 456,000 | Yes        |    11,456,623 |           649 |               14,600,616 |                      145 |

These are microbenchmark results for the specified query, not an end-to-end frame-rate claim. Returning a large range still copies its selected samples by design.
