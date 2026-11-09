# Pinned MUR live API

`schema/` is copied byte-for-byte from the mur-msgs commit recorded in
`SOURCE.json`. This copy contains protocol definitions only, no DBC data or logs.
Public builds need no upstream checkout.

- `npm run live-api:check`: verifies schema content hashes and regenerated types offline.
  This also runs before `npm test` and in public CI.
- `npm run live-api:check -- --source /path/to/mur-msgs`: additionally compares every
  schema file against the exact pinned commit using Git, including the file list.
- Update: `node tools/live-api.mjs vendor --source /path/to/mur-msgs --commit <full-sha>`.
  This copies committed schema bytes, records their hashes, and regenerates types.
- `npm run live-api:generate`: regenerates `../live-types.ts` from the verified copy.

Review schema/hash/pin changes together; the offline check detects accidental drift,
not a malicious edit of both schema and manifest. Run the upstream comparison when updating the pin. The current pin is mur-msgs
main merge commit `aa98d26ba6df4e35af2e029b2509f07bb80bfabf` from PR #6.

`../contract.ts` contains runtime helpers. Its exported wire types come entirely
from the generated file; no application code needs to import the mock backend.
The test suite validates real mock HTTP/WebSocket output and descriptor-directed
values. Stateful conformance rules are in the pinned upstream `api/live/v1/README.md`.
Stream-aware history and descriptor DBC provenance are optional. Descriptors retain
`dbc?: DBCProvenance` in the generated types. Timestamps use Unix nanoseconds.

No mur-msgs release tag exists yet, so the pin is the commit itself. Runtime `hello.api_version`
and `unsupported_api_version` remain necessary because components deploy separately.

This protocol-only copy exposes no credentials or vendor DBC contents. The public
repository's pre-existing private/vendor DBC copies raise a separate, unresolved
licensing/ownership question; this change does not alter them.
