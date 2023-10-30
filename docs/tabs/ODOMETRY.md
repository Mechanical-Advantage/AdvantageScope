# 🗺 Odometry

_[< Return to homepage](/docs/INDEX.md)_

The odometry tab shows a 2D visualization of the robot overlayed on a map of the field. It can also show extra data like vision targeting status and reference poses. The timeline shows when the robot is enabled and can be used to navigate through the log data.

> Note: To view the odometry visualization alongside other tabs, click the "Add Window" icon just below the navigation/playback controls. To hide the controls at the bottom of the window, click the eye icon.

![Overview of odometry tab](/docs/resources/odometry/odometry-1.png)

## Pose Data

To add a field with pose data, drag it from the sidebar to the box under "Poses" and use the drop down to select an object type. Multiple sets of objects can be added this way, and fields can be included multiple times. To remove a set of objects, right-click the field name.

Multiple poses are typically shown as duplicate objects, except for trajectories (where each pose is a point along the trajectory). The origin and units are configurable.

### Structured Format

Pose data can be stored as a byte-encoded struct or protobuf. The following data types are supported:

- `Pose2d`
- `Translation2d`
- `Transform2d`
- `Trajectory`

The example code below shows how to log pose data using WPILib or AdvantageKit.

```java
Pose2d poseA = new Pose2d();
Pose2d poseB = new Pose2d();

// WPILib
StructPublisher<Pose2d> publisher = NetworkTableInstance.getDefault()
    .getStructTopic("MyPose", Pose2d.struct).publish();
StructArrayPublisher<Pose2d> arrayPublisher = NetworkTableInstance.getDefault()
    .getStructArrayTopic("MyPoseArray", Pose2d.struct).publish();

periodic() {
    publisher.set(poseA);
    arrayPublisher.set(new Pose2d[] {poseA, poseB});
}

// AdvantageKit
Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose3d[] {poseA, poseB});
```

> Note: Without AdvantageKit, WPILib does not currently support structured logging of trajectories (as of 2024.1.1-beta-2). Keep an eye out for updates on this feature. In the meantime, trajectories can be logged using `Field2d` or as an array of poses.

WPILib's [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) class can also be used to log several sets of pose data together.

### Legacy Format

Alternatively, pose data can be stored as a numeric array describing one or more 2D poses with the following format:

```
[
  x, y, rot,
  x, y, rot,
  ...
]
```

The rotation must be CCW+, and the units (radians/degrees) are configurable.

## Objects

The following objects are supported:

- Robot
- Ghost
- Trajectory
- Vision Target
- Heatmap
- Arrow (Front/Center/Back)
- Zebra Marker (see [Loading Zebra MotionWorks™ Data](/docs/ZEBRA.md))

> Note: The robot pose is always centered on the robot. The crossbar on the arrow indicates the location of the pose (at the front, center, or back).

![Odometry with objects](/docs/resources/odometry/odometry-2.png)

## Configuration

The following configuration options are available:

- **Game:** The field image to use, defaults to the most recent game. To add a custom field image, see [Custom Assets](/docs/CUSTOM-ASSETS.md).
- **Units:** The linear and angular units of the provided fields. Meters, inches, radians, and degrees are supported.
- **Origin:** The location of the origin (0, 0) on the field, relative to the robot's alliance wall. The default option (right) aligns with the [WPILib coordinate system](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/coordinate-systems.html), and places the origin at the bottom left when looking at the field in its default orientation.
- **Side Length:** The side length (track width) of the robot in the selected linear units. The robot is always rendered as a square.
- **Alliance (Bumpers):** The color of the robot's bumpers, set independently of the field origin. "Auto" will select the alliance color based on the available log data.
- **Alliance (Origin):** The position of the field origin, on the blue or red alliance wall. "Auto" will select the alliance color based on the available log data.
- **Orientation:** The orientation to use when displaying the field, useful when aligning to a match video or testing field oriented controls.
