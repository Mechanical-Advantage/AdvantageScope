# 🔵 Points

_[< Return to homepage](/docs/INDEX.md)_

The points tab shows a 2D visualization of arbitrary points. This is a very flexible tool, allowing for custom visualizations of vision data/pipelines, mechanism states, etc. Several examples are shown below. The timeline shows when the robot is enabled and can be used to navigate through the log data.

> Note: To view the point visualization alongside other tabs, click the "Add Window" icon just below the navigation/playback controls. To hide the controls at the bottom of the window, click the eye icon.

![Point tab example #1](/docs/resources/points/points-1.png)

![Point tab example #2](/docs/resources/points/points-2.png)

## Point Data

To selected a field, drag it to one of the labeled boxes. To remove a field, right-click the box. The X and Y fields should be numeric arrays of the same length. **The origin is in the upper left corner, with +X to the right and +Y down.**

## Configuration

The following configuration options are available:

- **Size:** The dimensions of the display area. When displaying vision data, this is the resolution of the camera.
- **Group Size:** The number of points in each color coded group (for example, a group size of four could be used for vision corner data). Setting a group size of zero will disable color coding.
- **Point Shape:** The shape of each rendered point (plus, cross, or circle).
- **Point Size:** The size of each rendered point (large, medium, or small).
