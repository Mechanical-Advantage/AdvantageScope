# 🗺 Odometry

_[< Return to homepage](/docs/INDEX.md)_

The odometry tab shows a 2D visualization of the robot overlayed on a map of the field. It can also show extra data like vision targeting status and reference poses. The timeline shows when the robot is enabled and can be used to navigate through the log data.

> Note: To view the odometry visualization alongside other tabs, click the "Add Window" icon just below the navigation/playback controls.

![Overview of odometry tab](/docs/resources/odometry/odometry-1.png)

## Pose Data

To add a field with pose data, drag it from the sidebar to the box under "Poses" and use the drop down to select an object type. Multiple sets of objects can be added this way, and fields can be included multiple times. To remove a set of objects, right-click the field name under "Poses".

All pose data must be stored as a numeric array describing one or more 2D poses with the following format:

```
[
  x, y, rot,
  x, y, rot,
  ...
]
```

Multiple poses are typically shown as duplicate objects, except for trajectories (where each pose is a point along the trajectory). The rotation must be CCW+, which matches the standard [WPILib coordinate system](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/coordinate-systems.html). The origin and units are configurable.

> Note: To log Pose2d and trajectory values with WPILib, use the [Field2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) class. With AdvantageKit, call _Logger.getInstance().recordOutput(key, poses...);_ or _Logger.getInstance().recordOutput(key, trajectory);_

## Objects

The following objects are supported:

- Robot
- Ghost
- Trajectory
- Vision Target
- Arrow (Front/Center/Back)

> Note: The robot pose is always centered on the robot. The crossbar on the arrow indicates the location of the pose (at the front, center, or back).

![Odometry with objects](/docs/resources/odometry/odometry-2.png)

## Configuration

The following configuration options are available:

- **Game:** The field image to use, defaults to the most recent game. To add a custom field image, see ["Custom Fields/Robots/Joysticks"](/docs/CUSTOM-CONFIG.md).
- **Units:** The linear and angular units of the provided fields. Meters, inches, radians, and degrees are supported.
- **Origin:** The location of the origin (0, 0) on the field, relative to the robot's alliance wall. The default option (right) aligns with the [WPILib coordinate system](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/coordinate-systems.html), and places the origin at the bottom left when looking at the field in its default orientation.
- **Side Length:** The side length (track width) of the robot in the selected linear units. The robot is always rendered as a square.
- **Alliance (Bumpers):** The color of the robot's bumpers, set independently of the field origin. "Auto" will select the alliance color based on the available log data.
- **Alliance (Origin):** The position of the field origin, on the blue or red alliance wall. "Auto" will select the alliance color based on the available log data.
- **Orientation:** The orientation to use when displaying the field, useful when aligning to a match video or testing field oriented controls.
