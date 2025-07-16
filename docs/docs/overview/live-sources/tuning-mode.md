---
sidebar_position: 1
---

# Tuning Mode

Some live sources support live tuning of numeric and boolean values. For example, this feature can be used to [tune controller gains](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) when connected to a NetworkTables source. Note that the robot code must support receiving gains via NetworkTables.

By default, all values in AdvantageScope are read-only. To toggle tuning mode, **click the slider icon** to the right of the search bar when connected to a supported live source. When the icon is purple, tuning mode is active and field editing is enabled.

- To edit a **numeric field**, enter a new value using the text box to the right of the field in the sidebar. The value is published after the input is deselected or the "Enter" key is pressed. Leave the text box blank to use the robot-published value.
- To toggle a **boolean field**, click the red or green circle to the right of the field in the sidebar.

:::warning
This feature is not intended for controlling the robot on the field. Dashboard-style inputs like choosers, trigger buttons, etc. are not supported.
:::

## Tuning With AdvantageKit

Fields published by AdvantageKit to the `AdvantageKit` subtable are output-only and cannot be edited. However, users can publish fields from user code that are tunable from AdvantageScope. **Any fields published to the "/Tuning" table on NetworkTables will appear under the "Tuning" table when using the "NetworkTables 4 (AdvantageKit)" live source.**

For example, a tunable number can be published using the [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) class:

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
The `NetworkInputs` subtable **cannot be edited**, since it is used by AdvantageKit to record network values for logging and replay. Use the `Tuning` table to interact with network inputs in real time.
:::
