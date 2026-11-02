# mur-voir

mur-voir is the telemetry dashboard for **Melbourne University Motorsports (MUR)**, our Formula SAE team. It is one workbench for the whole car:

- live telemetry from the car
- recorded logs
- autonomy and simulation data

All of it shares one timeline.

Available now (alpha):

- Live MUR telemetry, ROS 2 over Foxglove WebSocket, and MQTT direct for debugging; a local bridge follows Wireless-telem JSONL.
- Recorded CSV, MCAP, candump + DBC, MF4, JSONL, WPILOG and RLOG.
- Line graphs, health tiles, track maps, laps and overlays; frame-aware 3D with URDF, TF, paths, cones and point clouds, plus ROS messages, logs and images.
- Electron desktop and Lite browser builds, with shared timelines and saved layouts.

Start with the [alpha how-to](docs/release-notes/0.1.0-alpha.1.md).
See [DEVELOPING.md](DEVELOPING.md) to build and run it.

Report bugs and feature requests on the [issues page](https://github.com/Melbourne-University-Motorsports/mur-voir/issues).

## Credits

Based on [AdvantageScope](https://github.com/Mechanical-Advantage/AdvantageScope) (BSD-3), © Littleton Robotics. mur-voir is an independent fork. It is not affiliated with, or endorsed by, Littleton Robotics, FRC 6328 or the AdvantageScope contributors. See [LICENSE](LICENSE).
