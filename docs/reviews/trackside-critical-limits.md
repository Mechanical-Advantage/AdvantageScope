<!--
Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
https://github.com/Melbourne-University-Motorsports/mur-voir

Use of this source code is governed by a BSD license that can be found in the LICENSE file at the root directory of this project.
-->

# Trackside critical limits review

Verified on 11 November 2026 with the seeded mock backend.

Commits `553a0ed2`, `fa433705`, and `db3100c4` already implement item 4. They move the limits actions to the Tiles field type menu, open one input at a time in Edit Range, preserve the opposite limit, reject invalid or inverted ranges inline, and test finite extremes. They remove the old list menu action and retain the stored `limits: {low, high}` shape. Line Graph range editing keeps its original mode.

The follow-up test checks the parsed single-limit result against tile alarm classification, then clears that limit and checks recovery.

The real `editRange.html` was loaded in hub iframes at its 360 by 160 content size. Minimum, maximum, blank, and invalid ordering were checked in dark and light themes. Both signs of `Number.MIN_VALUE` and `Number.MAX_VALUE` round-trip exactly through the inputs and port replies. Invalid ordering keeps the prompt open and shows "Critical minimum must be lower than critical maximum."

Captures and their full evaluation output are in `/Users/jasper/code/telemetry-dashboard/research/trackside/review-2026-11-11/`:

- `critical-prompts-dark.png` and `critical-prompts-light.png` show all prompt states beside stock Rename Tab and Line Graph Edit Range.
- `critical-alarm-low-dark.png` and `critical-alarm-low-light.png` show a minimum of 1000 triggering Alarm.
- `critical-alarm-high-dark.png` and `critical-alarm-high-light.png` show a maximum of 0 triggering Alarm.
- `critical-alarm-blank-dark.png` and `critical-alarm-blank-light.png` show clearing the maximum restoring a healthy tile.

Every new PNG was opened for visual inspection. Each successful run opens the actual field type menu. Headless mode reports its labels as:

```text
[headless] suppressed menu ["Set critical minimum","Set critical maximum"]
```

There were no other suppressed actions. The initial two screenshot attempts failed before launch because the shell set `ELECTRON_RUN_AS_NODE=1`. Successful screenshot commands unset that variable. No run timed out.

`npm test`, `npm run typecheck`, `npm run compile`, `npm run check-format`, and `npm run lite-smoke` passed with a 180-second limit per command. Screenshots use a 90-second limit. Full screenshot commands and evaluation bodies are in `critical-commands.log` in the capture folder.

## Prompt radius comparison, item 5

No radius change was needed at `db3100c4`. `editRange.html`, `renameTab.html`, and `unitConversion.html` all load `global.css` and `prompts.css`, with no local radius rules. `upstream-base` has the same relevant rules. Before and after this verification, the body radius is 0px and the shared button radius is 6px. The numeric and text inputs compute to 0px in the Electron captures. The non-input focus outline uses 3px in the shared stylesheet.

The native BrowserWindow outer corners belong to macOS. The limits window uses the same default framed modal window options as the stock Edit Range and Unit Conversion windows. There is no `roundedCorners`, `frame`, or `titleBarStyle` override on these prompts. Native outer corner pixels cannot be measured in a hidden hub iframe, so no numeric native radius is claimed.

The two `critical-prompts-*.png` captures provide the side-by-side comparison with Rename Tab and the unchanged Line Graph range mode. Adding a CSS radius override would diverge from stock. The result of item 5 is a documented stock match, with no styling change.

Items 4 and 5 are verified within the headless capture limits above. The optional graph, row toggle, Trackside renderer, and CSS layout were not changed.
