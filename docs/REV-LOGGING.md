# REV Motor Controller Logging

_[< Return to homepage](/docs/INDEX.md)_

Since REV does not provide an official method of automatically recording data from the Spark Max and Spark Flex, we have provided an unofficial alternative for Java and C++. This enables live plotting and logging of all devices similar to CTRE's [Tuner X plotting feature](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) and [signal logging API](https://v6.docs.ctr-electronics.com/en/latest/docs/yearly-changes/yearly-changelog.html#signal-logging).

After setup, periodic CAN frames from all Spark Max and Spark Flex devices are published to NetworkTables. WPILib's [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) can be used to capture the data to a log file. These frames are then viewable in AdvantageScope (see [Opening Log Files](/docs/OPEN-FILE.md) and [Connecting to Live Sources](/docs/OPEN-LIVE.md)).

- **All signals** are captured automatically, with **no manual setup for new devices**.
- **Every frame is captured**, even when the status frame period is faster than the robot loop cycle.
- Frames are logged with **timestamps based on the CAN RX time**, enabling more accurate acceleration characterization with [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) compared to traditional logging in user code.
- Logging is **highly efficient**; operations are threaded and run for under 60µs per 20ms periodic cycle, even when logging many devices.
- **All functions of REVLib are unaffected.**

> Note: As this library is not an official REV tool, support queries should be directed to the UnofficialREVLogger [issues page](https://github.com/Mechanical-Advantage/UnofficialREVLogger/issues) or software@team6328.org rather than REV's support contact.

## Setup

Install the [UnofficialREVLogger](https://github.com/Mechanical-Advantage/UnofficialREVLogger) vendordep by going to "WPILib: Manage Vendor Libraries" > "Install new libraries (online)" in VSCode and pasting in the URL below.

```
https://raw.githubusercontent.com/jwbonner/UnofficialREVLogger/maven/UnofficialREVLogger.json
```

The REV logger publishes to NetworkTables by default, but data can be saved to a log files by enabling WPILib's DataLogManager. The logger should be started in `robotInit`, as shown below in Java and C++.

```java
public void robotInit() {
  DataLogManager.start();
  UnofficialREVLogger.start();
}
```

```cpp
#include "frc/DataLogManager.h"
#include "UnofficialREVLogger.h"

void Robot::RobotInit() {
  frc::DataLogManager::Start();
  UnofficialREVLogger::Start();
}
```

AdvantageKit users should instead add the line shown below in `robotInit` to start recording data to the AdvantageKit log. Note that this feature is provided for convenience only; the data recorded to the log is NOT available in replay. **REV motor controllers must still be within an IO implementation with defined inputs to support replay**.

```java
public void robotInit() {
  // ...
  Logger.registerUnofficialREVLogger(UnofficialREVLogger.startAkit());
  Logger.start();
}
```
