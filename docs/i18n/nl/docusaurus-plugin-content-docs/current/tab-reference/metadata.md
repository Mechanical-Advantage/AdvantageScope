---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Metadata {#metadata}

Op het tabblad Metadata zie je waarden die zijn gepubliceerd naar de verborgen tabel "/Metadata" of via AdvantageKit. Links staan de metadatasleutels, en in de kolommen worden verschillende bronnen naast elkaar gezet (bijvoorbeeld "Echt" en "Replay" bij AdvantageKit).

<img src="/img/tab-reference/metadata-1.webp" alt="Overzicht van tabblad Metadata" />

_De Engelstalige interface wordt hierboven weergegeven._

In de voorbeeldcode hieronder zie je hoe je metadata logt.

<Tabs groupId="library">
<TabItem value="wpilib-java" label="Java" default>

In WPILib log je waarden als strings naar de tabel "/Metadata" via de klasse `Telemetry`.

```java
TelemetryTable metadata = Telemetry.getTable("Metadata");
metadata.log("RobotName", "Darwin");
metadata.log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-cpp" label="C++">

In WPILib log je waarden als strings naar de tabel "/Metadata" via de klasse `Telemetry`.

```cpp
wpi::telemetry::TelemetryTable& metadata = wpi::telemetry::GetTable("Metadata");
metadata.Log("RobotName", "Darwin");
metadata.Log("Platform", "macOS");
```

</TabItem>
<TabItem value="wpilib-python" label="Python">

In WPILib log je waarden als strings naar de tabel "/Metadata" via de module `telemetry`.

```python
import telemetry

metadata = telemetry.get_table("Metadata")
metadata.log("RobotName", "Darwin")
metadata.log("Platform", "macOS")
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

Roep in AdvantageKit de methode hieronder aan voordat je de logger start. De metadata wordt apart opgeslagen voor echte runs ("Echt") en replays ("Replay"), zodat je ze makkelijk kunt vergelijken.

```java
Logger.recordMetadata("RobotName", "Darwin");
Logger.recordMetadata("Platform", "macOS");
```

</TabItem>
</Tabs>
