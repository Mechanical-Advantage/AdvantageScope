# Trackside tiles verification

Electron 39, macOS, isolated profile, ELECTRON_RUN_AS_NODE removed. Mock backend on 18124 (no existing processes touched): `--seed 1 --sim-clock --fault-demo --stale-test --stale-source ennoid-bms`. Reset the simulation for matching captures at 5 s (OK), 13 s (WARN/CRIT), 24 s (recovered but latched), 31–32 s (stale), 36–37 s (offline). Thresholds and graph renderer are unchanged.

Screenshots: `/tmp/trackside-tiles-check/`.

- `before-{ok,warn-critical,latched,stale,offline}-{dark,light}.png`: original implementation.
- `after-{ok,warn-critical,latched,stale,offline}-{dark,light}.png`: 1600px wide.
- Same after names with `-900` before `.png`: 900px wide.
- `after-warn-only-{dark,light}.png`: actual fault-demo motor WARN with only that tile selected, covering the amber banner and one-tile grid.
- `after-editor-{dark,light}.png`: edit dialog at 900px.
- `after-many-{dark,light}.png`: 40 tiles at 900px, scrolled to the final tile. Vertical scrolling is intentional; no horizontal overflow.
- `after-narrow-{dark,light}.png`: additional narrow-window/data-loss pass.
- `stock-as-reference.png`, `stock-as-statistics.png`: archived original AdvantageScope Electron captures from `research/advantagescope/screenshots/05_line_graph_left_right_discrete.png` and `14_statistics_tab.png`, copied for comparison. Reference app was not relaunched for this task.
- `before-{dark,light}.png`: initial pre-reset fault-demo captures.

Every saved image was opened and visually critiqued. Before: saturated OK banner and stripes dominate the graph; row widths change with a fault; stale hatching overwhelms content. After: neutral stock surfaces, stock system text and SVG ellipsis controls, aligned grid columns across rows, actual faults alone use amber/red, full fault/availability words remain readable in both themes. Long banner text wraps without overlap at 900px. One correction from inspection: held fault values must not be struck through when the current source is stale. Only last live values receive the stale strikeout. The incomplete final grid row deliberately keeps the same column width instead of stretching.

Interaction checks: opened/cancelled all nine tile editors; added and saved an acceleration tile, then removed it; LIVE→REVIEW→LIVE; light hover #eee and active #ddd inherited from stock global CSS; zero, one, nine, ten and forty tiles; no horizontal overflow at 900px; recovered fault acknowledgement by tile and banner. Forty tiles use a 40vh scrolling strip to preserve room for the graph.

Validation: `npm run typecheck`, `npm run compile`, `npm test` (148 passed, 0 failed), `npm run check-format`, `npm run lite-smoke` (same-host HTTP/WS, live values, graph, health, layout download/upload and CSV picker).

Limits: no physical car/hardware test, no new stock app run; reference comparison uses archived stock Electron images plus the v4.1.6 source audit. Verification covers macOS Electron and Chromium Lite, not Windows/Linux native controls. The independent graph end-value change is outside this branch.
