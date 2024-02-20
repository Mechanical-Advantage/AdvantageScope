# Unofficial REV-Compatible Logger

_[< Return to homepage](/docs/INDEX.md)_

Since REV does not provide an official method of automatically recording data from the Spark Max and Spark Flex, we have provided an unofficial alternative for Java and C++ called [URCL](https://github.com/Mechanical-Advantage/URCL) (**U**nofficial **R**EV-**C**ompatible **L**ogger). This enables live plotting and logging of all devices similar to CTRE's [Tuner X plotting feature](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) and [Phoenix 6 signal logger](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html).

After setup, periodic CAN frames from all Spark Max and Spark Flex devices are published to NetworkTables. WPILib's [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) can be used to capture the data to a log file. These frames are then viewable in AdvantageScope (see [Opening Log Files](/docs/OPEN-FILE.md) and [Connecting to Live Sources](/docs/OPEN-LIVE.md)).

- **All signals** are captured automatically, with **no manual setup for new devices**.
- **Every frame is captured**, even when the status frame period is faster than the robot loop cycle.
- Frames are logged with **timestamps based on the CAN RX time**, enabling more accurate acceleration characterization with [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) compared to traditional logging in user code (see "SysId Usage" below).
- Logging is **highly efficient**; operations are threaded and run for under 80µs per 20ms periodic cycle, even when logging a large number of devices.
- **All functions of REVLib are unaffected.**

> Note: As this library is not an official REV tool, support queries should be directed to the URCL [issues page](https://github.com/Mechanical-Advantage/URCL/issues) or software@team6328.org rather than REV's support contact.

## Setup

> **Important: When viewing URCL data over NetworkTables, the "Live Mode" in the AdvantageScope preferences must be configured to "Logging". This will be fixed in a future release.**

Install the URCL vendordep by going to "WPILib: Manage Vendor Libraries" > "Install new libraries (online)" in VSCode and pasting in the URL below.

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/maven/URCL.json
```

URCL publishes to NetworkTables by default, but data can be saved to a log file by enabling WPILib's DataLogManager. The logger should be started in `robotInit`, as shown below in Java and C++.

```java
public void robotInit() {
  DataLogManager.start();
  URCL.start();
}
```

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

void Robot::RobotInit() {
  frc::DataLogManager::Start();
  URCL::Start();
}
```

To more easily identify devices in the log, CAN IDs can be assigned to aliases by passing a map object to the `start()` method. The keys are CAN IDs and the values are strings for the names to use in the log. Any devices not assigned an alias will be logged using their default names.

AdvantageKit users should replace the standard `start()` method with the line shown below to start recording data to the AdvantageKit log. Note that this feature is provided for convenience only; the data recorded to the log is NOT available in replay. **REV motor controllers must still be within an IO implementation with defined inputs to support replay**.

> Note: AdvantageKit must be running the 2024 kickoff release or later.

```java
public void robotInit() {
  // ...
  Logger.registerURCL(URCL.startExternal());
  Logger.start();
}
```

## SysId Usage

> Note: Update to the latest version of AdvantageScope and WPILib before attempting to use URCL data with SysId.

1. After setting up URCL as shown above, configure the SysId routine using `null` for the mechanism log consumer. An example is shown below for Java. This configuration can be performed within the subsystem class.

```java
// Create the SysId routine
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(),
  new SysIdRoutine.Mechanism(
    (voltage) -> subsystem.runVolts(voltage.in(Volts)),
    null, // No log consumer, since data is recorded by URCL
    subsystem
  )
);

// The methods below return Command objects
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kForward);
sysIdRoutine.quasistatic(SysIdRoutine.Direction.kReverse);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kForward);
sysIdRoutine.dynamic(SysIdRoutine.Direction.kReverse);

// AdvantageKit users should log the test state using the following configuration
new SysIdRoutine.Config(
  null, null, null,
  (state) -> Logger.recordOutput("SysIdTestState", state.toString())
)
```

2. Run the SysId routine on the robot. The SysId commands can be configured as auto routines or connected to a button trigger.

3. Download the log file and open it in AdvantageScope. In the menu bar, go to "File" > "Export Data...". Set the format to "WPILOG" and the field set to "Include Generated". Click the save icon and choose a location to save the log.

> Note: The log file from the robot must be opened and exported by AdvantageScope _before opening it using the SysId analyzer_. This is required to convert the CAN data recorded by URCL to a format compatible with SysId.

3. Open the SysId analyzer by searching for "WPILib: Start Tool" in the VSCode command palette and choosing "SysId" (or using the desktop launcher on Windows). Open the exported log file by clicking "Open data log file..."

4. Choose the following fields below to run the analysis using the default encoder. Position and velocity data from secondary encoders can also be used (alternate, external, analog, absolute, etc).

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

> Note: The gains produced by SysId will use the units the Spark Max/Flex is configured to report (using [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) and [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). By default, these are rotations and RPM with no gearing applied. If the units used when recording data do not match the desired units, the scaling can be adjusted in SysId during analysis.
