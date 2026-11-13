# Live lap update verification

The port changes live analysis work and caching. There is no UX change. Sector gates added out of travel order now produce non-negative sector times and labels in crossing order.

## Correctness checks

On `cb2265da`, all 262 tests pass. Compile, typecheck, Prettier and the license check pass.

The CSV parity check compares the complete lap result against main at `9a6bce4f`. It covers circuit, acceleration, skidpad, autocross and endurance on the valid, bad-data and late-start fixtures and one private log. All 20 comparisons pass. Repeating them with GPS disabled also passes all 20 comparisons.

Each input also streams through 40 batches from each of the five Event modes. The check changes the Event and edits gates between batches, then compares the incremental result against a fresh analysis. All 1,600 comparisons pass across the GPS and wheel-only runs. The sector regression tests cover gates added in reverse order and require positive finite times.

The private input and its telemetry stay outside the repository.

## Commands

Each command has a time limit. The app runs only through the screenshot command, with `ELECTRON_RUN_AS_NODE` cleared. Dependencies use the existing node_modules symlink.

```sh
perl -e 'alarm 1500; exec @ARGV' npm test
perl -e 'alarm 600; exec @ARGV' npm test -- review-parity
perl -e 'alarm 300; exec @ARGV' npm run compile
perl -e 'alarm 300; exec @ARGV' npm run typecheck
perl -e 'alarm 300; exec @ARGV' npx prettier --check .
perl -e 'alarm 300; exec @ARGV' npx license-check-and-add check -f file-header-config.json
```

The eight temporary parity checks also pass through `npm test -- review-parity`. They stay outside the commit.

The parity runner from the prior port evidence bundles the CSV worker and both LapService versions with rolldown. Each CSV run has a 300-second limit. It imports the private input locally and writes only comparison counts and equality results.

## Real-time baseline

Main at `9a6bce4f` ran for 16 minutes with the speed-1 mock and fault demo. The run kept all telemetry. It opened Line Graph, both Trackside tabs, Laps and Track Map, with Track Map selected and the Event set to skidpad. The graph used speed, front wheel speeds, yaw rate and motor speed.

Each row covers one minute. The heap column measures the hub renderer's retained JavaScript heap through CDP after garbage collection. It excludes native, GPU and other process memory. The garbage collection pauses contribute to the following measurement interval. The fixed version uses the same measurement method in a separate run.

| Minute | Samples read per update | Update mean / max, ms | bands mean / max, ms | Long tasks | Largest frame gap, ms | Retained JS heap, MiB |
| ------ | ----------------------- | --------------------- | -------------------- | ---------- | --------------------- | --------------------- |
| 1      | 7978.7                  | 5.81 / 18.2           | 0.092 / 18.2         | 1          | 99.8                  | 28                    |
| 2      | 25459.4                 | 16.36 / 47.8          | 0.231 / 40.3         | 2          | 67.3                  | 32.8                  |
| 3      | 42762.4                 | 23.67 / 50.2          | 0.363 / 50.2         | 4          | 65.7                  | 34                    |
| 4      | 60177                   | 31.66 / 95            | 0.482 / 95           | 13         | 99.9                  | 38.2                  |
| 5      | 77691.7                 | 38.35 / 80.2          | 0.549 / 80.3         | 21         | 117.3                 | 41.3                  |
| 6      | 95162.3                 | 49.87 / 112.5         | 0.737 / 86           | 114        | 116.7                 | 42.8                  |
| 7      | 112414.8                | 63.26 / 235.6         | 0.957 / 235.6        | 118        | 250.3                 | 46.2                  |
| 8      | 129494.1                | 65.26 / 148.2         | 1.014 / 148.2        | 119        | 183.4                 | 46.6                  |
| 9      | 146888.9                | 72.39 / 167.2         | 1.218 / 167.2        | 118        | 183.9                 | 51.5                  |
| 10     | 164240.9                | 83.12 / 262.2         | 1.341 / 262.2        | 119        | 350.9                 | 55.7                  |
| 11     | 181575                  | 92.27 / 249.2         | 1.601 / 249.3        | 118        | 300.7                 | 83.1                  |
| 12     | 198387.6                | 110.52 / 357.2        | 2.005 / 357.3        | 119        | 465.7                 | 92.5                  |
| 13     | 215847.1                | 103.73 / 174.7        | 1.832 / 174.7        | 119        | 249.9                 | 65.5                  |
| 14     | 233408.6                | 111.84 / 178.3        | 2.092 / 155.1        | 119        | 200                   | 66.4                  |
| 15     | 251079.6                | 119.36 / 188.7        | 2.285 / 188.7        | 118        | 216.7                 | 66.1                  |
| 16     | 268773.6                | 128.53 / 207.9        | 2.385 / 172.6        | 119        | 233.3                 | 70.1                  |

The before and after comparison is in [PR #15](https://github.com/Melbourne-University-Motorsports/mur-voir/pull/15).

Both app runs use this command, with `NAME` set to `before16` or `after16` and `EVIDENCE` set to the local evidence folder. The baseline uses an archive of main, while the after run uses this branch. Only local overlays expose the lap singleton and add the CDP heap binding to the screenshot tool. Neither overlay is committed.

```sh
unset ELECTRON_RUN_AS_NODE
perl -e 'alarm 1500; exec @ARGV' npm run screenshot -- --mock --mock-args='--speed 1 --fault-demo' --layout trackside --size 1952x1269 --theme dark --out "$EVIDENCE/shots" --name "$NAME" --eval "$(cat "$EVIDENCE/session16.js")"
```

No `[headless] suppressed` lines or renderer errors occurred in the completed baseline. An initial measurement attempt stopped early to add heap collection. The first restart rejected a duplicate local hook before launch. The next restart completed all 16 intervals.
