# Perf loop implementation verification

Verified on 2026-11-03 in `wt/perf-loops`, branch `ws/perf-loops`.

- Finding 1: marker state applies only new messages; backward seeks, replacement, history edits and front discards rebuild it. Vehicle trails retain parsed samples in their existing ten-second window. Clouds select the newest timestamps with binary search and retrieve raw data only for scans needing decode.
- Finding 5: tab close and restore dispose controllers/renderers. SourceLists cancel rAF, abort listeners, clear prompt callbacks, release preview suppliers and detach their DOM contents. Controller global listeners, the image observer, documentation loop and 3D renderer resources also have teardown. Hidden lists skip previews and resume on the next frame.
- Finding 6: per-field gap caches process appended samples and retain candidate gaps so changing median thresholds remain exact. Replacement, history edits and front discards invalidate the cache; removed graph fields release it. Numeric plotting/sampling and graph styles are unchanged.
- Finding 7: raw buffer tooltips report byte count; profiles and suffix-derived units are memoized. Metadata changes invalidate profiles/units. A field catalogue version avoids repeated Sidebar enumeration; SourceLists check only their displayed keys.

`npm test`: 152 tests, 152 passed, 0 failed, 0 skipped. Seeded differential tests cover marker actions, lifetimes, backward seeks, front discards, replacement and field removal; gaps are compared to full-history recomputation with varying viewport edges and freshness. A warm-cache test checks tail-only copying and same-time edits.

`npm run compile`, `npm run typecheck`, Prettier and `git diff --check` passed.

Runtime: compiled Electron development app, isolated `--user-data-dir`, MUR mock backend on port 18190. Used the read-only harness launch/connect helpers and `Runtime.queryObjects`; restored native color-scheme emulation after CDP attachment. Only the app/backend started for verification were terminated.

Final SourceList census (total / running / attached / visible):

- launch: 5 / 5 / 5 / 3
- trackside: 11 / 11 / 11 / 3
- trackside again: 11 / 11 / 11 / 3
- reordered: 11 / 11 / 11 / 3
- closed trackside: 5 / 5 / 5 / 3
- settled after close: 5 / 5 / 5 / 3

The visibility probe observed six updates for each of three visible lists and zero for each of eight hidden lists over 100 ms. Tab reorder and satellite creation were exercised; no renderer exceptions were observed. A further GC after closing tabs still found only the five attached lists. Earlier runs sometimes retained stopped instances temporarily; running counts remained equal to attached counts.

Limits: caches rebuild on backward seeks/front discards, without checkpoints. No long-duration CPU/FPS benchmark, packaged-distribution rebuild, ROS stress replay or manual pixel comparison of zoomed graphs was performed. The harness and retention policy were not changed; LogField.ts and CSV loading were not touched.

Initial validation attempts failed with ENOSPC. The workspace-owned dependency copy was replaced with a symlink to the existing alpha-release dependencies; the existing generated licenses.json was copied for compilation. Subsequent validation passed.
