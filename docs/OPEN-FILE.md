# Opening/Downloading Log Files

_[< Return to homepage](/docs/INDEX.md)_

This section describes how to open log files for analysis.

## Opening a Saved Log

In the menu bar, click "File" > "Open Log..." or press **cmd/ctrl + O**, then choose a log file from the local disk. Dragging a log file from the system file browser to the AdvantageScope icon or window also causes it to open.

![Opening a saved log](/docs/resources/open-file/open-file-1.gif)

Supported log formats are:

- **WPILOG (.wpilog)** - Produced by WPILib's [built-in data logging](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) and AdvantageKit v2 (2023) or later.
- **RLOG (.rlog)** - Produced by AdvantageKit v1 (2022).
- **Driver Station logs (.dslog and .dsevents)** - Produced by the [FRC Driver Station](https://docs.wpilib.org/en/stable/docs/software/driverstation/driver-station.html) and saved to "\Users\Public\Documents\FRC\Log Files".

> Note: ".dslog" files include numeric/boolean data and ".dsevents" files include console data. When opening either file type, AdvantageScope searches the same directory for the matching log. For example, when opening "/example/log/file.dslog" AdvantageScope searches for "/example/log/file.dsevents". If found, the fields from both files are combined.

## Merging Logs

Log files of different types can be merged automatically. For example, DS log data can be combined with a WPILOG file from the robot. Click "File" > "Merge Log..." or press **shift + cmd/ctrl + O**, then choose a log file from the local disk. The timestamps of the logs are aligned based on when the robot was first enabled (usually the start of the match).

> Note: Merging is only possible when the logs do not contain conflicting (shared) fields.

![Merging a log file](/docs/resources/open-file/open-file-2.gif)

## Downloading from a roboRIO

Open the preferences window by pressing **cmd/ctrl + comma** or clicking "Help" > "Show Preferences..." (Windows/Linux) or "AdvantageScope" > "Settings..." (macOS). Update the "roboRIO Address" and "roboRIO Log Folder".

> Note: Click "File" > "Use USB roboRIO Address" to temporarily use the IP address "172.22.11.2" for all connections.

![Diagram of roboRIO preferences](/docs/resources/open-file/open-file-3.png)

Click "File" > "Download Logs..." or press **cmd/ctrl + D** to open the download window. Once connected to the roboRIO, available logs are shown with the newest at the top. Select one or more log files to download (shift-click to select a range or **cmd/ctrl + A** to select all). Then click the ↓ symbol and select a save location.

> Note: When downloading multiple files, AdvantageScope skips any that are already found in the destination folder.

![Downloading log files](/docs/resources/open-file/open-file-4.gif)
