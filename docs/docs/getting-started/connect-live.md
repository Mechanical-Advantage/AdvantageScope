---
sidebar_position: 3
---

import PrefsImage from '../img/prefs.png';

# Connecting to Live Sources

All visualizations in AdvantageScope are designed to receive live data from a robot or simulator in addition to log files. This section describes how to connect to real time data sources.

## Configuration

Open the preferences window by clicking `Help` > `Show Preferences...` (Windows/Linux) or `AdvantageScope` > `Settings...` (macOS).

<img src={PrefsImage} alt="Diagram of roboRIO preferences" height="350" />

### roboRIO Address

Enter the roboRIO address using a 10.TE.AM.2 IP address as described in the [WPILib docs](https://docs.wpilib.org/en/stable/docs/networking/networking-introduction/ip-configurations.html#te-am-ip-notation). Click `File` > `Use USB roboRIO Address` to temporarily use the IP address `172.22.11.2` for all connections.

### Live Source

The following sources of live data are supported by AdvantageScope:

- **NetworkTables 4:** This is WPILib's primary networking protocol. See the [WPILib documentation](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) for more details.
- **NetworkTables 4 (AdvantageKit):** This mode is designed for use with robot code running AdvantageKit, which publishes to the `AdvantageKit` table in NetworkTables.
- **Phoenix Diagnostics:** This mode uses HTTP to connect to a Phoenix [diagnostic server](https://pro.docs.ctr-electronics.com/en/latest/docs/troubleshooting/running-diagnostics.html), which allows for data streaming from CTRE CAN devices with [Phoenix 6](https://pro.docs.ctr-electronics.com/en/latest/). This is similar to the [plotting feature](https://pro.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) in Phoenix Tuner. See [this page](/more-features/phoenix-diagnostics) for more information.
- **PathPlanner 2023:** Legacy, this mode connects using the `PathPlannerServer` protocol used for telemetry by PathPlanner 2023. The connection is always initiated on port 5811. Note that PathPlanner 2024 and later publish telemetry data using NetworkTables, so the **NetworkTables 4** mode should be used.
- **RLOG Server:** This protocol is supported by AdvantageKit as an alternative to NetworkTables. The connection is initiated on port 5800 by default.

### Live Mode

When NetworkTables is used as the live source, the following live modes can be selected:

- **Low Bandwidth (Default):** AdvantageScope only requests data from the server for fields that are actively being used. Data published before a field was selected will not be available. This mode is **highly recommended** when running in an environment with limited network bandwidth, or when a large number of fields are being published.
- **Logging:** AdvantageScope requests data for all fields regardless of whether they are actively being used. This means that fields can be viewed retroactively by pausing the stream of live data (see below). This mode is often useful during development but **should NOT be used when bandwidth is limited**.

### Discard Live Data

During a live connection, data is stored locally to allow for replay of past data (see "Viewing Live Data" below). To avoid very high memory usage, data is discarded after 20 minutes by default. A shorter period can be selected to reduce memory usage, or "Never" can be selected to store live data indefinitely.

## Starting the Connection

To start the connection to a robot (using the configured "roboRIO Address") or a simulator (using "127.0.0.1"), follow these steps:

- **Robot:** Click `File` > `Connect to Robot`
- **Simulator:** Click `File` > `Connect to Simulator`

The window title displays the IP address and the text "Searching" until the robot/sim is connected. It attempts to reconnect automatically using the same settings after a disconnect.

## Viewing Live Data

When connected to a live source, AdvantageScope locks all tabs to the current time by default. Views like the 📉 [Line Graph](../tab-reference/line-graph.md) and 🔢 [Table](../tab-reference/table.md) autoscroll, and views like field and joysticks display the current values of each field. Clicking the red arrow button in the navigation bar toggles this lock, enabling viewing and replay of past data.

![Live lock/unlock button](./img/open-live-1.png)

:::tip
Scrolling to the left in the line graph or timeline unlocks from the current time, and scrolling all the way to the right locks to the current time again.
:::

## Tuning Mode

Some live sources support live tuning of numeric and boolean values. For example, this feature can be used to [tune controller gains](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/tutorial-intro.html) when connected to a NetworkTables source. Note that the robot code must support receiving gains via NetworkTables.

By default, all values in AdvantageScope are read-only. To toggle tuning mode, **click the slider icon** to the right of the search bar when connected to a supported live source. When the icon is purple, tuning mode is active and field editing is enabled.

- To edit a **numeric field**, enter a new value using the text box to the right of the field in the sidebar. The value is published after the input is deselected or the "Enter" key is pressed. Leave the text box blank to use the robot-published value.
- To toggle a **boolean field**, click the red or green circle to the right of the field in the sidebar.

:::warning
This feature is not intended for controlling the robot on the field. Dashboard-style inputs like choosers, trigger buttons, etc. are not supported.
:::

### Tuning With AdvantageKit

Fields published by AdvantageKit to the `AdvantageKit` subtable are output-only and cannot be edited. However, users can publish fields from user code that are tunable from AdvantageScope. **Any fields published to the "/Tuning" table on NetworkTables will appear under the "Tuning" table when using the "NetworkTables 4 (AdvantageKit)" live source.**

For example, a tunable number can be published using the [`LoggedNetworkNumber`](https://docs.advantagekit.org/data-flow/recording-inputs/dashboard-inputs) class:

```java
LoggedNetworkNumber tunableNumber = new LoggedNetworkNumber("/Tuning/MyTunableNumber", 0.0);
```

:::warning
The `NetworkInputs` subtable **cannot be edited**, since it is used by AdvantageKit to record network values for logging and replay. Use the `Tuning` table to interact with network inputs in real time.
:::
