# Radio JSONL → mur-voir

From Wireless-telem, start the base station (substitute your real serial flags for UDP):

```sh
uv run base-station --udp-port 15001 --output /absolute/path/live.jsonl
```

From mur-voir, start the local MQTT-over-WebSocket bridge:

```sh
npm run radio-bridge -- --input /absolute/path/live.jsonl --port 1885
```

Open mur-voir's **File → Connect…** and enter:

| Setting             | Value                               |
| ------------------- | ----------------------------------- |
| Source              | MQTT direct (debug)                 |
| Address / URL       | `ws://127.0.0.1:1885`               |
| Topic filter        | `mur/signal/#`                      |
| Mapping / format    | JSON per signal                     |
| Username / password | Empty                               |
| CAN timestamp       | Unchecked (only applies to raw CAN) |

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

For a hardware-free producer, also run these in Wireless-telem in separate terminals:

```sh
uv run telem --simulate-port 15000 --radio-udp 15001 --no-bms
uv run can-simulator --udp-port 15000
```

Run follower and mapping tests with `npm test -- radio-bridge`.

## Verification (2026-11-02)

- Replayed all 94 packets of the supplied Wireless-telem `live.jsonl` by appending
  at its recorded packet intervals to a fresh followed file. A WebSocket MQTT
  subscriber matched all 2,458 topic/payload pairs byte for byte. Electron's MQTT
  direct Log matched every decoded value at its BigInt-derived session timestamp,
  across 89 paths. A separate JSONL importer worker produced exactly the same
  path set. The mapping test additionally checks a timestamp ending in `0001`,
  which cannot survive conversion through an epoch-sized double.
- Ran an unmodified temporary copy of `refs/Wireless-telem` with `uv run
base-station --udp-port 15001 --output ../live.jsonl`, `uv run telem
--simulate-port 15000 --radio-udp 15001 --no-bms --duration 22 --log-dir ../logs`
  and `uv run can-simulator --udp-port 15000 --duration 20`. The bridge followed
  that new output; Electron matched all 1,921 values from 73 packets across 89
  paths at the file-derived timestamps. The Connect dialog and stepped pedal
  graph were captured and visually inspected. No reference files were changed,
  and no recording data is committed.
- Test ports were 11885/11886 because 1885 was already occupied. The documented
  default remains 1885. All 136 unit tests passed, as did typecheck, compile and
  check-format. Radio hardware, real serial reception and pit-network clients
  were not tested.
