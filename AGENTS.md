# Agent notes

## Seeing the app

The user works on this machine while agents run, so every app run you start stays headless: no window, no Dock icon, no focus change. Look at the app through `npm run screenshot` (`tools/screenshot.mjs`, flags in `npm run screenshot -- --help`). It runs the real Electron app with `MURVOIR_HEADLESS=1`, writes PNGs to `.screenshots/` and prints their paths. Open them with your image reader. `npm start` and a bare `electron bundles/main.js` open windows on the user's screen, so leave those to the user.

- Comparing against a reference or visual note from the user: match its size and theme with `--size`, `--scale` and `--theme`, then put the two images side by side. A visual check is done when you have looked at the screenshot, not when the script exits 0.
- Data: `--mock` connects to the seeded mock backend, `--log <file>` opens a log. Both are repeatable, so two screenshots differ only where the code changed.
- Reaching a state the flags do not cover: `--eval` runs JavaScript in the hub page (`window.tabs`, `window.log`, `window.selection`, and `window.messagePort.onmessage({ data: { name, data } })` for any main-process message). A returned value prints as `[eval] <json>`.
- Lines starting `[headless] suppressed` are dialogs, file pickers or links that would have opened. They are part of the result: an unexpected one means the code tried to interrupt the user.
- Renderer-only checks can also use `npm run lite-smoke`, which drives the Lite build in headless Chromium.
- The macOS sidebar vibrancy captures as a solid grey, because a hidden window has no desktop behind it.

New main-process code needs no headless checks of its own: `src/main/electron/headless.ts` patches `show`, `focus`, dialogs and `shell.open*` centrally.
