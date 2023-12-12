# Loading CTRE Log Files (Experimental)

AdvantageScope supports directly loading log files produced by CTRE's Phoenix 6 [signal logger](https://pro.docs.ctr-electronics.com/en/latest/docs/yearly-changes/yearly-changelog.html#signal-logging). These files are saved to the RIO in the proprietary Hoot (.hoot) log format, but can be opened by AdvantageScope like any other log (after completing the setup instructions here). **This feature is only supported on Windows**, as CTRE provides no method for decoding their logs on macOS or Linux.

Alternatively, Phoenix Tuner X can be used to convert Hoot log files to the WPILOG format, which can then be opened using AdvantageScope. Those extra steps and intermediate file formats make it more difficult to access CTRE log data; this feature is intended to make the process simpler and faster by opening Hoot logs directly.

> Note: This feature is **experimental** and is likely to change in the future. The current implementation requires modifying the permissions of some system directories; proceed at your own risk.

## Setup

To support decoding CTRE's proprietary log format, an additional setup process is required to decode Hoot logs. This setup only needs to be completed once.

1. Install the latest version of Phoenix Tuner X from the [Microsoft store](https://apps.microsoft.com/detail/9NVV4PWDW27Z).
2. Navigate to "C:\Program Files" in File Explorer
3. Show hidden files by clicking "View" > "Hidden items"
4. Find the "WindowsApps" folder, then right-click and select "Properties"
5. Go to "Security" > "Advanced" > "Change" (to the right of "Owner") > "Advanced..." > "Find Now"
6. Click "Administrators" > "OK" > "OK"
7. Check "Replace owner on subcontainers and objects"
8. Click "Apply" > "OK" > "OK" > "OK"

Hoot log files can now be downloaded from the RIO, opened individually, or merged with other logs just like any other supported format.
