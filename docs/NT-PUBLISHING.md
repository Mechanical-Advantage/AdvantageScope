# Publishing NetworkTables Data

_[< Return to homepage](/docs/INDEX.md)_

AdvantageScope supports publishing NetworkTables data stored in a log file back to a NetworkTables server such as a simulator or robot. Possible use cases include:

- Replaying matches in simulation for debugging.
- Mimicking data from a coprocessor on a real robot.
- Debugging driver dashboard applications using realistic match data.

This feature requires a log file with a full capture of NetworkTables data, which can be generated using WPILib's [built-in data logger](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html). Note that AdvantageKit does not support this feature as it instead enables more complete deterministic replay in simulation.

To start publishing, a log file containing NetworkTables data must be open. Then, follow these steps:

- **Publish to Robot:** Click "File" > "Publish NT Data" > "Connect to Robot" or press **cmd/ctrl + P**
- **Publish to Simulator:** Click "File" > "Publish NT Data" > "Connect to Simulator" or press **shirt + cmd/ctrl + P**

The top of the window displays the text "Searching" or "Publishing" to indicate the status of data publishing. AdvantageScope attempts to reconnect automatically using the same settings after a disconnect.

All fields will be published using their stored values at the _selected timestamp_ used by many AdvantageScope tabs. This allows for real-time network playback through the same mechanism as playback within AdvantageScope. See [App Navigation](/docs/NAVIGATION.md) for more details. If no timestamp is selected, fields are published using their stored values at the _hovered timestamp_.

To stop publishing, click "File" > "Publish NT Data" > "Stop Publishing" or press **option + P**

## Filtering Fields

By default, AdvantageScope publishes all NetworkTables fields stored in the log file (except server-published meta topics). Some use cases, like mimicking a coprocessor, require only publishing a limited set of fields or subtables. To adjust the set of allowed field prefixes, open the preferences window by pressing **cmd/ctrl + comma** or clicking "Help" > "Show Preferences..." (Windows/Linux) or "AdvantageScope" > "Settings..." (macOS).

The "NT Publish Prefixes" option sets the allowable prefixes for fields published to NetworkTables. If left blank, all fields will be included. Otherwise, a command-separated list of prefixes or fields can be provided. See examples below.

- "_SmartDashboard_": Include all fields in the "SmartDashboard" table.
- "_SmartDashboard/Auto Selector_": Include only the "SmartDashboard/Auto Selector" table.
- "_limelight/tx,limelight/ty_": Include only the "limelight/tx" and "limelight/ty" fields.

## Limitations

- AdvantageScope does not support creating its own NetworkTables server. It must be connected to a separate server like a robot, simulator, etc. Note that OutlineViewer can be configured as an NT server if desired.
- Fields are published every 20ms, so NetworkTables data originally published at a higher frequency will skip samples.
- The timestamps of published samples are not preserved. This would be impossible when scrubbing back and forth in time or playing back at different speeds.
