# Connect mur-voir to cellular telemetry

mur-voir connects to the MUR telemetry backend over HTTP and WebSocket. The Pi publishes to that backend through Zenoh. Use the backend address in mur-voir.

## Connect

1. Join the MUR tailnet on the laptop and confirm the backend hostname resolves.
2. Open **File > Connect**, or press Cmd/Ctrl+K.
3. Select **MUR Telemetry** and enter the backend URL supplied by the infrastructure maintainer. For example, `http://mur-base:8080` if that is the deployed hostname and port.
4. Expand the signal tree and drag a signal onto a Line Graph axis. The graph requests up to five minutes of recent backend history, then follows live data.

The window title distinguishes searching, connected, no car data and connection errors. A connected backend can have an offline car. The signal tree and Trackside tiles show stale or offline values. Unsynchronised timestamps carry an approximate-time indicator.

After an established connection drops, mur-voir reconnects automatically. It reads a fresh catalogue, restores active subscriptions and requests available history. Missing measurements remain gaps. History retained by the backend can fill a viewer-only outage. A stopped backend may lose its in-memory history.

The backend supplies the typed catalogue, signal availability and recent history. The dashboard release does not install the Pi publisher, Zenoh router, Azure services or tailnet configuration.

## Set up a layout

- Use **Trackside** for large readouts and an optional graph. Drag fields into Tiles, then toggle the graph icon for fields to plot. Click a field's type icon to set a critical minimum or maximum. Blank means no limit. Numeric limits save in the layout. DBC-defined faults can alert without a tile.
- Use **Track and laps** for Map, Laps or Split views. Assign the lap setup fields, choose the Event and set the start/finish line if needed. Use the graph's lap-time or distance axis to compare laps. Old Track Map and Laps layouts restore into their corresponding views.
- Use **Driver Inputs** for steering, throttle and brake pressures. Use **Car Dynamics** for steering, front wheel speeds, yaw, acceleration and damper positions. Assign fields in Sources and set the scales for the car. Both tabs follow the shared timeline cursor.
- Export a layout from the File menu. When opening an MF4 or other log later, fields with matching DBC signal metadata reconnect to their saved sources.

Open tabs, visible sidebar values and DBC fault monitoring determine live subscriptions. Closing a lap view releases its extra lap inputs when no other lap view needs them. These subscriptions limit dashboard traffic. The Pi publisher's rates determine car-to-backend cellular usage.

## Browser version

The Lite archive needs Node.js 22.18 or newer. Unzip it and run this command from the extracted directory, using the actual backend address:

```sh
node tools/lite-serve/main.mjs --port 5808 --backend http://mur-base:8080
```

Open `http://localhost:5808`. Select MUR Telemetry and use `http://localhost:5808` as the connection address. The local server forwards HTTP and WebSocket requests to the backend. Trackside and Video are desktop-only. Graphs, Track and laps, Driver Inputs and Car Dynamics work in Lite.

## Verify without a car

From a source checkout, install dependencies and compile with Node.js 22.18 or newer:

```sh
npm ci
npm run compile
npm run mock-backend -- --lap-counter --speed 1
```

Start mur-voir separately and connect to `http://localhost:8090`. The mock publishes synthetic values and follows the same pinned API as the cellular backend.

The automated desktop check stays hidden and uses a separate temporary profile:

```sh
npm run cellular-smoke
npm run cellular-smoke -- --soak-seconds 960
```

It checks five-minute history, wire subscriptions, a backend outage and restart, duplicate delivery, and saved layouts for the new tabs. Its output and screenshots go into `.screenshots/cellular/`. Pass `--executable /path/to/mur-voir` to check an unpacked desktop build.

## Troubleshooting

| Symptom                       | Check                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Searching or connection error | Tailnet membership, the supplied hostname and port, and whether the backend is running. The connection address is the HTTP API URL.               |
| No car data                   | The dashboard reached the backend. Check the Pi publisher and cellular connection.                                                                |
| Empty graph                   | Assign a field to an axis, check its availability and confirm the backend has samples. A catalogue entry can exist while its producer is offline. |
| No recent history             | The backend may have restarted or may return history-unavailable. Live samples still display.                                                     |
| A saved field stays missing   | The publisher must include the exact `dbc.signal` and `dbc.message` metadata for DBC-decoded signals. Derived channels need reassignment.         |

MQTT direct and the [radio bridge](../tools/radio-bridge/README.md) remain available for debugging and the existing XBee path.
