---
sidebar_position: 5
---

# 💬 Console

The console view is designed to view a single string field with console data. Some suggested fields are listed below.

- **DSEvents** - Robot log from a ".dsevents" file.
- **messages** - Saved by WPILib's built-in logging based on calls to the [`DataLogManager.log`](<https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/wpilibj/DataLogManager.html#log(java.lang.String)>) method.
- **/RealOutputs/Console** - Saved by AdvantageKit automatically during robot operation (use `System.out.println` as normal).
- **/ReplayOutputs/Console** - Saved by AdvantageKit automatically during log replay (use `System.out.println` as normal).

Drag the desired field to the main view to get started. Each row represents an update to the field. For WPILib logs, a new row is created for each saved line. For AdvantageKit logs, a new row is created for each loop cycle.

![Console view](./img/console-1.png)

:::info
Click the color palette icon to toggle highlighting for warning and error messages. Messages are highlighted if they contain the text "warning" or "error".
:::

The controls are similar to the 🔢 [Table](../tab-reference/table) tab. The selected time is synchronized across all tabs. Click a row to select it, or hover over a row to preview it in any visible pop-up windows. Clicking the ↓ button jumps to the selected time (or the time entered in the box).

Enter text in the "Filter" input to only display rows which contain the filter text. Press `Ctrl+F` to quickly select the "Filter" input. Add a "!" at the start of the filter text to _exclude_ matching messages from the main view.

:::tip
Click the save icon to export the console data to a text file.
:::
