# mur-voir

mur-voir is the telemetry dashboard for Melbourne University Motorsports (MUR), our Formula SAE team. It displays live telemetry and recorded logs.

## Connect to live telemetry

Open File > Connect (Cmd/Ctrl+K). Choose MUR Telemetry and enter the backend address, or choose MQTT direct (debug) and enter a WebSocket broker address.

The window title shows the connection state as `address (Searching)`, `address`, `address (No car data)` or `address (Error)`. "No car data" means the backend is connected but no fresh car data is available.

MQTT and the [radio JSONL bridge](tools/radio-bridge/README.md) remain available until `telemetry-api` carries real car data.

## Open recorded logs

Use File > Open Log(s) to open MF4, candump with DBC, CSV, JSONL or WPILOG files.

## View data

The available tabs are Line Graph, Track Map, Laps, Table, Statistics, Console, Video, Points, Driver Inputs, Car Dynamics, Metadata and Documentation. Points is a plain 2D plot.

Driver Inputs and Car Dynamics draw the car at the timeline cursor, which follows hover. There are no default fields. Drag fields into Sources or load a layout, then right-click a source to choose its type. Each slot reads only its visible source. Each tab converts values from the field's unit, so live data in SI units and logs in DBC units draw the same.

- Driver Inputs replaces Joysticks. It draws steering, throttle and front/rear brake bars from the assigned sources. Steering is positive left. Brake Full Scale defaults to 1000 psi.
- Car Dynamics replaces Swerve. It draws front wheel directions from steering divided by Steering Ratio, default 3.827:1. Front wheel speed arrows reach full length at Max Speed. Linear speeds convert to km/h. Angular speeds use Wheel Radius, default 0.203 m as in Laps. Set the rolling radius for the car. Yaw draws an arc, acceleration draws a dot in a 2 g circle, and each damper source draws its position in mm beside its wheel. Wheelbase and Track set the proportions. Rear wheels have no measured speeds or arrows, and the tab shows no body slip angle.

Steering in both tabs, and Longitudinal Accel, Lateral Accel and Yaw Rate in Car Dynamics, have an Invert option in the stock source menu, opened by right-click or icon click. Choose Normal or Inverted. The choice saves with the source in layouts. Acceleration uses forward and left positive; yaw uses counterclockwise positive when viewed from above.

For the car's SBG mounting with +X right and +Y back, drag AccelY into Longitudinal Accel with Inverted, AccelX into Lateral Accel with Inverted, and GyroZ into Yaw Rate with Inverted. We checked the sensor axes in the [SBG Ellipse hardware manual, section 2.1.1.5](https://support.sbg-systems.com/download/attachments/11240254/Ellipse%203%20-%20Hardware%20Manual.pdf?api=v2&modificationDate=1617893855126&version=1) and SBG's [right-hand rule for alignment](https://support.sbg-systems.com/sc/el/firmware-v2.x/operating-handbooks/general-configuration/sensor-configuration). For this mounting, right cross back points down. Positive rotation about that +Z axis is clockwise from above, so GyroZ needs Inverted for the tab's counterclockwise-positive yaw. This assumes the signals use the stated sensor frame. The mock backend emits vehicle-frame signals, forward and left positive, so it cannot prove the real sensor signs.

The desktop app uses Electron. The Lite build runs in a browser. See [DEVELOPING.md](DEVELOPING.md) for setup, builds and the mock backend.

The removed ROS, Foxglove, point cloud and 3D work lives on `experimental/ros-foxglove`. That branch is not being developed.

Report bugs and feature requests on the [issues page](https://github.com/Melbourne-University-Motorsports/mur-voir/issues).

## Credits

Based on [AdvantageScope](https://github.com/Mechanical-Advantage/AdvantageScope) (BSD-3), © Littleton Robotics. mur-voir is an independent fork. It is not affiliated with, or endorsed by, Littleton Robotics, FRC 6328 or the AdvantageScope contributors. See [LICENSE](LICENSE).
