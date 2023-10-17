# 🦀 Swerve

_[< Return to homepage](/docs/INDEX.md)_

The swerve tab shows the state of four swerve modules, including the velocity vectors, idle positions, and robot rotation. The timeline shows when the robot is enabled and can be used to navigate through the log data.

> Note: To view the swerve visualization alongside other tabs, click the "Add Window" icon just below the navigation/playback controls. To hide the controls at the bottom of the window, click the eye icon.

![Overview of swerve tab](/docs/resources/swerve/swerve-1.png)

## Fields

To selected a field, drag it to one of the labeled boxes. To remove a field, right-click the box. The purpose and expected format of each field is shown below.

> Note: WPILib and AdvantageKit are planning to add struct & protobuf support before the 2024 season. This will allow for swerve states to be directly logged from robot code without converting to numeric arrays. More information about this feature will be available soon.

### States

Two sets of module states can be displayed simultaneously in <span style="color: red;">red</span> and <span style="color: blue;">blue</span>. For instance, the measured states can be compared to the setpoints.

The state fields should be numeric arrays with the format shown below. The rotation units are configurable (radians or degrees), and the velocity units should match the configured "Max Speed". The order of the modules is also configurable.

```
[
  rotation_1, velocity_1,
  rotation_2, velocity_2,
  rotation_3, velocity_3,
  rotation_4, velocity_4
]
```

> Note: To log an array of SwerveModuleState objects using AdvantageKit, call `Logger.getInstance().recordOutput(key, states[]);`

### Robot Rotation

This field can optionally be used to show the robot's current rotation (based on odometry or a gyro). The provided field should be a number in radians or degrees (the same units as the module rotations). If the robot's pose is already logged for the [odometry](/docs/tabs/ODOMETRY.md) tab, consider using the last item in the pose array as the robot rotation for swerve.

![Pose data as a rotation](/docs/resources/swerve/swerve-2.png)

## Configuration

The following configuration options are available:

- **Max Speed:** The maximum achievable speed of the modules, used to adjust the size of the vectors. The units should match the velocities in the state fields.
- **Rotation Units:** The units of the module rotations and robot rotation (radians and degrees are supported). Note that all measurements must be CCW+, which matches the standard [WPILib coordinate system](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/coordinate-systems.html).
- **Arrangement:** The order of the logged module states. For example, "FL, FR, BL, BR" indicates that:
  - First module = Front left
  - Second module = Front right
  - Third module = Back left
  - Fourth module = Back right
- **Size (Left-Right):** The distance between the left and right modules. Any units can be used, but they must match the units for the front-back measurement.
- **Size (Front-Back):** The distance between the front and back modules. Any units can be used, but they must match the units for the left-right measurement.
- **Forward Direction:** The direction the robot should be facing when the "Robot Rotation" is zero or blank. This option is often useful to align with odometry data or match videos.

> Note: [🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀 🦀](https://www.youtube.com/watch?v=IbbwtyM8Dxs)
