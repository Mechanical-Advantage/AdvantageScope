This release includes fixes for several issues:

- Some events (like clicking menu buttons) caused errors when no valid window was active. (#9)
- Extra threads were being created on each live connection and CSV export, causing performance issues after extended sessions. (#6)
- Reconnecting to the simulator was broken, sometimes failing outright or connecting to the roboRIO instead.

Also, log files can now be opened by dragging to an active window. (#10)
