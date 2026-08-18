---
sidebar_position: 12
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔍 元数据 {#metadata}

元数据选项卡显示发布到隐藏的 “/Metadata” 表或通过 AdvantageKit 发布的值。元数据键显示在左侧，列分隔来自不同来源的数据（例如在使用 AdvantageKit 时的真实数据和重放数据）。

<img src="/img/tab-reference/metadata-1.webp" alt="元数据标签页概述" />

_上图所示为英文界面。_

下面的示例代码展示了如何使用 Java 记录元数据。

<Tabs groupId="library">
<TabItem value="wpilib" label="WPILib" default>

在 WPILib 中，这些值必须作为字符串记录到 “/Metadata” 表中。

```java
// NetworkTables (默认情况下也保存到 DataLog)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (不发布到 NetworkTables)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

</TabItem>
<TabItem value="advantagekit" label="AdvantageKit">

在 AdvantageKit 中，在启动记录器之前调用以下方法。在运行真实数据和重放数据时，元数据被单独存储，以便于比较。

```java
Logger.recordMetadata("MyKey", "MyValue");
```

</TabItem>
</Tabs>
