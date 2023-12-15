# 👀 3D Field

_[< Return to homepage](/docs/INDEX.md)_

This tab shows a 3D visualization of the robot and field. It can be used with regular 2D odometry, but is especially helpful when working with 3D calculations (like localizing with AprilTags). Multiple camera views are available, including field relative, robot relative, and fixed. The timeline shows when the robot is enabled and can be used to navigate through the log data.

> Note: To view the 3D visualization alongside other tabs, click the "Add Window" icon just below the navigation/playback controls. Each pop-up window can also be configured with a different camera view (see more details below). To hide the controls at the bottom of the window, click the eye icon.

![Example of 3D field tab](/docs/resources/3d-field/3d-field-1.png)

## Pose Data

To add a field with pose data, drag it from the sidebar to the box under "3D Poses" or "2D Poses" and use the drop down to select an object type. Multiple sets of objects can be added this way, and fields can be included multiple times. To remove a set of objects, right-click the field name. The origin and units are configurable.

### Structured Format

Pose data can be stored as a byte-encoded struct or protobuf. The following data types are supported:

- `Pose3d`
- `Pose2d`
- `Translation3d`
- `Translation2d`
- `Transform3d`
- `Transform2d`
- `AprilTag`
- `Trajectory`

The example code below shows how to log pose data using WPILib or AdvantageKit.

```java
Pose3d poseA = new Pose3d();
Pose3d poseB = new Pose3d();

// WPILib
StructPublisher<Pose3d> publisher = NetworkTableInstance.getDefault()
    .getStructTopic("MyPose", Pose3d.struct).publish();
StructArrayPublisher<Pose3d> arrayPublisher = NetworkTableInstance.getDefault()
    .getStructArrayTopic("MyPoseArray", Pose3d.struct).publish();

periodic() {
    publisher.set(poseA);
    arrayPublisher.set(new Pose3d[] {poseA, poseB});
}

// AdvantageKit
Logger.recordOutput("MyPose", poseA);
Logger.recordOutput("MyPoseArray", poseA, poseB);
Logger.recordOutput("MyPoseArray", new Pose3d[] {poseA, poseB});
```

WPILib's [`Field2d`](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/field2d-widget.html) class can also be used to log several sets of 2D pose data together.

### Legacy Format

Alternatively, pose data can be stored as a numeric array describing one or more poses with the formats shown below.

**2D Poses**

```
[
  x, y, rot,
  x, y, rot,
  ...
]
```

The 2D rotation must be CCW+, and the units (radians/degrees) are configurable.

**3D Poses**

```
[
  x, y, z, w_rot, x_rot, y_rot, z_rot,
  x, y, z, w_rot, x_rot, y_rot, z_rot,
  ...
]
```

The w, x, y, and z rotation values represent a quaternion, which is used internally by WPILib's `Rotation3d` class.

## Objects

The following objects are supported:

- Robot
- Ghost (Green & Yellow)
- AprilTag (36h11 & 16h5)
- Axes
- Trajectory
- Vision Target
- Blue Cone (Front/Center/Back)
- Yellow Cone (Front/Center/Back)
- Camera Override (more details under "Camera Options")
- Mechanism (more details under "Mechanisms & Components")
- Component (more details under "Mechanisms & Components")

> Note: AprilTags use a smile texture by default. Add a field as "AprilTag ID" to specific an ID (0-586 for 36h11, 0-29 for 16h5) for each displayed tag. The ID field must be a numeric array where each item corresponds to a tag.

![3D with objects](/docs/resources/3d-field/3d-field-2.png)

## Mechanisms & Components

Mechanism data can be visualized using 2D mechanisms or articulated 3D components.

### 2D Mechanisms

