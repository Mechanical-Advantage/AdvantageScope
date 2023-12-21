# Loading CTRE Log Files (Experimental)

_[< Return to homepage](/docs/INDEX.md)_

AdvantageScope supports loading log files produced by CTRE's Phoenix 6 [signal logger](https://pro.docs.ctr-electronics.com/en/latest/docs/yearly-changes/yearly-changelog.html#signal-logging). These files are saved to the RIO in the proprietary Hoot (.hoot) log format, but can be opened by AdvantageScope like any other log after completing the setup instructions here. **This feature is only supported on Windows.**

Alternatively, Phoenix Tuner X can be used to convert Hoot log files to the WPILOG format, which can then be opened using AdvantageScope. Direct loading for AdvantageScope is intended to make this process simpler and easier by removing the requirement to use multiple applications for processing log files. Instead, the conversion is handled internally by CTRE’s log utility while loading the log file.

> Note: This feature is **experimental** and is likely to change in the future. The current implementation requires modifying the permissions of some system directories; proceed at your own risk.

## About Licensing

This feature **does not require a Phoenix Pro license** to use. However, non-Pro devices do not include all of the signals available through [Phoenix diagnostics](/docs/OPEN-LIVE.md) in the Hoot log; only "common" signals are available. Positions and velocities of encoders, applied voltages, etc are included. However, many signals like faults, pitch/roll from a Pigeon, the Talon FX control mode, PID error/state, etc are not available.

## Setup

An additional setup process is required to decode Hoot logs, which only needs to be completed once. As shown below, the "WindowsApps" folder must be switched to read-only mode. This folder contains apps that are downloaded from thr Microsoft store, like Phoenix Tuner X.

1. Install the latest version of Phoenix Tuner X from the [Microsoft store](https://apps.microsoft.com/detail/9NVV4PWDW27Z).
2. Navigate to "C:\Program Files" in File Explorer
3. Show hidden files by clicking "View" > "Hidden items"
4. Find the "WindowsApps" folder, then right-click and select "Properties"
5. Go to "Security" > "Advanced" > "Change" (to the right of "Owner") > "Advanced..." > "Find Now"
6. Click "Administrators" > "OK" > "OK"
7. Check "Replace owner on subcontainers and objects"
8. Click "Apply" > "OK" > "OK" > "OK"
9. Reboot the computer

Hoot log files can now be downloaded from the RIO, opened, merged, and exported (to WPILOG or MCAP) just like any other supported format.
