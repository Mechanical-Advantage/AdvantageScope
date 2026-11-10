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

Driver Inputs and Car Dynamics draw the car at the timeline cursor, which follows hover. Each tab fills itself from fields whose DBC signal names it knows. A field dragged into Sources replaces the default for the type it is given, and right-clicking a source changes its type. Each tab converts values from the field's unit, so live data in SI units and logs in DBC units draw the same.

- **Driver Inputs** replaces Joysticks. It draws a steering wheel from `DASH_SteeringAngle` (positive left), a throttle bar from `ECU_ThrottlePos`, else `PEDAL_Position1` or `PEDAL_Position2`, and brake bars from `ECU_BrakePressFront` and `ECU_BrakePressRear`. Brake Full Scale sets the pressure of a full bar. It defaults to 1000 psi.
- **Car Dynamics** replaces Swerve. It draws a top-down car with these parts:

  - front wheels turned by `DASH_SteeringAngle` divided by the steering ratio, 3.827:1 straight ahead by default
  - front wheel speed arrows from `DASH_SpeedFL` and `DASH_SpeedFR`, full length at Max Speed. Linear speed units convert to km/h; angular speeds convert using Wheel Radius, default 0.203 m as in Laps. Set the rolling radius for the car
  - the yaw rate from `SBG_FRONT_GyroZ` as an arc
  - an acceleration dot in a 2 g circle from `SBG_FRONT_AccelX` (forward) and `SBG_FRONT_AccelY` (left)
  - the damper position in mm beside each wheel from the four `ShockPot` signals

  Wheelbase and Track set the car's proportions. The DBCs have no rear wheel speeds or heading, so the rear wheels have no arrows and the tab shows no body slip angle.

The desktop app uses Electron. The Lite build runs in a browser. See [DEVELOPING.md](DEVELOPING.md) for setup, builds and the mock backend.

The removed ROS, Foxglove, point cloud and 3D work lives on `experimental/ros-foxglove`. That branch is not being developed.

Report bugs and feature requests on the [issues page](https://github.com/Melbourne-University-Motorsports/mur-voir/issues).

## Credits

Based on [AdvantageScope](https://github.com/Mechanical-Advantage/AdvantageScope) (BSD-3), © Littleton Robotics. mur-voir is an independent fork. It is not affiliated with, or endorsed by, Littleton Robotics, FRC 6328 or the AdvantageScope contributors. See [LICENSE](LICENSE).
