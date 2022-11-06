# 🗺 Odometry

_[< Return to homepage](/docs/INDEX.md)_

The odometry tab shows a 2D visualization of the robot overlayed on a map of the field. It can also show extra data like vision targeting status and reference poses. The timeline shows when the robot is enabled and can be used to navigate through the log data.

> Note: To view the odometry visualizations alongside other tabs, click the "Add Window" icon just below the navigation/playback controls.

![Overview of odometry tab](/docs/resources/odometry/odometry-1.png)

## Pose Data

To selected a field, drag it to one of the labeled boxes. To remove a field, right-click the box. The purpose and expected format of each field is shown below.

### Robot Pose

This pose describes the location of the robot. The provided field must be a numeric array with values [x, y, rotation]. The rotation must be CCW+, which matches the standard [WPILib coordinate system](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/coordinate-systems.html). The origin and units are configurable.

The robot is displayed as a square with an arrow indicating direction, as seen below. The path of the robot for the preceding and subsequent five seconds is also shown.

> Note: To log a Pose2d using AdvantageKit, call _Logger.getInstance().recordOutput(key, pose);_

![Robot pose](/docs/resources/odometry/odometry-2.png)

### Ghost Pose

This pose is rendered as a translucent robot, as seen below. Example use cases include trajectory reference poses or unfiltered vision poses. The expected format is the same as the standard robot pose (see previous section).

![Ghost pose](/docs/resources/odometry/odometry-3.png)

### Vision Coordinates

This field includes one or more translations indicating active vision targets. A green line is rendered from the robot to each target, as seen below. The provided field must be a numeric array with values [x_1, y_1, x_2, y_2, ...]. Any number of translations may be provided.

> Note: To log a Translation2d using AdvantageKit, call _Logger.getInstance().recordOutput(key, translation);_ or _Logger.getInstance().recordOutput(key, translation[]);_

![Vision coordinates](/docs/resources/odometry/odometry-4.png)

## Configuration

The following configuration options are available:

- **Game:** The field image to use, defaults to the most recent game. To add a custom field image, see ["Custom Fields/Robots/Joysticks"](/docs/CUSTOM-CONFIG.md).
- **Units:** The linear and angular units of the provided fields. Meters, inches, radians, and degrees are supported.
- **Origin:** The location of the origin (0, 0) on the field, relative to the robot's alliance wall. The default option (right) aligns with the [WPILib coordinate system](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/coordinate-systems.html), and places the origin at the bottom left when looking at the field in its default orientation.
- **Side Length:** The side length (track width) of the robot in the selected linear units. The robot is always rendered as a square.
- **Alliance Color:** The current alliance color, which flips the origin to the opposite side of the field if necessary.
- **Orientation:** The orientation to use when displaying the field, useful when aligning to a match video or testing field oriented controls.
