# Disk-backed CSV loading

## Change

Electron now sends the CSV size and optional enum sidecar instead of reading the CSV into a Buffer. A window-scoped source registry answers bounded byte-range requests using the source UUID. Each read opens and closes its descriptor and verifies size and modification time. Stopping a source releases its registration; temporary sources are removed on stop or window close.

HistoricalDataSource forwards worker read requests through the existing main message port and transfers returned ArrayBuffers to the worker. CSVFile retains one 4 MiB byte cache and, for ASCII chunks, one decoded chunk. It handles UTF-8 and BOM-marked UTF-16 in either byte order. Logical rows spanning chunks are assembled temporarily, including quoted newlines and escaped quotes.

The worker retains block-allocated Float64 byte offsets and timestamps (16 bytes per indexed row). Long-layout channel membership uses another 8 bytes per row, with smaller allocation blocks per channel. Type inference uses the same sample row choices as before; long-layout samples are read in file order across channels. Cached rows are processed synchronously to avoid a microtask for every record. Requested fields are still batched, decoded lazily, and merged through the existing timestamp-offset/key-prefix path.

Lazy decoding reads disk cache blocks containing the requested rows. Sparse channels can therefore require a pass over most disk blocks; unrelated decoded columns are not retained. Embedded CSV child logs and Lite still supply their existing in-memory byte arrays, but no whole-file decoded string is retained.

Limits now produce descriptive errors: 16 MiB per logical row, 32 MiB for the first 200 layout-sample rows, and safe-integer byte offsets. Missing/unreadable or changed files, malformed quoted fields, and worker/decode failures use HistoricalDataSource's existing custom-error dialog path. Whole-file string length is no longer a limit.

## Confirmed failure

With the old worker in the actual Electron app, a generated 650,006,909-byte file arrived intact but TextDecoder returned an empty string. Layout detection then threw `Cannot read properties of undefined (reading 'fields')`. The real 560,487,450-byte file produced the same empty decoder result and exception. Node's string-length exception was not the app's actual exception.

## Verification

Executed on 2026-11-03 in the assigned worktree, using the compiled app under the local Electron executable and a separate temporary user-data directory for every run. The supplied perf harness launched and inspected only these app instances. Baseline bundles came from the adjacent alpha-release checkout; its CSV worker source matched this branch's parent exactly. No real log values or screenshots were saved in the repository.

- `npm run compile`: passed (rolldown, 13.90 seconds on the final build).
- `npm run typecheck`: passed.
- `npm test`: 152 tests passed, 0 failed, 0 skipped (654.767125 ms reported test duration).
- Frozen old-worker differential tests cover wide and long layouts, inferred types, serialized metadata, values and timestamps, quoted commas/newlines/escaped quotes, CRLF, UTF-8 BOM, empty cells, duplicate/non-monotonic timestamps, decimal commas and no trailing newline. Byte-reader differential tests use tiny chunks and cover UTF-8 and both UTF-16 byte orders across chunk boundaries.
- App integration checks confirmed descriptive errors for a missing file, an unterminated quoted field, and a logical row over 16 MiB. The app merge path retained both synthetic sources with correct lazy-loaded values, timestamps and field prefixes.
- Real 231 MB log: 264 fields; plotted values and timestamps hash-identical to the old complete-file loader.
- Real 560 MB log: 268 fields; independent streaming enumeration confirms the field count. The old complete-file loader fails, so its plotted-channel comparison used the original header and selected channel's rows with the frozen old worker. Values and timestamps match exactly.
- Generated file: 650,006,909 bytes, sparse NUL padding, 1,000 data rows and a constant numeric channel. Open and plot succeeded; plotted values and timestamps match the known old-loader semantics. The generated file was deleted. This tests the size boundary, not representative telemetry throughput.

## Physical footprint and timing

Numbers below come from `footprint -p`, in its reported MB/KB units. Each pair is **process lifetime peak / settled before plotting**. Settled was sampled after approximately five idle seconds, without forced GC. Native `phys_footprint_peak` includes startup. The development app opens a separate DevTools renderer, reported separately. Peaks for different processes need not occur simultaneously.

**231 MB real file:** open 4.503 s; first plot 1.203 s.

- Main: 146 / 77 MB.
- Hub renderer (including worker): 454 / 215 MB.
- GPU: 250 / 99 MB.
- Network utility: 6897 / 6833 KB.
- DevTools renderer: 224 / 222 MB.
- Sampled simultaneous total peak: 836.6 MB.
- After plotting: main 74 MB, hub 245 MB.

**560 MB real file:** open 10.616 s; first plot 5.211 s.

- Main: 149 / 120 MB.
- Hub renderer (including worker): 900 / 355 MB.
- GPU: 325 / 124 MB.
- Network utility: 6929 / 6849 KB.
- DevTools renderer: 255 / 255 MB.
- Sampled simultaneous total peak: 1283.7 MB.
- After plotting: main 73 MB, hub 382 MB.

**650 MB synthetic file:** open 6.571 s; first plot 0.257 s.

- Main: 149 / 133 MB.
- Hub renderer (including worker): 863 / 135 MB.
- GPU: 344 / 161 MB.
- Network utility: 6849 / 6785 KB.
- DevTools renderer: 226 / 222 MB.
- Sampled simultaneous total peak: 1278.6 MB.
- After plotting: main 73 MB, hub 140 MB.

For comparison, the old 231 MB loader opened in 4.708 s, settled at main 285 MB and hub 724 MB before plotting, and reached a sampled simultaneous total peak of 1448.7 MB. The old 560 MB loader failed after 3.071 s with zero fields. Baseline figures are development-app measurements, not the earlier packaged perf-report run.

The new loader still has substantial temporary allocation and an index proportional to row count; it does not promise constant total memory. Exact peaks and settle times vary with GC, GPU activity and the development tools. Packaged-app measurements, every real channel, and live Lite/embedded-child-log loading were not separately exercised. Initial disk-full failures were resolved by removing only task-created artifacts and using sparse synthetic input.
