# Connecting to Live Sources

_[< Return to homepage](/docs/INDEX.md)_

All visualizations in Advantage Scope are designed to receive live data from a robot or simulator in addition to log files.

## Configuration

Open the preferences window by pressing **cmd/ctrl + comma** or clicking "Help" > "Show Preferences..." (Windows/Linux) or "Advantage Scope" > "Preferences..." (macOS). Update the "roboRIO Address" and "Live Mode (options listed below).

> Note: You can also click "File" > "Use USB roboRIO Address" to temporarily use the IP address "172.22.11.2" for all connections.

- **NetworkTables 4:** This is the default networking protocol starting in WPILib 2023, and is commonly used by dashboards, coprocessors, etc. See the [WPILib documentation](https://docs.wpilib.org/en/stable/docs/software/networktables/index.html) for more details. Note that NetworkTables 3 (used by WPILib 2022 and older) is not supported by Advantage Scope.
- **NetworkTables 4 (AdvantageKit):** This mode is designed for use with robot code running AdvantageKit, which publishes to the "/AdvantageKit" table in NetworkTables. The only difference from the previous mode is that the "/AdvantageKit" table is used as the root, which allows for easier switching between an NT4 connection and an AdvantageKit log file.
- **RLOG Server:** This protocol is used by AdvantageKit v1 (2022), and is included for compatability with older code bases. Note that you must also set the "RLOG Server Port" to use this mode.

![Diagram of live preferences](/docs/img/open-live-1.png)

## Starting the Connection

You can start the connection to a robot (uses the configured "roboRIO Address") or a simulator (uses "127.0.0.1"):

- **Robot:** Click "File" > "Connect to Robot" or press **cmd/ctrl + K**
- **Simulator:** Click "File" > "Connect to Simulator" or press **shift + cmd/ctrl + K**

The window title will display the IP address and the text "Searching" until the robot/sim is connected. It will continue to reconnect automatically using the same settings after a disconnect.

## Viewing Live Data

When connected to a live source, Advantage Scope will lock all tabs to the current time by default. Views like the line graph and table will autoscroll, and views like odometry and joysticks will display the current values of each field. Clicking the red arrow button in the navigation bar will toggle this lock, allowing you to view and replay older data.

> Note: You can also unlock from the current time by scrolling to the left in the line graph, and lock again by scrolling to the right.

![Live viewing controls](/docs/img/open-live-2.gif)
