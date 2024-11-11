---
sidebar_position: 1
---

# Full Changelog

### Log File Loading

- Significantly improved log decoding speed (up to 100x faster).
- Enabled selection of multiple files using the standard "Open" menu.
- Added the option to open additional logs while another log is already open.

### Timeline

- Completely redesigned the timeline interface for improved usability.
- Enabled zooming and panning functionality.
- Users can zoom by clicking and dragging with the Shift key held down.
- Implemented visual highlights for auto and teleop periods.
- Hovering over timestamps now displays a preview of the corresponding data.
- Added timestamps directly on the timeline for easier reference.
- The cursor now snaps to the start and end of match periods.

### Window Design

- Implemented a translucent sidebar on Windows 11 for a more modern look.
- Integrated the title bar into the main window on Windows
- Introduced custom menu bars for both Windows and Linux.
- Adjusted the loading bar height for better visibility.
- Added keyboard playback controls for pop-out windows.
- Added keyboard shortcuts for toggling the sidebar and control panel.

### 📖 Documentation

- Documentation is now available online at https://docs.advantagescope.org.
- Upgraded to a modern documentation interface.
- All documentation has been updated to reflect the new features released in 2025.
- In the app, documentation can now be accessed in a pop-out window.

### 📉 Line Graph

- Enhanced customization options, including the ability to manually change line color, thickness, and display mode (smooth or with sample points).
- Added support for graphs with discrete fields.
- Added automatic adjustment of color tones to ensure sufficient contrast.
- Improved UI for hiding fields and enabling drag-and-drop reordering of fields.
- Enabled dragging fields between left and right axes.
- Non-primary axes now have independent gridlines.
- Users can zoom by clicking and dragging with the Shift key held down.
- Implemented options to select recent unit conversion presets and reset units with a button click.
- Added integration and differentiation functions.
- Included a help menu that provides information about specific object types.
- Line graphs can now be accessed in a pop-out window.
- The cursor now snaps to changes in discrete fields.
- Added preview text for empty raw values.

### 🗺️ Odometry

- Introduced support for 3D poses.
- Improved the UI for configuring poses.
- Added the ability to temporarily hide objects.
- Implemented a button to clear all poses.
- Enabled drag-and-drop reordering of poses.
- Users can now resize the control menu.
- Redesigned the options UI for a more intuitive experience.
- Included a help menu that provides information about specific object types.
- Implemented value previews in the pose list.
- Added the option to change the ghost color.
- Separated vision targets by their associated robot object.
- Enabled customization of vision target colors and thickness.
- Added visualization of swerve states.
- Implemented rotation override for all robot types.
- Allowed users to change trajectory colors and thickness.
- Expanded heatmap range options to include auto, teleop, and teleop (no endgame).
- Added deprecation warnings for numeric array formats ([details](./legacy-formats.md)).

### 👀 3D Field

- Supported the combination of 2D and 3D poses.
- Improved the UI for configuring poses.
- Added the ability to temporarily hide objects.
- Implemented a button to clear all poses.
- Enabled drag-and-drop reordering of poses.
- Users can now resize the control menu.
- Redesigned the options UI for a more intuitive experience.
- Zooming controls are smoother on some devices.
- Included a help menu that provides information about specific object types.
- Implemented value previews in the pose list.
- Improved the efficiency of model rendering.
- Added an indicator to show when models are loading.
- Simplified models based on the rendering mode.
- Added support for using different robot models for each pose.
- Introduced heatmap objects for data visualization.
- Expanded color options for the ghost robot.
- Linked vision targets, components, and mechanisms to their respective object sets.
- Enabled customization of vision target thickness.
- Allowed users to change trajectory color and thickness.
- Added visualization of swerve states.
- Implemented rotation override for all robot types.
- Expanded heatmap range options to include auto, teleop, and teleop (no endgame).
- Increased the variety of cone color options.
- Removed source links for fields and robots to simplify the interface.
- Added deprecation warnings for numeric array formats ([details](./legacy-formats.md)).
- Added a mysterious "XR" button...

### 🔢 Table

- Enabled drag-and-drop functionality for rearranging fields in the table.
- Tables can now be accessed in a pop-out window.

### 💬 Console

- The console can now be accessed in a pop-out window.

### 📊 Statistics

- Improved the configuration UI for a more user-friendly experience.
- Added support for more than 3 fields.
- Added support for multiple reference fields.
- Implemented the ability to temporarily hide fields.
- Introduced a button to clear all fields.
- Enabled drag-and-drop reordering of fields.
- Users can now resize the control menu.
- Included a help menu that provides information about specific field types.
- Expanded range options to include visible range, auto, teleop, teleop (no endgame), live (30 seconds), and live (10 seconds)
- Sampling options are now handled automatically.
- Statistics can now be accessed in a pop-out window.

### 🎬 Video

- Improved the overall user interface for video playback.
- Fixed issues with YouTube video download functionality.

### 🎮 Joysticks

- Increased the number of joysticks that can be visualized.
- Introduced a new interface for configuring joysticks.

### 🦀 Swerve

- Added support an unlimited number of fields.
- Added support for chassis speeds.
- Expanded the range of object colors.
- Allowed users to manually customize object color.
- Implemented the ability to temporarily hide objects.
- Enabled drag-and-drop reordering of objects.
- Added a button to clear all objects.
- Implemented value previews in the source list.
- Allowed users to customize module layout per-source.
- Redesigned the options UI for a more intuitive experience.
- Added deprecation warnings for numeric array formats ([details](./legacy-formats.md)).
- Included a help menu that provides information about specific object types.

### ⚙️ Mechanism

- Added support for an unlimited number of objects.
- Implemented the ability to temporarily hide objects.
- Enabled drag-and-drop reordering of objects.
- Provided a button to clear all objects.
- Implemented value previews in the source list.
- Included a help menu that provides information about the supported sources.

### 🔵 Points

- Added support for an unlimited number of fields.
- Implemented the ability to temporarily hide objects.
- Provided a button to clear all objects.
- Enabled drag-and-drop reordering of objects.
- Implemented value previews in the source list.
- Redesigned the options UI for a more intuitive experience.
- Included a help menu that provides information about specific object types.

### 🔍 Metadata

- Metadata can now be accessed in a pop-out window.

### Miscellaneous

- Added feature to remember the last object type for all fields.
- Improved keyboard shortcuts for opening tabs.
- Added drag-and-drop functionality for the tab bar.
- Reordered tabs to prioritize odometry and 3D field after line graph.
- Made odometry and 3D field default tabs.
- Fixed errors that occurred when assets were partially downloaded.
- Fixed issues with leading zeroes in RIO addresses.
- Switched WPILib Linux distribution from a package to a directory.
- Added an AppArmor profile for Ubuntu.
- Updated the WPILib logo.
- Added startup alerts, feedback buttons, and survey prompts for the beta version.
- Added a privacy policy document ([link](../legal/privacy-policy.md)).
