---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Unofficial REV-Compatible Logger

Since REV does not provide an official method of automatically recording data from the Spark Max and Spark Flex, we have provided an unofficial alternative for Java and C++ called [URCL](https://github.com/Mechanical-Advantage/URCL) (**U**nofficial **R**EV-**C**ompatible **L**ogger). This enables live plotting and logging of all devices similar to CTRE's [Tuner X plotting feature](https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/plotting.html) and [Phoenix 6 signal logger](https://pro.docs.ctr-electronics.com/en/latest/docs/api-reference/api-usage/signal-logging.html).

After setup, periodic CAN frames from all Spark Max and Spark Flex devices are published to NetworkTables or DataLog. When using NetworkTables, WPILib's [DataLogManager](https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html) can be used to capture the data to a log file. These frames are viewable in AdvantageScope (see [Managing Log Files](../getting-started/manage-files.md) and [Connecting to Live Sources](../getting-started/connect-live.md)).

- **All signals** are captured automatically, with **no manual setup for new devices**.
- **Every frame is captured**, even when the status frame period is faster than the robot loop cycle.
- Frames are logged with **timestamps based on the CAN RX time**, enabling more accurate acceleration characterization with [SysId](https://docs.wpilib.org/en/stable/docs/software/pathplanning/system-identification/introduction.html) compared to traditional logging in user code (see "SysId Usage" below).
- Logging is **highly efficient**; operations are threaded and run for under 80µs per 20ms periodic cycle, even when logging a large number of devices.
- **All functions of REVLib are unaffected.**

:::info
As this library is not an official REV tool, support queries should be directed to the URCL [issues page](https://github.com/Mechanical-Advantage/URCL/issues) or software@team6328.org rather than REV's support contact.
:::

## Setup

Install the URCL vendordep by following the instructions to install [3rd party libraries](https://docs.wpilib.org/en/stable/docs/software/vscode-overview/3rd-party-libraries.html) using the dependency manager in VSCode. Alternatively, you can use the following vendor JSON URL:

```
https://raw.githubusercontent.com/Mechanical-Advantage/URCL/main/URCL.json
```

URCL publishes to NetworkTables by default, where data can be saved to a log file by enabling WPILib's DataLogManager. Alternatively, URCL can log directly to a DataLog. The logger should be started in `robotInit`, as shown below.

<Tabs>
<TabItem value="java" label="WPILib (Java)" default>

```java
public void robotInit() {
  // If publishing to NetworkTables and DataLog
  DataLogManager.start();
  URCL.start();

  // If logging only to DataLog
  URCL.start(DataLogManager.getLog());
}
```

</TabItem>
<TabItem value="cpp" label="WPILib (C++)">

```cpp
#include "frc/DataLogManager.h"
#include "URCL.h"

void Robot::RobotInit() {
  // If publishing to NetworkTables and DataLog
  frc::DataLogManager::Start();
  URCL::Start();

  // If logging only to DataLog
  URCL::Start(frc::DataLogManager::GetLog());
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import urcl
import wpilib

class Robot(wpilib.TimedRobot):
    def robotInit(self):
        # If publishing to NetworkTables and DataLog
        wpilib.DataLogManager.start()
        urcl.start()

        # If logging only to DataLog
        urcl.start(wpilib.DataLogManager.getLog())
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
public void robotInit() {
  // ...
  Logger.registerURCL(URCL.startExternal());
  Logger.start();
}
```

:::warning
URCL compatibility with AdvantageKit is provided for convenience only; the data recorded to the log is NOT available in replay. **REV motor controllers must still be part of an IO implementation with defined inputs to support replay**.
:::

</TabItem>
</Tabs>

To more easily identify devices in the log, CAN IDs can be assigned to aliases by passing a map object to the `start()` or `startExternal()` method. The keys are CAN IDs and the values are strings for the names to use in the log. Any devices not assigned an alias will be logged using their default names.

:::warning
To minimize CAN utilization, most status frames for Spark devices are **disabled by default** until an associated getter method is called. Any data included in these disabled status frames will not be available in the URCL log.

For more details, check the [REVLib documentation](https://docs.revrobotics.com/revlib/24-to-25#setting-status-periods). We recommend using the [`SignalsConfig`](https://codedocs.revrobotics.com/java/com/revrobotics/spark/config/signalsconfig) when configuring the Spark to manually enable any signals you wish to include in the log file.
:::

## SysId Usage

1. After setting up URCL as shown above, configure the SysId routine using `null` for the mechanism log consumer. An example is shown below for Java. This configuration can be performed within the subsystem class.

<Tabs groupId="library">
<TabItem value="WPILib" label="WPILib" default>

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
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

```java
// Create the SysId routine
var sysIdRoutine = new SysIdRoutine(
  new SysIdRoutine.Config(
    null, null, null,
    (state) -> Logger.recordOutput("SysIdTestState", state.toString())
  ),
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
```

</TabItem>
</Tabs>

2. Run the SysId routine on the robot. The SysId commands can be configured as auto routines or connected to a button trigger.

3. Download the log file and open it in AdvantageScope. In the menu bar, go to `File` > `Export Data...`. Set the format to "WPILOG" and the field set to "Include Generated". Click the save icon and choose a location to save the log.

:::warning
The log file from the robot must be opened and exported by AdvantageScope _before opening it using the SysId analyzer_. This is required to convert the CAN data recorded by URCL to a format compatible with SysId.
:::

3. Open the SysId analyzer by searching for "WPILib: Start Tool" in the VSCode command palette and choosing "SysId" (or using the desktop launcher on Windows). Open the exported log file by clicking "Open data log file..."

4. Choose the following fields below to run the analysis using the default encoder. Position and velocity data from secondary encoders can also be used (alternate, external, analog, absolute, etc).

   - Position = "NT:/URCL/&lt;Device&gt;/MotorPositionRotations"
   - Velocity = "NT:/URCL/&lt;Device&gt;/MotorVelocityRPM"
   - Voltage = "NT:/URCL/&lt;Device&gt;/AppliedOutputVoltage"

:::tip
The gains produced by SysId will use the units the Spark Max/Flex is configured to report (using [`setPositionConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setPositionConversionFactor(double)>) and [`setVelocityConversionFactor`](<https://codedocs.revrobotics.com/java/com/revrobotics/relativeencoder#setVelocityConversionFactor(double)>)). By default, these are rotations and RPM with no gearing applied. If the units used when recording data do not match the desired units, the scaling can be adjusted in SysId during analysis.
:::