To visualize mechanism data logged using a [Mechanism2d](https://docs.wpilib.org/en/stable/docs/software/dashboards/glass/mech2d-widget.html), drag the mechanism field to "2D Poses". The mechanism is projected onto the XZ plane of the robot using simple boxes (as shown below). The robot's origin is centered on the bottom edge of the mechanism.

Multiple mechanisms can be displayed simultaneously if more than one mechanism field is provided. Mechanisms are displayed on the main (solid) robot by default, but can also moved to the ghost robot by switching from "Mechanism (Robot)" to "Mechanism (Ghost)".

![2D mechanism](/docs/resources/3d-field/3d-field-3.png)

### 3D Components

To visualize mechanism data using articulated 3D components, log a set of 3D poses with the robot-relative locations of each component. Each component can be moved independently (like an elevator carriage, arm, or end effector). Drag the component data to "3D Poses" and select "Component (Robot)" or "Component (Ghost)". Component data can be provided separately for the ghost robot (for example, to visualize a mechanism setpoint). For more information on configuring robots with components, see [Custom Assets](/docs/CUSTOM-ASSETS.md).

![3D mechanism](/docs/resources/3d-field/3d-field-4.png)

## Camera Options

To switch the selected camera mode, right-click on the rendered field view. The camera mode and position is controlled independently for every pop-up window, allowing for the easy creation of multi-camera views.

### Orbit Field

This is the default camera mode, where the camera can be freely moved relative to the field. **Left-click + drag** rotates the camera, and **right-click + drag** pans the camera. **Scroll** to zoom in and out.

> Note: Right-click the rendered field view and click "Orbit FOV..." to adjust the FOV of the orbiting camera.

### Orbit Robot

This mode has the same controls as the "Orbit Field" mode, but the camera's position is locked relative to the robot. This allows for "tracking" shots of the robot's movement.

> Note: Right-click the rendered field view and click "Orbit FOV..." to adjust the FOV of the orbiting camera.

### Fixed Camera

Each robot model is configured with a set of fixed cameras, like vision and driver cameras. These cameras have fixed positions, aspect ratios, and FOVs. These views are often useful to check vision data or to simulate a driver camera view. In the example below, a driver camera is shown.

![Fixed camera](/docs/resources/3d-field/3d-field-5.png)

If a "Camera Override" pose is provided, it replaces the default poses of all fixed cameras while retaining their configured FOVs and aspect ratios. This allows the robot code to provide the position of a moving camera, like one mounted to a turret or shooter hood.

> Note: As with all other pose data, the "Camera Override" pose must be _field relative_, not robot relative.

## Configuration

![Configuration options](/docs/resources/3d-field/3d-field-6.png)

The following configuration options are available:

- **Field:** The field model to use, defaults to the most recent game. We recommend using the "Evergreen" field for devices with limited graphical performance. The "Axes" field displays only XYZ axes at the origin with a field outline for scale.
- **Alliance:** The current alliance color, which flips the origin to the opposite side of the field.
- **Robot:** The robot model to use. We recommend using the "KitBot" model for devices with limited graphical performance. To add a custom field or robot model, see [Custom Assets](/docs/CUSTOM-ASSETS.md).
- **Units:** The linear and angular units of the provided fields. Meters, inches, radians, and degrees are supported. The rotations units do no affect 3D poses.

## Rendering Modes

The 3D field supports three rendering modes:

- **Cinematic:** Render using shadows, lighting, and reflections for a more realistic look. Requires a decently powerful GPU.
- **Standard (Default):** Render with minimal lighting (no functional difference from cinematic mode).
- **Low Power:** Lower the framerate and resolution to reduce battery consumption and provide more consistent performance on low-end devices.

![Comparion of rendering modes](/docs/resources/3d-field/3d-field-7.png)

To configure the rendering mode, open the preferences window by pressing **cmd/ctrl + comma** or clicking "Help" > "Show Preferences..." (Windows/Linux) or "AdvantageScope" > "Settings..." (macOS). The "3D Mode (Battery)" setting can be switched from the default to override the rendering mode used on a laptop when not charging. For example, this can be used to preserve battery while at competition.

![Rendering mode preferences](/docs/resources/3d-field/3d-field-8.png)
