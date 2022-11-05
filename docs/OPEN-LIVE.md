# Connecting to Live Sources

_[< Return to homepage](/docs/INDEX.md)_

All visualizations in AdvantageScope are designed to receive live data from a robot or simulator in addition to log files. This section describes how to connect to real time data sources.

## Configuration

Open the preferences window by pressing **cmd/ctrl + comma** or clicking "Help" > "Show Preferences..." (Windows/Linux) or "AdvantageScope" > "Preferences..." (macOS). Update the "roboRIO Address" and "Live Mode (options listed below).

> Note: Click "File" > "Use USB roboRIO Address" to temporarily use the IP address "172.22.11.2" for all connections.

- **NetworkTables 4:** This is the default networking protocol starting in WPILib 2023, and is commonly used by dashboards, coprocessors, etc. See the [WPILib documentation](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) for more details. Note that NetworkTables 3 (used by WPILib 2022 and older) is not supported by AdvantageScope.
- **NetworkTables 4 (AdvantageKit):** This mode is designed for use with robot code running AdvantageKit, which publishes to the "/AdvantageKit" table in NetworkTables. The only difference from the **NetworkTables 4** mode is that the "/AdvantageKit" table is used as the root, which allows for easier switching between an NT4 connection and an AdvantageKit log file.
- **RLOG Server:** This protocol is used by AdvantageKit v1 (2022), and is included for compatibility with older code bases. Note that the "RLOG Server Port" must be set to use this mode.

![Diagram of live preferences](/docs/img/open-live-1.png)

## Starting the Connection

To start the connection to a robot (using the configured "roboRIO Address") or a simulator (using "127.0.0.1"), follow these steps:

- **Robot:** Click "File" > "Connect to Robot" or press **cmd/ctrl + K**
- **Simulator:** Click "File" > "Connect to Simulator" or press **shift + cmd/ctrl + K**

The window title displays the IP address and the text "Searching" until the robot/sim is connected. It attempts to reconnect automatically using the same settings after a disconnect.

## Viewing Live Data

When connected to a live source, AdvantageScope locks all tabs to the current time by default. Views like the line graph and table autoscroll, and views like odometry and joysticks display the current values of each field. Clicking the red arrow button in the navigation bar toggles this lock, enabling viewing and replay of past data.

> Note: Scrolling to the left in the line graph also unlocks from the current time, and scrolling all the way to the right locks to current time again.

![Live viewing controls](/docs/img/open-live-2.gif)
