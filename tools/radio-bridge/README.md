# Radio JSONL bridge

Configure Wireless-telem to write base-station JSONL to a local file. Use that file as the bridge input.

From mur-voir, start the local MQTT-over-WebSocket bridge:

```sh
npm run radio-bridge -- --input /absolute/path/live.jsonl --port 1885
```

Open mur-voir's File > Connect (Cmd/Ctrl+K) and enter:

| Setting             | Value                              |
| ------------------- | ---------------------------------- |
| Source              | MQTT direct (debug)                |
| Address / URL       | `ws://127.0.0.1:1885`              |
| Topic filter        | `mur/signal/#`                     |
| Mapping / format    | JSON per signal                    |
| Username / password | Empty                              |
| CAN timestamp       | Unchecked, only applies to raw CAN |

Connect before new packets arrive: there is no retained history. The bridge starts
at the current end of the file; `--from-start` publishes existing contents once at
startup, so a client connecting later will miss that replay. To replay into an
already-connected dashboard, append lines to the followed file at the desired rate.

The default bind is `127.0.0.1`. To share on the pit network add `--host 0.0.0.0`
and use `ws://<base-station-IP>:1885` on the dashboard. This broker has no
authentication or TLS; use it only on a trusted network. An HTTPS Lite page requires
a WSS proxy. Stop with Ctrl-C.

Missing files are retried. New, truncated and replaced files are read from their
beginning; incomplete trailing lines wait for a newline. A small trailing-content
check detects truncate-and-refill between polls, unless the checked bytes are
identical. Polling cannot recover contents overwritten before a poll.

Topics are `mur/signal/<NODE>/<Signal>` for bundled DBC matches, matching the JSONL
importer regardless of CAN bus number. Other dotted names become slash paths.
Enums publish the DBC label and a numeric `/raw` child. MQTT direct attaches bundled
DBC metadata (including units) to canonical signal paths. JSON payloads are
`{"t":"<exact Unix nanoseconds>","v":<value>}`; integer JSONL timestamps are quoted
before parsing to avoid rounding through a JavaScript number. The dashboard
subtracts its session epoch with BigInt before storing relative seconds.

Run follower and mapping tests with `npm test -- radio-bridge`.
