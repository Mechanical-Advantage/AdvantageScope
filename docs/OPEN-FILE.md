# Downloading/Opening Log Files

_[< Return to homepage](/docs/INDEX.md)_

This section describes how to open a log file for analysis.

## Opening a Saved Log

In the menu bar, click "File" > "Open..." or press **cmd/ctrl + O**, then choose a log file from the local disk. Both WPILOG and RLOG files are supported.

![Opening a saved log](/docs/img/open-file-1.gif)

## Downloading from a roboRIO

Open the preferences window by pressing **cmd/ctrl + comma** or clicking "Help" > "Show Preferences..." (Windows/Linux) or "AdvantageScope" > "Preferences..." (macOS). Update the "roboRIO Address" and "roboRIO Log Folder".

> Note: Click "File" > "Use USB roboRIO Address" to temporarily use the IP address "172.22.11.2" for all connections.

![Diagram of roboRIO preferences](/docs/img/open-file-2.png)

Click "File" > "Download Logs..." or press **cmd/ctrl + D** to open the download window. Once connected to the roboRIO, available logs are shown with the newest at the top. Click a log file to download, or shift-click to select a range of logs. Then click the ↓ symbol and select a save location.

![Downloading log files](/docs/img/open-file-3.gif)

When a single log file is downloaded, AdvantageScope prompts to open it immediately:

![Prompt to open log file](/docs/img/open-file-4.png)

## Exporting as CSV

To export a log as a CSV file, click "File" > "Export CSV..." or press **cmd/ctrl + E**, then choose a save location. Each column represents a field, and each row represents a new timestamp (with a single header row).

![CSV table](/docs/img/open-file-5.png)
