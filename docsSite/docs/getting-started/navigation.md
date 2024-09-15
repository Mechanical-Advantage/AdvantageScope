---
sidebar_position: 1
---

# App Navigation

The screenshot below shows the important elements of the main AdvantageScope window. The exact appearance differs between operating systems.

> Note: To view multiple log files simultaneously, click "File" > "New Window" or press **cmd/ctrl + N**.

![Navigation diagram](./img/navigation-1.png)

## Sidebar

To the left is the sidebar with the list of available tables and fields. Selectable fields are shown in _italics_ and built-in tables (from WPILib or AdvantageKit) are <u>underlined</u>. Click the arrow to expand nested tables. **Drag a single field** to select it or **hold cmd/ctrl** to select a collection of fields by clicking each one. Start dragging the collection of fields to finish the selection.

To search for a field, begin typing in the search box. A dropdown of fields will display, then the selected field will be highlighted in the sidebar and scrolled into view.

> Note: Click and drag on the right edge to resize or hide the sidebar.

![Dragging a field from the sidebar](./img/navigation-2.png)

## Tab Bar

Use the tab bar (blue) to switch between different views. This documentation is available at any time by clicking the 📖 icon to the left. To export the current tab layout (and associated settings), click "File" > "Export Layout..." To import a layout from a file, click "File" > "Import Layout..."

> Note: Tabs can be named to identify their contents. Rename a tab by right-clicking it and selecting "Rename..."

## Navigation Buttons & Playback

The navigation buttons (green) on the top manage the tabs and control playback. The "+" icon adds a new tab (this can be accessed quickly by pressing **cmd/ctrl + T**). The "X" icon closes the selected tab (**cmd/ctrl + W**) and the arrow buttons move the selected tab left or right (**cmd/ctrl + [ OR ]**). Quickly switch between tabs using the arrow keys (**cmd/ctrl + ← OR →**).

![Choosing a tab type](./img/navigation-3.png)

The selected time is synchronized between all tabs, including the line graph, table, field views, and more. Press **←** or **→** to step forward and backward in the log while paused. Playback can be toggled using the play/pause button or by pressing the **space bar**. To adjust the playback speed, **right-click** on the play/pause button.

> Note: Stepping through the log uses a 20ms period by default, and uses the synchronized loop cycle times when viewing an AdvantageKit log.

## Window Pop-Out

It is often useful to view multiple tabs at the same time. Since AdvantageScope synchronizes playback across all tabs, it is possible to perform sophisticated analysis by looking at multiple visualizations at once. An example might be viewing video, field odometry, joystick inputs, and performance graphs all together. Tabs that support pop-out have an additional "Add Window" icon just below the navigation/playback controls.

> Note: When using pop-out windows, playback is controlled from the main AdvantageScope window.

![Creating a pop-out window](./img/navigation-4.png)

## Touch Bar

Navigation is possible using the Touch Bar on supported MacBooks. The slider can be used to scrub through the log, and the "+" button adds a new tab.

![Touch Bar scrubbing interface](./img/navigation-5.png)
![Touch Bar new tab interface](./img/navigation-6.png)
