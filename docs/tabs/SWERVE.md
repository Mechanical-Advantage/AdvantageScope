# 🦀 Swerve

_[< Return to homepage](/docs/INDEX.md)_

The swerve tab shows the state of four swerve modules, including the velocity vectors, idle positions, and robot rotation. The timeline shows when the robot is enabled and can be used to navigate through the log data.

> Note: To view the swerve visualization alongside other tabs, click the "Add Window" icon just below the navigation/playback controls. To hide the controls at the bottom of the window, click the eye icon.

![Overview of swerve tab](/docs/resources/swerve/swerve-1.png)

## Fields

To selected a field, drag it to one of the labeled boxes. To remove a field, right-click the box. The purpose and expected format of each field is shown below.

### States

Two sets of module states can be displayed simultaneously in <span style="color: red;">red</span> and <span style="color: blue;">blue</span>. For instance, the measured states can be compared to the setpoints.

Pose data can be stored as a struct array of four `SwerveModuleState` objects. The example code below shows how to log this data using WPILib or AdvantageKit. The velocity units should match the configured "Max Speed". The order of the modules is also configurable.

```java
SwerveModuleState[] states = new SwerveModuleState[] {
    new SwerveModuleState(),
    new SwerveModuleState(),
    new SwerveModuleState(),
    new SwerveModuleState()
}

// WPILib
StructArrayPublisher<SwerveModuleState> publisher = NetworkTableInstance.getDefault()
    .getStructArrayTopic("MyStates", SwerveModuleState.struct).publish();

periodic() {
    publisher.set(states);
}

// AdvantageKit
Logger.recordOutput("MyStates", states);
```

Alternatively, the state fields can be numeric arrays with the format shown below. The rotation units are configurable (radians or degrees).

```
[
  rotation_1, velocity_1,
  rotation_2, velocity_2,
  rotation_3, velocity_3,
  rotation_4, velocity_4
]
```

### Robot Rotation

This field can optionally be used to show the robot's current rotation (based on odometry or a gyro). The provided field should be a byte-encoded `Rotation2d` (struct/protobuf) or a number in radians/degrees (the same units as the module rotations). If the robot's pose is already logged, consider using the rotation element or the last item in the pose array as the robot rotation for swerve.

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
