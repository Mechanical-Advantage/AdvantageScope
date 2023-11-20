# Opening/Downloading Log Files

_[< Return to homepage](/docs/INDEX.md)_

This section describes how to open log files for analysis.

## Opening a Log

In the menu bar, click "File" > "Open..." or press **cmd/ctrl + O**, then choose a log file from the local disk. Dragging a log file from the system file browser to the AdvantageScope icon or window also causes it to open.

![Opening a saved log](/docs/resources/open-file/open-file-1.png)

Supported log formats are:

- **WPILOG (.wpilog)** - Produced by WPILib's [built-in data logging](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) and AdvantageKit v2 (2023) or later.
- **RLOG (.rlog)** - Produced by AdvantageKit v1 (2022).
- **Driver Station logs (.dslog and .dsevents)** - Produced by the [FRC Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) and saved to "\Users\Public\Documents\FRC\Log Files".

> Note: ".dslog" files include numeric/boolean data and ".dsevents" files include console data. When opening either file type, AdvantageScope searches the same directory for the matching log. For example, when opening "/example/log/file.dslog" AdvantageScope searches for "/example/log/file.dsevents". If found, the fields from both files are combined.

## Merging Logs

Log files can be merged automatically. Possible use cases include:

- Merging DS log data with WPILOG data from the robot.
- Merging WPILOG data from different matches to compare data.

Click "File" > "Open Multple..." or press **shift + cmd/ctrl + O**, then choose up to 10 log files from the local disk. The fields from each log will be recorded under tables named "Log0", "Log1", etc. The timestamps of each log are adjusted such the robot is first enabled at 0 seconds (negative timestamps are permitted).

## Downloading from a roboRIO

Open the preferences window by pressing **cmd/ctrl + comma** or clicking "Help" > "Show Preferences..." (Windows/Linux) or "AdvantageScope" > "Settings..." (macOS). Update the "roboRIO Address" and "roboRIO Log Folder".

> Note: Click "File" > "Use USB roboRIO Address" to temporarily use the IP address "172.22.11.2" for all connections.

![Diagram of roboRIO preferences](/docs/resources/open-file/open-file-2.png)

Click "File" > "Download Logs..." or press **cmd/ctrl + D** to open the download window. Once connected to the roboRIO, available logs are shown with the newest at the top. Select one or more log files to download (shift-click to select a range or **cmd/ctrl + A** to select all). Then click the ↓ symbol and select a save location.

> Note: When downloading multiple files, AdvantageScope skips any that are already found in the destination folder.

![Downloading log files](/docs/resources/open-file/open-file-3.png)
