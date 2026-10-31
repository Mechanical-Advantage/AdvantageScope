# MQTT debug publisher

Run `npm run mqtt-mock` (optional `-- --port 1884 --timestamp-prefix`). This starts a localhost-only Aedes WebSocket broker and publishes at 10 Hz. Stop with Ctrl+C.

Select **MQTT direct (debug)** in Connect, address `ws://localhost:1884`, no credentials. Use one matching filter/mapping pair:

| Topic filter   | Mapping          |
| -------------- | ---------------- |
| `mur/signal/#` | JSON per signal  |
| `mur/object/#` | JSON object      |
| `mur/raw/#`    | Raw CAN + DBC    |
| `mur/ascii/#`  | ASCII name=value |

All modes publish inverter RPM, ENNOID BMS SoC and maximum cell temperature, front wheel speeds and ECU state using bundled mur-msgs names. The raw frames use Cascadia 0xA5, extended ENNOID 0x2D0A, Dashboard 0x203 and ECU 0x122. Enum labels come from the DBC. ASCII has no timestamp and intentionally exercises the unsynchronised warning. JSON timestamps are decimal Unix nanosecond strings. Raw frames use a u32 big-endian SocketCAN ID (bit 31 = extended), one DLC byte and eight padded data bytes; enable the dialog's timestamp checkbox when launching with `--timestamp-prefix` (u64 big endian).

Each mode produces the same canonical field paths when using the filters above. The default `mur/#` subscribes to everything; narrow it before using this multi-format mock. This is a debug fixture, not the cellular publisher contract. It accepts local connections without authentication; production credentials and TLS belong to your broker.
