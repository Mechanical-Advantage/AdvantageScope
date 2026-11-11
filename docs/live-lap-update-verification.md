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
perl -e 'alarm 300; exec @ARGV' npm run compile
perl -e 'alarm 300; exec @ARGV' npm run typecheck
perl -e 'alarm 300; exec @ARGV' npx prettier --check .
perl -e 'alarm 300; exec @ARGV' npx license-check-and-add check -f file-header-config.json
```

The parity runner from the prior port evidence bundles the CSV worker and both LapService versions with rolldown. Each CSV run has a 300-second limit. It imports the private input locally and writes only comparison counts and equality results.
