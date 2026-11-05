# mur-voir

mur-voir is the telemetry dashboard for Melbourne University Motorsports (MUR), our Formula SAE team. It displays live telemetry and recorded logs.

## Connect to live telemetry

Open File > Connect (Cmd/Ctrl+K). Choose MUR Telemetry and enter the backend address, or choose MQTT direct (debug) and enter a WebSocket broker address.

The window title shows the connection state as `address (Searching)`, `address`, `address (No car data)` or `address (Error)`. "No car data" means the backend is connected but no fresh car data is available.

MQTT and the [radio JSONL bridge](tools/radio-bridge/README.md) remain available until `telemetry-api` carries real car data.

## Open recorded logs

Use File > Open Log(s) to open MF4, candump with DBC, CSV, JSONL or WPILOG files.

## View data

The available tabs are Line Graph, Track Map, Laps, Table, Statistics, Console, Video, Points, Metadata and Documentation. Points is a plain 2D plot.

The desktop app uses Electron. The Lite build runs in a browser. See [DEVELOPING.md](DEVELOPING.md) for setup, builds and the mock backend.

The removed ROS, Foxglove, point cloud and 3D work lives on `experimental/ros-foxglove`. That branch is not being developed.

Report bugs and feature requests on the [issues page](https://github.com/Melbourne-University-Motorsports/mur-voir/issues).

## Credits

Based on [AdvantageScope](https://github.com/Mechanical-Advantage/AdvantageScope) (BSD-3), © Littleton Robotics. mur-voir is an independent fork. It is not affiliated with, or endorsed by, Littleton Robotics, FRC 6328 or the AdvantageScope contributors. See [LICENSE](LICENSE).
