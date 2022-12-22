# 👀 3D Field

_[< Return to homepage](/docs/INDEX.md)_

This tab shows a 3D visualization of the robot and field. It can be used with regular 2D odometry, but is especially helpful when working with 3D calculations (like localizing with AprilTags). Multiple camera views are available, including field relative, robot relative, and fixed. The timeline shows when the robot is enabled and can be used to navigate through the log data.

> Note: To view the 3D visualization alongside other tabs, click the "Add Window" icon just below the navigation/playback controls. Each pop-up window can also be configured with a different camera view (see more details below).

![Overview of 3D field tab](/docs/resources/3d-field/3d-field-1.png)

## Pose Data

To add a field with pose data, drag it from the sidebar to the box under "3D Poses" or "2D Poses" and use the drop down to select an object type. Multiple sets of objects can be added this way, and fields can be included multiple times. To remove a set of objects, right-click the field name.

All pose data must be stored as a numeric array describing one or more poses with the formats shown below.

### 2D Poses

```
[
  x, y, rot,
  x, y, rot,
  ...
]
```

The 2D rotation must be CCW+, which matches the standard [WPILib coordinate system](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/coordinate-systems.html). The linear and angular units are configurable.

> Note: To log Pose2d and trajectory values with WPILib, use the [Field2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) class. With AdvantageKit, call _Logger.getInstance().recordOutput(key, poses...);_ or _Logger.getInstance().recordOutput(key, trajectory);_

### 3D Poses

```
[
  x, y, z, w_rot, x_rot, y_rot, z_rot,
  x, y, z, w_rot, x_rot, y_rot, z_rot,
  ...
]
```

The w, x, y, and z rotation values represent a quaternion, which is used internally by WPILib's Rotation3d class. The linear units are configurable.

> Note: To log Pose3d values with AdvantageKit, call _Logger.getInstance().recordOutput(key, poses...);_

## Objects

The following objects are supported:

- Robot
- Ghost
- AprilTag
- Axes
- Trajectory
- Vision Target
- Camera Override (more details under "Camera Options")
- Blue Cone (Front/Center/Back)
- Yellow Cone (Front/Center/Back)

![3D with objects](/docs/resources/3d-field/3d-field-2.gif)

## Camera Options

To switch the selected camera mode, right-click on the rendered field view. The camera mode and position is controlled independently for every pop-up window, allowing for the easy creation of multi-camera views.

### Orbit Field

This is the default camera mode, where the camera can be freely moved relative to the field. **Left-click + drag** rotates the camera, and **right-click + drag** pans the camera. **Scroll** to zoom in and out.

!["Orbit Field" camera](/docs/resources/3d-field/3d-field-3.gif)

### Orbit Robot

This mode has the same controls as the "Orbit Field" mode, but the camera's position is locked relative to the robot. This allows for "tracking" shots of the robot's movement.

!["Orbit Robot" camera](/docs/resources/3d-field/3d-field-4.gif)

### Fixed Camera

Each robot model is configured with a set of fixed cameras, like vision and driver cameras. These cameras have fixed positions, aspect ratios, and FOVs. These views are often useful to check vision data or to simulate a driver camera view. In the example below, a driver camera and Limelight view are shown.

![Fixed camera](/docs/resources/3d-field/3d-field-5.gif)

If a "Camera Override" pose is provided, it replaces the default poses of all fixed cameras while retaining their configured FOVs and aspect ratios. This allows the robot code to provide the position of a moving camera, like one mounted to a turret or shooter hood.

> Note: As with all other pose data, the "Camera Override" pose must be _field relative_, not robot relative.

## Configuration

The following configuration options are available:

- **Field:** The field model to use, defaults to the most recent game. We recommend using the "Evergreen" field for devices with limited graphical performance. The "Axes" field displays only XYZ axes at the origin with a field outline for scale.
- **Alliance:** The current alliance color, which flips the origin to the opposite side of the field if necessary.
- **Robot:** The robot model to use. AdvantageScope includes a default set of robots from some of our fellow New England [#OpenAlliance](https://www.theopenalliance.com) teams. We recommend using the "KitBot" model for devices with limited graphical performance. To add a custom field or robot model, see ["Custom Fields/Robots/Joysticks"](/docs/CUSTOM-CONFIG.md).
- **Units:** The linear and angular units of the provided fields. Meters, inches, radians, and degrees are supported. The rotations units do no affect 3D poses.

The 3D field also supports an "efficiency" mode, which optionally reduces the framerate and resolution when enabled from the AdvantageScope preferences. Open the preferences window by pressing **cmd/ctrl + comma** or clicking "Help" > "Show Preferences..." (Windows/Linux) or "AdvantageScope" > "Preferences..." (macOS). The available options for the "3D Mode" are:

- **Prioritize quality:** Always render at the screen's native resolution and framerate.
- **Prioritize efficiency:** Always lower the framerate and resolution to reduce battery consumption and provide more consistent performance on low-end devices.
- **Prioritize efficiency on battery:** Prioritize efficiency when running on battery power, otherwise prioritize quality.
