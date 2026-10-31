# mur-voir

mur-voir is the telemetry dashboard for **Melbourne University Motorsports (MUR)**, our Formula SAE team. It is one workbench for the whole car:

- live telemetry from the car
- recorded logs
- autonomy and simulation data

All of it shares one timeline.

Current state (foundation):

- **Logs:** opens WPILOG, RLOG and CSV.
- **Live:** connects to NetworkTables 4 servers for testing the live pipeline. MUR's own telemetry backend, Foxglove bridge (ROS 2) and MQTT sources are planned.
- **Views:** Line Graph, 2D/3D Field, Table, Console, Statistics, Points, Metadata and Video sync.

See [DEVELOPING.md](DEVELOPING.md) to build and run it.

Report bugs and feature requests on the [issues page](https://github.com/Melbourne-University-Motorsports/mur-voir/issues).

## Credits

Based on [AdvantageScope](https://github.com/Mechanical-Advantage/AdvantageScope) (BSD-3), © Littleton Robotics. mur-voir is an independent fork. It is not affiliated with, or endorsed by, Littleton Robotics, FRC 6328 or the AdvantageScope contributors. See [LICENSE](LICENSE).
