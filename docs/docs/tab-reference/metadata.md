---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Metadata

The metadata tab shows values published to the hidden "/Metadata" table or through AdvantageKit. The metadata keys are displayed to the left, and the columns separate data from different sources (e.g. real and replay when using AdvantageKit).

![Overview of metadata tab](./img/metadata-1.png)

The example code below shows how to log metadata.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

In WPILib, log values to the "/Metadata" table as strings using the `Telemetry` class.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

In WPILib, log values to the "/Metadata" table as strings using the `Telemetry` class.

```cpp
wpi::telemetry::TelemetryTable& metadata = wpi::telemetry::GetTable("Metadata");
metadata.Log("RobotName", "Darwin");
metadata.Log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

In WPILib, log values to the "/Metadata" table as strings using the `telemetry` module.

```python
import telemetry

metadata = telemetry.get_table("Metadata")
metadata.log("RobotName", "Darwin")
metadata.log("Platform", "macOS")
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

In AdvantageKit, call the method below before starting the logger. Metadata is stored separately when running in real and replay for easy comparison.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
