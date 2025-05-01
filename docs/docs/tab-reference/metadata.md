---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 Metadata

The metadata tab shows values published to the hidden "/Metadata" table or through AdvantageKit. The metadata keys are displayed to the left, and the columns separate data from different sources (e.g. real and replay when using AdvantageKit).

![Overview of metadata tab](./img/metadata-1.png)

The example code below shows how to log metadata using Java.

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

In WPILib, the values must be logged to the "/Metadata" table as strings.

```java
// NetworkTables (also saved to DataLog by default)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (not published to NetworkTables)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

In AdvantageKit, call the method below before starting the logger. Metadata is stored separately when running in real and replay for easy comparison.

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
