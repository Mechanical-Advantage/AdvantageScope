# 👀 3D Field

_[< Return to homepage](/docs/INDEX.md)_

This tab shows a 3D visualization of the robot and field. It can be used with regular 2D odometry, but is especially helpful when working with 3D calculations (like localizing with AprilTags). Multiple camera views are available, including field relative, robot relative, and fixed. The timeline shows when the robot is enabled and can be used to navigate through the log data.

> Note: To view the 3D visualization alongside other tabs, click the "Add Window" icon just below the navigation/playback controls. Each pop-up window can also be configured with a different camera view (see more details below).

![Overview of 3D field tab](/docs/resources/3d-field/3d-field-1.png)

## Input Data

To selected a field, drag it to one of the labeled boxes. To remove a field, right-click the box. The purpose and expected format of each field is shown below.

> Note: For all fields, the linear units are **meters** and the angular units are **radians**.

### Robot

This field describes the current location of the robot in 2D or 3D. A 2D pose must be a numeric array with values [x, y, rotation], following the [WPILib coordinate system](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/geometry/coordinate-systems.html). A 3D pose must be a numeric array with values [x, y, z, w_rot, x_rot, y_rot, z_rot]. The w, x, y, and z rotation values represent a quaternion, which is used internally by WPILib's Rotation3d class.

> Note: To log a Pose2d or Pose3d using AdvantageKit, call _Logger.getInstance().recordOutput(key, pose);_

### Cones

Each of the non-robot fields can be used to display a set of cones at arbitrary 3D poses. For example, they could indicate the locations of detected AprilTags or estimated camera positions. Each field must be a numeric array describing a series of 3D poses with the following format:

```
[
  x, y, z, w_rot, x_rot, y_rot, z_rot,
  x, y, z, w_rot, x_rot, y_rot, z_rot,
  ...
]
```

> Note: To log an array of Pose3d objects using AdvantageKit, call _Logger.getInstance().recordOutput(key, poses[]);_

The tip of each cone shows the translation component, and the rotation matches the pose. The dark band is rendered on top of each cone and shows the rotation around its axis.

![3D cones](/docs/resources/3d-field/3d-field-2.gif)

## Configuration

The following configuration options are available:

- **Field:** The field model to use, defaults to the most recent game. We recommend using the "Evergreen" field for devices with limited graphical performance.
- **Alliance:** The current alliance color, which flips the origin to the opposite side of the field if necessary.
- **Robot:** The robot model to use. AdvantageScope includes a default set of robots from some of our fellow New England [#OpenAlliance](https://www.theopenalliance.com) teams. We recommend using the "KitBot" model for devices with limited graphical performance.

> Note: To add a custom field or robot model, see ["Custom Fields/Robots/Joysticks"](/docs/CUSTOM-CONFIG.md).

The 3D field also supports an "efficiency" mode, which optionally reduces the framerate and resolution when enabled from the AdvantageScope preferences. Open the preferences window by pressing **cmd/ctrl + comma** or clicking "Help" > "Show Preferences..." (Windows/Linux) or "AdvantageScope" > "Preferences..." (macOS). The available options for the "3D Mode" are:

- **Prioritize quality:** Always render at the screen's native resolution and framerate.
- **Prioritize efficiency:** Always lower the framerate and resolution to reduce battery consumption and provide more consistent performance on low-end devices.
- **Prioritize efficiency on battery:** Prioritize efficiency when running on battery power, otherwise prioritize quality.

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
